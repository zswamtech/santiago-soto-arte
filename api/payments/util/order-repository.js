// Repositorio de órdenes con soporte Postgres + fallback en memoria
// Uso: const repo = require('./order-repository');
// repo.create(orderData), repo.updateStatus(...), etc.

let pgClient = null;
let dbReady = false;

const useMemory = !process.env.POSTGRES_URL;

const memory = {
  orders: new Map(),
  webhookEvents: new Set()
};

async function ensureClient(){
  if(useMemory) return; // no DB mode
  if(pgClient) return;
  try {
    const { Client } = require('pg');
    pgClient = new Client({ connectionString: process.env.POSTGRES_URL });
    await pgClient.connect();
    dbReady = true;
    console.log('[order-repository] Conectado a Postgres');
  } catch (e){
    console.warn('[order-repository] No se pudo conectar a Postgres, usando memoria:', e.message);
  }
}

function normalizeOrderData(data){
  const required = ['id','provider','status','subtotal','discount_total','tax','shipping','total','pricing_snapshot'];
  for(const k of required){ if(typeof data[k] === 'undefined') throw new Error('Campo requerido faltante: '+k); }
  return { ...data };
}

// ---- Memory Implementation ----
function memCreate(order){
  if(memory.orders.has(order.id)) throw new Error('ORDER_EXISTS');
  memory.orders.set(order.id, { ...order, created_at: Date.now(), updated_at: Date.now() });
  return memory.orders.get(order.id);
}
function memFind(id){ return memory.orders.get(id) || null; }
function memUpdateStatus(id, nextStatus, patch){
  const o = memory.orders.get(id); if(!o) return null;
  // No retroceder paid
  if(o.status === 'paid' && nextStatus !== 'paid') return o;
  o.status = nextStatus;
  if(patch) Object.assign(o, patch);
  o.updated_at = Date.now();
  return o;
}
function memAddWebhookEvent(eventId){ if(memory.webhookEvents.has(eventId)) return false; memory.webhookEvents.add(eventId); return true; }
function memHasWebhookEvent(eventId){ return memory.webhookEvents.has(eventId); }

// ---- Postgres Implementation ----
async function pgCreate(order){
  const q = `INSERT INTO orders(
    id, provider, provider_ref, status, currency, subtotal, discount_total, tax, shipping, total,
    shipping_tier, discount_cap_applied, discounts, items, pricing_snapshot, customer_email, customer_name,
    patron_percent_applied, coupon_percent_applied, coupon_code, patron_points_snapshot
  ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::json,$14::json,$15::json,$16,$17,$18,$19,$20,$21)
  RETURNING *`;
  const values = [
    order.id, order.provider, order.provider_ref||null, order.status, order.currency||'cop', order.subtotal,
    order.discount_total, order.tax, order.shipping, order.total, order.shipping_tier||null,
    !!order.discount_cap_applied, JSON.stringify(order.discounts||{}), JSON.stringify(order.items||[]),
    JSON.stringify(order.pricing_snapshot), order.customer_email||null, order.customer_name||null,
    order.patron_percent_applied||null, order.coupon_percent_applied||null, order.coupon_code||null,
    order.patron_points_snapshot||0
  ];
  const { rows } = await pgClient.query(q, values);
  return rows[0];
}

async function pgFind(id){
  const { rows } = await pgClient.query('SELECT * FROM orders WHERE id=$1', [id]);
  return rows[0] || null;
}

async function pgUpdateStatus(id, nextStatus, patch){
  // Fetch current
  const current = await pgFind(id);
  if(!current) return null;
  if(current.status === 'paid' && nextStatus !== 'paid') return current; // no retroceso
  const merged = { ...current, ...patch, status: nextStatus, updated_at: new Date() };
  const q = `UPDATE orders SET provider_ref=$2, status=$3, subtotal=$4, discount_total=$5, tax=$6, shipping=$7, total=$8,
    shipping_tier=$9, discount_cap_applied=$10, discounts=$11::json, items=$12::json, pricing_snapshot=$13::json,
    customer_email=$14, customer_name=$15, patron_percent_applied=$16, coupon_percent_applied=$17,
    coupon_code=$18, patron_points_snapshot=$19, updated_at=NOW() WHERE id=$1 RETURNING *`;
  const values = [
    merged.id, merged.provider_ref||null, merged.status, merged.subtotal, merged.discount_total, merged.tax,
    merged.shipping, merged.total, merged.shipping_tier||null, !!merged.discount_cap_applied,
    JSON.stringify(merged.discounts||{}), JSON.stringify(merged.items||[]), JSON.stringify(merged.pricing_snapshot||{}),
    merged.customer_email||null, merged.customer_name||null, merged.patron_percent_applied||null,
    merged.coupon_percent_applied||null, merged.coupon_code||null, merged.patron_points_snapshot||0
  ];
  const { rows } = await pgClient.query(q, values);
  return rows[0];
}

async function pgAddWebhookEvent(eventId, provider, orderId, type, raw){
  try {
    await pgClient.query('INSERT INTO webhook_events(event_id, provider, order_id, type, raw) VALUES($1,$2,$3,$4,$5::json)', [eventId, provider, orderId||null, type||null, JSON.stringify(raw||{})]);
    return true;
  } catch(e){
    if(e.code === '23505') return false; // duplicate
    throw e;
  }
}
async function pgHasWebhookEvent(eventId){
  const { rows } = await pgClient.query('SELECT 1 FROM webhook_events WHERE event_id=$1', [eventId]);
  return rows.length>0;
}

// ---- Public API ----
async function create(orderData){
  await ensureClient();
  const order = normalizeOrderData(orderData);
  if(useMemory || !dbReady) return memCreate(order);
  return pgCreate(order);
}
async function findById(id){ await ensureClient(); return (useMemory||!dbReady)? memFind(id): pgFind(id); }
async function updateStatus(id, nextStatus, patch){ await ensureClient(); return (useMemory||!dbReady)? memUpdateStatus(id,nextStatus,patch): pgUpdateStatus(id,nextStatus,patch); }
async function addWebhookEvent(eventId, provider, orderId, type, raw){ await ensureClient(); return (useMemory||!dbReady)? memAddWebhookEvent(eventId): pgAddWebhookEvent(eventId, provider, orderId, type, raw); }
async function hasWebhookEvent(eventId){ await ensureClient(); return (useMemory||!dbReady)? memHasWebhookEvent(eventId): pgHasWebhookEvent(eventId); }

module.exports = { create, findById, updateStatus, addWebhookEvent, hasWebhookEvent, __internal:{ useMemory:()=> useMemory } };

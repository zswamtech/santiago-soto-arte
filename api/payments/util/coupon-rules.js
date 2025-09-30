// Reglas de cupones basadas en puntos desbloqueados (mirror frontend coupons.js)
// En esta fase no tenemos verificación server de puntos del usuario; se confía en el código pero
// se recalcula el % permitido usando esta tabla (previene inflar percent desde el cliente).

let COUPON_RULES = [
  { code: 'PATRON5', percent: 5 },
  { code: 'PATRON8', percent: 8 },
  { code: 'PATRON10', percent: 10 },
  { code: 'PATRON15', percent: 15 }
];

let pgClient = null;
let attempted = false;

async function ensureClient(){
  if(attempted) return pgClient;
  attempted = true;
  if(!process.env.POSTGRES_URL) return null;
  try {
    const { Client } = require('pg');
    pgClient = new Client({ connectionString: process.env.POSTGRES_URL });
    await pgClient.connect();
  } catch(e){
    console.warn('[coupon-rules] No se pudo conectar a Postgres, fallback hardcoded:', e.message);
    pgClient = null;
  }
  return pgClient;
}

async function loadCouponsFromDB(){
  await ensureClient();
  if(!pgClient) return;
  try {
    const { rows } = await pgClient.query('SELECT code, percent FROM coupons WHERE enabled = TRUE AND (expires_at IS NULL OR expires_at > NOW())');
    if(rows && rows.length){
      COUPON_RULES = rows.map(r=>({ code: r.code.toUpperCase(), percent: r.percent }));
    }
  } catch(e){
    console.warn('[coupon-rules] Error cargando cupones DB, se mantiene hardcoded:', e.message);
  }
}

function normalizeCode(code){
  return String(code||'').trim().toUpperCase();
}

async function findCoupon(code){
  if(!attempted) await loadCouponsFromDB();
  const c = COUPON_RULES.find(r=> r.code === normalizeCode(code));
  if(!c) return null;
  return { code: c.code, percent: c.percent };
}

// Validación principal: recibe code y opcionalmente claimedPercent del cliente,
// devuelve el percent autorizado (tabla) ignorando inflaciones.
async function validateCoupon(code){
  const c = await findCoupon(code);
  if(!c) return { ok:false, reason:'Cupón desconocido' };
  return { ok:true, coupon:c };
}
module.exports = { COUPON_RULES: () => COUPON_RULES, validateCoupon, _internal:{ loadCouponsFromDB } };
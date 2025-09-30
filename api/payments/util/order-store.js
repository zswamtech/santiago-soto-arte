// Almacenamiento temporal de órdenes en memoria (no persistente en serverless). 
// Para producción: reemplazar por DB (Supabase, PlanetScale, Mongo, etc.)

const orders = new Map(); // orderId -> order
const processedEvents = new Set(); // idempotencia webhooks

function createOrder(data) {
  // data: { orderId, items, pricing, status }
  const now = Date.now();
  const order = {
    orderId: data.orderId,
    items: data.items,
    pricing: data.pricing,
    status: data.status || 'pending',
    provider: data.provider || 'stripe',
    createdAt: now,
    updatedAt: now,
    paymentIntentId: data.paymentIntentId || null,
    customer: data.customer || null
  };
  orders.set(order.orderId, order);
  return order;
}

function updateOrder(orderId, patch) {
  const existing = orders.get(orderId);
  if (!existing) return null;
  Object.assign(existing, patch, { updatedAt: Date.now() });
  return existing;
}

function getOrder(orderId) {
  return orders.get(orderId) || null;
}

function markEventProcessed(id) {
  processedEvents.add(id);
}
function isEventProcessed(id) {
  return processedEvents.has(id);
}

module.exports = { createOrder, updateOrder, getOrder, markEventProcessed, isEventProcessed };

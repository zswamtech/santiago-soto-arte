// Endpoint: POST /api/payments/webhook
// Maneja eventos de Stripe: payment_intent.succeeded / failed.

const Stripe = require('stripe');
const { updateOrder, getOrder, markEventProcessed, isEventProcessed } = require('./util/order-store'); // fallback
const orderRepo = require('./util/order-repository');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Utilidad simple: registrar redención de cupón (si existe) y aumentar uses.
async function redeemCouponIfAny(orderRepo, order){
  if(!order) return;
  const code = order.coupon_code || order.couponCode || null;
  if(!code) return;
  // Sólo cuando la orden pasa efectivamente a paid.
  try {
    // Insert redemption y update uses dentro de una pequeña transacción best-effort.
    // Como no tenemos aún un wrapper transaccional, ejecutamos statements secuenciales.
    const { Client } = require('pg');
    if(!process.env.POSTGRES_URL) return; // sin DB no hacemos nada
    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();
    try {
      await client.query('BEGIN');
      // Insert redención (orden puede repetirse si re-envía webhook, proteger única por (code, order_id))
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_coupon_redemption_code_order ON coupon_redemptions(code, order_id)`);
      await client.query(`INSERT INTO coupon_redemptions(code, order_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [code, order.id]);
      // Incrementar uses del cupón si se insertó redención nueva
      const { rowCount } = await client.query(`UPDATE coupons SET uses = uses + 1 WHERE code=$1 AND enabled=TRUE`, [code]);
      await client.query('COMMIT');
      if(rowCount>0){
        console.log('[payments] coupon redeemed', code, 'order', order.id);
      }
    } catch(e){
      await client.query('ROLLBACK');
      console.warn('[payments] redemption failed (rollback):', e.message);
    } finally {
      await client.end();
    }
  } catch(e){
    console.warn('[payments] redeemCouponIfAny error:', e.message);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.rawBody deberia estar disponible en Vercel (o usar bodyParser disabled si fuera Express)
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
  } catch (err) {
    console.error('[payments] webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Intentar idempotencia vía repositorio; si no, fallback a memoria
  try {
    const already = await orderRepo.hasWebhookEvent(event.id);
    if(already) {
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch(e){
    // fallback memory
    if (isEventProcessed(event.id)) {
      return res.status(200).json({ received: true, duplicate: true });
    }
  }

  try {
    let finalOrderId = null;
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          finalOrderId = orderId;
          // Try repo first
          try {
            const existing = await orderRepo.findById(orderId);
            if(existing && existing.status !== 'paid') {
              const updated = await orderRepo.updateStatus(orderId, 'paid');
              // Registrar redención cupón si aplica
              await redeemCouponIfAny(orderRepo, updated || existing);
              console.log('[payments] order paid (repo)', orderId);
            } else if(!existing) {
              console.warn('[payments] webhook order not found in repo, fallback memory', orderId);
              const order = getOrder(orderId);
              if(order && order.status !== 'paid') updateOrder(orderId, { status: 'paid' });
              await redeemCouponIfAny(orderRepo, order);
            }
          } catch(e){
            const order = getOrder(orderId);
            if (order && order.status !== 'paid') {
              updateOrder(orderId, { status: 'paid' });
              console.log('[payments] order paid (memory fallback)', orderId);
            }
            await redeemCouponIfAny(orderRepo, order);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          finalOrderId = orderId;
          try {
            const existing = await orderRepo.findById(orderId);
            if(existing && existing.status !== 'failed' && existing.status !== 'paid') {
              await orderRepo.updateStatus(orderId, 'failed');
              console.log('[payments] order failed (repo)', orderId);
            } else if(!existing){
              const order = getOrder(orderId);
              if(order && order.status !== 'failed' && order.status !== 'paid') updateOrder(orderId,{ status:'failed' });
            }
          } catch(e){
            const order = getOrder(orderId);
            if (order && order.status !== 'failed' && order.status !== 'paid') {
              updateOrder(orderId, { status: 'failed' });
              console.log('[payments] order failed (memory fallback)', orderId);
            }
          }
        }
        break;
      }
      default:
        // Ignorar otros por ahora
        break;
    }
    // Registrar evento idempotente
    try {
      await orderRepo.addWebhookEvent(event.id, 'stripe', finalOrderId, event.type, event);
    } catch(e){
      // fallback memory
      markEventProcessed(event.id);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[payments] webhook processing error', err);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
};

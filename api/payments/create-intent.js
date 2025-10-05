// Endpoint: POST /api/payments/create-intent
// Crea un PaymentIntent de Stripe a partir de items validados.

const Stripe = require('stripe');
const { computePricing } = require('./util/pricing');
const { signPricingSnapshot } = require('./util/pricing-signature');
const orderRepo = require('./util/order-repository');
const { createOrder } = require('./util/order-store'); // fallback dev

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
  const { items = [], customer, couponCode, patronPoints } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    // Derivar descuento patron server-side (temporal hasta ledger)
    let patronDiscountPercent = 0;
    try {
      const { derivePatronDiscountPercent } = require('./util/patron-levels');
      patronDiscountPercent = derivePatronDiscountPercent(patronPoints);
    } catch(_) { /* fallback 0 */ }

    // Calcular precios oficiales (server authoritative)
  const pricing = computePricing(items, { couponCode, patronDiscountPercent });

    if (pricing.breakdown.total <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    // Crear PaymentIntent
    const orderId = 'ord_' + Date.now();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pricing.breakdown.total,
      currency: pricing.currency,
      metadata: {
        orderId,
        subtotal: pricing.breakdown.subtotal,
        tax: pricing.breakdown.tax,
        shipping: pricing.breakdown.shipping,
        coupon: couponCode || '',
        patronPoints: typeof patronPoints === 'number' ? patronPoints : 0,
        patronPercent: pricing.breakdown.discounts?.patron || 0
      },
      automatic_payment_methods: { enabled: true }
    });

    // Firmar snapshot (integridad)
    let signature = null; let canonical = null;
    try {
      const s = signPricingSnapshot(pricing.breakdown);
      signature = s.signature;
      canonical = s.canonical; // opcional almacenar si se quisiera auditar
    } catch(e){ console.warn('[payments] no se pudo firmar snapshot:', e.message); }

    // Guardar orden persistente (o fallback memoria)
    const discounts = pricing.breakdown.discounts || { total: pricing.breakdown.discount || 0 };
    const orderData = {
      id: orderId,
      provider: 'stripe',
      provider_ref: paymentIntent.id,
      status: 'pending',
      currency: pricing.currency,
      subtotal: pricing.breakdown.subtotal,
      discount_total: discounts.total,
      tax: pricing.breakdown.tax,
      shipping: pricing.breakdown.shipping,
      total: pricing.breakdown.total,
      shipping_tier: pricing.breakdown.shippingTier || null,
      discount_cap_applied: !!discounts.appliedCap,
      discounts,
  coupon_code: couponCode || null,
  patron_points_snapshot: typeof patronPoints === 'number' ? patronPoints : 0,
      patron_percent_applied: typeof discounts.patronPercent === 'number' ? discounts.patronPercent : null,
      coupon_percent_applied: typeof discounts.couponPercent === 'number' ? discounts.couponPercent : null,
      items: pricing.items.map(i=>({ id:i.id, name:i.name, type:i.type, unitAmount:i.unitAmount||i.price, quantity:i.quantity, lineTotal:(i.lineTotal || (i.price*i.quantity)) })),
  pricing_snapshot: pricing.breakdown,
  snapshot_signature: signature,
      customer_email: customer?.email || null,
      customer_name: customer?.name || null
    };
    try {
      await orderRepo.create(orderData);
    } catch(e){
      console.warn('[payments] repository create failed, fallback memory store:', e.message);
      createOrder({
        orderId,
        items: pricing.items,
        pricing: pricing.breakdown,
        status: 'pending',
        provider: 'stripe',
        paymentIntentId: paymentIntent.id,
        customer: customer || null
      });
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      amount: pricing.breakdown.total,
      currency: pricing.currency
    });
  } catch (err) {
    console.error('[payments] create-intent error', err);
    return res.status(500).json({ error: 'Error creando intento de pago' });
  }
};

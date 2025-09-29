// Endpoint: POST /api/payments/create-intent
// Crea un PaymentIntent de Stripe a partir de items validados.

const Stripe = require('stripe');
const { computePricing } = require('./util/pricing');
const { createOrder, updateOrder } = require('./util/order-store');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items = [], customer } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    // Calcular precios oficiales
    const pricing = computePricing(items);

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
        shipping: pricing.breakdown.shipping
      },
      automatic_payment_methods: { enabled: true }
    });

    // Guardar orden interna
    createOrder({
      orderId,
      items: pricing.items,
      pricing: pricing.breakdown,
      status: 'pending',
      provider: 'stripe',
      paymentIntentId: paymentIntent.id,
      customer: customer || null
    });

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

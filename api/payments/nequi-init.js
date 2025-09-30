// Endpoint: POST /api/payments/nequi-init (stub Wompi/Nequi)
// Simula el inicio de una transacción Wompi/Nequi para pagos en Colombia.
// Referencia real: https://docs.wompi.co/docs/en/api
// Este stub NO crea una transacción real; estructura pensada para futura integración.

const crypto = require('crypto');
const { computePricing } = require('./util/pricing');
const { createOrder } = require('./util/order-store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items = [], customer } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items requeridos' });
    }

    // Calcular precios
    const pricing = computePricing(items);
    if (pricing.breakdown.total <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    // Crear orden interna (provider wompi-nequi)
    const orderId = 'ord_' + Date.now();
    createOrder({
      orderId,
      items: pricing.items,
      pricing: pricing.breakdown,
      status: 'pending',
      provider: 'wompi',
      customer: customer || null
    });

    // Generar referencia pseudo única (en real: Wompi transaction reference)
    const wompiReference = 'wmp_' + crypto.randomBytes(6).toString('hex');

    // Respuesta simulada: en la integración real devolverías un enlace o QR
    return res.status(200).json({
      provider: 'wompi',
      method: 'nequi',
      orderId,
      amount: pricing.breakdown.total,
      currency: pricing.currency,
      reference: wompiReference,
      status: 'initiated',
      nextAction: {
        type: 'redirect',
        url: 'https://checkout-simulacion.wompi.co/nequi/' + wompiReference
      },
      note: 'Stub: este endpoint no crea una transacción real. Reemplazar con llamada Wompi.'
    });
  } catch (err) {
    console.error('[payments] nequi-init error', err);
    return res.status(500).json({ error: 'Error iniciando stub Nequi' });
  }
};

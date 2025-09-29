// Utilidad de cálculo de precios y validación de items
// En producción reemplazar con base de datos / panel de administración.

const PRODUCT_CATALOG = [
  // id, type, name, unitAmount (en centavos), allowQuantity
  { id: 'canvas_small', type: 'product', name: 'Lienzo Pequeño', unitAmount: 50000, allowQuantity: true },
  { id: 'canvas_medium', type: 'product', name: 'Lienzo Mediano', unitAmount: 90000, allowQuantity: true },
  { id: 'digital_pet', type: 'digital', name: 'Retrato Digital Mascota', unitAmount: 60000, allowQuantity: true },
  { id: 'custom_commission', type: 'custom_artwork', name: 'Encargo Personalizado', unitAmount: 150000, allowQuantity: false }
];

const MAX_QTY = 10;

function findProduct(id) {
  return PRODUCT_CATALOG.find(p => p.id === id);
}

function computePricing(clientItems = [], options = {}) {
  // clientItems: [{id, quantity}]
  let subtotal = 0;
  const normalizedItems = [];

  clientItems.forEach(ci => {
    const product = findProduct(ci.id);
    if (!product) return; // ignore unknown
    const quantity = Math.min(Math.max(parseInt(ci.quantity || 1, 10), 1), MAX_QTY);
    if (!product.allowQuantity && quantity !== 1) return; // invalid -> skip

    const lineTotal = product.unitAmount * quantity;
    subtotal += lineTotal;
    normalizedItems.push({
      id: product.id,
      name: product.name,
      type: product.type,
      unitAmount: product.unitAmount,
      quantity,
      lineTotal
    });
  });

  // Descuento aplicado (placeholder, podría venir de fidelización)
  const discount = 0;

  // Tax (ejemplo 10% solo productos físicos/custom)
  const taxable = normalizedItems.some(i => i.type === 'product' || i.type === 'custom_artwork') ? subtotal - discount : 0;
  const tax = Math.round(taxable * 0.10);

  // Shipping plano si hay item físico/custom y subtotal < cierto umbral
  const hasPhysical = normalizedItems.some(i => i.type === 'product' || i.type === 'custom_artwork');
  const shipping = hasPhysical ? (subtotal >= 250000 ? 0 : 15000) : 0; // centavos

  const total = Math.max(0, subtotal - discount + tax + shipping);

  return {
    currency: 'cop',
    items: normalizedItems,
    breakdown: { subtotal, discount, tax, shipping, total }
  };
}

module.exports = { computePricing, PRODUCT_CATALOG };

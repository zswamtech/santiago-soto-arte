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

// Definición centralizada de tiers de envío (netAfterDiscount basado)
// Ordenados por rango ascendente
const SHIPPING_TIERS = [
  { tier: 'T1', min: 0, max: 99999, cost: 18000 },
  { tier: 'T2', min: 100000, max: 199999, cost: 15000 },
  { tier: 'T3', min: 200000, max: 299999, cost: 10000 },
  { tier: 'FREE', min: 300000, max: Infinity, cost: 0 }
];

function findProduct(id) {
  return PRODUCT_CATALOG.find(p => p.id === id);
}

function computePricing(clientItems = [], options = {}) {
  // clientItems: [{id, quantity}]
  // options: { patronDiscountPercent?, couponPercent?, couponCode? }
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

  // ----- Descuentos -----
  const DISCOUNT_CAP = 25; // %
  const patronPct = Math.min(Math.max(parseFloat(options.patronDiscountPercent || 0), 0), 100);
  let couponPct = Math.min(Math.max(parseFloat(options.couponPercent || 0), 0), 100);
  // Si hay couponCode preferimos validación server authoritative
  if (options.couponCode && !options.couponPercent) {
    try {
      const { validateCoupon } = require('./coupon-rules');
      const r = validateCoupon(options.couponCode);
      if (r.ok) couponPct = r.coupon.percent;
      else couponPct = 0;
    } catch(e){
      couponPct = 0; // fallback silencioso
    }
  }
  const patronDiscount = Math.round(subtotal * (patronPct/100));
  const couponDiscount = Math.round(subtotal * (couponPct/100));
  let discountTotal = patronDiscount + couponDiscount;
  let appliedCap = false;
  const theoreticalPct = subtotal > 0 ? (discountTotal / subtotal) * 100 : 0;
  let finalPatron = patronDiscount;
  let finalCoupon = couponDiscount;
  if (theoreticalPct > DISCOUNT_CAP) {
    appliedCap = true;
    const capped = Math.round(subtotal * (DISCOUNT_CAP/100));
    const base = discountTotal || 1;
    const scale = capped / base;
    finalPatron = Math.round(patronDiscount * scale);
    finalCoupon = Math.round(couponDiscount * scale);
    // Ajustar por redondeo para sumar exactamente capped
    const diff = capped - (finalPatron + finalCoupon);
    finalPatron += diff; // asignar diferencia al patron
    discountTotal = capped;
  } else {
    discountTotal = finalPatron + finalCoupon;
  }

  // ----- Shipping escalonado -----
  const hasPhysical = normalizedItems.some(i => i.type === 'product' || i.type === 'custom_artwork');
  const netAfterDiscount = Math.max(0, subtotal - discountTotal);

  // Determinar shipping usando definición de tiers
  let shipping = 0;
  let shippingTier = null;
  let shippingProgress = { nextTier: null, missing: 0 };
  if (hasPhysical) {
    const matched = SHIPPING_TIERS.find(t => netAfterDiscount >= t.min && netAfterDiscount <= t.max);
    if (matched) {
      shipping = matched.cost;
      shippingTier = matched.tier;
      if (matched.tier !== 'FREE') {
        // Buscar siguiente tier con menor costo
        for (let i = 0; i < SHIPPING_TIERS.length; i++) {
          if (SHIPPING_TIERS[i].tier === matched.tier) {
            for (let j = i + 1; j < SHIPPING_TIERS.length; j++) {
              if (SHIPPING_TIERS[j].cost < matched.cost) {
                const next = SHIPPING_TIERS[j];
                if (netAfterDiscount < next.min) {
                  shippingProgress = {
                    nextTier: { tier: next.tier, threshold: next.min, shippingCost: next.cost },
                    missing: next.min - netAfterDiscount
                  };
                }
                break;
              }
            }
            break;
          }
        }
      }
    }
  }

  // ----- Impuestos -----
  const taxable = hasPhysical ? netAfterDiscount : 0;
  const tax = Math.round(taxable * 0.10);

  const total = Math.max(0, netAfterDiscount + tax + shipping);

  return {
    currency: 'cop',
    items: normalizedItems,
    breakdown: {
      subtotal,
      discounts: {
        patron: finalPatron,
        coupon: finalCoupon,
        total: discountTotal,
        appliedCap
      },
      netAfterDiscount,
      shipping,
      shippingTier,
      shippingProgress,
      tax,
      total
    }
  };
}

module.exports = { computePricing, PRODUCT_CATALOG, SHIPPING_TIERS };

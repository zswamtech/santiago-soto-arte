// Generación de firma canónica HMAC para snapshot de pricing
// Uso: const { signPricingSnapshot, verifyPricingSnapshot } = require('./pricing-signature');
// Requiere variable de entorno PRICE_SNAPSHOT_SECRET

const crypto = require('crypto');

function getSecret(){
  const secret = process.env.PRICE_SNAPSHOT_SECRET || process.env.PRICE_SNAPSHOT_KEY; // fallback nombre alterno
  if(!secret) throw new Error('PRICE_SNAPSHOT_SECRET no definido');
  return secret;
}

// Orden estable de propiedades numéricas relevantes
const TOP_LEVEL_FIELDS = [
  'subtotal','tax','shipping','total'
];
const DISCOUNT_FIELDS = ['patron','coupon','total','appliedCap'];
const SHIPPING_PROGRESS_FIELDS = ['nextTier','missing'];

function canonicalize(snapshot){
  if(!snapshot || typeof snapshot !== 'object') return '';
  const discounts = snapshot.discounts || {};
  const shippingProgress = snapshot.shippingProgress || {};
  // nextTier serializable estable
  let nextTier = null;
  if(shippingProgress.nextTier){
    const nt = shippingProgress.nextTier;
    nextTier = {
      tier: nt.tier || null,
      threshold: typeof nt.threshold === 'number'? nt.threshold : null,
      shippingCost: typeof nt.shippingCost === 'number'? nt.shippingCost : null
    };
  }
  const payload = {
    v: 1,
    subtotal: snapshot.subtotal || 0,
    tax: snapshot.tax || 0,
    shipping: snapshot.shipping || 0,
    total: snapshot.total || 0,
    discounts: {
      patron: discounts.patron || 0,
      coupon: discounts.coupon || 0,
      total: discounts.total || 0,
      appliedCap: !!discounts.appliedCap
    },
    shippingTier: snapshot.shippingTier || null,
    netAfterDiscount: snapshot.netAfterDiscount || 0,
    shippingProgress: {
      nextTier,
      missing: shippingProgress.missing || 0
    }
  };
  return JSON.stringify(payload);
}

function signPricingSnapshot(snapshot){
  const secret = getSecret();
  const canonical = canonicalize(snapshot);
  const h = crypto.createHmac('sha256', secret).update(canonical).digest('hex');
  return { signature: h, canonical };
}

function verifyPricingSnapshot(snapshot, signature){
  try {
    const { signature: expected } = signPricingSnapshot(snapshot);
    return expected === signature;
  } catch(e){
    return false;
  }
}

module.exports = { signPricingSnapshot, verifyPricingSnapshot, canonicalize };

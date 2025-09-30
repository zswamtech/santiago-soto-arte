// Reglas de cupones basadas en puntos desbloqueados (mirror frontend coupons.js)
// En esta fase no tenemos verificación server de puntos del usuario; se confía en el código pero
// se recalcula el % permitido usando esta tabla (previene inflar percent desde el cliente).

const COUPON_RULES = [
  { code: 'PATRON5', percent: 5 },
  { code: 'PATRON8', percent: 8 },
  { code: 'PATRON10', percent: 10 },
  { code: 'PATRON15', percent: 15 }
];

function normalizeCode(code){
  return String(code||'').trim().toUpperCase();
}

function findCoupon(code){
  const c = COUPON_RULES.find(r=> r.code === normalizeCode(code));
  if(!c) return null;
  return { code: c.code, percent: c.percent };
}

// Validación principal: recibe code y opcionalmente claimedPercent del cliente,
// devuelve el percent autorizado (tabla) ignorando inflaciones.
function validateCoupon(code){
  const c = findCoupon(code);
  if(!c) return { ok:false, reason:'Cupón desconocido' };
  return { ok:true, coupon:c };
}

module.exports = { COUPON_RULES, validateCoupon };
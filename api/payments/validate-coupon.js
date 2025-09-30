// Endpoint: GET /api/payments/validate-coupon?code=CODE
// Devuelve percent del cupón si existe. (No verifica puntos todavía).

const { validateCoupon } = require('./util/coupon-rules');

module.exports = async (req, res) => {
  const { code } = req.query || {};
  if(!code){
    return res.status(400).json({ ok:false, error:'code requerido' });
  }
  try {
    const r = validateCoupon(code);
    if(!r.ok) return res.status(404).json({ ok:false, error:'Cupón inválido' });
    return res.status(200).json({ ok:true, coupon:r.coupon });
  } catch(e){
    console.error('[payments] validate-coupon error', e);
    return res.status(500).json({ ok:false, error:'Error interno' });
  }
};
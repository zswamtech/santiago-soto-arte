// Smoke test de progresión de tiers de shipping
// Ejecutar con: node tests/pricing-tiers.smoke.js

const { computePricing } = require('../api/payments/util/pricing');

function format(num){ return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function assert(cond, msg){ if(!cond){ console.error('❌ FAIL:', msg); process.exitCode = 1; } else { console.log('✅', msg); } }

// Helper para generar items físicos (canvas_small = 50,000)
function makeItems(units){ return [{ id: 'canvas_small', quantity: units }]; }

// Casos límite: netAfterDiscount (sin descuentos) coincide con subtotal
const cases = [
  { qty:1, expected:{ tier:'T1', shipping:18000 } }, // 50,000
  { qty:2, expected:{ tier:'T1', shipping:18000 } }, // 100,000? Actually 2*50k = 100k → límite inferior T2, revisar reglas (T1 <100000)
  { qty:3, expected:{ tier:'T2', shipping:15000 } }, // 150,000
  { qty:4, expected:{ tier:'T2', shipping:15000 } }, // 200k → límite inferior T3 (T2 <200000)
  { qty:5, expected:{ tier:'T3', shipping:10000 } }, // 250,000
  { qty:6, expected:{ tier:'T3', shipping:10000 } }, // 300k → FREE
  { qty:7, expected:{ tier:'FREE', shipping:0 } }    // 350,000
];

console.log('▶ Smoke Shipping Tier Progression');

cases.forEach(c => {
  const items = makeItems(c.qty);
  const res = computePricing(items, {});
  const breakdown = res.breakdown;
  const net = breakdown.netAfterDiscount || (breakdown.subtotal - breakdown.discounts.total);
  // Determinar expected dinámico para límites exactos
  // Reglas: <100000 T1; 100000-199999 T2; 200000-299999 T3; >=300000 FREE
  let dynamicTier, dynamicShipping;
  if(net < 100000){ dynamicTier='T1'; dynamicShipping=18000; }
  else if(net < 200000){ dynamicTier='T2'; dynamicShipping=15000; }
  else if(net < 300000){ dynamicTier='T3'; dynamicShipping=10000; }
  else { dynamicTier='FREE'; dynamicShipping=0; }

  assert(breakdown.shippingTier === dynamicTier, `qty=${c.qty} net=${format(net)} tier esperado ${dynamicTier} obtenido ${breakdown.shippingTier}`);
  assert(breakdown.shipping === dynamicShipping, `qty=${c.qty} shipping esperado ${dynamicShipping} obtenido ${breakdown.shipping}`);

  // Si no es FREE, shippingProgress debe apuntar a un nextTier con missing >0 (salvo estar justo en borde superior)
  const prog = breakdown.shippingProgress;
  if(dynamicTier !== 'FREE'){
    if(net === 99999 || net === 199999 || net === 299999){
      // justo debajo del salto (no se alcanza por múltiplos de 50k, pero dejamos la intención)
      assert(prog.missing > 0, `qty=${c.qty} missing debería ser >0`);
    } else if(dynamicTier === 'T3') {
      // T3 debe apuntar a FREE si aún falta
      if(net < 300000){
        assert(prog.nextTier && prog.nextTier.tier === 'FREE', `qty=${c.qty} T3 debería apuntar a FREE`);
      }
    }
  } else {
    assert(!prog.nextTier, `qty=${c.qty} FREE no debe tener nextTier`);
  }
});

if(process.exitCode){
  console.error('\n❌ Smoke tiers FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 Smoke tiers OK');
}

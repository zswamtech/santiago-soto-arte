// Smoke test combinaciones patron + cupón respecto al CAP 25%
// Ejecutar: node tests/discount-combo.smoke.js

const { computePricing } = require('../api/payments/util/pricing');

function assert(cond, msg){ if(!cond){ console.error('❌ FAIL:', msg); process.exitCode=1; } else { console.log('✅', msg); } }

// Usamos subtotal 200,000 (4 lienzos pequeños * 50,000) para tener números claros
const items = [{ id:'canvas_small', quantity:4 }]; // subtotal = 200000

console.log('▶ Smoke Discount Combo (patron + cupón)');

// Caso A: 15% patron + 10% cupón = 25% exacto (no debe activar CAP)
let rA = computePricing(items, { patronDiscountPercent:15, couponPercent:10 });
let dA = rA.breakdown.discounts;
const expectedA = Math.round(200000 * 0.25);
assert(dA.total === expectedA, 'Caso A total 25% exacto');
assert(dA.appliedCap === false, 'Caso A no aplica CAP (25% exacto)');
assert(dA.patron === Math.round(200000*0.15), 'Caso A patron 15%');
assert(dA.coupon === Math.round(200000*0.10), 'Caso A cupón 10%');

// Caso B: 20% patron + 15% cupón = 35% teórico -> se recorta a 25% con proporción preservada
let rB = computePricing(items, { patronDiscountPercent:20, couponPercent:15 });
let dB = rB.breakdown.discounts;
assert(dB.appliedCap === true, 'Caso B CAP aplicado');
assert(dB.total === Math.round(200000*0.25), 'Caso B total limitado al 25%');
// Sin CAP habrían sido: patron=40000, coupon=30000, total=70000. Escala = 50000/70000 ≈ 0.714285...
const scaleB = (Math.round(200000*0.25)) / (40000 + 30000); // 50000/70000
const expectedPatronB = Math.round(40000 * scaleB);
const expectedCouponB = Math.round(30000 * scaleB);
// Tolerancia ±1 por redondeos sucesivos
assert(Math.abs(dB.patron - expectedPatronB) <= 1, 'Caso B patron reescalado proporcional');
assert(Math.abs(dB.coupon - expectedCouponB) <= 1, 'Caso B cupón reescalado proporcional');
assert(dB.patron + dB.coupon === dB.total, 'Caso B suma componentes coincide con total');

if(process.exitCode){
  console.error('\n❌ Smoke discount combo FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 Smoke discount combo OK');
}

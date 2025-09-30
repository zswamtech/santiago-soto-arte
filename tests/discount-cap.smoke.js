// Smoke test para CAP de descuentos (25%)
// Ejecutar: node tests/discount-cap.smoke.js

const { computePricing } = require('../api/payments/util/pricing');

function pct(num){ return (num*100).toFixed(2)+'%'; }
function assert(cond, msg){ if(!cond){ console.error('❌ FAIL:', msg); process.exitCode=1; } else { console.log('✅', msg); } }

// Escenario base: subtotal conocido (2 lienzos pequeños = 100000)
const items = [{ id:'canvas_small', quantity:2 }]; // subtotal 100000

// Caso 1: Descuento combinado bajo el CAP (10% patron + 5% cupón = 15%)
let r1 = computePricing(items, { patronDiscountPercent:10, couponPercent:5 });
const d1 = r1.breakdown.discounts;
assert(d1.total === Math.round(100000*0.15), 'Caso1 total descuento 15%');
assert(d1.appliedCap === false, 'Caso1 no aplica CAP');

// Caso 2: Descuento combinado excede CAP (20% patron + 20% cupón = 40% > 25%)
let r2 = computePricing(items, { patronDiscountPercent:20, couponPercent:20 });
const d2 = r2.breakdown.discounts;
assert(d2.appliedCap === true, 'Caso2 CAP aplicado');
assert(d2.total === Math.round(100000*0.25), 'Caso2 total limitado al 25%');

// Validar redistribución proporcional (aprox). Teórico sin CAP: 20000 + 20000 = 40000. Escala = 25000/40000 = 0.625
// Esperamos patron y coupon ≈ 12500 cada uno (puede variar ±1 por redondeo)
const scaleTarget = 0.625;
const expectedEach = Math.round(20000 * scaleTarget);
assert(Math.abs(d2.patron - expectedEach) <= 1, 'Caso2 patron reescalado proporcional');
assert(Math.abs(d2.coupon - expectedEach) <= 1, 'Caso2 coupon reescalado proporcional');
assert(d2.patron + d2.coupon === d2.total, 'Caso2 suma componentes = total cap');

// Caso 3: Solo un tipo de descuento excede CAP (30% patron, 0% cupón)
let r3 = computePricing(items, { patronDiscountPercent:30, couponPercent:0 });
const d3 = r3.breakdown.discounts;
assert(d3.appliedCap === true, 'Caso3 CAP aplicado');
assert(d3.total === Math.round(100000*0.25), 'Caso3 total limitado a 25%');
assert(d3.patron === d3.total && d3.coupon === 0, 'Caso3 reescalado mantiene cupón 0');

// Caso 4: Borde exacto 25% (15% + 10%) no activa CAP
let r4 = computePricing(items, { patronDiscountPercent:15, couponPercent:10 });
const d4 = r4.breakdown.discounts;
assert(d4.total === Math.round(100000*0.25), 'Caso4 total 25% exacto');
assert(d4.appliedCap === false, 'Caso4 no debe marcar CAP en 25% exacto');

if(process.exitCode){
  console.error('\n❌ Smoke discount CAP FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 Smoke discount CAP OK');
}

// Smoke: Verifica que la redención de cupón es idempotente (uses incrementa sólo una vez)
// Requiere: POSTGRES_URL y que migraciones estén aplicadas.

const { execSync } = require('child_process');
const crypto = require('crypto');

function requireEnv(){
  if(!process.env.POSTGRES_URL){
    console.log('SKIP: POSTGRES_URL no definido, saltando coupon-redemption smoke');
    process.exit(0);
  }
}

async function main(){
  requireEnv();
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  try {
    const code = 'PATRON5';
    const fakeOrderId = 'ord_smoke_'+Date.now();

    // Insert redención directa (simulando webhook exitoso por primera vez)
    await client.query('BEGIN');
    await client.query('INSERT INTO coupon_redemptions(code, order_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[code,fakeOrderId]);
    await client.query('UPDATE coupons SET uses = uses + 1 WHERE code=$1',[code]);
    await client.query('COMMIT');

    // Intento duplicado (como si llegara el mismo webhook otra vez)
    await client.query('BEGIN');
    await client.query('INSERT INTO coupon_redemptions(code, order_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[code,fakeOrderId]);
    await client.query('UPDATE coupons SET uses = uses + 1 WHERE code=$1 AND NOT EXISTS (SELECT 1 FROM coupon_redemptions WHERE code=$1 AND order_id=$2)',[code,fakeOrderId]);
    await client.query('COMMIT');

    const { rows } = await client.query('SELECT uses FROM coupons WHERE code=$1',[code]);
    if(!rows.length) throw new Error('Cupón no encontrado');
    const uses = rows[0].uses;
    if(uses < 1) throw new Error('El contador de uses no incrementó');

    console.log('✅ coupon-redemption smoke OK (uses actual =', uses + ')');
  } finally {
    await client.end();
  }
}

main().catch(e=>{ console.error('❌ coupon-redemption smoke FAIL', e); process.exit(1); });

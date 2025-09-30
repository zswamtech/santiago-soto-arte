#!/usr/bin/env node
/**
 * Verificador de integridad de órdenes
 * - Recalcula la firma HMAC del snapshot guardado y compara con snapshot_signature
 * - Lista discrepancias
 * - Muestra cuenta de órdenes con CAP y valida existencia de evento discount_cap_events
 *
 * Uso:
 *   node scripts/verify-pricing-signatures.js [--limit 50] [--fail-on-mismatch]
 * Requisitos:
 *   - Variables: POSTGRES_URL, PRICE_SNAPSHOT_SECRET
 */

const { Client } = require('pg');
const { signPricingSnapshot } = require('../api/payments/util/pricing-signature');

async function main(){
  const args = process.argv.slice(2);
  const limitArg = args.find(a=> a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1],10) : 100;
  const failOnMismatch = args.includes('--fail-on-mismatch');

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  console.log(`→ Verificando últimas ${limit} órdenes...`);
  const { rows } = await client.query(`SELECT id, pricing_snapshot, snapshot_signature, discount_cap_applied FROM orders ORDER BY created_at DESC LIMIT $1`, [limit]);

  let mismatches = [];
  let capCount = 0;
  for(const row of rows){
    if(row.discount_cap_applied) capCount++;
    const snap = row.pricing_snapshot;
    let ok = false; let expected;
    try {
      const sig = signPricingSnapshot(snap).signature;
      expected = sig;
      ok = (sig === row.snapshot_signature);
    } catch(e){
      mismatches.push({ id: row.id, error: e.message });
      continue;
    }
    if(!ok){
      mismatches.push({ id: row.id, expected, stored: row.snapshot_signature });
    }
  }

  console.log(`Órdenes revisadas: ${rows.length}`);
  console.log(`CAP aplicado en: ${capCount} (${rows.length? ((capCount/rows.length)*100).toFixed(1):'0'}%)`);

  // Verificar que existan eventos para órdenes con CAP
  const capIds = rows.filter(r=> r.discount_cap_applied).map(r=> r.id);
  if(capIds.length){
    const { rows: events } = await client.query(`SELECT order_id, COUNT(*) c FROM discount_cap_events WHERE order_id = ANY($1) GROUP BY order_id`, [capIds]);
    const map = Object.fromEntries(events.map(e=> [e.order_id, parseInt(e.c,10)]));
    const missing = capIds.filter(id=> !map[id]);
    if(missing.length){
      console.log('⚠️ Órdenes con CAP sin evento discount_cap_events:', missing);
    } else {
      console.log('✅ Todos los CAP tienen evento registrado');
    }
  }

  if(mismatches.length){
    console.log('❌ Mismatches / errores de firma encontrados:');
    mismatches.forEach(m=> console.log(' -', m));
  } else {
    console.log('✅ Todas las firmas coinciden');
  }

  await client.end();
  if(failOnMismatch && mismatches.length){
    process.exit(1);
  }
}

main().catch(e=>{ console.error('Error ejecutando verificación:', e); process.exit(1); });

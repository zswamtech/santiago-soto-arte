#!/usr/bin/env node
/**
 * Script de migraciones simple.
 * Aplica archivos en ./migrations en orden ascendente si no existen en schema_migrations.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  const conn = process.env.POSTGRES_URL;
  if(!conn){
    console.error('[migrate] POSTGRES_URL no definido');
    process.exit(1);
  }
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => /\d+.*\.sql$/.test(f))
    .sort();
  if(files.length === 0){
    console.log('[migrate] No hay migraciones');
    return;
  }
  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations(\n  version TEXT PRIMARY KEY,\n  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n)`);
    const { rows } = await client.query('SELECT version FROM schema_migrations');
    const applied = new Set(rows.map(r => r.version));

    for(const file of files){
      const version = file.split('_')[0];
      if(applied.has(version)){
        console.log(`[migrate] Skip ${file} (ya aplicado)`);
        continue;
      }
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      console.log(`[migrate] Aplicando ${file} ...`);
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(version) VALUES($1) ON CONFLICT DO NOTHING', [version]);
      console.log(`[migrate] OK ${file}`);
    }
    await client.query('COMMIT');
    console.log('[migrate] Completado');
  } catch (e){
    await client.query('ROLLBACK');
    console.error('[migrate] Error:', e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();

#!/usr/bin/env node
/**
 * Genera un archivo JSON consumible por shields.io endpoint dinámico
 * Detecta la última migración aplicada por convención de nombre NNN_*.sql
 * Uso: node scripts/generate-migration-badge.js
 */
const fs = require('fs');
const path = require('path');

function main(){
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const badgeDir = path.join(__dirname, '..', 'badges');
  if(!fs.existsSync(migrationsDir)){
    console.error('No migrations directory found');
    process.exit(1);
  }
  const files = fs.readdirSync(migrationsDir)
    .filter(f=>/^\d{3}_.+\.sql$/.test(f))
    .sort();
  const last = files[files.length-1] || null;
  const version = last ? last.split('_')[0] : '000';
  if(!fs.existsSync(badgeDir)) fs.mkdirSync(badgeDir);
  const badge = {
    schemaVersion: 1,
    label: 'migration',
    message: version,
    color: 'blue'
  };
  fs.writeFileSync(path.join(badgeDir, 'migration-badge.json'), JSON.stringify(badge, null, 2));
  console.log('Generated badge for migration version', version);
}

main();

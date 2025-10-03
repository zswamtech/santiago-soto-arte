#!/usr/bin/env node
/**
 * Conversión de imágenes de memory-cards a WebP y AVIF.
 * Requisitos: npm i sharp --save-dev
 * Uso: npm run images:optimize
 */
const fs = require('fs');
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch(e){
  console.error('\n[convert-images] Falta dependencia sharp. Instala con: npm i -D sharp\n');
  process.exit(1);
}

const SRC_DIR = path.join(__dirname, '..', 'assets', 'img', 'memory-cards');

function isPng(file){ return file.toLowerCase().endsWith('.png'); }

async function convertFile(file){
  const full = path.join(SRC_DIR, file);
  const base = file.replace(/\.png$/i, '');
  const webpOut = path.join(SRC_DIR, base + '.webp');
  const avifOut = path.join(SRC_DIR, base + '.avif');

  // Evitar reconvertir si ya existen (se puede forzar borrando)
  const pngStat = fs.statSync(full);
  const needsWebp = !fs.existsSync(webpOut) || fs.statSync(webpOut).mtimeMs < pngStat.mtimeMs;
  const needsAvif = !fs.existsSync(avifOut) || fs.statSync(avifOut).mtimeMs < pngStat.mtimeMs;

  if(!needsWebp && !needsAvif){
    console.log('Skip (actualizado):', file);
    return;
  }

  const image = sharp(full);
  try {
    if(needsWebp){
      await image.clone().webp({ quality: 82 }).toFile(webpOut);
      console.log('WEBP:', webpOut);
    }
    if(needsAvif){
      await image.clone().avif({ quality: 50 }).toFile(avifOut);
      console.log('AVIF:', avifOut);
    }
  } catch(err){
    console.warn('Error convirtiendo', file, err.message);
  }
}

(async function run(){
  if(!fs.existsSync(SRC_DIR)){
    console.error('Directorio no existe:', SRC_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(SRC_DIR).filter(isPng);
  console.log('\n=== Conversión imágenes memory-cards ===');
  console.log('PNG encontradas:', files.length);  
  for(const f of files){
    await convertFile(f);
  }
  console.log('\nListo. Puedes actualizar el juego para usar <picture> con AVIF/WebP.');
})();

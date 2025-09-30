// Server-side mapping puntos -> porcentaje descuento patron
// Esta capa replica temporalmente los niveles del frontend (art-patron-system.js)
// y debe ser reemplazada cuando exista un ledger server authoritative.

const LEVELS = [
  { name: 'Art Curious', min: 0, max: 99, percent: 0 },
  { name: 'Art Friend', min: 100, max: 299, percent: 5 },
  { name: 'Art Supporter', min: 300, max: 599, percent: 8 },
  { name: 'Art Patron', min: 600, max: 999, percent: 12 },
  { name: 'Art Champion', min: 1000, max: 1999, percent: 15 },
  { name: 'Art Legend', min: 2000, max: Infinity, percent: 20 }
];

function getPatronLevel(points){
  const p = typeof points === 'number' && points >= 0 ? points : 0;
  return LEVELS.find(l => p >= l.min && p <= l.max) || LEVELS[0];
}

function derivePatronDiscountPercent(points){
  return getPatronLevel(points).percent;
}

module.exports = { LEVELS, getPatronLevel, derivePatronDiscountPercent };

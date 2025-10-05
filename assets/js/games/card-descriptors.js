/*
 * card-descriptors.js
 * Sistema híbrido de definición de cartas para el Memory artístico.
 * Proporciona:
 *  - Enumeración de tipos de carta (CARD_TYPES)
 *  - Conversión de color a CIE Lab + ΔE2000
 *  - computeDifficulty(cardDef): calcula dificultad numérica continua
 *  - scoreMatch(cardDef, base?): convierte dificultad en puntos controlados
 *  - buildColorMetrics / helpers para normalizar métricas en cartas de color
 *
 * Este módulo NO hace el render. Sólo define la capa de datos y la fórmula.
 * La integración visual se hará en unified-memory.js consumiendo estas funciones.
 */

(function(global){
  'use strict';

  const CARD_TYPES = Object.freeze({
    COLOR_OVERLAP: 'colorOverlap',
    COLOR_TRIPLE: 'colorTriple',
    COLOR_RESULT: 'colorResult',
    PATTERN: 'pattern',
    COUNT_EMOJI: 'countEmoji',
    VISUAL_MATH: 'visualMath',
    SHAPE_SINGLE: 'shapeSingle'
  });

  /* ===================== Utilidades de Color (CIE Lab + ΔE2000) ===================== */

  function hexToRgb(hex){
    if(!hex) return {r:0,g:0,b:0};
    let h = hex.replace('#','').trim();
    if(h.length === 3) h = h.split('').map(c=>c+c).join('');
    const intVal = parseInt(h,16);
    return { r:(intVal>>16)&255, g:(intVal>>8)&255, b:intVal&255 };
  }

  function rgbToXyz({r,g,b}){
    // normalizar
    r/=255; g/=255; b/=255;
    // sRGB companding inverso
    r = r>0.04045? Math.pow((r+0.055)/1.055,2.4): r/12.92;
    g = g>0.04045? Math.pow((g+0.055)/1.055,2.4): g/12.92;
    b = b>0.04045? Math.pow((b+0.055)/1.055,2.4): b/12.92;
    // matriz D65
    return {
      x: (r*0.4124564 + g*0.3575761 + b*0.1804375),
      y: (r*0.2126729 + g*0.7151522 + b*0.0721750),
      z: (r*0.0193339 + g*0.1191920 + b*0.9503041)
    };
  }

  function xyzToLab({x,y,z}){
    // referencia D65
    const Xr=0.95047, Yr=1.00000, Zr=1.08883;
    let fx = f(x/Xr), fy = f(y/Yr), fz = f(z/Zr);
    return {
      L: 116*fy - 16,
      a: 500*(fx - fy),
      b: 200*(fy - fz)
    };
    function f(t){ return t>0.008856? Math.cbrt(t) : (903.3*t+16)/116; }
  }

  function hexToLab(hex){
    return xyzToLab(rgbToXyz(hexToRgb(hex)));
  }

  // ΔE2000 implementación basada en fórmula oficial (simplificada y optimizada para pocas llamadas)
  function deltaE2000(lab1, lab2){
    const {L:L1,a:a1,b:b1} = lab1; const {L:L2,a:a2,b:b2} = lab2;
    const avgLp = (L1+L2)/2;
    const C1 = Math.sqrt(a1*a1 + b1*b1);
    const C2 = Math.sqrt(a2*a2 + b2*b2);
    const avgC = (C1+C2)/2;
    const G = 0.5*(1 - Math.sqrt(Math.pow(avgC,7)/(Math.pow(avgC,7)+Math.pow(25,7))));
    const a1p = a1*(1+G), a2p = a2*(1+G);
    const C1p = Math.sqrt(a1p*a1p + b1*b1);
    const C2p = Math.sqrt(a2p*a2p + b2*b2);
    const avgCp = (C1p+C2p)/2;
    const h1p = hpF(b1,a1p);
    const h2p = hpF(b2,a2p);
    let avghp;
    const hDiff = Math.abs(h1p-h2p);
    if(C1p*C2p === 0) avghp = h1p + h2p; else if(hDiff>180) avghp = (h1p + h2p + 360)/2; else avghp = (h1p + h2p)/2;
    const T = 1 - 0.17*Math.cos(rad(avghp-30)) + 0.24*Math.cos(rad(2*avghp)) + 0.32*Math.cos(rad(3*avghp+6)) - 0.20*Math.cos(rad(4*avghp-63));
    let dhp;
    if(C1p*C2p === 0) dhp = 0; else if(hDiff<=180) dhp = h2p - h1p; else dhp = (h2p<=h1p? h2p - h1p + 360 : h2p - h1p - 360);
    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    const dHp = 2*Math.sqrt(C1p*C2p)*Math.sin(rad(dhp)/2);
    const Sl = 1 + (0.015*Math.pow(avgLp-50,2))/Math.sqrt(20+Math.pow(avgLp-50,2));
    const Sc = 1 + 0.045*avgCp;
    const Sh = 1 + 0.015*avgCp*T;
    const Rt = -2*Math.sqrt(Math.pow(avgCp,7)/(Math.pow(avgCp,7)+Math.pow(25,7))) * Math.sin(rad(60*Math.exp(-Math.pow((avghp-275)/25,2))));
    const dE = Math.sqrt(
      Math.pow(dLp/(Sl),2) + Math.pow(dCp/(Sc),2) + Math.pow(dHp/(Sh),2) + Rt*(dCp/(Sc))*(dHp/(Sh))
    );
    return dE;

    function hpF(b,a){
      if(a===0 && b===0) return 0;
      const h = (Math.atan2(b,a)*180/Math.PI + 360)%360;
      return h;
    }
    function rad(deg){ return deg*Math.PI/180; }
  }

  /* ===================== Métricas específicas ===================== */

  function buildColorMetrics(colors){
    // colors: array de hex string ['#rrggbb', ...]
    const labs = colors.map(hexToLab);
    let deltas = [];
    for(let i=0;i<labs.length;i++){
      for(let j=i+1;j<labs.length;j++){
        deltas.push(deltaE2000(labs[i], labs[j]));
      }
    }
    const minDelta = deltas.length? Math.min(...deltas):0;
    const maxDelta = deltas.length? Math.max(...deltas):0;
    const avgDelta = deltas.length? deltas.reduce((a,b)=>a+b,0)/deltas.length:0;
    return { deltas, minDelta, maxDelta, avgDelta };
  }

  /* ===================== computeDifficulty ===================== */
  // Devuelve número >=1 (aprox). Escalas controladas para que no exploten.
  function computeDifficulty(cardDef){
    if(!cardDef || !cardDef.type) return 1;
    const t = cardDef.type;
    const m = cardDef.metrics || {};

    switch(t){
      case CARD_TYPES.COLOR_OVERLAP: {
        // ΔE bajo = colores similares => más difícil. Usamos (50 - clamp(deltaE,0,50))
        const dE = clamp(m.deltaE || m.minDelta || m.avgDelta || 0, 0, 50);
        return 1 + (50 - dE)/18; // dE=0 => 1+50/18≈3.77 ; dE=50 =>1
      }
      case CARD_TYPES.COLOR_TRIPLE: {
        // Considerar promedio y el mínimo para penalizar triadas muy cercanas
        const minD = clamp(m.minDelta||0,0,50);
        const avgD = clamp(m.avgDelta||minD,0,60);
        const base = 1 + (55 - avgD)/30; // más alto si promedio es bajo
        const nearPenalty = (minD < 14 ? 0.6 : 0); // triada con par casi igual aumenta dificultad
        return round2(base + nearPenalty);
      }
      case CARD_TYPES.COLOR_RESULT: {
        // Hereda dificultad media de origen (pre-calculada en cardDef.sourceDifficulty)
        return clamp(cardDef.sourceDifficulty || 1, 1, 5);
      }
      case CARD_TYPES.PATTERN: {
        // uniqueSymbols, symmetryBroken(bool), irregularity(0-1)
        const u = m.uniqueSymbols || 1;
        const sym = m.symmetryBroken? 0.7:0;
        const irr = clamp(m.irregularity||0,0,1);
        return 0.9 + u*0.4 + sym + irr*0.8; // típicamente 1.3 - 3.0
      }
      case CARD_TYPES.COUNT_EMOJI: {
        const total = m.totalItems || 1; // <=12 recomendable
        const variety = m.variety || 1; // símbolos distintos
        return 0.8 + total*0.12 + variety*0.35; // controlado
      }
      case CARD_TYPES.VISUAL_MATH: {
        const ops = m.operands || 2; // 2..4
        const opComplex = m.operatorComplexity || 0; // suma=0, multi=0.5, mixta=0.8
        return 1 + (ops-2)*0.45 + opComplex; // 1..~2.7
      }
      case CARD_TYPES.SHAPE_SINGLE: {
        // Depende de la ambigüedad: metric shapeSetSize (cuántas parecidas había)
        const setSize = clamp(m.shapeSetSize||3,1,12); // más grande => más difícil
        return 0.9 + Math.log2(setSize); // setSize=3=>~2.4 ; 12=>~4.5
      }
      default:
        return 1;
    }
  }

  /* ===================== scoreMatch ===================== */
  // Crece suavemente con dificultad. base por defecto 100.
  function scoreMatch(cardDef, base = 100){
    const d = computeDifficulty(cardDef);
    // Factor logarítmico estable
    const factor = 1 + Math.log10(1 + d);
    return Math.round(base * factor);
  }

  /* ===================== Helpers ===================== */
  function clamp(v,min,max){ return v < min ? min : (v > max ? max : v); }
  function round2(x){ return Math.round(x*100)/100; }

  /* ===================== API pública ===================== */
  const api = {
    CARD_TYPES,
    hexToLab,
    deltaE2000,
    buildColorMetrics,
    computeDifficulty,
    scoreMatch
  };

  /* ===================== HOOKS DE INTEGRACIÓN (GUÍA) =====================
   * 1. En unified-memory.js durante la creación del pool de cartas:
   *    - Para cartas de mezcla doble: const metrics = CardDescriptors.buildColorMetrics([hexA, hexB]);
   *      card.metrics.deltaE = metrics.deltas[0]; (también puedes guardar min/avgDelta)
   *      card.difficulty = CardDescriptors.computeDifficulty(card).
   *    - Para mezcla triple: usar buildColorMetrics con las 3; guardar {minDelta, avgDelta}.
   *    - Para resultado color: card.sourceDifficulty = promedio de las cartas fuente.
   * 2. Al hacer match y calcular puntos:
   *      const pts = CardDescriptors.scoreMatch(cardDef, 100); // base configurable
   *      aplicar streakMultiplier si existe: Math.round(pts * currentStreakFactor)
   * 3. Persistencia / Analytics (opcional): registrar {cardId, type, difficulty, resolvedMs}
   * 4. Para optimizaciones de performance: precalcular difficulty y puntos esperados una sola vez.
   * 5. Para mostrar tooltip educativo en modo analítico: usar metrics.minDelta / deltaE formateado con 1 decimal.
   * 6. Validar que buildColorMetrics solo se llame una vez por carta generada para no duplicar coste.
   * 7. Extensión futura: añadir tipos nuevos sólo requiere agregar case en computeDifficulty.
   */

  // UMD simple
  if(typeof module !== 'undefined' && module.exports){
    module.exports = api;
  } else {
    global.CardDescriptors = api;
  }

})(typeof window !== 'undefined' ? window : globalThis);

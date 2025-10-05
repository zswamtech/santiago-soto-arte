/* xp.js - Sistema de XP y niveles (1-20) + recompensas básicas
 * Eventos emitidos: xp.gained, level.up
 */
(function(global){
  const KEY = 'sg_xp_v1';
  const initial = { level:1, xp:0, totalXP:0 };

  function load(){
    try { return Object.assign({}, initial, JSON.parse(localStorage.getItem(KEY)||'{}')); } catch(e){ return {...initial}; }
  }
  function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }

  const state = load();

  const ranks = [
    'Novato del Lienzo','Aprendiz del Pigmento','Mezclador Curioso','Estudiante del Matiz','Explorador Cromático',
    'Pintor Novicio','Artista del Espectro','Tejedor de Tonos','Guardián del Prisma','Alquimista Cromático',
    'Sinfonista Visual','Arquitecto del Color','Poeta de Paletas','Sabio del Arcoíris','Maestro del Pigmento',
    'Visionario Cromático','Emperador del Espectro','Titán de las Tintas','Deidad del Prisma','Eterno Artista del Color'
  ];

  function requiredXP(level){
    if(level === 1) return 100;
    if(level < 5) return 100 + (level - 1) * 50; // escalado suave primeros niveles
    if(level < 10) return 100 * level;           // medio
    return Math.floor(100 * level * 1.15);       // avanzado
  }

  function addXP(amount, source){
    state.xp += amount; state.totalXP += amount;
    GameCore.eventBus.emit('xp.gained', { amount, source, level: state.level, totalXP: state.totalXP });
    checkLevelUp();
    save(state);
  }

  function checkLevelUp(){
    let leveled = false;
    while(state.xp >= requiredXP(state.level) && state.level < 20){
      state.xp -= requiredXP(state.level);
      state.level++;
      leveled = true;
      GameCore.eventBus.emit('level.up', { level: state.level, rank: ranks[state.level-1] });
    }
    if(leveled) save(state);
  }

  function getState(){ return { ...state, rank: ranks[state.level-1], toNext: requiredXP(state.level) - state.xp }; }

  global.GameXP = { addXP, getState, requiredXP };
})(window);

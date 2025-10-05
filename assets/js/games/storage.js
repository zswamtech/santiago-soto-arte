/* storage.js - Wrapper de almacenamiento para juegos
 * - Namespacing
 * - Versionado simple
 * - Serialización segura
 */
(function(global){
  const NS = 'sg_store_v1';
  const LS_KEY = 'sg_storage_v1';
  const initial = {
    version: 1,
    score: 0,
    achievements: [],
    theme: 'dark',
    games: {
      colorMixing: { bestStreak: 0, plays: 0 },
      memory: { bestTime: null, plays: 0 },
      idea: { ideasSaved: 0 }
    },
    history: { events: [] } // historial near-miss / surprise
  };

  function load(){
    try {
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return { ...initial };
      const parsed = JSON.parse(raw);
      // Migraciones sencillas si version cambia en el futuro
      if(!parsed.version){ parsed.version = 1; }
      return { ...initial, ...parsed, games: { ...initial.games, ...(parsed.games||{}) } };
    } catch(e){
      console.warn('[games:storage] error load -> reset', e);
      return { ...initial };
    }
  }

  function save(state){
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch(e){ console.error('[games:storage] save error', e); }
  }

  const state = load();

  const Storage = {
    getState(){ return state; },
    patch(partial){ Object.assign(state, partial); save(state); },
    updateGameStat(gameKey, patchObj){ state.games[gameKey] = { ...(state.games[gameKey]||{}), ...patchObj }; save(state); },
    addAchievement(id){ if(!state.achievements.includes(id)){ state.achievements.push(id); save(state); } },
    setTheme(theme){ state.theme = theme; save(state); },
    addScore(points){ state.score += points; save(state); return state.score; },
    appendHistory(entry){
      try {
        const e = { id: entry.id || ('h-' + Date.now() + '-' + Math.random().toString(36).slice(2,6)), t: Date.now(), type: entry.type, kind: entry.kind, data: entry.data||{} };
        state.history.events.push(e);
        if(state.history.events.length>30){ state.history.events.splice(0, state.history.events.length-30); }
        save(state);
        return e;
      } catch(err){ console.warn('[games:storage] appendHistory error', err); }
    }
  };

  global.GameStorage = Storage;
})(window);

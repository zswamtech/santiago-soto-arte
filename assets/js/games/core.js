/*
 * core.js - Núcleo del sistema de juegos
 * Responsable de:
 *  - Event Bus (pub/sub simple)
 *  - Registro dinámico de juegos
 *  - Ciclo de carga / desmontaje
 *  - Feature flags
 *  - API pública minimalista para integraciones futuras
 */

(function(global){
  const FLAGS_KEY = 'sg_flags_v1';

  const defaultFlags = {
    enableColorMixing: true,
    enableMemory: true,
    enableIdeaGenerator: true,
    enableQuiz: true,           // habilitado para pruebas
    enableSlidePuzzle: false,   // futuro
    enableSpeedColor: false     // futuro
  };

  const storage = {
    loadFlags(){
      try {
        const raw = JSON.parse(localStorage.getItem(FLAGS_KEY));
        const merged = { ...defaultFlags, ...(raw || {}) };
        // Migración: asegurar quiz visible para pruebas actuales
        if(merged.enableQuiz === false) {
          merged.enableQuiz = true;
        }
        return merged;
      } catch(e){ return { ...defaultFlags }; }
    },
    saveFlags(flags){ try { localStorage.setItem(FLAGS_KEY, JSON.stringify(flags)); } catch(e){} }
  };

  const flags = storage.loadFlags();

  const eventBus = (() => {
    const listeners = {};
    return {
      on(event, cb){ (listeners[event] = listeners[event] || []).push(cb); return () => this.off(event, cb); },
      off(event, cb){ if(!listeners[event]) return; listeners[event] = listeners[event].filter(l => l!==cb); },
      emit(event, payload){ (listeners[event]||[]).forEach(l => { try { l(payload); } catch(e){ console.error('[games:event:error]', event, e); } }); }
    };
  })();

  const registry = new Map(); // id -> { id, title, mount, unmount, flag, category, description }
  let currentGameId = null;

  function registerGame(def){
    if(!def || !def.id) throw new Error('Game definition requires id');
    if(registry.has(def.id)) { console.warn('[games:registry] overriding game', def.id); }
    registry.set(def.id, def);
  }

  function listGames(){
    return Array.from(registry.values()).filter(g => !g.flag || flags[g.flag] !== false);
  }

  function mountGame(id, container){
    const def = registry.get(id);
    if(!def){ console.warn('[games] game not found', id); return; }
    if(def.flag && flags[def.flag] === false){ console.warn('[games] flag disabled for', id); return; }
    if(currentGameId && currentGameId !== id){ unmountCurrent(); }
    try {
      def.mount(container, { eventBus, flags });
      currentGameId = id;
      eventBus.emit('game.mounted', { id });
    } catch(e){ console.error('[games] mount error', id, e); }
  }

  function unmountCurrent(){
    if(!currentGameId) return;
    const def = registry.get(currentGameId);
    if(def && typeof def.unmount === 'function'){
      try { def.unmount(); } catch(e){ console.error('[games] unmount error', currentGameId, e); }
    }
    eventBus.emit('game.unmounted', { id: currentGameId });
    currentGameId = null;
  }

  function updateFlag(key, value){
    flags[key] = value; storage.saveFlags(flags); eventBus.emit('flags.updated', { key, value, flags });
  }

  // API pública
  const GameCore = { registerGame, listGames, mountGame, unmountCurrent, eventBus, flags, updateFlag };

  // Exponer global
  global.GameCore = GameCore;

})(window);

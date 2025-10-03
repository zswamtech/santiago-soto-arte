/* powerups.js - Infraestructura de Power-Ups Educativos */
(function(global){
  const KEY = 'sg_powerups_v1';
  const initial = {
    artistVision: { available:true, cooldownEnds:0 },
    chromaticMemory: { available:true, uses:1 },
    masterPalette: { available:true, uses:2 },
    musicalSynesthesia: { enabled:false },
    magicMix: { unlocked:false }
  };

  function load(){ try { return Object.assign({}, initial, JSON.parse(localStorage.getItem(KEY)||'{}')); } catch(e){ return {...initial}; } }
  function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }

  const state = load();

  function usePowerUp(name){
    const now = Date.now();
    switch(name){
      case 'artistVision':
        if(!state.artistVision.available || now < state.artistVision.cooldownEnds) return false;
        state.artistVision.cooldownEnds = now + 30000; // 30s
        GameCore.eventBus.emit('powerup.used', { name, effect:'highlight-complements', duration:5000 });
        break;
      case 'chromaticMemory':
        if(!state.chromaticMemory.available || state.chromaticMemory.uses <=0) return false;
        state.chromaticMemory.uses -=1;
        GameCore.eventBus.emit('powerup.used', { name, effect:'reveal-pairs', duration:500 });
        break;
      case 'masterPalette':
        if(!state.masterPalette.available || state.masterPalette.uses <=0) return false;
        state.masterPalette.uses -=1;
        GameCore.eventBus.emit('powerup.used', { name, effect:'freeze-time', duration:10000 });
        break;
      case 'musicalSynesthesia':
        state.musicalSynesthesia.enabled = !state.musicalSynesthesia.enabled;
        GameCore.eventBus.emit('powerup.toggled', { name, enabled: state.musicalSynesthesia.enabled });
        break;
      case 'magicMix':
        if(!state.magicMix.unlocked) return false;
        GameCore.eventBus.emit('powerup.used', { name, effect:'mix-preview', duration:0 });
        break;
      default: return false;
    }
    save(state);
    return true;
  }

  function getState(){ return JSON.parse(JSON.stringify(state)); }

  global.GamePowerUps = { usePowerUp, getState };
})(window);

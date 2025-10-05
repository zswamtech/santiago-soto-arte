/* micro-rewards.js - Sistema de micro-recompensas instantáneas
 * Objetivo: feedback <1s y pequeños impulsos de XP / energía para reforzar acciones.
 * Eventos que emite: micro.combo, micro.perfectTiming, micro.streak, micro.fastCompletion
 */
(function(global){
  if(!global.GameCore){ return; }
  const BUS = GameCore.eventBus;

  const config = {
    comboThresholds: [3,5],           // disparar en x3 y x5 consecutivos
    comboWindowMs: 12000,             // tiempo máximo entre eventos contiguos
    perfectTimingMarginMs: 1200,      // margen de rapidez para considerar 'perfectTiming'
    fastCompletionMs: 60000,          // partida completada rápido (memoria)
    xp:{ combo3:15, combo5:30, perfect:10, fastCompletion:40 },
    energy:{ combo:10, perfect:5, fastCompletion:15 }
  };

  const state = {
    lastActionTime:0,
    comboCount:0
  };

  function gainXP(amount, reason){ if(global.GameXP) GameXP.addXP(amount, reason); }
  function gainEnergy(amount, reason){ if(global.Gamification && global.Gamification.energy) global.Gamification.energy.gain(reason, amount); }

  function handleScoreChanged(e){
    const now = Date.now();
    if(now - state.lastActionTime <= config.comboWindowMs){
      state.comboCount++;
    } else {
      state.comboCount = 1;
    }
    state.lastActionTime = now;
    const isCombo = config.comboThresholds.includes(state.comboCount);
    if(isCombo){
      const key = state.comboCount === 3 ? 'combo3':'combo5';
      const xp = state.comboCount === 3 ? config.xp.combo3 : config.xp.combo5;
      const energyGain = config.energy.combo;
      gainXP(xp, key);
      gainEnergy(energyGain, key);
      BUS.emit('micro.combo', { streak: state.comboCount, xp, energy: energyGain });
      if(global.GameNotifications){
        GameNotifications.push({ type:'xp', title:`Combo x${state.comboCount}`, message:`+${xp} XP / +${energyGain}⚡`, icon:'🔥', mergeKey:'combo' });
      }
    }
  }

  function handleGameCompleted(e){
    // Fast completion para memory-game
    if(e.id==='memory-game' && e.durationMs && e.durationMs < config.fastCompletionMs){
      gainXP(config.xp.fastCompletion, 'fastCompletion');
      gainEnergy(config.energy.fastCompletion, 'fastCompletion');
      BUS.emit('micro.fastCompletion', { id:e.id, xp:config.xp.fastCompletion });
      if(global.GameNotifications){ GameNotifications.push({ type:'xp', title:'Rápido!', message:`Memoria veloz +${config.xp.fastCompletion} XP`, icon:'⚡' }); }
    }
  }

  function handleQuizAnswered(e){
    // perfect timing: responder correctamente con mucho tiempo restante
    if(!e || !e.question || !e.correct) return;
    // Asumimos que el evento quiz.answered original no provee remaining, añadirlo futuro; por ahora calculamos por basePoints heurística
    const base = e.question.basePoints || 0;
    if(base >= 20){ // heurística: preguntas de dificultad media/alta
      gainXP(config.xp.perfect, 'perfectTiming');
      gainEnergy(config.energy.perfect, 'perfectTiming');
      BUS.emit('micro.perfectTiming', { questionId:e.question.id, xp:config.xp.perfect });
      if(global.GameNotifications){ GameNotifications.push({ type:'xp', title:'Timing Perfecto', message:`+${config.xp.perfect} XP`, icon:'⏱️' }); }
    }
  }

  // Suscripción a eventos fuente
  BUS.on('score.changed', handleScoreChanged);
  BUS.on('game.completed', handleGameCompleted);
  BUS.on('quiz.answered', handleQuizAnswered);

  global.MicroRewards = { config, state };
})(window);

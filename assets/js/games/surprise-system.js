/* surprise-system.js - Sistema de recompensas sorpresa
 * Objetivo: Introducir elementos de variabilidad y deleite que aparezcan de forma controlada
 * para reforzar compromiso sin romper balance.
 *
 * Eventos que emite:
 *  - surprise.triggered { id, type, reward, context }
 *  - surprise.rewardGranted { id, reward, xp, energy }
 *
 * Triggers iniciales (heurísticos / probabilísticos):
 *  1. Lucky XP Burst: en un evento xp.gained >= 30 existe probabilidad base (2%) de duplicar ese mismo XP como bonus extra.
 *  2. Palindrome Score (score.changed): si totalScore (acumulado aproximado) forma número palíndromo de 3+ dígitos => mini recompensa.
 *  3. Streak Booster: al alcanzar ciertas rachas (gamification.streak) que sean números primos (>=5) se otorga boost sorpresa leve.
 *  4. Quiet Period Surprise: después de 90s sin xp.gained pero el usuario genera un game.played se otorga pulso XP pequeño para reenganchar.
 *  5. Mystery Card: al completar memory-game perfecto (accuracy>=0.9 y durationMs<90000) 10% de invocar sorpresa de energía.
 *
 * Recompensas base:
 *  - XP plan: small=15, medium=35, burst= variable duplicación, streakPrime=25
 *  - Energía: surpriseEnergy=20
 *  - Puede crecer con más tipos (cosméticos, boosters temporales, etc.)
 */
(function(global){
  if(!global.GameCore){ return; }
  const BUS = global.GameCore.eventBus;

  const config = {
    luckyXP:{ probability:0.02 },
    quietPeriodMs:90000,
    mysteryMemory:{ accuracy:0.9, durationMs:90000, probability:0.10 },
    xpRewards:{ small:15, medium:35, streakPrime:25 },
    energyRewards:{ surprise:20 }
  };

  const state = {
    lastXpTime: Date.now(),
    approxScore:0,
    lastSurprises:[], // historial simple
    activeSessionStart: Date.now()
  };

  function grantXP(amount, reason){ if(global.GameXP) GameXP.addXP(amount, reason); }
  function grantEnergy(amount, reason){ if(global.Gamification && global.Gamification.energy) global.Gamification.energy.gain(reason, amount); }

  function recordSurprise(entry){
    state.lastSurprises.push({ t:Date.now(), ...entry });
    if(state.lastSurprises.length>50) state.lastSurprises.shift();
  }

  function emitTriggered(data){ BUS.emit('surprise.triggered', data); }
  function emitReward(data){ BUS.emit('surprise.rewardGranted', data); }

  function isPrime(n){ if(n<2) return false; for(let i=2;i*i<=n;i++){ if(n%i===0) return false; } return true; }
  function isPalindrome(num){ const s = String(num); return s.length>=3 && s === s.split('').reverse().join(''); }

  function handleXpGained(e){
    state.lastXpTime = Date.now();
    if(e.amount >= 30){
      // Lucky XP Burst
      if(Math.random() < config.luckyXP.probability){
        const bonus = e.amount; // duplicación
        emitTriggered({ id:'lucky-xp-burst', type:'lucky', reward:{ xp:bonus }, context:{ base:e.amount } });
        grantXP(bonus, 'luckyBurst');
        emitReward({ id:'lucky-xp-burst', xp:bonus });
        notify('Golpe de Suerte', `Duplicaste ${bonus} XP`, '🍀', 'lucky-burst');
      }
    }
  }

  function handleScoreChanged(e){
    if(e.delta>0){ state.approxScore += e.delta; }
    if(isPalindrome(state.approxScore)){
      emitTriggered({ id:'palindrome-score', type:'pattern', reward:{ xp:config.xpRewards.small }, context:{ score:state.approxScore } });
      grantXP(config.xpRewards.small, 'palindrome');
      emitReward({ id:'palindrome-score', xp:config.xpRewards.small });
      notify('Patrón Curioso', `Puntuación palíndroma ${state.approxScore} +${config.xpRewards.small} XP`, '🔁', 'pal-score');
    }
  }

  function handleStreak(e){
    if(e.streak && isPrime(e.streak) && e.streak>=5){
      emitTriggered({ id:'prime-streak', type:'streak', reward:{ xp:config.xpRewards.streakPrime }, context:{ streak:e.streak } });
      grantXP(config.xpRewards.streakPrime, 'primeStreak');
      emitReward({ id:'prime-streak', xp:config.xpRewards.streakPrime });
      notify('Racha Prima', `Racha #${e.streak} (número primo) +${config.xpRewards.streakPrime} XP`, '💠', 'prime-streak');
    }
  }

  function handleGamePlayed(e){
    // Quiet period reward
    const now = Date.now();
    if(now - state.lastXpTime > config.quietPeriodMs){
      emitTriggered({ id:'quiet-pulse', type:'reattach', reward:{ xp:config.xpRewards.medium }, context:{ idleMs: now - state.lastXpTime } });
      grantXP(config.xpRewards.medium, 'quietPulse');
      emitReward({ id:'quiet-pulse', xp:config.xpRewards.medium });
      notify('Regreso Inspirado', `Bien volver +${config.xpRewards.medium} XP`, '🌅', 'quiet-pulse');
    }
  }

  function handleGameCompleted(e){
    if(e.id==='memory-game' && typeof e.accuracy==='number' && e.accuracy>=config.mysteryMemory.accuracy && e.durationMs && e.durationMs<config.mysteryMemory.durationMs){
      if(Math.random() < config.mysteryMemory.probability){
        emitTriggered({ id:'mystery-card', type:'memoryPerfect', reward:{ energy:config.energyRewards.surprise }, context:{ accuracy:e.accuracy, durationMs:e.durationMs } });
        grantEnergy(config.energyRewards.surprise, 'mysteryCard');
        emitReward({ id:'mystery-card', energy:config.energyRewards.surprise });
        notify('Carta Misteriosa', `Energía sorpresa +${config.energyRewards.surprise}`, '🃏', 'mystery-card');
      }
    }
  }

  function notify(title, message, icon, mergeKey){
    if(global.GameNotifications){
      GameNotifications.push({ type:'xp', title, message, icon, mergeKey });
    }
  }

  // Listeners
  BUS.on('xp.gained', handleXpGained);
  BUS.on('score.changed', handleScoreChanged);
  BUS.on('gamification.streak', handleStreak);
  BUS.on('game.played', handleGamePlayed);
  BUS.on('game.completed', handleGameCompleted);

  global.SurpriseSystem = { config, state };

})(window);

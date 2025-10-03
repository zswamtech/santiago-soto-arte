/* near-miss.js - Sistema de detección de "casi" logros y oferta de retry boost
 * Objetivo: Identificar partidas que quedan muy cerca de cumplir un criterio (objetivo diario,
 * precisión mínima, tiempo límite) y ofrecer un impulso motivacional (retry con multiplicador XP breve).
 * Eventos que emite:
 *  - nearMiss.detected { id, game, reason, metrics, offerId, expiresAt }
 *  - nearMiss.accepted { offerId, game, boost:{ type, multiplier, durationMs } }
 *  - nearMiss.expired { offerId, game }
 *  - nearMiss.redeemed { offerId, game }
 *
 * Reglas iniciales (heurísticas):
 *  1. Memory Game: precisión entre 60% y 64% cuando daily exige 65% (accuracyGap <=5%)
 *  2. Memory Game: duración entre 60s y 70s si fastCompletion es <60s
 *  3. Quiz: respuesta fallida con basePoints >= 25 (pregunta de alto valor) y llevaba racha combo (micro combo >=3 dentro de ventana) -> casi logras streak perfecto.
 *  4. Weekly speed-week: si partida termina en 122-130s (límite 120s) => near-miss semanal.
 *
 * Oferta estándar: doubleXP para la PRÓXIMA partida de ese mismo juego (o próxima respuesta correcta en quiz) durante una ventana de 90s.
 * Sólo una oferta activa por juego simultáneamente. Persistencia no crítica (ephemeral).
 */
(function(global){
  if(!global.GameCore){ return; }
  const BUS = global.GameCore.eventBus;

  const config = {
    offerDurationMs: 90000,
    boost:{ multiplier:2, type:'doubleXP-once' },
    memory:{ accuracyThreshold:0.65, nearWindow:0.05, fastLimitMs:60000, fastNearWindowMs:10000 },
    weeklySpeedGraceMs:{ min:120000, max:130000 },
    quiz:{ highValueBase:25 }
  };

  const activeOffers = { /* gameId: { offerId, expiresAt, boost, reason } */ };

  function now(){ return Date.now(); }

  function generateId(){ return 'nm-' + Math.random().toString(36).slice(2,9); }

  function emitOffer(game, reason, metrics){
    // Evitar duplicar si ya hay oferta vigente para ese juego
    const existing = activeOffers[game];
    if(existing && existing.expiresAt > now()){ return; }
    const offerId = generateId();
    const expiresAt = now() + config.offerDurationMs;
    activeOffers[game] = { offerId, expiresAt, boost:config.boost, reason, metrics };
    BUS.emit('nearMiss.detected', { id:offerId, game, reason, metrics, offerId, expiresAt });
    if(global.GameNotifications){
      GameNotifications.push({ type:'near', title:'¡Casi!', message: mensajeNear(reason, game), icon:'🎯', action:{ label:'Reintentar x2 XP', event:'nearMiss.accept', data:{ offerId } }, mergeKey:'near-'+game });
    }
  }

  function mensajeNear(reason, game){
    switch(reason){
      case 'memory-accuracy': return 'Te faltó muy poco para la precisión diaria (x2 XP si reintentas ya)';
      case 'memory-fast': return 'Casi dentro del tiempo rápido, ¡vuelve a intentarlo!';
      case 'quiz-highValue': return 'Pregunta valiosa fallida, recupera y gana x2 XP';
      case 'weekly-speedNear': return 'Casi dentro del desafío semanal de velocidad';
      default: return 'Oportunidad de revancha';
    }
  }

  function acceptOffer(offerId){
    // Buscar oferta por id
    const game = Object.keys(activeOffers).find(g => activeOffers[g].offerId === offerId);
    if(!game) return false;
    const offer = activeOffers[game];
    if(offer.expiresAt < now()){ return false; }
    BUS.emit('nearMiss.accepted', { offerId, game, boost:offer.boost });
    // Marcamos boost activo one-shot
    offer.accepted = true;
    offer.redeemed = false;
    if(global.GameNotifications){ GameNotifications.push({ type:'info', title:'Boost Activo', message:'Próxima partida x2 XP', icon:'🚀', mergeKey:'boost-'+game }); }
    return true;
  }

  function maybeRedeem(game, context){
    const offer = activeOffers[game];
    if(!offer || !offer.accepted || offer.redeemed) return; // no hay boost aplicable
    if(offer.expiresAt < now()){
      BUS.emit('nearMiss.expired', { offerId:offer.offerId, game });
      delete activeOffers[game];
      return;
    }
    // Aplicar multiplicador a cualquier XP otorgado dentro de esta acción final
    if(global.GameXP && context && typeof context.baseXP === 'number'){
      const extra = context.baseXP * (config.boost.multiplier - 1);
      if(extra > 0){ GameXP.addXP(extra, 'nearMissBoost'); }
    }
    offer.redeemed = true;
    BUS.emit('nearMiss.redeemed', { offerId:offer.offerId, game });
    if(global.GameNotifications){ GameNotifications.push({ type:'xp', title:'Boost Usado', message:'XP duplicado aplicado', icon:'💥', mergeKey:'boost-'+game }); }
    // Retirar oferta tras redención
    delete activeOffers[game];
  }

  // Hook para centralizar duplicado XP cuando un boost accepted existe.
  // En lugar de interceptar addXP global, escuchamos xp.gained y emitimos xp extra justo antes de primer uso.
  // Implementación simple: Cuando ocurre game.completed del juego que tiene oferta aceptada (o quiz.answered correcta), duplicamos XP de esa partida.

  function onGameCompleted(e){
    // Detección near misses memoria
    if(e.id === 'memory-game'){
      if(typeof e.accuracy === 'number'){
        const gap = config.memory.accuracyThreshold - e.accuracy;
        if(gap > 0 && gap <= config.memory.nearWindow){
          emitOffer('memory-game', 'memory-accuracy', { accuracy:e.accuracy, needed: config.memory.accuracyThreshold });
        }
      }
      if(e.durationMs && e.durationMs >= config.memory.fastLimitMs && e.durationMs <= (config.memory.fastLimitMs + config.memory.fastNearWindowMs)){
        emitOffer('memory-game', 'memory-fast', { durationMs:e.durationMs, limit:config.memory.fastLimitMs });
      }
    }
    // Weekly speed week near miss
    if(e.durationMs && e.durationMs >= config.weeklySpeedGraceMs.min && e.durationMs <= config.weeklySpeedGraceMs.max){
      // Necesitamos saber si weekly actual es speed-week
      const state = global.GameStorage.getState();
      const weekly = state.gamification && state.gamification.weekly;
      if(weekly && weekly.id === 'speed-week' && !weekly.completed && e.durationMs > 120000){
        emitOffer(e.id, 'weekly-speedNear', { durationMs:e.durationMs, weeklyId:weekly.id });
      }
    }
    // Redención potencial (si oferta aceptada para este juego)
    maybeRedeem(e.id, { baseXP: e.baseXP || e.xp || 0 });
  }

  function onQuizAnswered(e){
    if(!e || !e.question){ return; }
    if(e.correct === false && e.question.basePoints >= config.quiz.highValueBase){
      emitOffer('quiz-game', 'quiz-highValue', { basePoints:e.question.basePoints });
    } else if(e.correct === true){
      // Intentar redimir si había oferta aceptada
      // Suponemos que base XP de una respuesta correcta ~ question.basePoints (ajustable)
      maybeRedeem('quiz-game', { baseXP: e.question.basePoints || 0 });
    }
  }

  function onTick(){
    const t = now();
    Object.keys(activeOffers).forEach(game => {
      const offer = activeOffers[game];
      if(offer.expiresAt < t){
        BUS.emit('nearMiss.expired', { offerId:offer.offerId, game });
        if(global.GameNotifications){ GameNotifications.push({ type:'info', title:'Oferta expirada', message:'La revancha ya no está disponible', icon:'⌛', mergeKey:'near-'+game }); }
        delete activeOffers[game];
      }
    });
  }
  setInterval(onTick, 5000);

  // Exponer una API mínima para aceptar oferta desde UI/hub (GameNotifications action)
  global.NearMissSystem = {
    accept: acceptOffer,
    getActive: ()=> JSON.parse(JSON.stringify(activeOffers)),
    config
  };

  // Escuchar eventos base
  BUS.on('game.completed', onGameCompleted);
  BUS.on('quiz.answered', onQuizAnswered);

  // Listener para acción desde notificaciones: usaremos un evento custom centralizado
  BUS.on('nearMiss.accept.request', data => { if(data && data.offerId) acceptOffer(data.offerId); });

})(window);

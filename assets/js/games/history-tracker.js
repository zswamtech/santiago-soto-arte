/* history-tracker.js - Captura y persiste eventos near-miss y surprise para el Hub */
(function(global){
  if(!global.GameCore || !global.GameStorage) return;
  const BUS = GameCore.eventBus;

  function add(kind, type, raw){
    const entry = GameStorage.appendHistory({ kind, type, data: raw });
    BUS.emit('history.updated', { entry, all: GameStorage.getState().history.events });
  }

  // Near-miss
  BUS.on('nearMiss.detected', e => add('nearMiss','detected',{ game:e.game, reason:e.reason, expiresAt:e.expiresAt }));
  BUS.on('nearMiss.accepted', e => add('nearMiss','accepted',{ game:e.game, boost:e.boost }));
  BUS.on('nearMiss.expired', e => add('nearMiss','expired',{ game:e.game }));
  BUS.on('nearMiss.redeemed', e => add('nearMiss','redeemed',{ game:e.game }));

  // Surprise
  BUS.on('surprise.triggered', e => add('surprise','triggered',{ id:e.id, reward:e.reward, ctx:e.context }));
  BUS.on('surprise.rewardGranted', e => add('surprise','rewardGranted',{ id:e.id, reward:e.reward||{ xp:e.xp, energy:e.energy } }));

  global.HistoryTracker = { get: ()=> GameStorage.getState().history.events.slice().reverse() };
})(window);

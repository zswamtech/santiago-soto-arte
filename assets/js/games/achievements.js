/* achievements.js - Sistema declarativo de logros */
(function(global){
  const definitions = [
    { id: 'score_100', label: 'Puntuación 100', condition: s => s.score >= 100, reward: { points: 10 } },
    { id: 'score_300', label: 'Puntuación 300', condition: s => s.score >= 300, reward: { points: 30 } },
    { id: 'color_plays_10', label: '10 Mezclas', condition: s => (s.games.colorMixing?.plays||0) >= 10 },
    { id: 'memory_plays_5', label: '5 Memorias', condition: s => (s.games.memory?.plays||0) >= 5 },
    { id: 'ideas_5', label: '5 Ideas Guardadas', condition: s => (s.games.idea?.ideasSaved||0) >= 5 }
  ];

  function evaluate(){
    const state = GameStorage.getState();
    definitions.forEach(def => {
      if(def.condition(state) && !state.achievements.includes(def.id)){
        GameStorage.addAchievement(def.id);
        if(def.reward?.points){ GameStorage.addScore(def.reward.points); }
        GameCore.eventBus.emit('achievement.unlocked', def);
      }
    });
  }

  // Suscripción a eventos de juego
  GameCore.eventBus.on('score.changed', evaluate);
  GameCore.eventBus.on('game.played', evaluate);
  GameCore.eventBus.on('idea.saved', evaluate);

  global.GameAchievements = { evaluate, definitions };
})(window);

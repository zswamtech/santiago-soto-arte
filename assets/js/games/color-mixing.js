/* color-mixing.js - Adaptación modular del juego de mezclas
 * Extraído de la clase monolítica original para futura migración progresiva.
 */
(function(global){
  function mount(container,{ eventBus }){
    // Por ahora versión placeholder que apunta al método existente si ArtGames ya está cargado.
    if(typeof artGames !== 'undefined' && artGames.colorMixingGame){
      artGames.colorMixingGame();
      // Emitir evento de juego iniciado
      GameStorage.updateGameStat('colorMixing', { plays: (GameStorage.getState().games.colorMixing.plays||0)+1 });
      eventBus.emit('game.played', { id: 'color-mixing' });
      return;
    }
    container.innerHTML = '<p>Juego de mezclas en migración…</p>';
  }

  function unmount(){ /* futuro: limpiar timers */ }

  GameCore.registerGame({
    id: 'color-mixing',
    title: 'Mezclas de Color',
    icon: '🧪',
    flag: 'enableColorMixing',
    description: 'Aprende combinaciones de color avanzadas',
    mount, unmount
  });
})(window);

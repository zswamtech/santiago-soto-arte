import React from 'react';
import MemoryCard from './MemoryCard';
import { useMemoryGame, RawImageItem } from '../hooks/useMemoryGame';
import './MemoryBoard.css';

export interface MemoryBoardProps { images: (string | RawImageItem)[] }

export function MemoryBoard({ images }: MemoryBoardProps) {
  const { deck, flipped, matchedIds, attempts, matches, totalPairs, status, actions, isLocked } = useMemoryGame({ images });

  return (
    <div className="memory-board-wrapper">
      <div className="memory-board-header">
        <h2>🧠 Juego de Memoria</h2>
        <div className="memory-stats">
          <span>Parejas: {matches}/{totalPairs}</span>
          <span>Intentos: {attempts}</span>
          <span>Estado: {status === 'finished' ? 'Completado' : (status === 'playing' ? 'Jugando' : 'Preparando')}</span>
        </div>
        <button onClick={actions.restart} className="restart-btn">Reiniciar</button>
      </div>
      <div className={`memory-grid-react ${isLocked ? 'locked' : ''}`} aria-label="Tablero de cartas" role="grid">
        {deck.map((card, index) => {
          const isFlipped = flipped.includes(index) || matchedIds.has(card.id);
          return (
            <div role="gridcell" key={card.uuid}>
              <MemoryCard
                imageUrl={card.src}
                altText={card.alt}
                isFlipped={isFlipped}
                onClick={() => actions.flipCard(index)}
              />
            </div>
          );
        })}
      </div>
      {status === 'finished' && (
        <div className="memory-finish-panel">
          <p>🎉 ¡Completado! {matches} parejas en {attempts} intentos.</p>
          <button onClick={actions.restart}>Jugar otra vez</button>
        </div>
      )}
    </div>
  );
}

export default MemoryBoard;

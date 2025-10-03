import React, { useState, useEffect } from 'react';
import MemoryCard from './MemoryCard.tsx';
import { useMemoryGame, RawImageItem, MemoryCardData } from '../hooks/useMemoryGame.ts';
import './MemoryBoard.css';

export interface MemoryBoardProps { images: (string | RawImageItem)[] }

export function MemoryBoard({ images }: MemoryBoardProps) {
  const [mode, setMode] = useState<'variants'|'split'|'clues'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memoryGameModeReact');
      if (saved === 'variants' || saved === 'split' || saved === 'clues') return saved;
    }
    return 'variants';
  });
  useEffect(() => {
    try { localStorage.setItem('memoryGameModeReact', mode); } catch(_) { /* noop */ }
  }, [mode]);
  const { deck, flipped, matchedIds, attempts, matches, totalPairs, status, actions, isLocked } = useMemoryGame({ images, mode });

  return (
    <div className="memory-board-wrapper">
      <div className="memory-board-header">
        <h2>🧠 Juego de Memoria</h2>
        <div className="memory-mode-select">
          <label>
            Modo:
            <select value={mode} onChange={e => setMode(e.target.value as any)} aria-label="Seleccionar modo de juego">
              <option value="variants">Variantes</option>
              <option value="split">Mitades</option>
              <option value="clues">Pistas</option>
            </select>
          </label>
        </div>
        <div className="memory-stats">
          <span>Parejas: {matches}/{totalPairs}</span>
          <span>Intentos: {attempts}</span>
          <span>Estado: {status === 'finished' ? 'Completado' : (status === 'playing' ? 'Jugando' : 'Preparando')}</span>
        </div>
        <button onClick={actions.restart} className="restart-btn">Reiniciar</button>
      </div>
      <div className={`memory-grid-react ${isLocked ? 'locked' : ''}`} aria-label="Tablero de cartas" role="grid">
        {/* Render en filas para cumplir ARIA (cada fila un contenedor role=row) */}
        {deck.map((card: MemoryCardData, index: number) => {
          const isFlipped = flipped.includes(index) || matchedIds.has(card.id);
          return (
            <div role="row" key={card.uuid} className="memory-row">
              <div role="gridcell">
                <MemoryCard
                  imageUrl={card.src}
                  altText={card.alt}
                  isFlipped={isFlipped}
                  onClick={() => actions.flipCard(index)}
                />
              </div>
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

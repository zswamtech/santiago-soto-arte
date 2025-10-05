import React from 'react';
import './MemoryCard.css';

export interface MemoryCardProps {
  imageUrl: string;
  altText: string;
  isFlipped: boolean;
  onClick: () => void;
}

export function MemoryCard({ imageUrl, altText, isFlipped, onClick }: MemoryCardProps) {
  return (
    <div
      className={`memory-card${isFlipped ? ' is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? altText : 'Carta oculta'}
    >
      <div className="card-inner">
        <div className="card-face card-front" aria-hidden={isFlipped}>
          <span className="card-front-icon" aria-hidden="true">🎨</span>
        </div>
        <div className="card-face card-back" aria-hidden={!isFlipped}>
          {isFlipped && (
            <img
              src={imageUrl}
              alt={altText}
              loading="lazy"
              onError={(e) => { e.currentTarget.alt = 'Imagen no disponible'; e.currentTarget.style.filter='grayscale(1)'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MemoryCard;

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * useMemoryGame - Hook de lógica central del juego de memoria.
 * Objetivo actual: modo básico (variants) con pares de imágenes duplicadas.
 * Futuro: soportar modos 'split' (mitades) y 'clues' (pista + imagen) extendiendo la estructura de cartas.
 */
export interface RawImageItem { id?: string; src: string; alt?: string; type?: string; }
export interface MemoryCardData { id: string; src: string; alt: string; key: string | number; type?: string; uuid?: string; }
export interface UseMemoryGameOptions { images?: (string | RawImageItem)[]; autoStart?: boolean; lockDelay?: number; }
export interface UseMemoryGameReturn {
  deck: MemoryCardData[];
  flipped: number[];
  matchedIds: Set<string>;
  attempts: number;
  matches: number;
  totalPairs: number;
  status: string;
  isLocked: boolean;
  actions: { flipCard: (index: number) => void; restart: () => void };
}

export function useMemoryGame({ images = [], autoStart = true, lockDelay = 900 }: UseMemoryGameOptions = {}): UseMemoryGameReturn {
  // Normalizamos: cada "item" en images puede ser string (url) o objeto { id, src, alt, type }
  const baseCards: MemoryCardData[] = useMemo(() => {
    return images.map((img, idx) => {
      if (typeof img === 'string') {
        return { id: `img-${idx}`, src: img, alt: `Imagen ${idx+1}`, key: idx } as MemoryCardData;
      }
      const obj = img as RawImageItem;
      return { id: obj.id || `img-${idx}`, src: obj.src, alt: obj.alt || obj.id || `Imagen ${idx+1}`, key: obj.id || idx, type: obj.type } as MemoryCardData;
    });
  }, [images]);

  // Generar pares (duplicamos cada baseCard)
  const generateDeck = useCallback((): MemoryCardData[] => {
    const duplicated: MemoryCardData[] = baseCards.flatMap(card => [
      { ...card, uuid: card.id + '-A' },
      { ...card, uuid: card.id + '-B' }
    ]);
    // Mezcla Fisher-Yates
    for(let i = duplicated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
    }
    return duplicated;
  }, [baseCards]);

  const [deck, setDeck] = useState(() => generateDeck());
  const [flipped, setFlipped] = useState([]); // guarda indices
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState('init'); // init | playing | finished

  const totalPairs = baseCards.length;

  const restart = useCallback(() => {
    setDeck(generateDeck());
    setFlipped([]);
    setMatchedIds(new Set());
    setAttempts(0);
    setMatches(0);
    setStatus('playing');
    setIsLocked(false);
  }, [generateDeck]);

  useEffect(() => {
    if(autoStart) restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCard = useCallback((index: number) => {
    if(isLocked) return;
    if(flipped.includes(index)) return; // ya volteada esta ronda
    if(matchedIds.has(deck[index].id)) return; // ya emparejada

    setFlipped(prev => {
      if(prev.length === 0) {
        return [index];
      } else if(prev.length === 1) {
        const firstIndex = prev[0];
        const secondIndex = index;
        const firstCard = deck[firstIndex];
        const secondCard = deck[secondIndex];
        const newFlipped = [firstIndex, secondIndex];
        setAttempts(a => a + 1);
        if(firstCard.id === secondCard.id) {
          // match
            setMatchedIds(old => new Set([...old, firstCard.id]));
            setMatches(m => m + 1);
            // pequeño buffer antes de limpiar flipped para permitir animaciones
            setTimeout(() => setFlipped([]), 400);
        } else {
          // mismatch
          setIsLocked(true);
          setTimeout(() => {
            setFlipped([]);
            setIsLocked(false);
          }, lockDelay);
        }
        return newFlipped;
      } else {
        return prev; // ignorar si ya hay dos
      }
    });
  }, [deck, flipped, isLocked, matchedIds, lockDelay]);

  useEffect(() => {
    if(status === 'playing' && matches === totalPairs && totalPairs > 0) {
      setStatus('finished');
    }
  }, [matches, totalPairs, status]);

  return {
    deck,
    flipped,
    matchedIds,
    attempts,
    matches,
    totalPairs,
    status,
    isLocked,
    actions: {
      flipCard,
      restart
    }
  };
}

export default useMemoryGame;

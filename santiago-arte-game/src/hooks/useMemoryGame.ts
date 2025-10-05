import { useCallback, useEffect, useMemo, useState } from 'react';

export type SplitRole = 'split-left' | 'split-right';
export type GameMode = 'variants' | 'split' | 'clues';

export interface RawImageItem { id?: string; src: string; alt?: string; type?: string; role?: SplitRole | 'clue' | 'image'; pairGroup?: string; clue?: string; }
export interface MemoryCardData { id: string; src: string; alt: string; key: string | number; type?: string; uuid?: string; }
export interface UseMemoryGameOptions { images?: (string | RawImageItem)[]; autoStart?: boolean; lockDelay?: number; mode?: GameMode; holdUntilNextClick?: boolean; }
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

export function useMemoryGame({ images = [], autoStart = true, lockDelay = 1850, mode = 'variants', holdUntilNextClick = true }: UseMemoryGameOptions = {}): UseMemoryGameReturn {
  const baseCards: MemoryCardData[] = useMemo(() => {
    return images.map((img, idx) => {
      if (typeof img === 'string') {
        return { id: `img-${idx}`, src: img, alt: `Imagen ${idx+1}`, key: idx } as MemoryCardData;
      }
      const obj = img as RawImageItem;
      return { id: obj.id || `img-${idx}`, src: obj.src, alt: obj.alt || obj.id || `Imagen ${idx+1}`, key: obj.id || idx, type: obj.type } as MemoryCardData;
    });
  }, [images]);

  const buildVariantsDeck = (cards: MemoryCardData[]): MemoryCardData[] => {
    const duplicated: MemoryCardData[] = cards.flatMap(card => [
      { ...card, uuid: card.id + '-A' },
      { ...card, uuid: card.id + '-B' }
    ]);
    for(let i = duplicated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
    }
    return duplicated;
  };

  const buildSplitDeck = (raw: (string | RawImageItem)[]): MemoryCardData[] => {
    // Agrupar por pairGroup con left/right presentes
    const splitItems = raw.filter(r => typeof r !== 'string' && (r as RawImageItem).role && ((r as RawImageItem).role === 'split-left' || (r as RawImageItem).role === 'split-right')) as RawImageItem[];
    const groups: Record<string, { left?: RawImageItem; right?: RawImageItem }> = {};
    splitItems.forEach(it => {
      if(!it.pairGroup) return;
      if(!groups[it.pairGroup]) groups[it.pairGroup] = {};
      if(it.role === 'split-left') groups[it.pairGroup].left = it; else if(it.role === 'split-right') groups[it.pairGroup].right = it;
    });
    const pairs: MemoryCardData[] = [];
    Object.keys(groups).forEach(g => {
      const { left, right } = groups[g];
      if(left && right){
        const baseId = left.id || right.id || g;
        pairs.push({ id: baseId + '-L', src: left.src, alt: left.alt || baseId + ' mitad izquierda', key: baseId + '-L' });
        pairs.push({ id: baseId + '-R', src: right.src, alt: right.alt || baseId + ' mitad derecha', key: baseId + '-R' });
      }
    });
    // Si no hay suficientes, fallback a variants
    if(pairs.length < 2) return buildVariantsDeck(baseCards);
    // Mezclar
    for(let i = pairs.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs.map((c, idx) => ({ ...c, uuid: c.id + '_' + idx }));
  };

  const buildCluesDeck = (raw: (string | RawImageItem)[]): MemoryCardData[] => {
    // FUTURO: construir pares imagen + clue. Placeholder: fallback variants.
    return buildVariantsDeck(baseCards);
  };

  const generateDeck = useCallback((): MemoryCardData[] => {
    switch(mode){
      case 'split': return buildSplitDeck(images);
      case 'clues': return buildCluesDeck(images);
      case 'variants':
      default: return buildVariantsDeck(baseCards);
    }
  }, [baseCards, images, mode]);

  const [deck, setDeck] = useState<MemoryCardData[]>(() => generateDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [status, setStatus] = useState<'init' | 'playing' | 'finished'>('init');
  const [pendingUnflip, setPendingUnflip] = useState<number[] | null>(null);

  // Pairs calculation depends on mode
  const totalPairs = useMemo(() => {
    if(mode === 'variants') return baseCards.length;
    if(mode === 'split') return Math.floor(deck.length / 2);
    if(mode === 'clues') return Math.floor(deck.length / 2); // imagen + pista
    return baseCards.length;
  }, [mode, baseCards.length, deck.length]);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerar mazo cuando cambia el modo
  useEffect(() => {
    // Evita reinicio innecesario si aún en init y no autoStart
    if(status !== 'init') restart();
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const flipCard = useCallback((index: number) => {
    if(isLocked) return;
    if(flipped.includes(index)) return;
    if(matchedIds.has(deck[index].id)) return;

    // Si estamos usando modo hold y hay un par pendiente de cerrar, ciérralo justo al iniciar un nuevo intento
    if(holdUntilNextClick && pendingUnflip && flipped.length === 0){
      setFlipped([]);
      setPendingUnflip(null);
      // Nota: no retornamos; permitimos que este clic cuente como primer clic del nuevo intento
    }

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
          setMatchedIds(old => new Set([...Array.from(old), firstCard.id]));
          setMatches(m => m + 1);
          setTimeout(() => setFlipped([]), 400);
        } else {
          if(holdUntilNextClick){
            // Mantener ambas abiertas hasta que el usuario inicie el siguiente intento
            setPendingUnflip([firstIndex, secondIndex]);
            // No bloqueamos, para que el siguiente clic cierre y empiece el nuevo intento
          } else {
            setIsLocked(true);
            setTimeout(() => {
              setFlipped([]);
              setIsLocked(false);
            }, lockDelay);
          }
        }
        return newFlipped;
      } else {
        return prev;
      }
    });
  }, [deck, flipped, isLocked, matchedIds, lockDelay, holdUntilNextClick, pendingUnflip]);

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
    actions: { flipCard, restart }
  };
}

export default useMemoryGame;

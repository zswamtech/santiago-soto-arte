/* memory-game.js - Versión modular y accesible del juego de Memoria
 * Incorpora:
 *  - Grid semántica ARIA
 *  - Navegación por teclado (flechas + Enter/Espacio)
 *  - Anuncios accesibles (aria-live)
 *  - Barra de progreso accesible
 *  - Integración con GameCore / GameStorage / Achievements
 */
(function(global){
  const GAME_ID = 'memory-game';
  // Configuración de la fórmula de puntuación
  const SCORING = {
    baseMatch: 20,              // puntos base por pareja
    streakStep: 5,              // incremento aplicado por cada paso de racha > 1
    failPenalty: 5,             // penalización por fallo (cuando dos cartas no coinciden)
    repeatPenalty: 5,           // penalización específica por tercera vez que volteas la MISMA carta sin haberla emparejado
    clampMinScore: 0,           // no permitir bajar de 0
    modeMultipliers: {          // multiplicadores de dificultad
      variants: 1.0,
      split: 1.12,
      clues: 1.18
    }
  };

  // Origen de datos:
  // 1) Nuevo dataset ArtBreeds (categorías -> breeds -> images variantes)
  // 2) Fallback: artGames.animalCategories (estructura anterior con animals simples)
  const breedCategories = (global.ArtBreeds && global.ArtBreeds.categories) ? global.ArtBreeds.categories : null;
  const legacyCategories = (typeof artGames !== 'undefined' && artGames.animalCategories) ? artGames.animalCategories : {};
  // API unificada mínima para el selector: devolvemos objeto { key: { name, emoji, type: 'breeds'|'legacy', items:[...] } }
  function buildUnifiedCategories(){
    if(breedCategories){
      const out = {};
      Object.keys(breedCategories).forEach(k => {
        const c = breedCategories[k];
        out[k] = { name: c.name, emoji: c.emoji || '', type: 'breeds', ref: c };
      });
      return out;
    }
    // fallback legacy
    const out = {};
    Object.keys(legacyCategories).forEach(k => {
      const c = legacyCategories[k];
      out[k] = { name: c.name, emoji: c.emoji || '', type: 'legacy', ref: c };
    });
    return out;
  }
  const unifiedCategories = buildUnifiedCategories();

  // Accessible announcer
  function createAnnouncer(){
    const polite = document.createElement('div');
    polite.className = 'sr-only';
    polite.setAttribute('aria-live','polite');
    polite.setAttribute('aria-atomic','true');

    const assertive = document.createElement('div');
    assertive.className = 'sr-only';
    assertive.setAttribute('aria-live','assertive');
    assertive.setAttribute('role','alert');

    document.body.appendChild(polite);
    document.body.appendChild(assertive);

    return {
      announce(msg, priority='polite'){
        const region = priority === 'assertive' ? assertive : polite;
        region.textContent='';
        setTimeout(()=>{ region.textContent = msg; }, 60);
      }
    };
  }

  function memoryTemplate(){
    return `<div class="memory-accessible" aria-label="Juego de memoria de animales">\n      <div class="memory-header">\n        <h3>🧠 Memoria Artística</h3>\n        <p class="memory-instructions">Usa flechas para moverte y Enter/Espacio para voltear cartas.</p>\n        <div class="memory-toolbar">\n          <label class="sr-only" for="memory-category-select">Categoría</label>\n          <select id="memory-category-select" aria-label="Seleccionar categoría"></select>\n          <label class="sr-only" for="memory-mode-select">Modo</label>\n          <select id="memory-mode-select" aria-label="Seleccionar modo de juego">\n            <option value="variants">Variantes (conceptual)</option>\n            <option value="split">Mitades (componer imagen)</option>\n            <option value="clues">Pistas (texto + imagen)</option>\n            <option value="hybrid">🎯 Híbrido (imágenes + quiz)</option>\n          </select>\n          <button id="memory-restart-btn" class="memory-action-btn">Reiniciar ♻️</button>\n          <button id="memory-back-hub" class="memory-action-btn">Menú 🏠</button>\n          <button id="memory-reduce-motion-toggle" class="memory-action-btn memory-reduce-motion-btn" aria-live="polite" aria-label="Estado animaciones: Auto" data-state="auto">Anim: Auto</button>\n        </div>\n        <div class="memory-progress-wrapper">\n          <div class="memory-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0% completado">\n            <div class="memory-progress-fill"></div>\n          </div>\n        </div>\n        <div class="memory-stats-row">\n          <span>Puntuación: <strong class="memory-score">0</strong></span>\n          <span>Parejas: <strong class="memory-pairs">0</strong></span>\n          <span>Intentos: <strong class="memory-attempts">0</strong></span>\n          <span>Modo: <strong class="memory-mode-label">Variantes</strong></span>\n          <div class="memory-feedback-chips" aria-live="polite"></div>\n        </div>\n      </div>\n      <div class="memory-grid" role="grid" aria-label="Tablero de cartas"></div>\n      <div class="memory-status" aria-live="polite" aria-atomic="true"></div>\n    </div>`;
  }

  function registerStyles(){
    // Ya migrado a memory-game.css. Solo aseguramos que si el CSS no está cargado, podemos inyectar un aviso (opcional).
    if(!document.querySelector('link[href*="memory-game.css"]')){
      console.warn('[memory-game] Falta incluir assets/css/memory-game.css en index.html');
    }
  }

  class MemoryAccessibleGame {
    constructor(container, announcer){
      this.container = container;
      this.announcer = announcer;
      this.state = {
        categoryKey: null,
        cards: [],
        flipped: [],
        matches: 0,
        attempts: 0,
        totalPairs: 0,
        mode: 'variants', // 'variants' | 'split' | 'clues' | 'hybrid'
        streakCurrent: 0,
        bestStreak: 0,
        seenCards: new Set(), // 🎯 Tracking de cartas ya vistas (solo penalizar si ya se vio antes)
        flipCounts: {}        // Conteo de volteos por índice para penalización de repetición
      };
      // Intentar restaurar modo persistido antes de montar UI
      try {
        const savedMode = localStorage.getItem('memoryGameMode');
        if(savedMode && ['variants','split','clues','hybrid'].includes(savedMode)) {
          this.state.mode = savedMode;
        }
      } catch(_){ /* ignorar */ }
      this.setup();
    }

    setup(){
      registerStyles();
      this.container.innerHTML = memoryTemplate();
      this.scoreEl = this.container.querySelector('.memory-score');
      this.pairsEl = this.container.querySelector('.memory-pairs');
      this.attemptsEl = this.container.querySelector('.memory-attempts');
      this.gridEl = this.container.querySelector('.memory-grid');
      this.progressEl = this.container.querySelector('.memory-progress');
      this.progressFillEl = this.container.querySelector('.memory-progress-fill');
  // Contenedor dinámico de feedback (chips animados)
  this.feedbackContainer = this.container.querySelector('.memory-feedback-chips');

      // Ajustar select y etiqueta al modo restaurado
      const modeSelect = this.container.querySelector('#memory-mode-select');
      if(modeSelect){
        modeSelect.value = this.state.mode;
        const label = this.container.querySelector('.memory-mode-label');
        if(label){
          const modeLabels = {
            'variants': 'Variantes',
            'split': 'Mitades',
            'clues': 'Pistas',
            'hybrid': 'Híbrido'
          };
          label.textContent = modeLabels[this.state.mode] || 'Variantes';
        }
      }

      this.populateCategories();
      this.bindToolbar();
      this.initCategory();
      this.announcer.announce('Juego de memoria iniciado. Selecciona una categoría.');
      this.initMotionPreference();
    }

    // === Preferencia Animaciones Tri-estado ===
    initMotionPreference(){
      const btn = this.container.querySelector('#memory-reduce-motion-toggle');
      if(!btn) return;
      let stored = 'auto';
      try { const raw = localStorage.getItem('memoryReduceMotionPref'); if(['auto','reduced','full'].includes(raw)) stored = raw; } catch(_){ }
      btn.dataset.state = stored;
      this.applyMotionState(stored, btn);
      btn.addEventListener('click', () => this.cycleMotionPreference());
    }

    cycleMotionPreference(){
      const btn = this.container.querySelector('#memory-reduce-motion-toggle');
      if(!btn) return;
      const order = ['auto','reduced','full'];
      let idx = order.indexOf(btn.dataset.state || 'auto');
      idx = (idx + 1) % order.length;
      const next = order[idx];
      btn.dataset.state = next;
      try { localStorage.setItem('memoryReduceMotionPref', next); } catch(_){ }
      this.applyMotionState(next, btn, true);
    }

    applyMotionState(state, btn, announce=false){
      const root = this.container.querySelector('.memory-accessible');
      if(!root) return;
      let reduce = false;
      if(state === 'reduced') reduce = true; else if(state === 'auto') {
        reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      if(reduce) root.classList.add('reduce-motion'); else root.classList.remove('reduce-motion');
      const labelMap = { auto:'Auto', reduced:'Reducidas', full:'Completas' };
      btn.textContent = `Anim: ${labelMap[state]}`;
      btn.setAttribute('aria-label', `Estado animaciones: ${labelMap[state]}`);
      if(announce) this.announcer.announce(`Animaciones ${labelMap[state]}`);
    }

    // Muestra chips efímeros de feedback (puntuación, racha, bonus)
    showFeedbackChip(text, type = 'score', duration = 1500) {
      const container = this.feedbackContainer || this.container.querySelector('.memory-feedback-chips');
      if (!container) return;
      if(this.container.classList.contains('reduce-motion')){
        // Mostrar sólo texto simple sin crear múltiples chips
        container.textContent = text;
        return;
      }
      const chip = document.createElement('div');
      chip.className = `feedback-chip chip-${type}`;
      chip.textContent = text;
      // accesibilidad: forzar anuncio (aria-live polite)
      container.textContent = text;
      container.appendChild(chip);
      setTimeout(() => {
        chip.remove();
        if(container.childElementCount === 0){
          container.textContent = '';
        }
      }, duration);
    }

    populateCategories(){
      const select = this.container.querySelector('#memory-category-select');
      const keys = Object.keys(unifiedCategories);
      if(!keys.length){
        select.innerHTML = '<option value="">(No hay categorías)</option>';
        return;
      }
      select.innerHTML = keys.map(k => `<option value="${k}">${unifiedCategories[k].emoji} ${unifiedCategories[k].name}</option>`).join('');
    }

    bindToolbar(){
      this.container.querySelector('#memory-category-select').addEventListener('change', e => {
        this.state.categoryKey = e.target.value || null;
        if(this.state.categoryKey) this.startGame();
      });
      this.container.querySelector('#memory-mode-select').addEventListener('change', e => {
        this.state.mode = e.target.value;
        try { localStorage.setItem('memoryGameMode', this.state.mode); } catch(_){ /* ignorar */ }
        const label = this.container.querySelector('.memory-mode-label');
        const modeLabels = {
          'variants': 'Variantes',
          'split': 'Mitades',
          'clues': 'Pistas',
          'hybrid': 'Híbrido'
        };
        label.textContent = modeLabels[this.state.mode] || 'Variantes';
        if(this.state.categoryKey) this.startGame();
      });
      this.container.querySelector('#memory-restart-btn').addEventListener('click', () => this.restart());
      this.container.querySelector('#memory-back-hub').addEventListener('click', () => GameCore.mountGame('hub', this.container.parentElement));
      // El listener de animaciones se agrega en initMotionPreference para evitar duplicados.
    }

    initCategory(){
      const keys = Object.keys(unifiedCategories);
      if(keys.length){ this.state.categoryKey = keys[0]; this.startGame(); }
    }

    startGame(){
      const catMeta = unifiedCategories[this.state.categoryKey];
      if(!catMeta) return;
      let pairs = [];
      let totalPairs = 0;
      if(this.state.mode === 'clues') {
        // Modo pistas: 1 carta imagen + 1 carta textual descriptiva
        if(catMeta.type === 'breeds'){
          const cat = catMeta.ref;
          const breeds = [...cat.breeds];
          const needed = Math.min(6, breeds.length);
          const chosen = this.randomPick(breeds, needed);
          chosen.forEach(b => {
            if(!b.images || !b.images.length) return;
            const img = b.images[0];
            const clue = this.deriveClue(b, img);
            pairs.push({ key: b.id, label: b.name, img: img.src, alt: img.alt || b.name, variant: img.variant, type: 'image' });
            pairs.push({ key: b.id, label: b.name, clue, alt: `Pista: ${clue}`, type: 'clue' });
          });
          totalPairs = pairs.length / 2;
        } else {
          const category = catMeta.ref;
          const animals = [...category.animals];
          const needed = Math.min(6, animals.length);
          const selected = this.randomPick(animals, needed);
          selected.forEach(a => {
            const img = this.pickImageLegacy(a);
            if(!img) return;
            const clue = this.deriveLegacyClue(a);
            pairs.push({ key: a.name, label: a.name, img, alt: a.name, variant: 1, type: 'image' });
            pairs.push({ key: a.name, label: a.name, clue, alt: `Pista: ${clue}`, type: 'clue' });
          });
          totalPairs = selected.length;
        }
      } else if(this.state.mode === 'hybrid') {
        // 🎯 MODO HÍBRIDO: Mezcla pares de imágenes complementarias + pares de quiz
        if(catMeta.type === 'breeds'){
          const cat = catMeta.ref;
          // Verificar si tiene hybridPairs
          if(cat.hybridPairs && cat.hybridPairs.length > 0){
            const hybridPairs = [...cat.hybridPairs];
            const needed = Math.min(6, hybridPairs.length); // Máximo 6 pares (12 cartas)
            const chosen = this.randomPick(hybridPairs, needed);
            chosen.forEach(pair => {
              if(pair.type === 'image-complement'){
                // Par de imágenes complementarias
                pairs.push({
                  key: pair.id,
                  label: pair.card1.description || pair.pairKey,
                  img: pair.card1.img,
                  alt: pair.card1.alt,
                  type: 'image',
                  hybridType: 'complement'
                });
                pairs.push({
                  key: pair.id,
                  label: pair.card2.description || pair.pairKey,
                  img: pair.card2.img,
                  alt: pair.card2.alt,
                  type: 'image',
                  hybridType: 'complement'
                });
              } else if(pair.type === 'quiz'){
                // Par de quiz (pregunta + respuesta)
                pairs.push({
                  key: pair.id,
                  label: 'Pregunta',
                  text: pair.card1.text,
                  alt: `Pregunta: ${pair.card1.text.substring(0,50)}...`,
                  type: 'quiz-question',
                  hybridType: 'quiz'
                });
                pairs.push({
                  key: pair.id,
                  label: 'Respuesta',
                  text: pair.card2.text,
                  alt: `Respuesta: ${pair.card2.text}`,
                  type: 'quiz-answer',
                  hybridType: 'quiz'
                });
              }
            });
            totalPairs = pairs.length / 2;
          } else {
            // Si no hay hybridPairs, usar fallback con variantes normales
            const breeds = [...cat.breeds];
            const needed = Math.min(4, breeds.length);
            const chosen = this.randomPick(breeds, needed);
            chosen.forEach(b => {
              if(!b.images || b.images.length < 2) return;
              const [img1, img2] = this.pickTwoDistinct(b.images);
              pairs.push({ key: b.id, label: b.name, img: img1.src, alt: img1.alt, variant: img1.variant });
              pairs.push({ key: b.id, label: b.name, img: img2.src, alt: img2.alt, variant: img2.variant });
            });
            totalPairs = pairs.length / 2;
          }
        } else {
          // Fallback para legacy: usar modo variants normal
          const category = catMeta.ref;
          const animals = [...category.animals];
          const needed = Math.min(4, animals.length);
          const selected = this.randomPick(animals, needed);
          selected.forEach(a => {
            const img1 = this.pickImageLegacy(a);
            const img2 = this.pickImageLegacy(a, img1);
            pairs.push({ key: a.name, label: a.name, img: img1, alt: a.name, variant: 1 });
            pairs.push({ key: a.name, label: a.name, img: img2, alt: a.name, variant: 2 });
          });
          totalPairs = selected.length;
        }
      } else if(this.state.mode === 'split') {
        // Modo mitades mejorado: usa variantes reales 'split-left/right' si existen; de lo contrario fallback duplicado
        if(catMeta.type === 'breeds') {
          const cat = catMeta.ref;
          const breeds = [...cat.breeds];
          const needed = Math.min(8, breeds.length);
          const chosen = this.randomPick(breeds, needed);
          chosen.forEach(b => {
            if(!b.images || !b.images.length) return;
            const left = b.images.find(i => i.role === 'split-left');
            const right = b.images.find(i => i.role === 'split-right');
            if(left && right && left.pairGroup && left.pairGroup === right.pairGroup) {
              pairs.push({ key: b.id, label: b.name, img: left.src, alt: left.alt || `${b.name} mitad izquierda`, variant: left.variant || 'L', split: 'left', fullGroup: left.pairGroup, fullRef: { left: left.src, right: right.src } });
              pairs.push({ key: b.id, label: b.name, img: right.src, alt: right.alt || `${b.name} mitad derecha`, variant: right.variant || 'R', split: 'right', fullGroup: right.pairGroup, fullRef: { left: left.src, right: right.src } });
            } else {
              // Fallback: usa primera imagen duplicada simulando mitades (temporal)
              const baseImg = b.images[0];
              if(!baseImg) return;
              pairs.push({ key: b.id, label: b.name, img: baseImg.src, alt: `${b.name} (simulada) mitad izquierda`, variant: 'L', split: 'left', simulated: true });
              pairs.push({ key: b.id, label: b.name, img: baseImg.src, alt: `${b.name} (simulada) mitad derecha`, variant: 'R', split: 'right', simulated: true });
            }
          });
          totalPairs = pairs.length / 2;
        } else {
          // Legacy dataset no tiene mitades reales: fallback igual que antes
          const category = catMeta.ref;
          const animals = [...category.animals];
          const needed = Math.min(8, animals.length);
          const selected = this.randomPick(animals, needed);
          selected.forEach(a => {
            const img = this.pickImageLegacy(a);
            if(!img) return;
            pairs.push({ key: a.name, label: a.name, img, alt: `${a.name} mitad izquierda`, variant: 'L', split: 'left', simulated: true });
            pairs.push({ key: a.name, label: a.name, img, alt: `${a.name} mitad derecha`, variant: 'R', split: 'right', simulated: true });
          });
          totalPairs = selected.length;
        }
      } else {
        // Modo variants (anterior)
        if(catMeta.type === 'breeds'){
          const cat = catMeta.ref; // { breeds: [...] }
          const breeds = [...cat.breeds];
          const needed = Math.min(6, breeds.length);
          const chosen = this.randomPick(breeds, needed);
          chosen.forEach(b => {
            if(!b.images || b.images.length < 2) return;
            const [img1, img2] = this.pickTwoDistinct(b.images);
            pairs.push({ key: b.id, label: b.name, img: img1.src, alt: img1.alt, variant: img1.variant });
            pairs.push({ key: b.id, label: b.name, img: img2.src, alt: img2.alt, variant: img2.variant });
          });
          totalPairs = pairs.length / 2;
        } else {
          const category = catMeta.ref;
          const animals = [...category.animals];
          const needed = Math.min(6, animals.length);
          const selected = this.randomPick(animals, needed);
          selected.forEach(a => {
            const img1 = this.pickImageLegacy(a);
            const img2 = this.pickImageLegacy(a, img1);
            pairs.push({ key: a.name, label: a.name, img: img1, alt: a.name, variant: 1 });
            pairs.push({ key: a.name, label: a.name, img: img2, alt: a.name, variant: 2 });
          });
          totalPairs = selected.length;
        }
      }
      // Mezclar
      this.state.cards = pairs.sort(()=>Math.random()-0.5);
      this.state.totalPairs = totalPairs;
      this.state.flipped = [];
      this.state.matches = 0;
      this.state.attempts = 0;
      this.state.streakCurrent = 0;
      this.state.bestStreak = 0;
      this.state.seenCards = new Set(); // 🎯 Reset tracking de cartas vistas
      this.gameStartTime = Date.now();
      this.renderCards();
      this.updateStats();
      this.updateProgress();
      GameStorage.updateGameStat('memory', { plays: (GameStorage.getState().games.memory.plays||0)+1 });
      GameCore.eventBus.emit('game.played', { id: GAME_ID });
      this.announcer.announce(`Categoría ${catMeta.name} iniciada. ${this.state.totalPairs} parejas.`);
    }

    randomPick(arr, count){
      const pool = [...arr];
      const out = [];
      for(let i=0;i<count && pool.length;i++){
        const idx = Math.floor(Math.random()*pool.length);
        out.push(pool.splice(idx,1)[0]);
      }
      return out;
    }

    pickTwoDistinct(images){
      if(images.length < 2) return [images[0], images[0]];
      const i1 = Math.floor(Math.random()*images.length);
      let i2 = Math.floor(Math.random()*images.length);
      if(i2 === i1){ i2 = (i2+1) % images.length; }
      return [images[i1], images[i2]];
    }

    pickImageLegacy(animal, exclude){
      if(!animal.images || !animal.images.length) return null;
      const pool = exclude ? animal.images.filter(i => i!==exclude) : animal.images;
      return pool[Math.floor(Math.random()*pool.length)];
    }

    // (Función antigua pickImage reemplazada por pickImageLegacy y pickTwoDistinct)

    renderCards(){
      const cols = Math.ceil(Math.sqrt(this.state.cards.length));
      this.gridEl.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      if(!this.state.cards.length){
        // Render provisional de esqueleto mientras no hay dataset (fallback UX)
        const provisional = 12;
        const tempCols = Math.ceil(Math.sqrt(provisional));
        this.gridEl.style.gridTemplateColumns = `repeat(${tempCols},1fr)`;
        this.gridEl.innerHTML = Array.from({length: provisional}).map((_,i)=>`
          <button class="memory-card-btn placeholder" role="gridcell" aria-label="Carta cargando" aria-pressed="false" data-index="${i}" tabindex="${i===0? '0':'-1'}" data-temp="true">
            <div class="card-back" aria-hidden="true">
              <div class="cb-surface"></div>
              <div class="cb-pattern-grid"></div>
              <div class="cb-strokes">
                <span class="stroke s1"></span>
                <span class="stroke s2"></span>
                <span class="stroke s3"></span>
              </div>
              <div class="cb-emblem" aria-hidden="true">🎨</div>
              <span class="card-index-badge" data-index-label="${i+1}" aria-hidden="true"></span>
              <span class="sr-only">Carta placeholder en carga</span>
            </div>
          </button>`).join('');
        // Anuncio accesible de estado de carga (no repetitivo)
        if(!this._announcedLoading){
          this._announcedLoading = true;
          this.announcer.announce('Cargando cartas de la categoría seleccionada...');
        }
        this.cardButtons = Array.from(this.gridEl.querySelectorAll('.memory-card-btn'));
        return;
      }
      this.gridEl.innerHTML = this.state.cards.map((c,i)=>{
        const hasImg = !!c.img;
        const hasText = !!(c.text || c.clue);
        const placeholderClass = (hasImg || hasText) ? '' : ' placeholder';
        const splitClass = c.split ? ' split-mode' : '';
        const clueClass = c.type === 'clue' ? ' clue-card' : '';
        const quizClass = (c.type === 'quiz-question' || c.type === 'quiz-answer') ? ' quiz-card' : '';
        // Reverso unificado (card-back) con patrón híbrido (grid tenue + trazos + badge index)
        const cardBack = `
          <div class="card-back" aria-hidden="true">
            <div class="cb-surface"></div>
            <div class="cb-pattern-grid"></div>
            <div class="cb-strokes">
              <span class="stroke s1"></span>
              <span class="stroke s2"></span>
              <span class="stroke s3"></span>
            </div>
            <div class="cb-emblem" aria-hidden="true">🎨</div>
            <span class="card-index-badge" data-index-label="${i+1}" aria-hidden="true"></span>
            <span class="sr-only">Carta sin contenido revelado</span>
          </div>`;
        return `<button class="memory-card-btn${placeholderClass}${splitClass}${clueClass}${quizClass}" role="gridcell" aria-label="Carta oculta" aria-pressed="false" data-index="${i}" tabindex="${i===0? '0':'-1'}" data-key="${c.key}" data-type="${c.type||''}" data-split="${c.split||''}">${cardBack}</button>`;
      }).join('');
      this.cardButtons = Array.from(this.gridEl.querySelectorAll('.memory-card-btn'));
      this.currentFocus = 0;
      this.bindCardEvents(cols);
      this.setupKeyboardNavigation(cols);
    }

    bindCardEvents(cols){
      this.cardButtons.forEach(btn => {
        btn.addEventListener('click', () => this.flipCard(parseInt(btn.dataset.index,10)));
      });
    }

    setupKeyboardNavigation(cols){
      this.gridEl.addEventListener('keydown', e => {
        if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Enter',' '].includes(e.key)) return;
        switch(e.key){
          case 'ArrowRight': this.moveFocus(1); break;
          case 'ArrowLeft': this.moveFocus(-1); break;
          case 'ArrowDown': this.moveFocus(cols); break;
          case 'ArrowUp': this.moveFocus(-cols); break;
          case 'Enter':
          case ' ': this.flipCard(this.currentFocus); e.preventDefault(); break;
        }
      });
    }

    moveFocus(delta){
      const target = this.currentFocus + delta;
      if(target < 0 || target >= this.cardButtons.length) return;
      this.cardButtons[this.currentFocus].setAttribute('tabindex','-1');
      this.currentFocus = target;
      const btn = this.cardButtons[this.currentFocus];
      btn.setAttribute('tabindex','0');
      btn.focus();
    }

    flipCard(index){
      const btn = this.cardButtons[index];
      if(!btn || btn.classList.contains('matched') || btn.getAttribute('aria-pressed')==='true') return;
      const card = this.state.cards[index];
      // --- Tracking de repetición antes de voltear ---
      if(!this.state.flipCounts[index]) this.state.flipCounts[index] = 0;
      this.state.flipCounts[index]++;
      const thisFlipCount = this.state.flipCounts[index];
      btn.setAttribute('aria-pressed','true');
      // Iniciar desaparición visual del reverso (card-back)
      const backLayer = btn.querySelector('.card-back');
      if(backLayer && !backLayer.classList.contains('vanish')) {
        backLayer.classList.add('vanish');
        // Retirar del flujo interactivo después de la transición
        setTimeout(()=>{ if(backLayer) backLayer.style.pointerEvents='none'; }, 260);
      }
      const alt = card.alt || card.label || card.key;
      btn.classList.remove('placeholder');
      if(card.split){
        // Renderizar mitad
        const halfClass = card.split === 'left' ? 'half-left' : 'half-right';
        btn.classList.add('revealed');
        btn.innerHTML = `<div class="memory-card-half-wrapper ${halfClass}"><img src="${card.img}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.alt='Imagen no disponible';this.style.filter='grayscale(1)';" /></div>`;
      } else if(card.type === 'clue') {
        btn.classList.add('revealed');
        btn.innerHTML = `<div class="memory-clue-text" style="padding:.45rem;font-size:.66rem;line-height:1.15;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:500;">${card.clue}</div>`;
      } else if(card.type === 'quiz-question' || card.type === 'quiz-answer') {
        // 🎯 Renderizar carta de quiz (pregunta o respuesta)
        btn.classList.add('revealed');
        const isQuestion = card.type === 'quiz-question';
        const icon = isQuestion ? '❓' : '💡';
        const bgColor = isQuestion ? 'rgba(255, 193, 7, 0.15)' : 'rgba(76, 175, 80, 0.15)';
        const borderColor = isQuestion ? '#ffc107' : '#4caf50';
        btn.innerHTML = `<div class="memory-quiz-text" style="padding:.5rem;font-size:.7rem;line-height:1.2;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-weight:500;background:${bgColor};border:2px solid ${borderColor};border-radius:8px;height:100%;"><span style="font-size:1.2rem;margin-bottom:.25rem;">${icon}</span><span>${card.text}</span></div>`;
      } else {
        btn.innerHTML = card.img ? `<img src="${card.img}" alt="${alt}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.onerror=null;this.alt='Imagen no disponible';this.style.filter='grayscale(1)';" />` : `<span class="sr-only">${card.label || card.key}</span>`;
      }
      this.state.flipped.push({ index, key: card.key, label: card.label, type: card.type });
      // Evento granular: carta volteada
      try { GameCore.eventBus.emit('card.flipped', { game: GAME_ID, index, key: card.key, type: card.type, mode: this.state.mode }); } catch(_){ }
      // Penalización por tercera (o más) vez que se voltea la misma carta sin haber sido emparejada aún
      if(!btn.classList.contains('matched') && thisFlipCount === 3){
        const penalty = -SCORING.repeatPenalty;
        this.applyScoreDelta(penalty, { reason:'repeat', penalty: SCORING.repeatPenalty, index });
        this.showFeedbackChip(`-${SCORING.repeatPenalty} repetición`, 'penalty', 1600);
        this.announcer.announce('Atención: tercera vez que revisas esta carta. Penalización aplicada.');
        try { GameCore.eventBus.emit('card.repeatPenalty', { game: GAME_ID, index, key: card.key, flips: thisFlipCount, penalty: SCORING.repeatPenalty }); } catch(_){ }
      }
      let announceType = 'Carta';
      let announceText = card.label || card.key;
      if(card.type === 'clue'){
        announceType = 'Pista';
      } else if(card.type === 'quiz-question'){
        announceType = 'Pregunta';
        announceText = card.text.substring(0, 80);
      } else if(card.type === 'quiz-answer'){
        announceType = 'Respuesta';
        announceText = card.text;
      }
      this.announcer.announce(`${announceType} revelada: ${announceText}`);

      if(this.state.flipped.length === 2){
        this.state.attempts++;
        const [c1, c2] = this.state.flipped;
        if(c1.key === c2.key){
          // Match
          btn.classList.add('matched');
          const otherBtn = this.cardButtons[c1.index === index ? c2.index : c1.index];
          otherBtn.classList.add('matched');
          // Si es modo split, fusionar en imagen completa (opcionalmente sobre la primera carta)
          if(this.state.mode === 'split'){
            const cardA = this.state.cards[c1.index];
            const cardB = this.state.cards[c2.index];
            const primary = this.cardButtons[c1.index];
            const secondary = this.cardButtons[c2.index];
            // Si es un par real (no simulated) reconstruimos una sola imagen combinada mostrando la mitad izquierda sobre fondo y fade-in
            if(cardA.fullRef && !cardA.simulated){
              // Elegimos mostrar la mitad izquierda + mitad derecha fusionadas en un contenedor flex
              primary.innerHTML = `<div class="split-fuse-wrapper" aria-label="${cardA.label} imagen completa">
                  <img src="${cardA.fullRef.left}" alt="${cardA.label} parte izquierda" class="split-half-display" />
                  <img src="${cardA.fullRef.right}" alt="${cardA.label} parte derecha" class="split-half-display" />
                </div>`;
              secondary.innerHTML = '<span class="sr-only">Pareja completada</span>';
              primary.classList.add('fuse-anim');
            } else {
              // Fallback antiguo: misma imagen
              const fullImgSrc = cardA.img;
              primary.innerHTML = `<img src="${fullImgSrc}" alt="${cardA.label} imagen" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
              secondary.innerHTML = '<span class="sr-only">Pareja completada</span>';
              primary.classList.add('fuse-anim');
            }
          }
          this.state.matches++;
          // Actualizar racha
          this.state.streakCurrent++;
          if(this.state.streakCurrent > this.state.bestStreak) {
            this.state.bestStreak = this.state.streakCurrent;
          }
          // Emitir evento combo.updated
          try { GameCore.eventBus.emit('combo.updated', {
            game: GAME_ID,
            streak: this.state.streakCurrent,
            best: this.state.bestStreak,
            matches: this.state.matches,
            totalPairs: this.state.totalPairs
          }); } catch(_){ }
              // --- FÓRMULA DE PUNTUACIÓN COMPLETA ---
              const { delta, breakdown } = this.calculateMatchScore();
              this.applyScoreDelta(delta, breakdown);
              // Feedback visual escalonado
              this.showFeedbackChip(`+${breakdown.base}`, 'score');
              if(breakdown.streakBonus > 0){
                setTimeout(()=> this.showFeedbackChip(`Racha +${breakdown.streakBonus}`, 'streak', 1700), 160);
              }
              if(breakdown.modeBonusComponent > 0){
                setTimeout(()=> this.showFeedbackChip(`Modo +${breakdown.modeBonusComponent}`, 'bonus', 1900), 320);
              }
              // Evento detallado
              try { GameCore.eventBus.emit('score.formula', { game: GAME_ID, type:'match', ...breakdown, delta }); } catch(_){ }
              if(breakdown.streakBonus > 0){
                try { GameCore.eventBus.emit('combo.bonus', { game: GAME_ID, streak: this.state.streakCurrent, bonus: breakdown.streakBonus }); } catch(_){ }
              }
              // --- FIN FÓRMULA ---
          // Evento granular: match encontrado
          try { GameCore.eventBus.emit('match.found', { game: GAME_ID, key: card.key, attempts: this.state.attempts, matches: this.state.matches, totalPairs: this.state.totalPairs, mode: this.state.mode }); } catch(_){ }
          // === XP INTEGRATION ===
          if(global.GameXP){
            // Bonus ligero si acierta con pocos intentos relativos (eficiencia)
            const efficiency = Math.max(0, (this.state.totalPairs * 2) - this.state.attempts); // mayor si menos intentos
            const xpGain = 10 + Math.floor(efficiency * 0.5); // base 10 + eficiencia escalada
            GameXP.addXP(xpGain, 'memoryPair');
          }
          this.announcer.announce(`¡Pareja de ${card.label || card.key} encontrada!`,'assertive');
          this.state.flipped = [];
          this.updateStats();
          this.updateProgress();
          if(this.state.matches === this.state.totalPairs){
            this.finish();
          }
        } else {
          // Reiniciar racha al fallo
          if(this.state.streakCurrent > 0){
            try { GameCore.eventBus.emit('combo.break', { game: GAME_ID, streak: this.state.streakCurrent }); } catch(_){ }
          }
          this.state.streakCurrent = 0;
          // Evento granular: intento fallido (no match)
          try { GameCore.eventBus.emit('match.failed', { game: GAME_ID, first: c1.key, second: c2.key, attempts: this.state.attempts, matches: this.state.matches, mode: this.state.mode }); } catch(_){ }

          // 🎯 NUEVA LÓGICA: Solo penalizar si AMBAS cartas ya fueron vistas antes
          const card1WasSeen = this.state.seenCards.has(c1.index);
          const card2WasSeen = this.state.seenCards.has(c2.index);
          const shouldPenalize = card1WasSeen && card2WasSeen;

          if(shouldPenalize){
            // Penalización de fallo (solo si ya viste ambas cartas antes)
            const penalty = -SCORING.failPenalty;
            this.applyScoreDelta(penalty, { reason:'fail', penalty: SCORING.failPenalty });
            this.showFeedbackChip(`-${SCORING.failPenalty}`, 'penalty', 1400);
            this.announcer.announce('No coinciden. Ya habías visto estas cartas, intenta recordar mejor');
          } else {
            // Primera vez viendo al menos una de las cartas, sin penalización
            this.announcer.announce('No coinciden, intenta de nuevo');
          }

          // Marcar ambas cartas como vistas para futuros intentos
          this.state.seenCards.add(c1.index);
          this.state.seenCards.add(c2.index);
          setTimeout(()=>{
            this.state.flipped.forEach(f => {
              const b = this.cardButtons[f.index];
              b.setAttribute('aria-pressed','false');
                // Restaurar estado visual (limpiamos contenido y reinsertamos card-back para consistencia)
                b.innerHTML = '';
                const rebuiltBack = document.createElement('div');
                rebuiltBack.className = 'card-back';
                rebuiltBack.setAttribute('aria-hidden','true');
                rebuiltBack.innerHTML = `
                  <div class="cb-surface"></div>
                  <div class="cb-pattern-grid"></div>
                  <div class="cb-strokes">
                    <span class="stroke s1"></span>
                    <span class="stroke s2"></span>
                    <span class="stroke s3"></span>
                  </div>
                  <div class="cb-emblem" aria-hidden="true">🎨</div>
                  <span class="card-index-badge" data-index-label="${f.index+1}" aria-hidden="true"></span>
                  <span class="sr-only">Carta sin contenido revelado</span>`;
                b.appendChild(rebuiltBack);
              if(b.classList.contains('split-mode')){ b.classList.remove('revealed'); }
              if(b.classList.contains('clue-card')){ b.classList.remove('revealed'); }
              if(b.classList.contains('quiz-card')){ b.classList.remove('revealed'); }
            });
            this.state.flipped = [];
          }, 900);
          this.updateStats();
        }
      }
    }

    // Calcula la puntuación para un match usando la fórmula configurada
    calculateMatchScore(){
      const base = SCORING.baseMatch;
      const streakBonus = this.state.streakCurrent > 1 ? (this.state.streakCurrent - 1) * SCORING.streakStep : 0;
      const modeMult = SCORING.modeMultipliers[this.state.mode] || 1;
      const raw = (base + streakBonus) * modeMult;
      const delta = Math.round(raw);
      // Para desglose amigable: qué porción viene del multiplicador de modo
      const withoutMode = base + streakBonus;
      const modeBonusComponent = Math.max(0, Math.round(delta - withoutMode));
      return {
        delta,
        breakdown: {
          base,
            streakBonus,
          modeMultiplier: modeMult,
          modeBonusComponent,
          raw
        }
      };
    }

    // Aplica variación de score con clamp y emite evento estándar
    applyScoreDelta(delta, meta={}){
      const current = GameStorage.getState().score;
      let target = current + delta;
      if(target < SCORING.clampMinScore) target = SCORING.clampMinScore;
      const applied = target - current; // por si fue clamped
      if(applied !== 0){
        GameStorage.addScore(applied); // reutiliza almacenamiento existente
      }
      try { GameCore.eventBus.emit('score.changed', { game: GAME_ID, delta: applied, ...meta, total: target }); } catch(_){ }
    }

    deriveClue(breed, img){
      const alt = img.alt || breed.name;
      let fragment = '';
      if(alt.includes('–')) fragment = alt.split('–')[1].trim();
      if(!fragment) fragment = 'rasgo distintivo';
      // Evitar pista demasiado larga
      return (fragment.length > 70 ? fragment.slice(0,67)+'…' : fragment);
    }

    deriveLegacyClue(animal){
      return `Rasgo de ${animal.name}`;
    }

    updateStats(){
      this.scoreEl.textContent = GameStorage.getState().score;
      this.pairsEl.textContent = `${this.state.matches}/${this.state.totalPairs}`;
      this.attemptsEl.textContent = this.state.attempts;
      // (Racha ahora se comunica solo mediante chips efímeros)
    }

    updateProgress(){
      const pct = (this.state.matches / this.state.totalPairs) * 100;
      this.progressFillEl.style.width = pct + '%';
      this.progressEl.setAttribute('aria-valuenow', pct.toFixed(0));
      this.progressEl.setAttribute('aria-valuetext', `${this.state.matches} de ${this.state.totalPairs} parejas`);
    }

    finish(){
      this.announcer.announce(`Juego completado. ${this.state.matches} parejas.`, 'assertive');
      // === XP INTEGRATION (Completion) ===
      if(global.GameXP){
        const accuracy = this.state.matches / this.state.attempts; // ~1 si perfecto
        const speedFactor = this.state.matches; // simple multiplicador por número de parejas
        const completionXP = 50 + Math.floor(accuracy * 40) + speedFactor * 5; // base + precisión + escala parejas
        GameXP.addXP(completionXP, 'memoryComplete');
      }
      // Emitir evento game.completed para motor de gamificación y otros sistemas
      GameCore.eventBus.emit('game.completed', {
        id: GAME_ID,
        matches: this.state.matches,
        attempts: this.state.attempts,
        totalPairs: this.state.totalPairs,
        accuracy: this.state.matches / this.state.attempts,
        score: GameStorage.getState().score,
        durationMs: Date.now() - this.gameStartTime
      });
      const panel = document.createElement('div');
      panel.className = 'memory-complete-panel';
      panel.innerHTML = `
        <h4>🏆 ¡Completado!</h4>
        <p>Parejas: ${this.state.matches}/${this.state.totalPairs}</p>
        <p>Puntuación: ${GameStorage.getState().score}</p>
        <button class="memory-action-btn" id="memory-play-again">Jugar de nuevo 🔄</button>
        <button class="memory-action-btn" id="memory-menu">Menú 🏠</button>
      `;
      this.container.appendChild(panel);
      panel.querySelector('#memory-play-again').addEventListener('click', () => this.startGame());
      panel.querySelector('#memory-menu').addEventListener('click', () => GameCore.mountGame('hub', this.container.parentElement));
    }

    restart(){ this.startGame(); }
  }

  function mount(container){
    const announcer = createAnnouncer();
    new MemoryAccessibleGame(container, announcer);
  }

  function unmount(){ /* Limpieza futura si añadimos timers o listeners globales */ }

  GameCore.registerGame({
    id: GAME_ID,
    title: 'Memoria Animales',
    icon: '🧠',
    flag: 'enableMemory',
    description: 'Encuentra parejas de animales con navegación accesible',
    mount, unmount
  });

})(window);

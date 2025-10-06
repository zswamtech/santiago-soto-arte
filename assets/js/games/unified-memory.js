/*
 * 🎨 MEMORIA ARTÍSTICA UNIFICADA
 * Juego único simplificado que mezcla:
 * - Quiz visual de colores (3 pares)
 * - Imágenes complementarias (3 pares)
 * - Imágenes variadas de animales (6 pares)
 * Total: 12 pares = 24 cartas
 */

(function(global){
  const GAME_ID = 'unified-memory';

  // ⚙️ Parámetros de timing (experiencia de volteo) - VERSIÓN LENTA PARA DISFRUTAR
  // Duración de la animación CSS (debe sincronizar con unified-memory.css .card-inner transition: 1s)
  const FLIP_ANIMATION_MS = 1850; // animación más lenta
  // Tiempo visible adicional antes de evaluar match (segunda carta ya volteada)
  const POST_SECOND_FLIP_BUFFER_MS = 1500; // mucho más tiempo para ver las cartas
  // Tiempo que permanecen visibles cartas no coincidentes antes de voltearse de regreso
  const UNMATCH_VIEW_DELAY_MS = 5000; // 5 segundos completos para memorizar
  // MODO EXTENDIDO: si se desea que las cartas no coincidentes permanezcan abiertas
  const HOLD_UNTIL_NEXT_CLICK = true; // <== activado según solicitud del usuario
  // Espera adicional total antes de evaluar (Opción A solicitada) tras la segunda carta (además de animación+buffer)
  const EXTRA_EVAL_DELAY_MS = 2000; // más tiempo para pensar

  // 🎯 Configuración de puntuación (Sistema V2)
  const SCORING = {
    easy: 8,           // Pares fáciles
    medium: 12,        // Pares medios
    hard: 20,          // Pares difíciles
    penalty: 3,        // Penalización general
    bonusStreak: 3,    // Bonus por racha
    bonusPerfect: 25   // Bonus sin errores
  };

  // 🎨 Diccionario de nombres de color a HEX (es/en ampliado + sinónimos)
  const COLOR_MAP = {
    rojo:'#ff0000', red:'#ff0000', carmesi:'#dc143c', carmesí:'#dc143c',
    azul:'#0052ff', blue:'#0052ff', celeste:'#4fc3f7', cielo:'#4fc3f7', cyan:'#00bcd4', cian:'#00bcd4', turquesa:'#1abc9c',
    amarillo:'#ffd400', yellow:'#ffd400', dorado:'#daa520', oro:'#daa520',
    verde:'#00a848', green:'#00a848', lima:'#7bdc00', lima_limon:'#bfff00',
    naranja:'#ff7a00', orange:'#ff7a00',
    morado:'#7627ff', purple:'#7627ff', purpura:'#7627ff', púrpura:'#7627ff', violeta:'#7a33cc', lila:'#b57edc', lavanda:'#b57edc',
    magenta:'#ff0099', fucsia:'#ff0099', rosa:'#ff4fa3', pink:'#ff4fa3',
    marron:'#7b4b2a', marrón:'#7b4b2a', café:'#7b4b2a', cafe:'#7b4b2a', brown:'#7b4b2a',
    negro:'#000000', black:'#000000',
    blanco:'#ffffff', white:'#ffffff',
    gris:'#888888', griss:'#888888', gray:'#888888', grey:'#888888', plata:'#c0c0c0', plateado:'#c0c0c0', silver:'#c0c0c0'
  };

  function normalizeColor(input){
    if(!input) return '#cccccc';
    // Normalizar tildes y caracteres especiales
    const lowered = String(input).trim().toLowerCase();
    const deAccented = lowered.normalize('NFD').replace(/\p{Diacritic}/gu,'');
    const cleaned = deAccented.replace(/[^a-z0-9#]/g,'_'); // espacios y guiones a _ para map (ej. lima limon)
    if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(lowered)) return lowered;
    if(COLOR_MAP[lowered]) return COLOR_MAP[lowered];
    if(COLOR_MAP[deAccented]) return COLOR_MAP[deAccented];
    if(COLOR_MAP[cleaned]) return COLOR_MAP[cleaned];
    // intento CSS nativo
    const tmp = document.createElement('div');
    tmp.style.color = lowered;
    if(tmp.style.color){
      document.body.appendChild(tmp);
      const cs = getComputedStyle(tmp).color; // rgb(r,g,b)
      document.body.removeChild(tmp);
      const m = cs.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if(m){
        const toHex = v => ('0'+parseInt(v).toString(16)).slice(-2);
        return '#'+toHex(m[1])+toHex(m[2])+toHex(m[3]);
      }
    }
    return '#cccccc';
  }

  function blendHex(colors){
    const arr = colors.map(c => normalizeColor(c));
    if(!arr.length) return '#cccccc';
    // Convertir a Lab, promediar L,a,b, regresar a RGB
    const labs = arr.map(hex => rgbToLab(hexToRgb(hex)));
    let L=0,a=0,b=0;
    labs.forEach(v => { L+=v.L; a+=v.a; b+=v.b; });
    L/=labs.length; a/=labs.length; b/=labs.length;
    const {r,g,bl} = labToRgb({L,a,b});
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = v => ('0'+clamp(v).toString(16)).slice(-2);
    return '#'+toHex(r)+toHex(g)+toHex(bl);
  }

  // --- Utilidades color perceptual ---
  function hexToRgb(hex){
    const h = hex.replace('#','');
    return {
      r: parseInt(h.substring(0,2),16),
      g: parseInt(h.substring(2,4),16),
      b: parseInt(h.substring(4,6),16)
    };
  }
  function rgbToXyz(r,g,b){
    // Normalizar
    r/=255; g/=255; b/=255;
    // Corrección gamma sRGB
    r = r>0.04045 ? Math.pow((r+0.055)/1.055,2.4) : r/12.92;
    g = g>0.04045 ? Math.pow((g+0.055)/1.055,2.4) : g/12.92;
    b = b>0.04045 ? Math.pow((b+0.055)/1.055,2.4) : b/12.92;
    // Convertir
    const x = (r*0.4124 + g*0.3576 + b*0.1805) / 0.95047;
    const y = (r*0.2126 + g*0.7152 + b*0.0722) / 1.00000;
    const z = (r*0.0193 + g*0.1192 + b*0.9505) / 1.08883;
    return {x,y,z};
  }
  function xyzToLab(x,y,z){
    const f = t => t>0.008856 ? Math.cbrt(t) : (7.787*t)+16/116;
    const fx=f(x), fy=f(y), fz=f(z);
    return {
      L: (116*fy)-16,
      a: 500*(fx-fy),
      b: 200*(fy-fz)
    };
  }
  function rgbToLab({r,g,b}){ return xyzToLab(...Object.values(rgbToXyz(r,g,b))); }
  function labToXyz(L,a,b){
    const fy = (L+16)/116;
    const fx = a/500 + fy;
    const fz = fy - b/200;
    const inv = t => t**3>0.008856 ? t**3 : (t-16/116)/7.787;
    const xr = inv(fx), yr = inv(fy), zr = inv(fz);
    return { x: xr*0.95047, y: yr*1.00000, z: zr*1.08883 };
  }
  function xyzToRgb(x,y,z){
    x*=100; y*=100; z*=100;
    let r = (x* 0.032406 + y*-0.015372 + z*-0.004986);
    let g = (x*-0.009689 + y* 0.018758 + z* 0.000415);
    let b = (x* 0.000557 + y*-0.002040 + z* 0.010570);
    // Inversa gamma
    const gamma = v => v<=0.0031308 ? 12.92*v : 1.055*Math.pow(v,1/2.4)-0.055;
    r=gamma(r); g=gamma(g); b=gamma(b);
    return { r:r*255, g:g*255, bl:b*255 };
  }
  function labToRgb(lab){ return xyzToRgb(...Object.values(labToXyz(lab.L, lab.a, lab.b))); }

  // Distancia perceptual simple (CIE76) entre dos hex
  function deltaE76(hex1, hex2){
    const l1 = rgbToLab(hexToRgb(normalizeColor(hex1)));
    const l2 = rgbToLab(hexToRgb(normalizeColor(hex2)));
    const dL = l1.L - l2.L;
    const da = l1.a - l2.a;
    const db = l1.b - l2.b;
    return Math.sqrt(dL*dL + da*da + db*db);
  }

  // ΔE2000 más preciso
  function deltaE2000(hex1, hex2){
    const lab1 = rgbToLab(hexToRgb(normalizeColor(hex1)));
    const lab2 = rgbToLab(hexToRgb(normalizeColor(hex2)));
    const {L:L1,a:a1,b:b1} = lab1; const {L:L2,a:a2,b:b2} = lab2;
    const avgL = (L1 + L2) / 2;
    const C1 = Math.sqrt(a1*a1 + b1*b1);
    const C2 = Math.sqrt(a2*a2 + b2*b2);
    const avgC = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC,7) / (Math.pow(avgC,7) + Math.pow(25,7))));
    const a1p = (1+G)*a1;
    const a2p = (1+G)*a2;
    const C1p = Math.sqrt(a1p*a1p + b1*b1);
    const C2p = Math.sqrt(a2p*a2p + b2*b2);
    const avgCp = (C1p + C2p)/2;
    const h1p = Math.atan2(b1, a1p) * 180/Math.PI + (Math.atan2(b1,a1p) < 0 ? 360:0);
    const h2p = Math.atan2(b2, a2p) * 180/Math.PI + (Math.atan2(b2,a2p) < 0 ? 360:0);
    let deltahp;
    if(Math.abs(h1p - h2p) <= 180) deltahp = h2p - h1p; else deltahp = (h2p <= h1p)? h2p - h1p + 360 : h2p - h1p - 360;
    const deltaLp = L2 - L1;
    const deltaCp = C2p - C1p;
    const deltaHp = 2 * Math.sqrt(C1p*C2p) * Math.sin((deltahp * Math.PI/180)/2);
    const avgLp = (L1 + L2)/2;
    let avghp; if(Math.abs(h1p - h2p) > 180) avghp = (h1p + h2p + 360)/2; else avghp = (h1p + h2p)/2;
    const T = 1 - 0.17*Math.cos((avghp - 30)*Math.PI/180) + 0.24*Math.cos((2*avghp)*Math.PI/180) + 0.32*Math.cos((3*avghp + 6)*Math.PI/180) - 0.20*Math.cos((4*avghp - 63)*Math.PI/180);
    const Sl = 1 + (0.015 * Math.pow(avgLp - 50,2))/Math.sqrt(20 + Math.pow(avgLp - 50,2));
    const Sc = 1 + 0.045*avgCp; const Sh = 1 + 0.015*avgCp*T;
    const deltaRo = 30 * Math.exp(-Math.pow((avghp - 275)/25,2));
    const Rc = 2 * Math.sqrt(Math.pow(avgCp,7)/(Math.pow(avgCp,7)+Math.pow(25,7)));
    const Rt = -Rc * Math.sin(2*deltaRo*Math.PI/180);
    const Kl=1,Kc=1,Kh=1;
    return Math.sqrt(
      Math.pow(deltaLp/(Sl*Kl),2) +
      Math.pow(deltaCp/(Sc*Kc),2) +
      Math.pow(deltaHp/(Sh*Kh),2) +
      Rt*(deltaCp/(Sc*Kc))*(deltaHp/(Sh*Kh))
    );
  }

  // Mapear ΔE a un factor de escala (más parecidos => intersección más grande)
  function intersectionScale(deltaE, min=15, max=75){
    // Clamp deltaE typical range ~0-100
    const d = Math.max(0, Math.min(100, deltaE));
    // Invertir: d=0 => 1, d=100 => 0
    const inv = 1 - (d / 100);
    // Aplicar curva suave (ease-out) para no exagerar extremos medios
    const curved = Math.pow(inv, 0.65);
    // Escala lineal al rango solicitado (% del ancho contenedor relativo al width base de círculos)
    return min + (max - min) * curved; // número en %
  }

  // Escala alternativa para modo visibilidad extrema (aplana diferencias)
  function intersectionScaleVisibility(deltaE, min=60, max=88){
    const d = Math.max(0, Math.min(100, deltaE));
    const inv = 1 - (d/100);
    // Curva más plana para comprimir variación
    const curved = Math.pow(inv, 0.45);
    return min + (max - min) * curved;
  }

  function unifiedMemoryTemplate(){
    return `
      <div class="unified-memory-game">
        <div class="memory-header-simple">
          <h2>🎨 Memoria Artística</h2>
          <button class="memory-help-btn" id="memory-help-btn" aria-label="Ayuda del juego" title="¿Cómo jugar?">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <div class="memory-stats-bar">
            <div class="stat-item">
              <span class="stat-label">Puntos</span>
              <span class="stat-value" id="um-score">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Aciertos</span>
              <span class="stat-value"><span id="um-matches">0</span>/<span id="um-total-pairs">10</span></span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Racha</span>
              <span class="stat-value" id="um-streak">0</span>
            </div>
          </div>
        </div>

        <div class="memory-board-container">
          <div class="memory-board" id="um-board">
            <!-- 24 cartas se generarán aquí -->
          </div>
        </div>

        <div class="memory-actions">
          <button class="mem-btn mem-btn-restart" id="um-restart">🔄 Jugar de Nuevo</button>
          <button class="mem-btn mem-btn-contrast" id="um-contrast-toggle" aria-pressed="false" aria-label="Activar alto contraste" title="Alternar alto contraste">🌓 Contraste</button>
          <button class="mem-btn mem-btn-analytic" id="um-analytic-toggle" aria-pressed="false" aria-label="Activar modo analítico de mezcla" title="Alternar modo analítico">🔬 Analítico</button>
          <button class="mem-btn mem-btn-visibility" id="um-visibility-toggle" aria-pressed="false" aria-label="Modo visibilidad de intersección" title="Alternar modo de tamaño de mezcla">👁 Tamaño</button>
            <button class="mem-btn mem-btn-overlay" id="um-overlay-toggle" aria-pressed="true" aria-label="Ocultar información educativa" title="Mostrar/ocultar títulos de las obras">ℹ️ Overlay</button>
          <button class="mem-btn mem-btn-preview" id="um-preview-replay" aria-label="Repetir vista previa" title="Mostrar temporalmente todas las imágenes">👁‍🗨 Vista previa</button>
        </div>
        <div class="sr-only" id="um-announce" aria-live="polite"></div>
        <span id="merge-tip-small" class="sr-only">Colores muy diferentes: área de mezcla mínima (círculo pequeño). Colores similares generan una intersección más grande.</span>

        <!-- Modal de Ayuda -->
        <div class="memory-help-modal" id="memory-help-modal">
          <div class="memory-help-content">
            <button class="memory-help-close" id="memory-help-close" aria-label="Cerrar ayuda">&times;</button>
            <h3>🎮 ¿Cómo Jugar?</h3>
            <div class="help-rules">
              <div class="help-rule">
                <span class="help-icon">🎯</span>
                <div class="help-text">
                  <strong>Objetivo:</strong>
                  <p>Encuentra todas las parejas de obras de arte</p>
                </div>
              </div>
              <div class="help-rule">
                <span class="help-icon">👆</span>
                <div class="help-text">
                  <strong>Cómo jugar:</strong>
                  <p>Toca dos cartas para voltearlas y ver si coinciden</p>
                </div>
              </div>
              <div class="help-rule">
                <span class="help-icon">✨</span>
                <div class="help-text">
                  <strong>Parejas:</strong>
                  <p>Cada obra tiene 2 versiones: completa y detalle</p>
                </div>
              </div>
              <div class="help-rule">
                <span class="help-icon">🏆</span>
                <div class="help-text">
                  <strong>Puntuación:</strong>
                  <p>Gana puntos por cada pareja encontrada. ¡Las rachas dan bonus!</p>
                </div>
              </div>
              <div class="help-rule">
                <span class="help-icon">ℹ️</span>
                <div class="help-text">
                  <strong>Consejos:</strong>
                  <p>Usa el botón "ℹ️ Overlay" para ver/ocultar los títulos de las obras</p>
                </div>
              </div>
            </div>
            <button class="memory-help-play-btn" id="memory-help-play">¡Entendido, a jugar! 🎨</button>
          </div>
        </div>
      </div>
    `;
  }

  class UnifiedMemoryGame {
    constructor(container){
      this.container = container;
      this.state = {
        cards: [],
        flipped: [],
        matched: [],
        score: 0,
        attempts: 0,
        streak: 0,
        seenCards: new Set(),
        cardClickCount: {}, // 🎯 Tracking: cuántas veces se ha clickeado cada carta
        announcedSegments: new Set() // Para anunciar cada segmento una sola vez
      };
      this._imagesReady = false; // Hasta que el preload de obras termine
      this.init();
    }

    // Centralización de paths: permite intercambiar base sin tocar cada par
    getImageBase(){
      // Si existe global override: window.UM_MEMORY_BASE
      if(global.UM_MEMORY_BASE){ return global.UM_MEMORY_BASE; }
      // Ruta corregida directamente a la ubicación correcta
      return 'assets/img/memory-cards/';
    }

    mapCardSrc(file){
      const base = this.getImageBase();
      // Evitar doble base si ya incluye assets/img
      if(/memory-cards\//.test(file) && !file.startsWith(base)){
        // Reemplazar prefijo previo si necesario
        return file.replace(/^.*memory-cards\//, base);
      }
      if(!/memory-cards\//.test(file)){
        return base + file;
      }
      return file;
    }

    init(){
      this.container.innerHTML = unifiedMemoryTemplate();
      this.board = document.getElementById('um-board');
      this.scoreEl = document.getElementById('um-score');
      this.matchesEl = document.getElementById('um-matches');
      this.streakEl = document.getElementById('um-streak');

      document.getElementById('um-restart').addEventListener('click', () => this.restart());
      this.contrastBtn = document.getElementById('um-contrast-toggle');
      this.announceEl = document.getElementById('um-announce');

      // Preferencia de alto contraste
      this.initContrastPreference();
      // Preferencia modo analítico
      this.initAnalyticPreference();
      if(this.contrastBtn){
        this.contrastBtn.addEventListener('click', () => this.toggleHighContrast());
        this.contrastBtn.addEventListener('keydown', (e) => {
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); this.toggleHighContrast(); }
        });
      }
      this.analyticBtn = document.getElementById('um-analytic-toggle');
  this.visibilityBtn = document.getElementById('um-visibility-toggle');
    this.overlayBtn = document.getElementById('um-overlay-toggle');
      if(this.analyticBtn){
        this.analyticBtn.addEventListener('click', () => this.toggleAnalyticMode());
        this.analyticBtn.addEventListener('keydown', (e) => {
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); this.toggleAnalyticMode(); }
        });
      }
      if(this.visibilityBtn){
        this.initVisibilityPreference();
        this.visibilityBtn.addEventListener('click', () => this.toggleVisibilityMode());
        this.visibilityBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); this.toggleVisibilityMode(); }});
      }
      if(this.overlayBtn){
        this.initOverlayPreference();
        this.overlayBtn.addEventListener('click', ()=> this.toggleOverlayPreference());
        this.overlayBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); this.toggleOverlayPreference(); }});
      }
      const previewReplayBtn = document.getElementById('um-preview-replay');
      if(previewReplayBtn){
        previewReplayBtn.addEventListener('click', ()=> this.replayPreview());
      }

      // 🆘 Botón de ayuda
      const helpBtn = document.getElementById('memory-help-btn');
      const helpModal = document.getElementById('memory-help-modal');
      const helpClose = document.getElementById('memory-help-close');
      const helpPlay = document.getElementById('memory-help-play');

      if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
          helpModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        });

        const closeHelp = () => {
          helpModal.classList.remove('active');
          document.body.style.overflow = '';
        };

        if (helpClose) helpClose.addEventListener('click', closeHelp);
        if (helpPlay) helpPlay.addEventListener('click', closeHelp);

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && helpModal.classList.contains('active')) {
            closeHelp();
          }
        });

        // Cerrar al hacer click fuera del contenido
        helpModal.addEventListener('click', (e) => {
          if (e.target === helpModal) {
            closeHelp();
          }
        });
      }

      this.loadCards().then(() => {
        this.renderBoard();
        // Pre-carga de imágenes de obras para que al primer giro ya estén nítidas
        this.preloadArtworkImages();
        // Actualizar total de pares dinámico
        const totalPairsEl = document.getElementById('um-total-pairs');
        if(totalPairsEl){ totalPairsEl.textContent = (this.state.cards.length / 2).toString(); }
      });
      // 🔍 Atajo modo debug visual (Ctrl/Cmd + Shift + D)
      window.addEventListener('keydown', (e)=>{
        if(e.key && e.key.toLowerCase()==='d' && e.shiftKey && (e.ctrlKey || e.metaKey)){
          const root = this.container.querySelector('.unified-memory-game');
          if(root){ root.classList.toggle('um-debug'); }
        }
      });
    }

    initContrastPreference(){
      const stored = localStorage.getItem('umHighContrast');
      if(stored === null){
        // Si el sistema pide más contraste y no hay preferencia guardada
        const mq = window.matchMedia('(prefers-contrast: more)');
        if(mq.matches){
          this.setHighContrast(true, false);
          return;
        }
      }
      if(stored === 'true') this.setHighContrast(true, false);
    }

    setHighContrast(enabled, announce = true){
      const root = this.container.querySelector('.unified-memory-game');
      if(!root) return;
      if(enabled){
        root.classList.add('um-high-contrast');
        if(this.contrastBtn){
          this.contrastBtn.setAttribute('aria-pressed','true');
          this.contrastBtn.setAttribute('aria-label','Desactivar alto contraste');
        }
        localStorage.setItem('umHighContrast','true');
        if(announce && this.announceEl) this.announceEl.textContent = 'Alto contraste activado';
      } else {
        root.classList.remove('um-high-contrast');
        if(this.contrastBtn){
          this.contrastBtn.setAttribute('aria-pressed','false');
          this.contrastBtn.setAttribute('aria-label','Activar alto contraste');
        }
        localStorage.setItem('umHighContrast','false');
        if(announce && this.announceEl) this.announceEl.textContent = 'Alto contraste desactivado';
      }
    }

    toggleHighContrast(){
      const root = this.container.querySelector('.unified-memory-game');
      const enabled = root.classList.contains('um-high-contrast');
      this.setHighContrast(!enabled, true);
    }

    initAnalyticPreference(){
      const stored = localStorage.getItem('umAnalyticMode');
      if(stored === 'true') this.setAnalyticMode(true, false);
    }
    setAnalyticMode(enabled, announce=true){
      const root = this.container.querySelector('.unified-memory-game');
      if(!root) return;
      if(enabled){
        root.classList.add('um-analytic');
        if(this.analyticBtn){
          this.analyticBtn.setAttribute('aria-pressed','true');
          this.analyticBtn.setAttribute('aria-label','Desactivar modo analítico de mezcla');
        }
        localStorage.setItem('umAnalyticMode','true');
        if(announce && this.announceEl) this.announceEl.textContent = 'Modo analítico activado';
      } else {
        root.classList.remove('um-analytic');
        if(this.analyticBtn){
          this.analyticBtn.setAttribute('aria-pressed','false');
          this.analyticBtn.setAttribute('aria-label','Activar modo analítico de mezcla');
        }
        localStorage.setItem('umAnalyticMode','false');
        if(announce && this.announceEl) this.announceEl.textContent = 'Modo analítico desactivado';
      }
      // Actualizar badges analíticos (ΔE) dinámicamente
      this.updateAnalyticBadges();
    }
    toggleAnalyticMode(){
      const root = this.container.querySelector('.unified-memory-game');
      const enabled = root.classList.contains('um-analytic');
      this.setAnalyticMode(!enabled, true);
    }

    initVisibilityPreference(){
      const stored = localStorage.getItem('umVisibilityMode');
      if(stored === 'visibility'){ this.setVisibilityMode(true, false); }
    }
    setVisibilityMode(enabled, announce=true){
      const root = this.container.querySelector('.unified-memory-game');
      if(!root) return;
      if(enabled){
        root.classList.add('um-visibility-mode');
        if(this.visibilityBtn){
          this.visibilityBtn.setAttribute('aria-pressed','true');
          this.visibilityBtn.setAttribute('aria-label','Modo visibilidad activado (click para volver a preciso)');
        }
        localStorage.setItem('umVisibilityMode','visibility');
        if(announce && this.announceEl) this.announceEl.textContent = 'Modo visibilidad activado';
      } else {
        root.classList.remove('um-visibility-mode');
        if(this.visibilityBtn){
          this.visibilityBtn.setAttribute('aria-pressed','false');
          this.visibilityBtn.setAttribute('aria-label','Modo precisión activado (click para modo visibilidad)');
        }
        localStorage.setItem('umVisibilityMode','precision');
        if(announce && this.announceEl) this.announceEl.textContent = 'Modo precisión activado';
      }
      // Re-render intersecciones sin reconstruir todo el board (ajustar widths)
      this.board.querySelectorAll('.overlap-merge').forEach(btn => {
        const dE = parseFloat(btn.getAttribute('data-de2000'));
        if(isNaN(dE)) return;
        const isTri = btn.classList.contains('tri');
        if(enabled){
          const size = intersectionScaleVisibility(dE, isTri?64:68, isTri?88:92);
          btn.style.setProperty('--merge-size', size+'%');
        } else {
          // recalcular usando escala original (usamos parámetros previos razonables)
          const size = intersectionScale(dE, isTri?48:52, isTri?76:82);
          btn.style.setProperty('--merge-size', size+'%');
        }
      });
    }
    toggleVisibilityMode(){
      const root = this.container.querySelector('.unified-memory-game');
      const enabled = root.classList.contains('um-visibility-mode');
      this.setVisibilityMode(!enabled, true);
    }

    initOverlayPreference(){
      const stored = localStorage.getItem('umOverlayVisible');
      if(stored === 'false'){
        this.setOverlayVisible(false, false);
      } else {
        this.setOverlayVisible(true, false); // default visible
      }
    }
    setOverlayVisible(visible, announce=true){
      const root = this.container.querySelector('.unified-memory-game');
      if(!root) return;
      if(visible){
        root.classList.remove('um-overlay-hidden');
        if(this.overlayBtn){
          this.overlayBtn.setAttribute('aria-pressed','true');
          this.overlayBtn.setAttribute('aria-label','Ocultar información educativa');
        }
        localStorage.setItem('umOverlayVisible','true');
        if(announce && this.announceEl) this.announceEl.textContent = 'Overlay educativo visible';
      } else {
        root.classList.add('um-overlay-hidden');
        if(this.overlayBtn){
          this.overlayBtn.setAttribute('aria-pressed','false');
          this.overlayBtn.setAttribute('aria-label','Mostrar información educativa');
        }
        localStorage.setItem('umOverlayVisible','false');
        if(announce && this.announceEl) this.announceEl.textContent = 'Overlay educativo oculto';
      }
    }
    toggleOverlayPreference(){
      const root = this.container.querySelector('.unified-memory-game');
      const hidden = root.classList.contains('um-overlay-hidden');
      this.setOverlayVisible(hidden, true); // si estaba oculto => visible
    }

    async loadCards(){
      // 1. Intentar cargar manifest dinámico de pares desde assets/img/memory-cards/pairs.json
      //    Si falla, usar la librería embebida (fallback). Así podemos llegar a 20 pares sin tocar el código.
      let dynamicLibrary = null;
      try {
        const res = await fetch(this.mapCardSrc('pairs.json'));
        if(res.ok){
          const json = await res.json();
          if(Array.isArray(json) && json.length){ dynamicLibrary = json; }
        }
      } catch(e){ /* fallback */ }

      // 2. Definir librería fallback (cada entrada = un par)
      const library = [
        {
          key: 'van_gogh_starry_night_segments_01', difficulty:'medium',
          meta: { title: 'La noche estrellada', artist: 'Vincent van Gogh', year: 1889, source: 'Dominio público', blurb: 'Cielo en espiral y contraste entre pueblo oscuro y universo vibrante.' },
          segments: [
            { src: this.mapCardSrc('par_01_van_goh_a.png'), alt:'La noche estrellada (detalle pueblo y ciprés)', segment:'pueblo' },
            { src: this.mapCardSrc('par_01_van_goh_b.png'), alt:'La noche estrellada (detalle cielo en espiral)', segment:'cielo' }
          ]
        },
        {
          key: 'hokusai_kanagawa_wave_segments_01', difficulty:'medium',
          meta: { title: 'La Gran Ola de Kanagawa', artist: 'Katsushika Hokusai', year: 'c. 1831', source: 'Dominio público', blurb: 'La ola capta el instante antes del colapso; el Monte Fuji permanece sereno.' },
          segments: [
            { src: this.mapCardSrc('par_03_ola_kanagawa_a.png'), alt:'La Gran Ola (detalle ola principal)', segment:'ola' },
            { src: this.mapCardSrc('par_03_ola_kanagawa_b.png'), alt:'La Gran Ola (detalle monte Fuji)', segment:'monte fuji' }
          ]
        },
        {
          key: 'munch_el_grito_segments_01', difficulty:'medium',
          meta: { title: 'El Grito', artist: 'Edvard Munch', year: 1893, source: 'Dominio público', blurb: 'Angustia existencial plasmada en vibración de cielo y figura.' },
          segments: [
            { src: this.mapCardSrc('par_05_el_grito_a.png'), alt:'El Grito (detalle figura central)', segment:'figura' },
            { src: this.mapCardSrc('par_05_el_grito_b.png'), alt:'El Grito (detalle fondo y cielo)', segment:'cielo' }
          ]
        },
        {
          key: 'botticelli_nacimiento_venus_segments_01', difficulty:'medium',
          meta: { title: 'El Nacimiento de Venus', artist: 'Sandro Botticelli', year: 'c. 1485', source: 'Dominio público', blurb: 'Ideal neoplatónico de belleza emergiendo del mar.' },
          segments: [
            { src: this.mapCardSrc('par_06_nacimiento_a.png'), alt:'Nacimiento de Venus (detalle Venus)', segment:'venus' },
            { src: this.mapCardSrc('par_06_nacimiento_b.png'), alt:'Nacimiento de Venus (detalle caracola / entorno)', segment:'entorno' }
          ]
        },
        {
          key: 'van_gogh_girasoles_segments_01', difficulty:'easy',
          meta: { title: 'Los Girasoles', artist: 'Vincent van Gogh', year: 1888, source: 'Dominio público', blurb: 'Exploración del ciclo de vida y gamas amarillas intensas.' },
          segments: [
            { src: this.mapCardSrc('par_07_girasol_a.png'), alt:'Girasoles (detalle flor principal)', segment:'flor' },
            { src: this.mapCardSrc('par_07_girasol_b.png'), alt:'Girasoles (detalle conjunto adicional)', segment:'ramo' }
          ]
        },
        {
          key: 'escena_gotica_segments_01', difficulty:'hard',
          meta: { title: 'Escena Gótica', artist: 'Autor desconocido', year: 's. XIX', source: 'Dominio público', blurb: 'Arquitectura y tracería de lectura visual similar (reto de discriminación).' },
          segments: [
            { src: this.mapCardSrc('par_08_gotica_a.png'), alt:'Escena gótica (detalle arco / vitral)', segment:'arco' },
            { src: this.mapCardSrc('par_08_gotica_b.png'), alt:'Escena gótica (detalle tracería / estructura)', segment:'traceria' }
          ]
        },
        {
          key: 'velazquez_infanta_segments_01', difficulty:'medium',
          meta: { title: 'Las Meninas (Infanta Margarita Teresa)', artist: 'Diego Velázquez', year: 1656, source: 'Dominio público', blurb: 'Jerarquía cortesana y luz focal sobre la Infanta.' },
          segments: [
            { src: this.mapCardSrc('par_02_infanta_a.png'), alt:'Infanta (detalle rostro y tocado)', segment:'infanta rostro' },
            { src: this.mapCardSrc('par_02_infanta_b.png'), alt:'Infanta (detalle vestido y volumen)', segment:'infanta vestido' }
          ]
        },
        {
          key: 'klimt_el_beso_segments_01', difficulty:'medium',
          meta: { title: 'El Beso', artist: 'Gustav Klimt', year: 1908, source: 'Dominio público', blurb: 'Oro y patrones envolviendo intimidad simbolista.' },
          segments: [
            { src: this.mapCardSrc('par_09_el_beso_a.png'), alt:'El Beso (detalle figuras)', segment:'figuras' },
            { src: this.mapCardSrc('par_09_el_beso_b.png'), alt:'El Beso (detalle manto y mosaico)', segment:'manto dorado' }
          ]
        },
        {
          key: 'mano_de_dios_segments_01', difficulty:'medium',
          meta: { title: 'La Mano de Dios', artist: 'Autor / Serie Contemporánea', year: '2025', source: 'Interno', blurb: 'Gestualidad simbólica: la mano como vínculo entre creación e identidad.' },
          segments: [
            { src: this.mapCardSrc('par_13_la_mano_de_dios_a.png'), alt:'Mano de Dios (gesto A)', segment:'mano gesto A' },
            { src: this.mapCardSrc('par_13_la_mano_de_dios_b.png'), alt:'Mano de Dios (gesto B)', segment:'mano gesto B' }
          ]
        },
        {
          key: 'dali_persistencia_memoria_segments_01', difficulty:'hard',
          meta: { title: 'La persistencia de la memoria', artist: 'Salvador Dalí', year: 1931, source: 'Dominio público', blurb: 'Relojes blandos retan la percepción rígida del tiempo.' },
          segments: [
            { src: this.mapCardSrc('par_10_dali_a.png'), alt:'Persistencia (detalle reloj blando)', segment:'reloj blando' },
            { src: this.mapCardSrc('par_10_dali_b.png'), alt:'Persistencia (detalle paisaje y horizonte)', segment:'paisaje' }
          ]
        },
        {
          key: 'da_vinci_ultima_cena_segments_01', difficulty:'hard',
          meta: { title: 'La Última Cena', artist: 'Leonardo da Vinci', year: 1498, source: 'Dominio público', blurb: 'Explosión de gestos tras el anuncio de la traición.' },
          segments: [
            { src: this.mapCardSrc('par_11_ultima_cena_a.png'), alt:'Última Cena (Cristo centro)', segment:'cristo centro' },
            { src: this.mapCardSrc('par_11_ultima_cena_b.png'), alt:'Última Cena (apóstoles laterales)', segment:'apostoles' }
          ]
        },
        {
          key: 'picasso_guernica_segments_01', difficulty:'hard',
          meta: { title: 'Guernica', artist: 'Pablo Picasso', year: 1937, source: 'Dominio público', blurb: 'Símbolos de dolor y resistencia al horror bélico.' },
          segments: [
            { src: this.mapCardSrc('par_12_guernica_a.png'), alt:'Guernica (detalle caballo herido)', segment:'caballo' },
            { src: this.mapCardSrc('par_12_guernica_b.png'), alt:'Guernica (detalle figura gritando)', segment:'figura grito' }
          ]
        },
        {
          key: 'arnolfini_matrimonio_segments_01', difficulty:'medium',
          meta: { title: 'El Matrimonio Arnolfini', artist: 'Jan van Eyck', year: 1434, source: 'Dominio público', blurb: 'La pareja y los símbolos (espejo, vela, perro) certifican la unión.' },
          segments: [
            { src: this.mapCardSrc('par_14_matrimonio_arnolfini_a.png'), alt:'Matrimonio Arnolfini (pareja y gesto)', segment:'pareja' },
            { src: this.mapCardSrc('par_14_matrimonio_arnolfini_b.png'), alt:'Matrimonio Arnolfini (espejo y símbolos)', segment:'espejo símbolos' }
          ]
        },
        {
          key: 'vermeer_joven_de_perla_segments_01', difficulty:'medium',
          meta: { title: 'La joven de la perla', artist: 'Johannes Vermeer', year: 'c. 1665', source: 'Dominio público', blurb: 'Retrato enigmático donde la luz resalta rostro, turbante y la icónica perla.' },
          segments: [
            { src: this.mapCardSrc('par_15_joven_de_perla_a.png'), alt:'La Joven de la Perla (rostro y turbante)', segment:'rostro y turbante' },
            { src: this.mapCardSrc('par_15_joven_de_perla_b.png'), alt:'La Joven de la Perla (perla y fondo oscuro)', segment:'perla y fondo' }
          ]
        },
        {
          key: 'color_mix_demo_segments_01', difficulty:'easy',
          meta: { title: 'Mezcla de Color (Demo)', artist: 'Generativo', year: '2025', source: 'Interno', blurb: 'Par demostrativo de mecánica.' },
          segments: [
            { src: this.mapCardSrc('par_04_color_mix_a.png'), alt:'Color mix demo A', segment:'color A' },
            { src: this.mapCardSrc('par_04_color_mix_b.png'), alt:'Color mix demo B', segment:'color B' }
          ]
        }
      ];

      // 3. Construir desde dynamicLibrary si existe; si no, desde fallback
      const sourceLib = dynamicLibrary ? dynamicLibrary.map(item => ({
        key: item.key,
        difficulty: item.difficulty || 'medium',
        meta: item.meta || {},
        segments: [
          { src: this.mapCardSrc(item.files?.a || ''), alt: item.alt?.a || '', segment: (item.segments?.a || 'A') },
          { src: this.mapCardSrc(item.files?.b || ''), alt: item.alt?.b || '', segment: (item.segments?.b || 'B') }
        ]
      })) : library;

      // 4. Seleccionar aleatoriamente 10 pares (si hay más) con probabilidad uniforme
      const shuffledPairs = this.shuffle(sourceLib);
      const selected = shuffledPairs.slice(0, 10); // siempre 10 pares

      // 5. Expandir a cartas
      const cards = [];
      selected.forEach(pair => {
        pair.segments.forEach((seg, idx) => {
          cards.push({
            id: pair.key + '_' + (idx===0?'a':'b'),
            type: 'artwork-image',
            data: {
              src: seg.src,
              alt: seg.alt,
              artwork: {
                title: pair.meta.title,
                artist: pair.meta.artist,
                year: pair.meta.year,
                segment: seg.segment,
                source: pair.meta.source || 'Dominio público',
                blurb: pair.meta.blurb || ''
              }
            },
            pairKey: pair.key,
            difficulty: pair.difficulty || 'medium'
          });
        });
      });

      this.state.cards = this.shuffle(cards);
      // Ajustar siempre contador total a 10 en UI (si existe)
      const totalPairsEl = document.getElementById('um-total-pairs');
      if(totalPairsEl){ totalPairsEl.textContent = '10'; }
    }

    shuffle(array){
      const arr = [...array];
      for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    preloadArtworkImages(){
      const artworkCards = this.state.cards.filter(c => c.type === 'artwork-image');
      if(!artworkCards.length){ this._imagesReady = true; return; }
      const uniqueSrcs = [...new Set(artworkCards.map(c => c.data && c.data.src).filter(Boolean))];
      let loaded = 0;
      const markDone = () => {
        loaded++;
        if(loaded >= uniqueSrcs.length){
          this._imagesReady = true;
          const root = this.container.querySelector('.unified-memory-game');
          if(root){ root.classList.add('um-images-ready'); }
          if(this.announceEl){ this.announceEl.textContent = 'Listo para jugar'; }
          // Vista previa automática DESACTIVADA para mejor experiencia de juego
          // this.startInitialPreview();
        }
      };
      uniqueSrcs.forEach(src => {
        const testImg = new Image();
        testImg.onload = markDone;
        testImg.onerror = markDone;
        testImg.src = src; // solo PNG existente
      });
      // Seguridad: si después de 3.5s no terminaron, habilitar de todas formas
      setTimeout(()=>{ if(!this._imagesReady){ this._imagesReady = true; if(this.announceEl) this.announceEl.textContent = 'Imágenes listas (parcial)'; } }, 3500);
    }

    startInitialPreview(){
      if(this._initialPreviewShown) return;
      this._initialPreviewShown = true;
      const cards = Array.from(this.board.querySelectorAll('.memory-card'));
      // Voltear sólo las artwork-image (para no revelar lógicas de color si en futuro se mezclan)
      cards.forEach(cardEl => {
        const idx = parseInt(cardEl.getAttribute('data-index'));
        const card = this.state.cards[idx];
        if(card && card.type === 'artwork-image'){
          const front = cardEl.querySelector('.card-front');
          if(front && front.getAttribute('data-revealed') !== 'true'){
            front.setAttribute('data-revealed','true');
            this.renderCardContent(front, card);
          }
          cardEl.classList.add('preview-open');
          cardEl.classList.add('flipped');
        }
      });
      // Duración de vista previa (configurable)
      const PREVIEW_MS = 3500; // 3.5s para observar
      setTimeout(()=>{
        cards.forEach(cardEl => {
          if(cardEl.classList.contains('preview-open')){
            cardEl.classList.remove('preview-open');
            // Cerrar sólo si no fue ya encontrada o interactuada
            const idx = parseInt(cardEl.getAttribute('data-index'));
            if(!this.state.matched.includes(idx)){
              cardEl.classList.remove('flipped');
              const front = cardEl.querySelector('.card-front');
              if(front) front.setAttribute('data-revealed','false');
            }
          }
        });
        if(this.announceEl) this.announceEl.textContent = 'Comienza el juego';
      }, PREVIEW_MS);
    }

    replayPreview(){
      // Permitir re-visualización aunque ya haya sido mostrada la inicial
      const cards = Array.from(this.board.querySelectorAll('.memory-card'));
      cards.forEach(cardEl => {
        const idx = parseInt(cardEl.getAttribute('data-index'));
        const card = this.state.cards[idx];
        if(card && card.type === 'artwork-image' && !this.state.matched.includes(idx)){
          const front = cardEl.querySelector('.card-front');
          if(front && front.getAttribute('data-revealed') !== 'true'){
            front.setAttribute('data-revealed','true');
            this.renderCardContent(front, card);
          }
          cardEl.classList.add('preview-open');
          cardEl.classList.add('flipped');
        }
      });
      const PREVIEW_MS = 3500;
      setTimeout(()=>{
        cards.forEach(cardEl => {
          if(cardEl.classList.contains('preview-open')){
            cardEl.classList.remove('preview-open');
            const idx = parseInt(cardEl.getAttribute('data-index'));
            if(!this.state.matched.includes(idx)){
              cardEl.classList.remove('flipped');
              const front = cardEl.querySelector('.card-front');
              if(front) front.setAttribute('data-revealed','false');
            }
          }
        });
        if(this.announceEl) this.announceEl.textContent = 'Vista previa finalizada';
      }, PREVIEW_MS);
    }

    announceArtwork(card){
      if(!card || card.type !== 'artwork-image') return;
      const id = card.id;
      if(this.state.announcedSegments.has(id)) return; // ya anunciado
      this.state.announcedSegments.add(id);
      if(!this.announceEl) return;
      const aw = card.data && card.data.artwork;
      if(!aw) return;
      const parts = [aw.title];
      if(aw.segment) parts.push('segmento: '+aw.segment);
      if(aw.artist) parts.push('Autor: '+aw.artist);
      if(aw.year) parts.push('Año: '+aw.year);
      this.announceEl.textContent = parts.join('. ');
    }

    renderBoard(){
      this.board.innerHTML = this.state.cards.map((card, index) => {
        return `<div class="memory-card" data-index="${index}" data-type="${card.type}">
          <div class="card-inner">
            <div class="card-back">
              <div style="position: relative; z-index: 2; text-align: center;">
                <div style="font-size: 3.5rem; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">🎨</div>
                <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.8; font-weight: 600; letter-spacing: 1px;">ARTE</div>
              </div>
            </div>
            <div class="card-front" data-revealed="false"></div>
          </div>
        </div>`;
      }).join('');

      // Listeners
      this.board.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', () => this.flipCard(parseInt(card.dataset.index)));
      });
    }

    flipCard(index){
      // 🔄 Limpieza diferida de un par no coincidente mantenido abierto (HOLD_UNTIL_NEXT_CLICK)
      // Si existe un par pendiente y el usuario inicia un nuevo intento (ninguna carta seleccionada todavía en este turno)
      if(HOLD_UNTIL_NEXT_CLICK && this._pendingUnflip && this.state.flipped.length === 0){
        const cards = this.board.querySelectorAll('.memory-card');
        const [i1, i2] = this._pendingUnflip;
        [i1, i2].forEach(i => {
          const el = cards[i];
            if(el){
              el.classList.remove('flipped');
              const front = el.querySelector('.card-front');
              if(front) front.setAttribute('data-revealed','false');
            }
        });
        this._pendingUnflip = null; // limpiar estado
      }
      const cardEl = this.board.querySelectorAll('.memory-card')[index];
      const card = this.state.cards[index];
      if(!cardEl || !card) return;

      // Si las imágenes de obras aún no terminaron de cargar, evitamos interacción (excepto si no es artwork)
      if(card.type === 'artwork-image' && !this._imagesReady){
        if(this.announceEl && !this._warnedPreload){
          this._warnedPreload = true;
          this.announceEl.textContent = 'Cargando imágenes, un momento…';
        }
        return;
      }

      // BLOQUEO: No permitir clics mientras se está evaluando un par
      if(this._evaluating) return;

      // Reglas básicas
      if(this.state.flipped.length >= 2) return;
      if(this.state.flipped.some(f => f.index === index)) return;
      if(this.state.matched.includes(index)) return;

      // Revelar
      const front = cardEl.querySelector('.card-front');
      front.setAttribute('data-revealed','true');

      console.log('🎴 Volteando carta #' + index);
      console.log('   Tipo:', card.type);
      console.log('   Src:', card.data?.src);
      console.log('   HTML antes:', front.innerHTML);

      this.renderCardContent(front, card);

      console.log('✅ Contenido renderizado:');
      console.log('   HTML después:', front.innerHTML.substring(0, 200));
      console.log('   Visibility:', window.getComputedStyle(front).visibility);
      console.log('   Display:', window.getComputedStyle(front).display);

      this.updateAnalyticBadges();
      if(card.type === 'artwork-image'){
        this.announceArtwork(card); // anuncio accesible
      }
      // ELIMINADA funcionalidad fast-open: todas las cartas deben tener la misma velocidad
      // para que el usuario pueda visualizar bien cada carta que voltea
      cardEl.classList.add('flipped');

      console.log('🔄 Carta volteada, clases:', cardEl.className);

      // Tracking clicks por carta
      if(!this.state.cardClickCount[index]) this.state.cardClickCount[index] = 0;
      this.state.cardClickCount[index]++;

      this.state.flipped.push({ index, pairKey: card.pairKey });
      if(this.state.flipped.length === 2){
        // BLOQUEAR más clics hasta que termine la evaluación
        this._evaluating = true;
        // Esperar solo el tiempo de animación para que termine de voltear la segunda carta
        // Luego evaluar inmediatamente
        setTimeout(()=> this.checkMatch(), FLIP_ANIMATION_MS + 300);
      }
    }

    renderCardContent(frontEl, card){
      const d = card.data;

      // 🎨 Mezcla de colores (2 colores) - DISEÑO SIMPLE
      if(card.type === 'color-mix'){
        const labels = d.labels || d.colors || [];
        const accessibleLabel = `Mezcla de ${labels[0]} y ${labels[1]}`;
        const cA = normalizeColor(d.colors[0]);
        const cB = normalizeColor(d.colors[1]);
        const de = card._deltaEDisplay || '';
        // Asegurar definición accesible global de ΔE
        if(!document.getElementById('um-deltae-def')){
          const def = document.createElement('div');
          def.id = 'um-deltae-def';
          def.className = 'sr-only';
          def.textContent = 'ΔE representa la diferencia perceptual entre colores en el espacio Lab. Valores bajos indican colores muy similares; valores altos indican mayor diferencia.';
          document.body.appendChild(def);
        }
        frontEl.innerHTML = `
          <div class="color-question-card" role="group" aria-label="${accessibleLabel}">
            <div class="color-circle-simple" style="background:${cA}">
              <span class="sr-only">${labels[0]}</span>
            </div>
            <div class="operator-simple" aria-hidden="true">${d.operator || '+'}</div>
            <div class="color-circle-simple" style="background:${cB}">
              <span class="sr-only">${labels[1]}</span>
            </div>
            <div class="analytic-badge" data-analytic="deltaE" data-deltae="${de}" aria-describedby="um-deltae-def" data-tooltip="ΔE diferencia de color perceptual (CIEDE2000)"></div>
          </div>`;
      }
      // 🎨 Mezcla de 3 colores - DISEÑO SIMPLE
      else if(card.type === 'color-triple-mix'){
        const labels = d.labels || d.colors || [];
        const accessibleLabel = `Mezcla de ${labels[0]}, ${labels[1]} y ${labels[2]}`;
        const c1 = normalizeColor(d.colors[0]);
        const c2 = normalizeColor(d.colors[1]);
        const c3 = normalizeColor(d.colors[2]);
        const de = card._deltaEDisplay || '';
        if(!document.getElementById('um-deltae-def')){
          const def = document.createElement('div');
          def.id = 'um-deltae-def';
          def.className = 'sr-only';
          def.textContent = 'ΔE representa la diferencia perceptual entre colores en el espacio Lab. Valores bajos indican colores muy similares; valores altos indican mayor diferencia.';
          document.body.appendChild(def);
        }
        frontEl.innerHTML = `
          <div class="color-question-card" role="group" aria-label="${accessibleLabel}">
            <div class="color-circle-simple" style="background:${c1}">
              <span class="sr-only">${labels[0]}</span>
            </div>
            <div class="operator-simple" aria-hidden="true">+</div>
            <div class="color-circle-simple" style="background:${c2}">
              <span class="sr-only">${labels[1]}</span>
            </div>
            <div class="operator-simple" aria-hidden="true">+</div>
            <div class="color-circle-simple" style="background:${c3}">
              <span class="sr-only">${labels[2]}</span>
            </div>
            <div class="analytic-badge" data-analytic="deltaE" data-deltae="${de}" aria-describedby="um-deltae-def" data-tooltip="ΔE diferencia de color perceptual (CIEDE2000)"></div>
          </div>`;
      }
      // 🎨 Resultado de color - CÍRCULO SIMPLE
      else if(card.type === 'color-result'){
        const name = d.label || d.name || d.color || 'color';
        frontEl.innerHTML = `
          <div class="color-answer-card" role="group" aria-label="Resultado: ${name}">
            <div class="color-result" style="background:${d.color}">
              <span class="sr-only">${name}</span>
            </div>
          </div>
        `;
      }
      // --- Ajuste: mezcla triple más grande ---
      // 🔢 Contador de formas
      else if(card.type === 'shape-count'){
        const shapes = Array(d.count).fill(d.shape).join(' ');
        frontEl.innerHTML = `
          <div class="shape-count-card">
            <div class="shapes-display" style="color: ${d.color};">${shapes}</div>
          </div>
        `;
      }
      // 🔢 Número
      else if(card.type === 'number'){
        frontEl.innerHTML = `
          <div class="number-card">
            <div class="number-display" style="color: ${d.color};">${d.value}</div>
          </div>
        `;
      }
      // ➕ Matemáticas visuales
      else if(card.type === 'visual-math'){
        frontEl.innerHTML = `
          <div class="visual-math-card">
            <div class="emoji-large">${d.emoji}</div>
            <div class="math-operation">${d.operation}</div>
          </div>
        `;
      }
      // 😊 Contador de emojis (resultado)
      else if(card.type === 'emoji-count'){
        const emojis = Array(d.count).fill(d.emoji).join(' ');
        frontEl.innerHTML = `
          <div class="emoji-count-card">
            <div class="emoji-grid">${emojis}</div>
          </div>
        `;
      }
      // 😊 Emoji individual
      else if(card.type === 'emoji-single'){
        frontEl.innerHTML = `
          <div class="emoji-single-card">
            <div class="emoji-${d.size}">${d.emoji}</div>
          </div>
        `;
      }
      // 🔷 Patrón de formas
      else if(card.type === 'shape-pattern'){
        const pattern = d.pattern.map(s => `<span class="pattern-item">${s}</span>`).join('');
        frontEl.innerHTML = `
          <div class="shape-pattern-card">
            <div class="pattern-display">${pattern}</div>
          </div>
        `;
      }
      // 🔷 Forma individual (respuesta de patrón)
      else if(card.type === 'shape-single'){
        frontEl.innerHTML = `
          <div class="shape-single-card">
            <div class="shape-${d.size}" style="color: ${d.color};">${d.shape}</div>
          </div>
        `;
      }
      // 🖼️ Imagen de obra de arte
      else if(card.type === 'artwork-image'){
        const src = d.src || '';
        const alt = d.alt || 'Obra de arte';
        const aw = d.artwork || {};
        const title = aw.title || '';
        const segment = aw.segment || '';
        const artist = aw.artist || '';
        // NOTA: Variantes AVIF/WebP desactivadas temporalmente (404) hasta ejecutar conversión.
        // Cuando existan, reintroducir <picture> con sources.
        // Overlay educativo: título corto + segmento
        frontEl.innerHTML = `
          <div class="artwork-image-card artwork-front" aria-label="${title}${segment? ' — '+segment : ''}">
            <img
              src="${src}"
              alt="${alt}"
              class="artwork-image"
              style="width:100%;height:100%;object-fit:cover;border-radius:8px;"
              loading="lazy"
              onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'artwork-missing',textContent:'Imagen no disponible'}));"
            />
            <div class="artwork-edu-overlay">
              <div class="overlay-title">${title || ''}</div>
              <div class="overlay-segment">${segment ? segment : ''}${artist ? ' · '+artist : ''}</div>
            </div>
          </div>
        `;
      }
      else {
        // Fallback para evitar carta en blanco
        frontEl.innerHTML = `
          <div class="fallback-card" style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#eceff1,#cfd8dc);font-size:3rem;font-weight:800;color:#546e7a;">
            ?
          </div>`;
      }
    }

    checkMatch(){
      const [f1, f2] = this.state.flipped;
      const cards = document.querySelectorAll('.memory-card');

      if(f1.pairKey === f2.pairKey){
        // ✅ MATCH!
        this.state.matched.push(f1.index, f2.index);
        this.state.streak++;
        const card = this.state.cards[f1.index];
        // Nuevo cálculo continuo: usar CardDescriptors.scoreMatch si existe cdDifficulty
        let basePoints;
        if(card.cdDifficulty && global.CardDescriptors && typeof global.CardDescriptors.scoreMatch === 'function'){
          basePoints = global.CardDescriptors.scoreMatch(card.cdDifficulty);
        } else {
          // fallback al sistema previo
          const diff = card.difficulty || 'medium';
          basePoints = SCORING[diff] || SCORING.medium;
        }
        // Multiplicador de racha suave (5% extra por racha adicional)
        const streakMult = 1 + Math.max(0, this.state.streak - 1) * 0.05;
        const points = Math.round(basePoints * streakMult);
        this.state.score += points;

        // Marcar como emparejadas (se quedan visibles)
        cards[f1.index].classList.add('matched');
        cards[f2.index].classList.add('matched');

        // Mensaje educativo si es obra
        let extra = '';
        if(card.type === 'artwork-image' && card.data && card.data.artwork){
          const aw = card.data.artwork;
            if(aw.blurb && aw.title){
              extra = `\n${aw.title} — ${aw.blurb}`;
            } else if(aw.title){
              extra = `\n${aw.title} (${aw.artist || ''})`;
            }
        }
        this.showFeedback(`+${points} puntos! 🎉${extra ? ' '+extra : ''}`, 'success');

        // 👤 Mostrar información del creador si es un par de la comunidad
        if(card.data && card.data.creator){
          setTimeout(() => this.showCreatorAttribution(card.data), 600);
        }

        if(this.state.matched.length === this.state.cards.length){
          setTimeout(() => this.finish(), 800);
        }
        // Si hubo MATCH, desbloquear inmediatamente
        this._evaluating = false;
      } else {
        // ❌ NO MATCH
        this.state.streak = 0;

        // 🎯 NUEVA LÓGICA: Solo penalizar si ambas cartas han sido clickeadas 3+ veces
        const card1Clicks = this.state.cardClickCount[f1.index] || 0;
        const card2Clicks = this.state.cardClickCount[f2.index] || 0;
        const shouldPenalize = card1Clicks >= 3 && card2Clicks >= 3;

        if(shouldPenalize){
          this.state.score = Math.max(0, this.state.score - SCORING.penalty);
          this.showFeedback(`-${SCORING.penalty} puntos (ya viste estas cartas)`, 'penalty');
        } else {
          this.showFeedback('Intenta de nuevo', 'neutral');
        }

        if(HOLD_UNTIL_NEXT_CLICK){
          // Mantener abiertas hasta que el jugador haga otro clic en una tercera carta
          this._pendingUnflip = [f1.index, f2.index];
          // Desbloquear inmediatamente para permitir siguiente intento
          this._evaluating = false;
        } else {
          // Modo clásico: cerrar después de delay
          setTimeout(() => {
            cards[f1.index].classList.remove('flipped');
            cards[f2.index].classList.remove('flipped');
            cards[f1.index].querySelector('.card-front').setAttribute('data-revealed', 'false');
            cards[f2.index].querySelector('.card-front').setAttribute('data-revealed', 'false');
            this._evaluating = false;
          }, UNMATCH_VIEW_DELAY_MS);
        }
      }

      this.state.flipped = [];
      this.updateStats();
    }

    // 🔍 Actualiza el contenido visible de badges ΔE según modo analítico
    updateAnalyticBadges(){
      const root = this.container.querySelector('.unified-memory-game');
      if(!root) return;
      const enabled = root.classList.contains('um-analytic');
      this.board.querySelectorAll('.analytic-badge[data-analytic="deltaE"]').forEach(el => {
        const val = el.getAttribute('data-deltae');
        if(enabled && val){
          el.textContent = `ΔE ${val}`;
          el.classList.add('visible');
        } else {
          el.textContent = '';
          el.classList.remove('visible');
        }
      });
    }

    showFeedback(message, type){
      // Crear notificación temporal
      const notification = document.createElement('div');
      notification.className = `memory-notification notification-${type}`;
      notification.textContent = message;
      this.container.appendChild(notification);

      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 1500);
    }

    showCreatorAttribution(pairData){
      // Obtener estadísticas del par desde PairsLibrary
      let stats = { plays: 0, successRate: 0 };
      if(global.PairsLibrary && pairData.pairId){
        stats = global.PairsLibrary.getPairStats(pairData.pairId) || stats;
      }

      // Crear toast de creador
      const toast = document.createElement('div');
      toast.className = 'creator-attribution-toast';
      toast.innerHTML = `
        <div class="creator-header">
          <span class="creator-icon">👤</span>
          <span class="creator-label">Creado por</span>
        </div>
        <div class="creator-info">
          <div class="creator-name">${pairData.creator.name}</div>
          <div class="creator-location">📍 ${pairData.creator.country}</div>
        </div>
        <div class="creator-stats">
          <div class="stat-item">
            <span class="stat-value">${stats.plays}</span>
            <span class="stat-label">jugadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${stats.successRate}%</span>
            <span class="stat-label">éxito</span>
          </div>
        </div>
      `;

      this.container.appendChild(toast);

      // Animación de entrada
      setTimeout(() => toast.classList.add('show'), 10);

      // Animación de salida
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }

    updateStats(){
      this.scoreEl.textContent = this.state.score;
      this.matchesEl.textContent = this.state.matched.length / 2;
      this.streakEl.textContent = this.state.streak;
    }

    finish(){
      const finalScore = this.state.score;
      const isPerfect = this.state.attempts === 0; // Sin errores

      // 🎯 Nueva tabla de conversión (hasta 15% máximo)
      let discount = 0;
      if (finalScore >= 160) discount = 15;
      else if (finalScore >= 130) discount = 12;
      else if (finalScore >= 100) discount = 10;
      else if (finalScore >= 70) discount = 8;
      else if (finalScore >= 40) discount = 5;

      // 💎 Guardar puntos permanentes en perfil de usuario
      let pointsEarned = 0;
      let userMessage = '';

      if (typeof global.UserProfile !== 'undefined') {
        const result = global.UserProfile.saveGame('memory', finalScore, isPerfect);
        pointsEarned = result.pointsEarned;
        const rankInfo = global.UserProfile.getRankInfo();

        userMessage = `\n\n💎 Puntos ganados: +${pointsEarned}\n🏅 Puntos totales: ${result.totalPoints}\n${rankInfo.icon} Rango: ${rankInfo.name}`;
      }

      // Guardar descuento en sistema acumulativo
      try {
        const existing = JSON.parse(localStorage.getItem('gamificationDiscounts') || '{}');
        existing.memoryDiscount = discount;
        existing.labDiscount = existing.labDiscount || 0;
        existing.totalDiscount = Math.min(25, (existing.memoryDiscount || 0) + (existing.labDiscount || 0));
        existing.timestamp = Date.now();
        localStorage.setItem('gamificationDiscounts', JSON.stringify(existing));

        // Mantener compatibilidad con sistema antiguo
        localStorage.setItem('artGameDiscount', existing.totalDiscount.toString());
      } catch(e){}

      const totalDiscount = Math.min(25, discount + (JSON.parse(localStorage.getItem('gamificationDiscounts') || '{}').labDiscount || 0));

      alert(`🎉 ¡Felicidades! Has completado el juego.\n\nPuntuación final: ${finalScore}\n💰 Descuento Memoria: ${discount}%\n🎯 Descuento Total: ${totalDiscount}%${userMessage}\n\n${totalDiscount < 25 ? '¡Juega Laboratorio de Mezclas para llegar al 25%!' : '🏆 ¡Descuento máximo desbloqueado!'}\n\n¡Ve al carrito para usar tu descuento!`);
    }

    enhanceColorCards(){
      // Gradiente dinámico para resultados con colores fuente
      const results = this.board.querySelectorAll('.color-result.result-has-source');
      results.forEach(el => {
        const attr = el.getAttribute('data-source-colors');
        if(!attr) return;
        const parts = attr.split(',').map(s => s.trim()).filter(Boolean);
        if(!parts.length) return;
        let gradient;
        if(parts.length === 1){
          gradient = `linear-gradient(135deg, ${parts[0]}, ${parts[0]})`;
        } else if(parts.length === 2){
          gradient = `linear-gradient(135deg, ${parts[0]}, ${parts[1]})`;
        } else {
          gradient = `linear-gradient(135deg, ${parts[0]} 0%, ${parts[1]} 50%, ${parts[2]} 100%)`;
        }
        el.style.setProperty('--result-gradient', gradient);
      });

      // Podríamos añadir un preview sutil de mezcla en la frontera de bisect (ya hay overlay).
      const bisects = this.board.querySelectorAll('.color-bisect-wrapper');
      bisects.forEach(wrapper => {
        // Si queremos una línea intermedia coloreada, se podría insertar.
        // Mantengo actual overlay neutro para no saturar.
      });
    }

    initMergeTooltips(){
      if(this._mergeTooltipsInitialized) return;
      this._mergeTooltipsInitialized = true;

      // Crear contenedor tooltip global si no existe
      let tip = document.getElementById('um-merge-tooltip');
      if(!tip){
        tip = document.createElement('div');
        tip.id = 'um-merge-tooltip';
        tip.setAttribute('role','tooltip');
        tip.style.position = 'fixed';
        tip.style.zIndex = '9999';
        tip.style.pointerEvents = 'none';
        tip.style.background = 'rgba(30,30,30,0.92)';
        tip.style.color = '#fff';
        tip.style.padding = '6px 10px';
        tip.style.fontSize = '0.75rem';
        tip.style.lineHeight = '1.1';
        tip.style.borderRadius = '6px';
        tip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
        tip.style.opacity = '0';
        tip.style.transform = 'translate(-50%, -8px) scale(.95)';
        tip.style.transition = 'opacity .18s ease, transform .18s ease';
        document.body.appendChild(tip);
      }

      const showTip = (el) => {
        const ids = (el.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
        if(!ids.length) return;
        const texts = ids.map(i => {
          const node = document.getElementById(i);
          return node ? node.textContent : '';
        }).filter(Boolean);
        if(!texts.length) return;
        tip.textContent = texts.join(' ');
        const rect = el.getBoundingClientRect();
        tip.style.left = (rect.left + rect.width/2) + 'px';
        tip.style.top = (rect.top - 6) + 'px';
        requestAnimationFrame(()=>{
          tip.style.opacity = '1';
          tip.style.transform = 'translate(-50%, -12px) scale(1)';
        });
      };
      const hideTip = () => {
        tip.style.opacity = '0';
        tip.style.transform = 'translate(-50%, -8px) scale(.95)';
      };

      const activate = (btn) => {
        if(btn.dataset.tooltipInit === 'true') return;
        btn.dataset.tooltipInit = 'true';
        btn.classList.add('merge-focusable');
        btn.setAttribute('tabindex','0');
        btn.addEventListener('mouseenter', () => showTip(btn));
        btn.addEventListener('mouseleave', hideTip);
        btn.addEventListener('focus', () => showTip(btn));
        btn.addEventListener('blur', hideTip);
        btn.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ hideTip(); btn.blur(); }});
        // Soporte táctil: tap revela 1.2s
        btn.addEventListener('touchstart', (e)=>{ e.preventDefault(); showTip(btn); clearTimeout(btn._tt); btn._tt = setTimeout(hideTip, 1200); }, { passive:false });
      };

      const observer = new MutationObserver(()=>{
        this.board.querySelectorAll('.overlap-merge[data-tooltip-init="false"]').forEach(activate);
        // Añadir badge 'MIN' si falta
        this.board.querySelectorAll('.overlap-merge[data-small="true"]').forEach(btn => {
          if(!btn.querySelector('.small-mix-badge')){
            const badge = document.createElement('div');
            badge.className = 'small-mix-badge';
            badge.textContent = 'MIN';
            badge.setAttribute('aria-hidden','true');
            btn.appendChild(badge);
          }
        });
      });
      observer.observe(this.board, { childList:true, subtree:true });
      // Inicial inmediato
      this.board.querySelectorAll('.overlap-merge[data-tooltip-init="false"]').forEach(activate);
      this.board.querySelectorAll('.overlap-merge[data-small="true"]').forEach(btn => {
        if(!btn.querySelector('.small-mix-badge')){
          const badge = document.createElement('div');
          badge.className = 'small-mix-badge';
          badge.textContent = 'MIN';
          badge.setAttribute('aria-hidden','true');
          btn.appendChild(badge);
        }
      });
    }

    restart(){
      this.state = {
        cards: [],
        flipped: [],
        matched: [],
        score: 0,
        attempts: 0,
        streak: 0,
        seenCards: new Set(),
        cardClickCount: {}
      };
      this.loadCards().then(() => {
        this.renderBoard();
        this.updateStats();
        // Pre-carga nuevamente tras reinicio
        this.preloadArtworkImages();
        const totalPairsEl = document.getElementById('um-total-pairs');
        if(totalPairsEl){ totalPairsEl.textContent = (this.state.cards.length / 2).toString(); }
      });
    }
  }

  function mount(container){
    new UnifiedMemoryGame(container);
  }

  function unmount(){}

  // Registrar en GameCore si existe
  const gameDef = {
    id: GAME_ID,
    title: 'Memoria Artística Unificada',
    icon: '🎨',
    description: 'Juego único con colores, imágenes y quiz',
    mount, unmount
  };

  function attemptRegister(reason){
    try {
      if(global.GameCore){
        if(!GameCore.listGames().some(g => g.id === GAME_ID)){
          GameCore.registerGame(gameDef);
          console.log('[unified-memory] Registrado en GameCore ('+reason+")");
          global.dispatchEvent(new CustomEvent('unified-memory-registered'));
        }
        return true;
      }
    } catch(e){ console.warn('[unified-memory] Error registrando', e); }
    return false;
  }

  // Intento inmediato
  if(!attemptRegister('immediate')){
    // Fallback DOMContentLoaded
    document.addEventListener('DOMContentLoaded', ()=> attemptRegister('DOMContentLoaded'));
    // Poll ligero (máx 2s) por si core.js va después
    let tries = 0;
    const maxTries = 20; // 20 * 100ms = 2s
    const iv = setInterval(()=>{
      tries++;
      if(attemptRegister('poll#'+tries) || tries >= maxTries){ clearInterval(iv); }
    }, 100);
  }

})(window);

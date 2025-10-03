/* quiz-game.js - Quiz de Teoría del Color (20 preguntas escalonadas)
 * Características:
 *  - Banco de preguntas con niveles basic/intermediate/advanced
 *  - Puntuación con bonus por tiempo restante
 *  - Barra de progreso + temporizador
 *  - Eventos: quiz.started, quiz.answered, quiz.completed
 *  - Integración XP (si existe GameXP) y Score base
 */
(function(global){
  const GAME_ID = 'quiz-color';

  const questionBank = [
    { id:1, level:'basic', q:'¿Cuáles son los colores primarios en el modelo RGB?', options:['Rojo, Amarillo, Azul','Rojo, Verde, Azul','Cian, Magenta, Amarillo','Blanco, Negro, Gris'], correct:1, explanation:'RGB es el modelo aditivo usado en pantallas.', basePoints:10, timeLimit:15 },
    { id:2, level:'basic', q:'¿Qué color resulta al mezclar amarillo y azul en pintura?', options:['Naranja','Violeta','Verde','Marrón'], correct:2, explanation:'Modelo sustractivo: amarillo + azul = verde.', basePoints:10, timeLimit:15 },
    { id:3, level:'basic', q:'¿Cuál es el color complementario del rojo?', options:['Azul','Amarillo','Verde','Naranja'], correct:2, explanation:'Está opuesto al rojo en la rueda cromática.', basePoints:10, timeLimit:15 },
    { id:4, level:'basic', q:'¿Qué son los colores cálidos?', options:['Azul, Verde, Violeta','Rojo, Naranja, Amarillo','Blanco, Negro, Gris','Rosa, Celeste, Lima'], correct:1, explanation:'Evocan calor y energía (fuego/sol).', basePoints:10, timeLimit:15 },
    { id:5, level:'basic', q:'¿Qué es el valor de un color?', options:['Su temperatura','Qué tan claro u oscuro es','Su pureza','Su intensidad'], correct:1, explanation:'Valor = luminosidad relativa.', basePoints:10, timeLimit:15 },
    { id:6, level:'basic', q:'¿Cómo se llaman los colores sin matiz?', options:['Primarios','Secundarios','Acromáticos','Terciarios'], correct:2, explanation:'Blanco, negro y grises.', basePoints:10, timeLimit:15 },
    { id:7, level:'basic', q:'¿Armonía monocromática?', options:['Colores opuestos','Variaciones de un mismo color','Tres equidistantes','Colores aleatorios'], correct:1, explanation:'Un solo matiz con valores/saturaciones distintas.', basePoints:10, timeLimit:15 },
    { id:8, level:'intermediate', q:'¿Qué es la saturación?', options:['Su brillo','Su temperatura','Su pureza o intensidad','Su opacidad'], correct:2, explanation:'Pureza del color.', basePoints:20, timeLimit:18 },
    { id:9, level:'intermediate', q:'Diferencia principal RGB vs CMYK', options:['RGB antiguo','RGB aditivo / CMYK sustractivo','RGB más colores','No hay diferencia'], correct:1, explanation:'RGB suma luz, CMYK resta luz.', basePoints:20, timeLimit:18 },
    { id:10, level:'intermediate', q:'¿Qué es una tríada cromática?', options:['Tres colores al azar','Tres tonos del mismo color','Tres colores equidistantes','Tres colores fríos'], correct:2, explanation:'Forman un triángulo equilátero en la rueda.', basePoints:20, timeLimit:18 },
    { id:11, level:'intermediate', q:'Efecto del contraste simultáneo', options:['Se mezclan','Color cambia según entorno','Colores vibran','Colores desaparecen'], correct:1, explanation:'Percepción influida por colores adyacentes.', basePoints:20, timeLimit:18 },
    { id:12, level:'intermediate', q:'Espacio de color más amplio', options:['RGB','CMYK','LAB','HSB'], correct:2, explanation:'LAB abarca todos los colores perceptibles.', basePoints:20, timeLimit:18 },
    { id:13, level:'intermediate', q:'Colores análogos', options:['Opuestos','Adyacentes','Igual valor','Digitales'], correct:1, explanation:'Vecinos en la rueda cromática.', basePoints:20, timeLimit:18 },
    { id:14, level:'intermediate', q:'Temperatura luz del mediodía', options:['2700K','4000K','5500K-6500K','10000K'], correct:2, explanation:'Alta temperatura = blanco-azulada.', basePoints:20, timeLimit:18 },
    { id:15, level:'advanced', q:'Metamerismo', options:['Mezcla de metales','Iguales bajo una luz, diferentes en otra','Degradación del color','Tipo de daltonismo'], correct:1, explanation:'Percepción igual con espectros distintos.', basePoints:30, timeLimit:22 },
    { id:16, level:'advanced', q:'Ángulo de matiz del cian (HSL)', options:['0°','120°','180°','240°'], correct:2, explanation:'Cian en 180°, opuesto al rojo.', basePoints:30, timeLimit:22 },
    { id:17, level:'advanced', q:'Ley de Weber-Fechner', options:['Mezcla aditiva','Relación log estímulo-percepción','Temperatura del color','Síntesis sustractiva'], correct:1, explanation:'Percepción logarítmica cambios de luminosidad.', basePoints:30, timeLimit:22 },
    { id:18, level:'advanced', q:'Gamut de un dispositivo', options:['Resolución','Brillo','Rango de colores reproducibles','Consumo de energía'], correct:2, explanation:'Límites del espacio reproducible.', basePoints:30, timeLimit:22 },
    { id:19, level:'advanced', q:'Conos en visión humana típica', options:['2','3','4','5'], correct:1, explanation:'S, M, L (tricromática).', basePoints:30, timeLimit:22 },
    { id:20, level:'advanced', q:'Colores en pompas de jabón', options:['Refracción','Dispersión','Interferencia película delgada','Fluorescencia'], correct:2, explanation:'Interferencia constructiva/destructiva.', basePoints:30, timeLimit:22 }
  ];

  const levelWeights = { basic:{timeBonus:5}, intermediate:{timeBonus:10}, advanced:{timeBonus:15} };

  function shuffle(arr){ return arr.map(a=>({a, r:Math.random()})).sort((x,y)=>x.r-y.r).map(x=>x.a); }

  class QuizGame {
    constructor(container){
      this.container = container;
      this.state = { index:0, score:0, answered:[], start:null };
      this.questions = questionBank; // Podríamos permitir filtrado / mezcla
      this.renderIntro();
    }

    renderIntro(){
      this.container.innerHTML = `
        <div class="quiz-intro">
          <h3>🎨 Quiz de Teoría del Color</h3>
          <p>20 preguntas escalonadas (básico → avanzado). Bonus por responder rápido.</p>
          <button class="quiz-start-btn">Comenzar ▶️</button>
          <button class="quiz-menu-btn">Menú 🏠</button>
        </div>`;
      this.container.querySelector('.quiz-start-btn').addEventListener('click', () => this.start());
      this.container.querySelector('.quiz-menu-btn').addEventListener('click', () => GameCore.mountGame('hub', this.container.parentElement));
    }

    start(){
      this.state.index = 0; this.state.score = 0; this.state.answered = []; this.state.start = Date.now();
      GameCore.eventBus.emit('quiz.started', { total: this.questions.length });
      this.renderQuestion();
    }

    current(){ return this.questions[this.state.index]; }

    renderQuestion(){
      const q = this.current();
      if(!q){ return this.finish(); }
      this.container.innerHTML = `
        <div class="quiz-question" data-level="${q.level}">
          <div class="quiz-meta">
            <span>Pregunta ${this.state.index+1}/${this.questions.length}</span>
            <span>Nivel: ${q.level}</span>
            <span class="quiz-timer" aria-live="polite">${q.timeLimit}s</span>
            <span>Puntos: ${this.state.score}</span>
          </div>
          <h4 class="quiz-q-text">${q.q}</h4>
          <div class="quiz-options" role="list">
            ${q.options.map((op,i)=>`<button class="quiz-opt" data-idx="${i}" role="listitem" tabindex="0">${op}</button>`).join('')}
          </div>
          <div class="quiz-actions">
            <button class="quiz-menu-btn">Menú 🏠</button>
          </div>
          <div class="quiz-feedback" aria-live="assertive"></div>
          <div class="quiz-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(this.state.index/this.questions.length)*100}">
            <div class="quiz-progress-fill" style="width:${(this.state.index/this.questions.length)*100}%"></div>
          </div>
        </div>`;
      this.bindOptions();
      this.container.querySelector('.quiz-menu-btn').addEventListener('click', () => GameCore.mountGame('hub', this.container.parentElement));
      this.startTimer(q);
    }

    startTimer(q){
      const timerEl = this.container.querySelector('.quiz-timer');
      let remaining = q.timeLimit;
      clearInterval(this.timer);
      this.timer = setInterval(()=>{
        remaining--;
        if(timerEl) timerEl.textContent = remaining + 's';
        if(remaining <= 0){
          clearInterval(this.timer);
          this.forceAnswer(null); // sin respuesta
        }
      },1000);
    }

    bindOptions(){
      this.container.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.idx,10)));
        btn.addEventListener('keyup', e => { if(e.key==='Enter' || e.key===' '){ this.answer(parseInt(btn.dataset.idx,10)); }});
      });
    }

    answer(idx){
      const q = this.current(); if(!q) return;
      clearInterval(this.timer);
      const correct = idx === q.correct;
      const remaining = this.getRemainingSeconds();
      let earned = 0;
      if(correct){
        const lw = levelWeights[q.level];
        earned = q.basePoints + Math.max(0, Math.floor(remaining/2)) + (lw ? lw.timeBonus : 0);
        GameStorage.addScore(earned);
        GameCore.eventBus.emit('score.changed', { game: GAME_ID, delta: earned });
        if(global.GameXP){ GameXP.addXP(earned, 'quizCorrect'); }
      }
      this.state.answered.push({ id:q.id, correct, earned });
      GameCore.eventBus.emit('quiz.answered', { question:q, correct, earned });
      this.showFeedback(correct, q, earned);
    }

    getRemainingSeconds(){
      const timerEl = this.container.querySelector('.quiz-timer');
      if(!timerEl) return 0;
      const val = parseInt(timerEl.textContent,10);
      return isNaN(val) ? 0 : val;
    }

    forceAnswer(){ this.answer(-1); }

    showFeedback(correct, q, earned){
      const fb = this.container.querySelector('.quiz-feedback');
      fb.innerHTML = correct ? `✅ Correcto (+${earned}). ${q.explanation}` : `❌ Incorrecto. ${q.explanation}`;
      setTimeout(()=>{ this.next(); }, 1400);
    }

    next(){
      this.state.index++;
      if(this.state.index >= this.questions.length){ this.finish(); }
      else { this.renderQuestion(); }
    }

    finish(){
      clearInterval(this.timer);
      const correctTotal = this.state.answered.filter(a=>a.correct).length;
      const totalScore = GameStorage.getState().score;
      this.container.innerHTML = `
        <div class="quiz-complete">
          <h3>🔚 Quiz Completado</h3>
          <p>Correctas: ${correctTotal}/${this.questions.length}</p>
          <p>Puntuación ganada en quiz: ${this.state.answered.reduce((s,a)=>s+a.earned,0)}</p>
          <p>Puntuación total global: ${totalScore}</p>
          <button class="quiz-retry-btn">Repetir 🔄</button>
          <button class="quiz-menu-btn">Menú 🏠</button>
        </div>`;
      this.container.querySelector('.quiz-retry-btn').addEventListener('click', () => this.start());
      this.container.querySelector('.quiz-menu-btn').addEventListener('click', () => GameCore.mountGame('hub', this.container.parentElement));
      GameCore.eventBus.emit('quiz.completed', { answered:this.state.answered, correctTotal });
      if(global.GameXP){ GameXP.addXP(correctTotal * 5, 'quizComplete'); }
    }
  }

  function mount(container){ new QuizGame(container); }
  function unmount(){ /* limpiar timers si hiciera falta */ }

  GameCore.registerGame({
    id: GAME_ID,
    title: 'Quiz Color',
    icon: '❓',
    flag: 'enableQuiz',
    description: 'Pon a prueba teoría del color',
    mount, unmount
  });
})(window);

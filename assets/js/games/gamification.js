/* gamification.js - Motor base de gamificación inicial
 * Objetivo: integrar estrategia de sesión corta (5-10 min) y preparar
 * subsistemas (session manager, progression, micro rewards) de forma incremental.
 * Esta versión se enfoca en:
 *  - SessionManager básico (tiempo transcurrido + fases)
 *  - Registro de eventos clave del GameCore
 *  - Emisión de eventos gamification.* derivados (ej: fase cambiada)
 *  - Persistencia mínima en GameStorage (streak, ultimaSesion)
 *  - Hooks para futura ProgressionSystem / Energy / MicroRewards
 */
(function(global){
  if(!global.GameCore || !global.GameStorage){
    console.warn('[gamification] Requiere GameCore y GameStorage cargados antes.');
    return;
  }
  const BUS = global.GameCore.eventBus;

  // Utilidad segura para leer/escribir en GameStorage un namespace gamification
  function loadState(){
    const state = global.GameStorage.getState();
    return state.gamification || {};
  }
  function savePatch(patch){
    const current = loadState();
    global.GameStorage.patch({ gamification: { ...current, ...patch }});
  }

  // Definición de fases según elapsed (segundos)
  const PHASES = [
    { id:'warmup',   start:0,    end:60 },      // 0-1 min
    { id:'core',     start:60,   end:420 },     // 1-7 min
    { id:'climax',   start:420,  end:540 },     // 7-9 min
    { id:'closure',  start:540,  end:600 },     // 9-10 min
  ];

  class SessionManager {
    constructor(){
      this.sessionStart = Date.now();
      this.currentPhase = 'warmup';
      this.actions = []; // historial simple: {t, type}
      this.interval = null;
      this.tick();
      this.interval = setInterval(()=>this.tick(), 15000); // cada 15s reevaluamos fase
    }
    getElapsedSeconds(){
      return Math.floor((Date.now() - this.sessionStart)/1000);
    }
    determinePhase(){
      const s = this.getElapsedSeconds();
      const phase = PHASES.find(p => s >= p.start && s < p.end) || PHASES[PHASES.length-1];
      return phase.id;
    }
    tick(){
      const prev = this.currentPhase;
      const next = this.determinePhase();
      if(prev !== next){
        this.currentPhase = next;
        BUS.emit('gamification.phaseChanged', { phase: next, elapsed: this.getElapsedSeconds() });
      }
    }
    recordAction(type, meta){
      this.actions.push({ t: Date.now(), type, ...(meta||{}) });
      if(this.actions.length > 200) this.actions.shift();
    }
    end(){
      if(this.interval) clearInterval(this.interval);
      BUS.emit('gamification.sessionEnded', { duration: this.getElapsedSeconds() });
    }
  }

  class GamificationEngineBase {
    constructor(){
      this.session = new SessionManager();
      this.ensureDailyStreak();
      this.progression = new ProgressionSystem();
      this.energy = new CreativeEnergySystem();
      this.bindCoreEvents();
      BUS.emit('gamification.initialized');
    }

    ensureDailyStreak(){
      const state = loadState();
      const today = (new Date()).toISOString().slice(0,10); // YYYY-MM-DD
      if(state.lastSessionDate === today){
        this.streak = state.streak || 1;
      } else {
        // si la última fue ayer mantenemos, si no, reiniciamos
        if(state.lastSessionDate){
          const prev = new Date(state.lastSessionDate);
          const diffDays = (Date.now() - prev.getTime())/(1000*60*60*24);
          if(diffDays > 1.5){ // perdió racha
            this.streak = 1;
          } else {
            this.streak = (state.streak||1)+1;
          }
        } else {
          this.streak = 1;
        }
      }
      savePatch({ lastSessionDate: today, streak: this.streak });
      BUS.emit('gamification.streak', { streak: this.streak });
    }

    bindCoreEvents(){
      BUS.on('game.played', payload => {
        this.session.recordAction('game.played', { id: payload.id });
        if(this.progression) this.progression.handleEvent('game.played', payload);
        if(this.energy) this.energy.handleEvent('game.played', payload);
      });
      BUS.on('score.changed', payload => {
        this.session.recordAction('score.changed', { delta: payload.delta, game: payload.game });
        if(this.progression) this.progression.handleEvent('score.changed', payload);
        if(this.energy) this.energy.handleEvent('score.changed', payload);
      });
      BUS.on('achievement.unlocked', payload => {
        this.session.recordAction('achievement.unlocked', { id: payload.id });
        if(this.energy) this.energy.handleEvent('achievement.unlocked', payload);
      });
      BUS.on('xp.gained', payload => {
        this.session.recordAction('xp.gained', { amount: payload.amount, reason: payload.reason });
      });
      BUS.on('level.up', payload => {
        this.session.recordAction('level.up', { level: payload.level });
      });
      BUS.on('game.completed', payload => {
        this.session.recordAction('game.completed', { id: payload.id, durationMs: payload.durationMs });
        if(this.progression) this.progression.handleEvent('game.completed', payload);
        if(this.energy) this.energy.handleEvent('game.completed', payload);
      });
      // Futuro: powerup.used, quiz.* etc
    }

    getPhase(){ return this.session.currentPhase; }
    getStreak(){ return this.streak; }
    getSessionElapsed(){ return this.session.getElapsedSeconds(); }
    getEnergy(){ return this.energy ? this.energy.getState() : null; }
    spendEnergy(code){ return this.energy ? this.energy.spend(code) : false; }
  }

  // ================= ProgressionSystem (Objetivos diarios / semanales) =================
  class ProgressionSystem {
    constructor(){
      const state = loadState();
      const today = (new Date()).toISOString().slice(0,10);
      const weekKey = this.computeWeekKey();
      this.dailySchemaVersion = 2; // incrementar cuando cambiemos estructura/semántica
      // Si cambia el día regeneramos diarios
      const needsRegen = !state.daily || state.daily.date !== today || state.daily.version !== this.dailySchemaVersion;
      if(needsRegen){
        this.dailyObjectives = this.generateDailyObjectives();
        savePatch({ daily: { date: today, version: this.dailySchemaVersion, objectives: this.dailyObjectives }});
      } else {
        this.dailyObjectives = state.daily.objectives || [];
      }
      // Semanal
      if(!state.weekly || state.weekly.week !== weekKey){
        this.weekly = { week: weekKey, challenge: this.generateWeeklyChallenge(), progress:0, completed:false };
        savePatch({ weekly: this.weekly });
      } else {
        this.weekly = state.weekly;
      }
      BUS.emit('progression.dailyLoaded', { objectives: this.dailyObjectives });
      BUS.emit('progression.weeklyLoaded', { weekly: this.weekly });
    }
    computeWeekKey(){
      const d = new Date();
      const first = new Date(d.getFullYear(),0,1);
      const day = Math.floor((d - first)/(24*60*60*1000));
      const week = Math.ceil((day + first.getDay()+1)/7);
      return d.getFullYear() + '-W' + week;
    }
    generateDailyObjectives(){
      return [
        {
          id:'quick-start',
          name:'Calentamiento Rápido',
          description:'Completa 1 partida de cualquier juego',
          xp:20, progress:0, target:1, difficulty:'easy', type:'game.completed', matcher:()=>true
        },
        {
          id:'color-explorer',
          name:'Explorador Cromático',
          description:'Completa 3 partidas de memoria con ≥65% de precisión',
          xp:40, progress:0, target:3, difficulty:'medium', type:'game.completed',
          // Ya no usamos stat; contamos 1 por partida que cumpla criterios
          matcher:(e)=> e.id==='memory-game' && typeof e.accuracy==='number' && e.accuracy >= 0.65
        },
        {
          id:'perfect-mix',
          name:'Mezcla Perfecta',
          description:'Logra 3 incrementos de puntuación en mezclas (sin fallos)',
          xp:40, progress:0, target:3, difficulty:'hard', type:'score.changed',
          matcher:(e)=> e.game==='color-mixing' && e.delta>0
        }
      ];
    }
    generateWeeklyChallenge(){
      const challenges = [
        { name:'Semana del Arcoíris', description:'Juega con los 7 colores del espectro', xp:200, badge:'🌈', id:'rainbow-week', type:'game.played', requirement:7, progress:0 },
        { name:'Velocista del Color', description:'Completa 10 partidas en menos de 2 minutos', xp:250, badge:'⚡', id:'speed-week', type:'game.completed', requirement:10, progress:0, condition:(e)=> e.durationMs && e.durationMs < 120000 }
      ];
      return challenges[Math.floor(Math.random()*challenges.length)];
    }
    persistDaily(){
      savePatch({ daily: { date: (new Date()).toISOString().slice(0,10), version: this.dailySchemaVersion, objectives: this.dailyObjectives }});
    }
    persistWeekly(){
      savePatch({ weekly: this.weekly });
    }
    handleEvent(type, payload){
      // Daily objectives
      let updated = false;
      this.dailyObjectives.forEach(obj => {
        if(obj.completed) return;
        if(obj.type === type){
          if(!obj.matcher || obj.matcher(payload)){
            let inc = 1;
            if(obj.stat && payload[obj.stat] != null){
              inc = payload[obj.stat]; // sumamos matches de la partida, por ejemplo
            }
            obj.progress += inc;
            if(obj.progress >= obj.target){
              obj.progress = obj.target;
              obj.completed = true;
              BUS.emit('progression.objectiveCompleted', { objective: obj });
              if(global.GameXP){ GameXP.addXP(obj.xp, 'dailyObjective'); }
            }
            updated = true;
          }
        }
      });
      if(updated){
        this.persistDaily();
        BUS.emit('progression.dailyUpdated', { objectives: this.dailyObjectives });
      }
      // Weekly challenge
      if(this.weekly && !this.weekly.completed && this.weekly.type === type){
        if(!this.weekly.condition || this.weekly.condition(payload)){
          this.weekly.progress += 1;
          if(this.weekly.progress >= this.weekly.requirement){
            this.weekly.progress = this.weekly.requirement;
            this.weekly.completed = true;
            BUS.emit('progression.weeklyCompleted', { weekly: this.weekly });
            if(global.GameXP){ GameXP.addXP(this.weekly.xp, 'weeklyChallenge'); }
          }
          this.persistWeekly();
          BUS.emit('progression.weeklyUpdated', { weekly: this.weekly });
        }
      }
    }
    getDaily(){ return this.dailyObjectives; }
    getWeekly(){ return this.weekly; }
  }

  // ================= CreativeEnergySystem =================
  class CreativeEnergySystem {
    constructor(){
      const state = loadState();
      this.config = {
        max: 100,
        gain: { perMinute:10, perMatch:5, perCombo:15, perAchievement:25 },
        spend: { skipChallenge:20, doubleXP:30, unlockHint:10, customizeTheme:50 }
      };
      const stored = state.energy || { current:0, lastTick: Date.now(), streakBonus:0 };
      this.current = stored.current || 0;
      this.lastTick = stored.lastTick || Date.now();
      this.applyStreakBonus();
      this.setupMinuteGain();
      this.persist();
    }
    applyStreakBonus(){
      const gState = loadState();
      const streak = gState.streak || 1;
      this.streakBonus = Math.min(20, streak * 2); // simple bonus máximo 20
    }
    setupMinuteGain(){
      setInterval(()=>{
        this.gain('perMinute', this.config.gain.perMinute + this.streakBonus);
      }, 60000);
    }
    gain(reason, amount){
      if(amount<=0) return;
      const before = this.current;
      this.current = Math.min(this.config.max, this.current + amount);
      this.persist();
      BUS.emit('energy.gained', { reason, amount, total:this.current, before });
    }
    spend(code){
      const cost = this.config.spend[code];
      if(cost == null) return false;
      if(this.current < cost) return false;
      const before = this.current;
      this.current -= cost;
      this.persist();
      BUS.emit('energy.spent', { code, cost, remaining:this.current, before });
      if(code === 'doubleXP'){ BUS.emit('energy.effect.doubleXP', { durationMs:60000 }); }
      return true;
    }
    handleEvent(type, payload){
      // Integraciones básicas
      if(type==='game.completed' && payload.id==='memory-game'){ // matches totales ya en payload
        this.gain('perMatch', payload.matches * this.config.gain.perMatch);
      }
      if(type==='achievement.unlocked'){
        this.gain('perAchievement', this.config.gain.perAchievement);
      }
      if(type==='score.changed' && payload.delta>0){
        // Pequeña ganancia proporcional (cap para no desbalancear)
        const add = Math.min(10, Math.floor(payload.delta/50));
        if(add>0) this.gain('scoreBonus', add);
      }
      // Futuro: detectar combos (necesita tracking incremental)
    }
    persist(){
      savePatch({ energy: { current:this.current, lastTick: Date.now(), streakBonus:this.streakBonus }});
    }
    getState(){ return { current:this.current, max:this.config.max, streakBonus:this.streakBonus }; }
  }


  // Instanciamos una sola vez y lo exponemos
global.Gamification = new GamificationEngineBase();

})(window);

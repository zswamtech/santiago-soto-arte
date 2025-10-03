/* notifications.js - Sistema de notificaciones inteligentes no intrusivas
 * Características:
 *  - Cola con maxVisible=1
 *  - Agrupación merge-similar por tipo e id
 *  - Diferentes presets (achievement, tip, milestone, energy, xp)
 *  - Accesible: aria-live y focus no robado
 */
(function(global){
  if(!global.GameCore){ console.warn('[notifications] Requiere GameCore.'); return; }
  const BUS = GameCore.eventBus;

  const PRESETS = {
    achievement: { duration:3000, position:'top-center', cls:'ntf-achievement' },
    tip: { duration:2000, position:'bottom-right', cls:'ntf-tip' },
    milestone: { duration:4000, position:'center', cls:'ntf-milestone', backdrop:true },
    energy: { duration:1800, position:'bottom-right', cls:'ntf-energy' },
    xp: { duration:1800, position:'bottom-right', cls:'ntf-xp' }
  };

  function ensureContainer(){
    let root = document.getElementById('game-notifications-root');
    if(!root){
      root = document.createElement('div');
      root.id = 'game-notifications-root';
      document.body.appendChild(root);
      injectStyles();
    }
    return root;
  }

  function injectStyles(){
    if(document.getElementById('game-notifications-styles')) return;
    const st = document.createElement('style');
    st.id='game-notifications-styles';
    st.textContent = `
      #game-notifications-root { position:fixed; inset:0; pointer-events:none; z-index:9999; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; }
      .game-ntf { min-width:240px; max-width:320px; background:rgba(30,30,40,.95); color:#fff; padding:.9rem 1rem; border-radius:12px; box-shadow:0 4px 18px -2px rgba(0,0,0,.45); pointer-events:auto; display:flex; gap:.6rem; align-items:flex-start; opacity:0; transform:translateY(-6px); transition:opacity .3s, transform .3s; }
      .game-ntf.show { opacity:1; transform:translateY(0); }
      .game-ntf .ntf-icon { font-size:1.3rem; line-height:1; }
      .game-ntf .ntf-body { flex:1; }
      .game-ntf .ntf-title { font-weight:600; margin:0 0 .25rem; font-size:.95rem; }
      .game-ntf .ntf-msg { margin:0; font-size:.8rem; line-height:1.2; opacity:.9; }
      .game-ntf .action-btn { margin-top:.4rem; background:#673ab7; color:#fff; border:none; padding:.35rem .65rem; font-size:.7rem; border-radius:6px; cursor:pointer; box-shadow:0 2px 4px -1px rgba(0,0,0,.5); }
      .game-ntf .action-btn:hover { background:#7e57c2; }
      .pos-top-center { position:absolute; top:1.2rem; left:50%; transform:translateX(-50%); }
      .pos-bottom-right { position:absolute; bottom:1.2rem; right:1.2rem; }
      .pos-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); }
      .game-ntf.backdrop::before { content:""; position:fixed; inset:0; backdrop-filter:blur(3px) brightness(.4); border-radius:inherit; z-index:-1; }
      .ntf-achievement { border:1px solid #ffb74d; }
      .ntf-milestone { border:1px solid #64b5f6; }
      .ntf-energy { border:1px solid #81c784; }
      .ntf-xp { border:1px solid #9575cd; }
      .close-btn { background:none; border:none; color:#fff; font-size:1rem; line-height:1; cursor:pointer; opacity:.7; }
      .close-btn:hover { opacity:1; }
    `;
    document.head.appendChild(st);
  }

  class NotificationCenter {
    constructor(){
      this.queue = [];
      this.active = null;
      ensureContainer();
    }
    push({ type='tip', title, message, icon, id, mergeKey, duration, action }){
      const preset = PRESETS[type] || PRESETS.tip;
      const item = { type, title, message, icon, id: id||Date.now(), duration: duration||preset.duration, preset, mergeKey: mergeKey||type+':'+(id||title), action };
      // merge-similar
      const existing = this.queue.find(q => q.mergeKey === item.mergeKey && !q.consumed && q.type===item.type);
      if(existing){
        existing.count = (existing.count||1)+1;
        existing.message = item.message; // update msg
        if(this.active && this.active.mergeKey===existing.mergeKey){
          this.updateActive(existing);
        }
        return;
      }
      this.queue.push(item);
      this.maybeShowNext();
    }
    maybeShowNext(){
      if(this.active) return;
      const next = this.queue.shift();
      if(!next) return;
      this.show(next);
    }
    show(item){
      this.active = item;
      const root = ensureContainer();
      const el = document.createElement('div');
      el.className = `game-ntf pos-${item.preset.position} ${item.preset.backdrop? 'backdrop':''} ${item.preset.cls}`;
      el.setAttribute('role','status');
      el.setAttribute('aria-live','polite');
      let actionBtnHTML = '';
      if(item.action){
        actionBtnHTML = `<button class="action-btn" data-action="primary" aria-label="${item.action.label}">${item.action.label}</button>`;
      }
      el.innerHTML = `
        <div class="ntf-icon">${item.icon||'🔔'}</div>
        <div class="ntf-body">
          <p class="ntf-title">${item.title||''} ${item.count? 'x'+item.count:''}</p>
          <p class="ntf-msg">${item.message||''}</p>
          ${actionBtnHTML}
        </div>
        <button class="close-btn" aria-label="Cerrar notificación">×</button>
      `;
      root.appendChild(el);
      requestAnimationFrame(()=> el.classList.add('show'));
      const close = ()=>{ this.close(el,item); };
      el.querySelector('.close-btn').addEventListener('click', close);
      item.timer = setTimeout(close, item.duration);
      if(item.action){
        const ab = el.querySelector('.action-btn');
        if(ab){
          ab.addEventListener('click', ()=>{
            try { item.action.handler ? item.action.handler(item) : BUS.emit(item.action.event, item.action.data||{}); } catch(err){ console.error(err); }
            close();
          });
        }
      }
    }
    updateActive(item){
      const root = document.getElementById('game-notifications-root');
      if(!root) return;
      const el = root.querySelector('.game-ntf');
      if(!el) return;
      const titleEl = el.querySelector('.ntf-title');
      if(titleEl){ titleEl.textContent = (item.title||'') + (item.count? ' x'+item.count : ''); }
      const msgEl = el.querySelector('.ntf-msg');
      if(msgEl){ msgEl.textContent = item.message||''; }
    }
    close(el,item){
      clearTimeout(item.timer);
      el.classList.remove('show');
      setTimeout(()=>{
        el.remove();
        this.active = null;
        this.maybeShowNext();
      },250);
    }
  }

  const center = new NotificationCenter();

  // Exponer API sencilla
  global.GameNotifications = {
    push:(opts)=> center.push(opts)
  };

  // Enlaces con eventos (reglas básicas)
  BUS.on('achievement.unlocked', e => {
    GameNotifications.push({ type:'achievement', title:'Logro', message:e.objective? e.objective.name : (e.id||'Logro desbloqueado'), icon:'🏅' });
  });
  BUS.on('progression.objectiveCompleted', e => {
    GameNotifications.push({ type:'achievement', title:'Objetivo diario', message:e.objective.name, icon:'✅' });
  });
  BUS.on('progression.weeklyCompleted', e => {
    GameNotifications.push({ type:'milestone', title:'Desafío semanal', message:e.weekly.challenge.name, icon:e.weekly.challenge.badge||'🏆' });
  });
  BUS.on('xp.gained', e => {
    if(e.amount >= 30){
      GameNotifications.push({ type:'xp', title:'+XP', message:`Ganaste ${e.amount} XP`, icon:'✨', mergeKey:'xp-burst' });
    }
  });
  BUS.on('level.up', e => {
    GameNotifications.push({ type:'milestone', title:'Nivel '+e.level, message:'¡Has subido de nivel!', icon:'🚀' });
  });
  BUS.on('energy.gained', e => {
    if(e.amount >= 10){
      GameNotifications.push({ type:'energy', title:'Energía', message:`+${e.amount} ⚡ (${e.total})`, icon:'⚡', mergeKey:'energy-gain' });
    }
  });

  // Near-miss events
  BUS.on('nearMiss.detected', e => {
    // Ya se genera notificación en near-miss.js vía GameNotifications.push con action, aquí podríamos reforzar si quisiéramos.
  });
  BUS.on('nearMiss.accepted', e => {
    GameNotifications.push({ type:'xp', title:'Revancha', message:'Boost x2 activado', icon:'🎯', mergeKey:'near-accepted' });
  });
  BUS.on('nearMiss.expired', e => {
    GameNotifications.push({ type:'tip', title:'Expirada', message:'Oferta near-miss expirada', icon:'⌛', mergeKey:'near-expired' });
  });

})(window);

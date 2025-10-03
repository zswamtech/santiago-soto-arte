/* hub.js - UI central para listar y lanzar juegos */
(function(global){
  function render(container){
    const games = GameCore.listGames();
    const state = GameStorage.getState();
    const progression = global.Gamification && global.Gamification.progression ? global.Gamification.progression : null;
    const daily = progression ? progression.getDaily() : [];
    const weekly = progression ? progression.getWeekly() : null;

    const energy = global.Gamification && global.Gamification.getEnergy ? global.Gamification.getEnergy() : null;
    container.innerHTML = `
      <div class="games-hub" data-theme="${state.theme}">
        <h3 class="hub-title">🎮 Laboratorio Creativo</h3>
        <div class="hub-stats">
          <div><strong>Puntuación:</strong> ${state.score}</div>
          <div><strong>Logros:</strong> ${state.achievements.length}</div>
          <div><strong>Tema:</strong> ${state.theme}</div>
          <div><strong>Racha:</strong> ${global.Gamification ? global.Gamification.getStreak() : '-'}</div>
          <div class="energy-block" aria-label="Energía creativa">
            <span><strong>⚡ Energía:</strong> ${energy ? energy.current : 0}/${energy ? energy.max : 100}</span>
            <div class="energy-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${energy ? energy.max : 100}" aria-valuenow="${energy ? energy.current : 0}">
              <div class="energy-fill" style="width:${energy ? (energy.current/energy.max)*100 : 0}%;"></div>
            </div>
          </div>
        </div>
        <section class="hub-objectives" aria-label="Objetivos diarios y semanales">
          <h4>🗓️ Objetivos Diarios</h4>
          <ul class="daily-list">
            ${daily.map(o => `<li data-obj-id="${o.id}" class="daily-item ${o.completed?'completed':''}">
              <span class="obj-name">${o.name}</span>
              <span class="obj-progress">${o.progress}/${o.target}</span>
              ${o.completed ? '<span class="badge">✔</span>' : ''}
            </li>`).join('') || '<li>(Cargando...)</li>'}
          </ul>
          <h4>🏆 Desafío Semanal</h4>
          <div class="weekly-box">
            ${weekly ? `
              <div class="weekly-title">${weekly.challenge.name} ${weekly.challenge.badge||''}</div>
              <div class="weekly-desc">${weekly.challenge.description}</div>
              <div class="weekly-progress" aria-label="Progreso semanal">${weekly.progress}/${weekly.requirement} ${weekly.completed? '✔' : ''}</div>
            ` : '<p>(Cargando...)</p>'}
          </div>
        </section>
        <section class="hub-history" aria-label="Historial de eventos sorpresa" tabindex="0">
          <h4>🧪 Historial Reciente</h4>
          <div class="history-filters" role="toolbar" aria-label="Filtros historial">
            <button class="hist-filter-btn" data-filter="all" aria-pressed="true">Todos</button>
            <button class="hist-filter-btn" data-filter="nearMiss" aria-pressed="false">Near-Miss</button>
            <button class="hist-filter-btn" data-filter="surprise" aria-pressed="false">Sorpresas</button>
          </div>
          <ul class="history-list">
            ${renderHistoryItems(state.history && state.history.events || [])}
          </ul>
          <div class="history-actions"><button id="clear-history-btn" aria-label="Limpiar historial">Limpiar</button></div>
        </section>
        <div class="games-grid">
          ${games.map(g => `
            <div class="game-card" tabindex="0" role="button" aria-label="Juego ${g.title}" data-game-id="${g.id}">
              <h4>${g.icon||'🎲'} ${g.title}</h4>
              <p>${g.description||''}</p>
              ${g.flag && GameCore.flags[g.flag]===false ? '<span class="flag-off">(Desactivado)</span>' : ''}
            </div>
          `).join('')}
        </div>
        <div class="hub-footer">
          <button id="toggle-theme-btn">Cambiar Tema</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-game-id');
        GameCore.mountGame(id, container);
      });
      card.addEventListener('keyup', (e) => { if(e.key==='Enter' || e.key===' '){ card.click(); }});
    });

    const themeBtn = container.querySelector('#toggle-theme-btn');
    themeBtn.addEventListener('click', () => {
      const next = state.theme === 'dark' ? 'light' : state.theme === 'light' ? 'neon' : 'dark';
      GameStorage.setTheme(next);
      GameCore.eventBus.emit('theme.changed', next);
      render(container); // re-render
    });

    // Suscribirse a actualizaciones de progression para refrescar solo panel objetivos
    if(!render._progressionBound){
      GameCore.eventBus.on('progression.dailyUpdated', () => refreshObjectives(container));
      GameCore.eventBus.on('progression.objectiveCompleted', () => refreshObjectives(container));
      GameCore.eventBus.on('progression.weeklyUpdated', () => refreshObjectives(container));
      GameCore.eventBus.on('progression.weeklyCompleted', () => refreshObjectives(container));
      GameCore.eventBus.on('energy.gained', () => refreshEnergy(container));
      GameCore.eventBus.on('energy.spent', () => refreshEnergy(container));
      GameCore.eventBus.on('history.updated', () => refreshHistory(container));
      render._progressionBound = true;
    }

    const clearBtn = container.querySelector('#clear-history-btn');
    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        const st = GameStorage.getState();
        if(st.history){ st.history.events = []; GameStorage.patch({ history: st.history }); }
        refreshHistory(container);
      });
    }

    // Filtros
    const filterState = (GameStorage.getState().historyFilters) || { active:'all' };
    applyFilterUI(container, filterState.active);
    container.querySelectorAll('.hist-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-filter');
        filterState.active = f;
        GameStorage.patch({ historyFilters: filterState });
        applyFilterUI(container, f);
        refreshHistory(container);
      });
    });
  }

  function refreshObjectives(container){
    const progression = global.Gamification && global.Gamification.progression ? global.Gamification.progression : null;
    if(!progression) return;
    const daily = progression.getDaily();
    const weekly = progression.getWeekly();
    const dailyList = container.querySelector('.daily-list');
    if(dailyList){
      dailyList.innerHTML = daily.map(o => `<li data-obj-id="${o.id}" class="daily-item ${o.completed?'completed':''}">
        <span class="obj-name">${o.name}</span>
        <span class="obj-progress">${o.progress}/${o.target}</span>
        ${o.completed ? '<span class="badge">✔</span>' : ''}
      </li>`).join('');
    }
    const weeklyBox = container.querySelector('.weekly-box');
    if(weeklyBox && weekly){
      weeklyBox.innerHTML = `
        <div class="weekly-title">${weekly.challenge.name} ${weekly.challenge.badge||''}</div>
        <div class="weekly-desc">${weekly.challenge.description}</div>
        <div class="weekly-progress" aria-label="Progreso semanal">${weekly.progress}/${weekly.requirement} ${weekly.completed? '✔' : ''}</div>
      `;
    }
  }

  function refreshEnergy(container){
    const energy = global.Gamification && global.Gamification.getEnergy ? global.Gamification.getEnergy() : null;
    if(!energy) return;
    const block = container.querySelector('.energy-block');
    if(block){
      block.querySelector('span').innerHTML = `<strong>⚡ Energía:</strong> ${energy.current}/${energy.max}`;
      const bar = block.querySelector('.energy-bar');
      if(bar){
        bar.setAttribute('aria-valuenow', energy.current);
        block.querySelector('.energy-fill').style.width = (energy.current/energy.max)*100 + '%';
      }
    }
  }

  function renderHistoryItems(events){
    if(!events || !events.length) return '<li class="empty">(Sin eventos)</li>';
    return events.slice(-15).reverse().map(ev => {
      const time = new Date(ev.t).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
      const label = historyLabel(ev);
      const detail = tooltipContent(ev);
      return `<li class="hist-item hist-${ev.kind}-${ev.type}" tabindex="0" aria-label="${label}" data-info="${encode(detail)}"><span class="hist-time">${time}</span><span class="hist-label">${label}</span></li>`;
    }).join('');
  }

  function historyLabel(ev){
    if(ev.kind==='nearMiss'){
      switch(ev.type){
        case 'detected': return `Near-miss ${ev.data.game} (${ev.data.reason||''})`;
        case 'accepted': return `Boost aceptado (${ev.data.game})`;
        case 'redeemed': return `Boost usado (${ev.data.game})`;
        case 'expired': return `Oferta expirada (${ev.data.game})`;
      }
    }
    if(ev.kind==='surprise'){
      switch(ev.type){
        case 'triggered': return `Sorpresa: ${ev.data.id}`;
        case 'rewardGranted': return `Recompensa aplicada: ${ev.data.id}`;
      }
    }
    return ev.type;
  }

  function refreshHistory(container){
    const list = container.querySelector('.history-list');
    if(!list) return;
    const st = GameStorage.getState();
    const filter = (st.historyFilters && st.historyFilters.active) || 'all';
    let events = (st.history && st.history.events) || [];
    if(filter !== 'all'){
      events = events.filter(e => e.kind === filter);
    }
    list.innerHTML = renderHistoryItems(events);
    attachHistoryTooltips(container);
  }

  function applyFilterUI(container, active){
    container.querySelectorAll('.hist-filter-btn').forEach(b => {
      const on = b.getAttribute('data-filter') === active;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true':'false');
    });
  }

  function tooltipContent(ev){
    const base = [ `Tipo: ${ev.kind}/${ev.type}` ];
    if(ev.data){
      Object.keys(ev.data).forEach(k => {
        const v = typeof ev.data[k]==='object' ? JSON.stringify(ev.data[k]) : ev.data[k];
        base.push(`${k}: ${v}`);
      });
    }
    const dateStr = new Date(ev.t).toLocaleString();
    base.push(`Hora: ${dateStr}`);
    return base.join('\n');
  }

  function encode(str){ return String(str).replace(/["<>]/g, c => ({'"':'&quot;','<':'&lt;','>':'&gt;'}[c])); }

  function ensureTooltipHost(){
    let host = document.getElementById('hist-tooltip-host');
    if(!host){
      host = document.createElement('div');
      host.id='hist-tooltip-host';
      host.setAttribute('role','tooltip');
      document.body.appendChild(host);
    }
    return host;
  }

  function attachHistoryTooltips(container){
    const items = container.querySelectorAll('.history-list .hist-item');
    const host = ensureTooltipHost();
    items.forEach(it => {
      function show(){
        const info = it.getAttribute('data-info');
        if(!info) return;
        host.textContent = info.replace(/\\n/g, '\n');
        host.classList.add('show');
        const rect = it.getBoundingClientRect();
        const top = rect.top + window.scrollY - host.offsetHeight - 8;
        const left = rect.left + window.scrollX + 10;
        host.style.top = (top < 0 ? rect.bottom + window.scrollY + 8 : top) + 'px';
        host.style.left = left + 'px';
      }
      function hide(){ host.classList.remove('show'); }
      it.addEventListener('mouseenter', show);
      it.addEventListener('mouseleave', hide);
      it.addEventListener('focus', show);
      it.addEventListener('blur', hide);
    });
  }

  // Registrar el HUB como “juego” especial
  GameCore.registerGame({
    id: 'hub',
    title: 'Centro',
    icon: '🧭',
    description: 'Explora todos los minijuegos',
    mount(container){ render(container); },
    unmount(){}
  });

  global.GamesHub = { render };
})(window);

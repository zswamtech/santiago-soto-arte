/*
 * validation-logger.js
 * Módulo ligero para registrar resultados de casos de validación manual.
 * - Persiste en localStorage bajo clave 'validation_log_v1'
 * - Evita duplicados por id de caso
 * - Permite exportar a Markdown tabla con timestamp
 * - API segura (no rompe si localStorage falla)
 */
(function(global){
  const STORAGE_KEY = 'validation_log_v1';

  function nowISO(){
    return new Date().toISOString();
  }

  function safeLoad(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return { cases: [], meta: { createdAt: nowISO(), updatedAt: nowISO(), version: 1 } };
      const parsed = JSON.parse(raw);
      if(!parsed.cases) parsed.cases = [];
      return parsed;
    } catch(e){
      console.warn('[ValidationLogger] load error', e);
      return { cases: [], meta: { createdAt: nowISO(), updatedAt: nowISO(), version: 1, degraded: true } };
    }
  }

  function safeSave(state){
    try {
      state.meta.updatedAt = nowISO();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e){
      console.warn('[ValidationLogger] save error', e);
    }
  }

  function validateStatus(status){
    return ['OK','FALLO','NA'].includes(status);
  }

  function toMarkdown(state){
    const header = `# Resultados Validación (Export ${nowISO()})\n\nTotal casos: ${state.cases.length}\n\n| Caso | Estado | Notas | Timestamp |\n|------|--------|-------|-----------|`;
    const rows = state.cases.map(c => `| ${c.id} | ${c.status} | ${(c.notes||'').replace(/\n/g,' ')} | ${c.updatedAt} |`);
    return `${header}\n${rows.join('\n')}\n`;
  }

  const ValidationLogger = {
    addOrUpdate(caseId, status, notes){
      const state = safeLoad();
      if(!validateStatus(status)){
        throw new Error('Estado inválido. Use OK | FALLO | NA');
      }
      const existing = state.cases.find(c => c.id === caseId);
      if(existing){
        existing.status = status;
        existing.notes = notes || existing.notes || '';
        existing.updatedAt = nowISO();
      } else {
        state.cases.push({ id: caseId, status, notes: notes||'', createdAt: nowISO(), updatedAt: nowISO() });
      }
      safeSave(state);
      document.dispatchEvent(new CustomEvent('validation:updated', { detail: { caseId, status } }));
      return this.get(caseId);
    },
    get(caseId){
      const state = safeLoad();
      return state.cases.find(c => c.id === caseId) || null;
    },
    list(){
      return safeLoad().cases.slice();
    },
    remove(caseId){
      const state = safeLoad();
      const before = state.cases.length;
      state.cases = state.cases.filter(c => c.id !== caseId);
      safeSave(state);
      return before !== state.cases.length;
    },
    clear(confirmFlag){
      if(!confirmFlag) throw new Error('Falta confirmación clear(true)');
      safeSave({ cases: [], meta: { createdAt: nowISO(), updatedAt: nowISO(), version: 1 } });
    },
    exportMarkdown(){
      return toMarkdown(safeLoad());
    },
    downloadMarkdown(filename){
      const blob = new Blob([this.exportMarkdown()], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || `validation_results_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 100);
    }
  };

  // QA Overlay opcional
  function maybeInitOverlay(){
    const params = new URLSearchParams(location.search);
    if(!params.has('qa')) return; // Activar con ?qa=1
    if(document.getElementById('qa-validation-overlay')) return;

    const container = document.createElement('div');
    container.id = 'qa-validation-overlay';
    container.style.cssText = 'position:fixed;bottom:1rem;left:1rem;z-index:99999;background:#111;color:#fff;font:12px system-ui;padding:8px 10px;border:1px solid #444;border-radius:6px;max-width:260px;box-shadow:0 4px 12px rgba(0,0,0,.4);';
    container.innerHTML = `
      <strong style="font-size:13px;display:block;margin-bottom:4px;">QA Logger</strong>
      <div id="qa-cases-list" style="max-height:120px;overflow:auto;margin-bottom:6px;"></div>
      <form id="qa-add-form" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
        <input required name="id" placeholder="Caso" style="flex:1;min-width:60px;font-size:11px;padding:2px 4px;" />
        <select name="status" style="font-size:11px;padding:2px 4px;">
          <option>OK</option>
          <option>FALLO</option>
          <option>NA</option>
        </select>
        <input name="notes" placeholder="Notas" style="flex:1 1 100%;font-size:11px;padding:2px 4px;" />
        <button style="font-size:11px;padding:2px 6px;cursor:pointer;">Guardar</button>
      </form>
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        <button id="qa-export" style="font-size:11px;padding:2px 6px;cursor:pointer;">Export</button>
        <button id="qa-clear" style="font-size:11px;padding:2px 6px;cursor:pointer;">Clear</button>
        <button id="qa-close" style="font-size:11px;padding:2px 6px;cursor:pointer;margin-left:auto;">×</button>
      </div>`;

    function render(){
      const listEl = container.querySelector('#qa-cases-list');
      const cases = ValidationLogger.list().sort((a,b)=> a.id.localeCompare(b.id));
      listEl.innerHTML = cases.map(c => `<div style='padding:2px 0;border-bottom:1px solid #222;'><strong>${c.id}</strong> <span style='color:${c.status==='OK'?'#4ade80':(c.status==='FALLO'?'#f87171':'#eab308')};'>${c.status}</span></div>`).join('') || '<em style="opacity:.7;">Sin casos</em>';
    }

    container.querySelector('#qa-add-form').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        ValidationLogger.addOrUpdate(fd.get('id').trim(), fd.get('status').trim(), fd.get('notes').trim());
        e.target.reset();
        render();
      } catch(err){
        alert(err.message);
      }
    });

    container.querySelector('#qa-export').addEventListener('click', ()=>{
      ValidationLogger.downloadMarkdown();
    });
    container.querySelector('#qa-clear').addEventListener('click', ()=>{
      if(confirm('¿Borrar todos los registros QA?')){
        try { ValidationLogger.clear(true); render(); } catch(err){ alert(err.message); }
      }
    });
    container.querySelector('#qa-close').addEventListener('click', ()=> container.remove());

    document.addEventListener('validation:updated', render);

    document.body.appendChild(container);
    render();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', maybeInitOverlay);
  } else {
    maybeInitOverlay();
  }

  global.ValidationLogger = ValidationLogger;
})(window);

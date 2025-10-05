// library.js - Render dinámico de la Biblioteca de Razas (ArtBreeds)
// Requiere que animal-data.js haya definido window.ArtBreeds
(function(global){
  if(!global.ArtBreeds){ console.warn('[library] ArtBreeds no encontrado aún'); return; }
  const dataset = global.ArtBreeds;

  function qs(id){ return document.getElementById(id); }

  function computeFlatList(){
    const out = [];
    Object.entries(dataset.categories).forEach(([catKey, cat]) => {
      (cat.breeds||[]).forEach(b => {
        out.push({
          categoryKey: catKey,
          categoryName: cat.name,
          categoryEmoji: cat.emoji || '',
          id: b.id,
            name: b.name,
          images: b.images || [],
          variants: b.images ? b.images.length : 0
        });
      });
    });
    return out;
  }

  let ALL = computeFlatList();

  function variantBucket(count){
    if(count <= 1) return '1';
    if(count === 2) return '2';
    return '3'; // 3 o más
  }

  function render(){
    const grid = qs('lib-grid');
    if(!grid) return;
    const catSel = qs('lib-category-filter');
    const varSel = qs('lib-variant-filter');
    const search = qs('lib-search');
    const catFilter = catSel?.value || 'all';
    const variantFilter = varSel?.value || 'any';
    const query = (search?.value || '').trim().toLowerCase();

    let list = ALL.slice();
    if(catFilter !== 'all') list = list.filter(i => i.categoryKey === catFilter);
    if(variantFilter !== 'any'){
      list = list.filter(i => {
        if(variantFilter === '3') return i.variants >= 3;
        return variantBucket(i.variants) === variantFilter;
      });
    }
    if(query) list = list.filter(i => i.name.toLowerCase().includes(query));

    // Stats
    const stats = qs('lib-stats');
    if(stats){
      const totalBreeds = ALL.length;
      stats.textContent = `Mostrando ${list.length} de ${totalBreeds} razas (${uniqueCategories(list).length} categorías filtradas)`;
    }

    grid.innerHTML = list.map(item => cardTemplate(item)).join('');
  }

  function uniqueCategories(list){
    return Array.from(new Set(list.map(i => i.categoryKey)));
  }

  function cardTemplate(item){
    const first = item.images[0];
    const thumb = first ? `<img src="${first.src}" alt="${first.alt || item.name}" loading="lazy" onerror="this.style.display='none'" style="width:100%;height:140px;object-fit:cover;border-radius:10px;">` : '<div style="height:140px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">🎨</div>';
    const variantsHtml = item.images && item.images.length ? item.images.map(img => `<div class="variant" style="flex:1;min-width:48px;"> <img src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.style.opacity=.3;this.alt='Sin imagen';" style="width:100%;height:58px;object-fit:cover;border-radius:6px;"> <span style="display:block;font-size:.55rem;opacity:.7;margin-top:2px;text-align:center;">v${img.variant}</span></div>`).join('') : '<span style="font-size:.7rem;opacity:.6;">Sin variantes</span>';
    return `<div class="lib-card" data-cat="${item.categoryKey}" style="background:#fff;border:1px solid #e2e2e8;padding:.75rem;border-radius:14px;display:flex;flex-direction:column;gap:.55rem;position:relative;box-shadow:0 2px 4px rgba(0,0,0,.04);">
      <div class="thumb-wrapper" style="position:relative;">${thumb}<span style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff;font-size:.65rem;padding:2px 6px;border-radius:12px;">${item.categoryEmoji} ${item.categoryName}</span></div>
      <h3 style="margin:0;font-size:1rem;line-height:1.1;">${item.name}</h3>
      <div class="variants-row" style="display:flex;gap:4px;flex-wrap:wrap;">${variantsHtml}</div>
      <div style="font-size:.65rem;opacity:.7;display:flex;align-items:center;justify-content:space-between;">
        <span>${item.variants} variante${item.variants!==1?'s':''}</span>
        <button class="lib-focus-btn" data-id="${item.id}" style="background:#667eea;color:#fff;border:none;border-radius:6px;padding:4px 7px;font-size:.6rem;cursor:pointer;">Detalles</button>
      </div>
    </div>`;
  }

  function populateFilters(){
    const catSel = qs('lib-category-filter');
    if(!catSel) return;
    Object.entries(dataset.categories).forEach(([key, cat]) => {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = `${cat.emoji || ''} ${cat.name}`;
      catSel.appendChild(opt);
    });
  }

  function attachEvents(){
    ['lib-category-filter','lib-variant-filter','lib-search'].forEach(id => {
      const el = qs(id); if(el){ el.addEventListener('input', render); el.addEventListener('change', render);} });
    const refresh = qs('lib-refresh'); if(refresh) refresh.addEventListener('click', () => { ALL = computeFlatList(); render(); });
    const grid = qs('lib-grid');
    if(grid){
      grid.addEventListener('click', e => {
        const btn = e.target.closest('.lib-focus-btn');
        if(btn){ showDetail(btn.dataset.id); }
      });
    }
  }

  function showDetail(id){
    const breed = ALL.find(b => b.id === id);
    if(!breed) return;
    const modalId = 'lib-modal';
    let modal = document.getElementById(modalId);
    if(!modal){
      modal = document.createElement('div');
      modal.id = modalId;
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.style.position='fixed';
      modal.style.inset='0';
      modal.style.background='rgba(0,0,0,.55)';
      modal.style.display='flex';
      modal.style.alignItems='center';
      modal.style.justifyContent='center';
      modal.innerHTML = '<div class="lib-modal-inner" style="background:#fff;max-width:680px;width:92%;max-height:85%;overflow:auto;border-radius:18px;padding:1.25rem;box-shadow:0 4px 18px rgba(0,0,0,.25);"></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', ev => { if(ev.target === modal) modal.remove(); });
    }
    const inner = modal.querySelector('.lib-modal-inner');
    inner.innerHTML = detailTemplate(breed) + '<div style="text-align:right;margin-top:1rem;"><button style="padding:.55rem .9rem;border-radius:8px;background:#667eea;color:#fff;border:none;cursor:pointer;" onclick="document.getElementById(\'lib-modal\').remove()">Cerrar</button></div>';
    modal.style.opacity='0';
    requestAnimationFrame(()=>{ modal.style.transition='opacity .25s ease'; modal.style.opacity='1'; });
  }

  function detailTemplate(b){
    const imgs = b.images.map(img => `<figure style="margin:0;"> <img src="${img.src}" alt="${img.alt}" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;" loading="lazy"> <figcaption style="font-size:.6rem;opacity:.7;margin-top:4px;">v${img.variant} – ${img.alt}</figcaption></figure>`).join('<div style="flex-basis:100%;height:1px;"></div>');
    return `<h3 style="margin-top:0;">${b.name}</h3>
      <p style="font-size:.8rem;opacity:.8;margin:.2rem 0 1rem;">Categoría: ${b.categoryEmoji} ${b.categoryName} · Variantes: ${b.variants}</p>
      <div style="display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));">${imgs}</div>`;
  }

  function initWhenVisible(){
    // Si la sección no está aún en DOM, reintentar brevemente
    const grid = qs('lib-grid');
    if(!grid){ setTimeout(initWhenVisible, 300); return; }
    populateFilters();
    attachEvents();
    render();
  }

  // Iniciar al DOM listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initWhenVisible);
  } else {
    initWhenVisible();
  }

})(window);

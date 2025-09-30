// 🛒 Módulo Cart - Fuente única de verdad del carrito
// Responsable de: estado, persistencia, cálculos y eventos
// UI y pasarela de pago consumen esta capa.

(function(global) {
  const STORAGE_KEY = 'santiago_soto_cart';
  const CART_VERSION = 1;

  // Observers internos (callbacks)
  const listeners = new Set();

  const state = {
    items: [], // {id, type, name, description, price, quantity, customData, image}
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0, // subtotal - discount + tax + shipping
    breakdown: { 
      discounts: { patron: 0, coupon: 0, total: 0, appliedCap: false }, 
      shippingTier: null,
      netAfterDiscount: 0,
      shippingProgress: { nextTier: null, missing: 0 } // nextTier: { tier, threshold, shippingCost }
    },
    coupon: null, // { code, percent }
    meta: { version: CART_VERSION, updatedAt: null }
  };

  // ----- Utils de Cálculo -----
  function hasPhysicalProducts() {
    return state.items.some(i => i.type === 'product' || i.type === 'custom_artwork');
  }

  // ----- Pricing avanzado -----
  const SHIPPING_TIERS = [
    { max: 99, cost: 18, tier: 'T1' },
    { min: 100, max: 199, cost: 15, tier: 'T2' },
    { min: 200, max: 299, cost: 10, tier: 'T3' },
    { min: 300, cost: 0, tier: 'FREE' }
  ];
  const DISCOUNT_CAP_PERCENT = 25; // CAP global

  function getPatronDiscountPercent(){
    if (typeof global.artPatronSystem !== 'undefined') {
      return global.artPatronSystem.getPatronDiscount() || 0;
    }
    return 0;
  }

  function calculateShipping(net, hasPhysical){
    if(!hasPhysical) return { shipping: 0, tier: null, progress: { nextTier:null, missing:0 } };
    let matched = { shipping:0, tier:'FREE' };
    for(const rule of SHIPPING_TIERS){
      const min = (typeof rule.min === 'number') ? rule.min : -Infinity;
      const max = (typeof rule.max === 'number') ? rule.max : Infinity;
      if(net >= min && net <= max){
        matched = { shipping: rule.cost, tier: rule.tier };
        break;
      }
    }
    // Calcular progreso hacia próximo tier (solo si no es FREE)
    let nextTier = null; let missing = 0;
    if(matched.tier !== 'FREE'){
      // Encontrar el siguiente rule con costo menor que el actual
      const ordered = SHIPPING_TIERS.slice().sort((a,b)=> (a.min||0)-(b.min||0));
      const currentIndex = ordered.findIndex(r=> r.tier === matched.tier);
      if(currentIndex > -1){
        for(let i=currentIndex+1;i<ordered.length;i++){
          if(ordered[i].cost < matched.shipping){
            const threshold = (typeof ordered[i].min === 'number') ? ordered[i].min : 0;
            if(net < threshold){
              missing = Math.max(0, threshold - net);
              nextTier = { tier: ordered[i].tier, threshold, shippingCost: ordered[i].cost };
            }
            break;
          }
        }
      }
    }
    return { shipping: matched.shipping, tier: matched.tier, progress: { nextTier, missing } };
  }

  function calculatePricing(items){
    const subtotal = items.reduce((s,i)=> s + i.price * i.quantity, 0);
    // Descuentos
  const patronPct = getPatronDiscountPercent();
  const patron = Math.round(subtotal * (patronPct/100));
  const couponPct = state.coupon ? state.coupon.percent : 0;
    const coupon = Math.round(subtotal * (couponPct/100));
    let totalDiscount = patron + coupon;
    const theoreticalPct = subtotal > 0 ? (totalDiscount / subtotal)*100 : 0;
    let appliedCap = false;
    if(theoreticalPct > DISCOUNT_CAP_PERCENT){
      totalDiscount = Math.round(subtotal * (DISCOUNT_CAP_PERCENT/100));
      // Redistribución proporcional (simple) entre componentes
      const baseSum = patron + coupon || 1;
      const scale = totalDiscount / baseSum;
      const newPatron = Math.round(patron * scale);
      const newCoupon = Math.round(coupon * scale);
      // Ajuste por redondeo
      const diff = totalDiscount - (newPatron + newCoupon);
      state.breakdown.discounts.patron = newPatron + diff; // asignar diff al patron
      state.breakdown.discounts.coupon = newCoupon;
      appliedCap = true;
    } else {
      state.breakdown.discounts.patron = patron;
      state.breakdown.discounts.coupon = coupon;
    }

    const discount = appliedCap ? (state.breakdown.discounts.patron + state.breakdown.discounts.coupon) : totalDiscount;
    const netAfterDiscount = Math.max(0, subtotal - discount);
    const hasPhysical = items.some(i => i.type === 'product' || i.type === 'custom_artwork');
    const { shipping, tier, progress } = calculateShipping(netAfterDiscount, hasPhysical);
    const taxableBase = hasPhysical ? netAfterDiscount : 0;
    const tax = Math.round(taxableBase * 0.10);
    const total = Math.max(0, netAfterDiscount + tax + shipping);

    state.breakdown.discounts.total = discount;
    state.breakdown.discounts.appliedCap = appliedCap;
    state.breakdown.shippingTier = tier;
    state.breakdown.netAfterDiscount = netAfterDiscount;
    state.breakdown.shippingProgress = progress;

    return { subtotal, discount, tax, shipping, total };
  }

  function recompute() {
    const pricing = calculatePricing(state.items);
    state.subtotal = pricing.subtotal;
    state.discount = pricing.discount;
    state.tax = pricing.tax;
    state.shipping = pricing.shipping;
    state.total = pricing.total;
    state.meta.updatedAt = Date.now();
  }

  // ----- Persistencia -----
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta: state.meta, cart: {
        items: state.items,
        subtotal: state.subtotal,
        discount: state.discount,
        tax: state.tax,
        shipping: state.shipping,
        total: state.total
      }}));
    } catch(e) { /* noop */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.cart) {
        state.items = parsed.cart.items || [];
        recompute(); // recalcular con reglas actuales
      }
    } catch(e) { /* noop */ }
  }

  // ----- Notificación -----
  function emit() {
    recompute();
    save();
    // Disparar CustomEvent global
    try { global.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: snapshot() } })); } catch(_){}
    // Notificar listeners internos (sin mutar)
    listeners.forEach(cb => { try { cb(snapshot()); } catch(_){} });
  }

  function snapshot(){
    return {
      items: state.items.map(i=>({...i})),
      pricing: state.pricing,
      breakdown: {
        discounts: { ...state.breakdown.discounts },
        shippingTier: state.breakdown.shippingTier,
        netAfterDiscount: state.breakdown.netAfterDiscount,
        shippingProgress: state.breakdown.shippingProgress
      },
      appliedCoupon: state.coupon ? { ...state.coupon } : null
    };
  }

  // ----- Operaciones CRUD -----
  function add(item) {
  if (!item || typeof item.price !== 'number') return;
  // Forzar id como string para uniformidad
  const incomingId = String(item.id || Date.now());
  const existing = state.items.find(i => String(i.id) === incomingId && i.type === item.type);
    if (existing && item.type !== 'custom_artwork') {
      existing.quantity += item.quantity || 1;
    } else {
      state.items.push({
        id: incomingId,
        type: item.type,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity || 1,
        customData: item.customData || null,
        image: item.image || null
      });
    }
    emit();
  }

  function remove(itemId) {
    const targetId = String(itemId);
    state.items = state.items.filter(i => String(i.id) !== targetId);
    emit();
  }

  function updateQuantity(itemId, qty) {
    if (qty <= 0) {
      remove(itemId);
      return;
    }
    const targetId = String(itemId);
    const it = state.items.find(i => String(i.id) === targetId);
    if (it) {
      it.quantity = qty;
      emit();
    }
  }

  function clear() {
    state.items = [];
    emit();
  }

  // ----- Listeners -----
  function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }

  // ----- Multi-tab sync -----
  function setupStorageSync() {
    global.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        load();
        emit(); // re-emite para UI local
      }
    });
  }

  // Inicializar
  load();
  recompute();
  setupStorageSync();

  // ---- Integración con sistema de puntos (descuento dinámico) ----
  try {
    window.addEventListener('artpatron:points-updated', () => {
      // Solo recalcular y notificar UI si hay items (si no, no se necesita ruido visual)
      if(state.items.length === 0) return;
      // Recomputar y notificar a listeners/UI sin duplicar lógica: usamos emit() pero
      // emit también dispara recompute + save. Para evitar doble recompute innecesario, podemos
      // llamar recompute() y luego notificar manualmente.
      recompute();
      try { window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: snapshot() } })); } catch(_){ }
      listeners.forEach(cb => { try { cb(snapshot()); } catch(_){} });
    });
  } catch(_) {}

  const api = {
    add,
    remove,
    updateQuantity,
    clear,
    getSnapshot: snapshot,
    subscribe,
    applyCoupon(code, percent){
      if(!code || typeof percent !== 'number') return;
      state.coupon = { code:String(code), percent:Math.max(0, Math.min(100, percent)) };
      emit();
    },
    clearCoupon(){ if(state.coupon){ state.coupon = null; emit(); } }
  };

  // ==== MODO DEBUG =====
  let debugEnabled = false;
  let lastPrint = 0;
  function debugLog(snap){
    if(!debugEnabled) return;
    const now = Date.now();
    // Evitar spam excesivo si muchas mutaciones en ms
    if(now - lastPrint < 50) return;
    lastPrint = now;
    try {
      console.groupCollapsed(`🛒 [CartDebug] ${snap.items.length} items | total $${snap.total}`);
      console.table(snap.items.map(i=>({ id:i.id, name:i.name, qty:i.quantity, price:i.price, line:i.price*i.quantity })));
      console.log('subtotal:', snap.subtotal, 'discount:', snap.discount, 'tax:', snap.tax, 'shipping:', snap.shipping, 'total:', snap.total);
      console.log('meta:', snap.meta);
      console.groupEnd();
    } catch(e){ /* noop */ }
  }

  // Hook debug al subscribe interno existente
  subscribe(debugLog);

  function setDebug(on){ debugEnabled = !!on; if(debugEnabled){ debugLog(snapshot()); console.info('[CartDebug] Activado'); } else { console.info('[CartDebug] Desactivado'); } }

  // Activación por query param ?debugCart=1
  try {
    const qp = new URLSearchParams(location.search);
    if(qp.get('debugCart') === '1') setDebug(true);
  } catch(_){}

  // Exponer helper debug separado para no contaminar API de negocio
  global.CartModuleDebug = { enable:()=>setDebug(true), disable:()=>setDebug(false), status:()=>debugEnabled };

  global.CartModule = api;
})(window);

// 💳 Pasarela de Pagos - Refactor con CartModule
(function(global){
  // =====================================================================
  //  DOCUMENTACIÓN RÁPIDA (extensión del carrito)
  //  Para añadir un producto desde cualquier parte del HTML:
  //    <button class="add-to-cart-btn" data-item='{"id":"sku_123","type":"product","name":"Nombre","description":"Desc","price":45}'>Añadir</button>
  //  El listener delegado global detectará el click y llamará addToCart.
  //  Tipos soportados: product, custom_artwork (este último no acumula cantidades, cada pieza es única si se decide así en CartModule).
  //  El snapshot expuesto a otras capas incluye: subtotal, discount, tax, shipping, total y breakdown con:
  //    breakdown.discounts { patron, coupon, total, appliedCap }
  //    breakdown.shippingTier (T1|T2|T3|FREE)
  //    breakdown.shippingProgress { nextTier, missing }
  //  Para aplicar cupones desde otra UI:
  //    window.CartModule.applyCoupon('CODE', percent)
  //  (La validación real debe hacerse en backend antes de pago definitivo.)
  // =====================================================================
  function mapCartSnapshot(snap){
    return {
      items: snap.items || [],
      subtotal: snap.subtotal || 0,
      discount: snap.discount || 0,
      tax: snap.tax || 0,
      shipping: snap.shipping || 0,
      total: snap.total || 0,
      meta: snap.meta || { version: 1, updatedAt: null },
      breakdown: snap.breakdown || {},
      appliedCoupon: snap.appliedCoupon || null
    };
  }
  class PaymentGateway {
    constructor(){
      this.stripe=null;
      this.cardElement=null;
      this.stripeCardValid=false;
      this.cartSnapshot=mapCartSnapshot({});
  // Estado renovado de highlight: persiste hasta que el usuario lo vea en sidebar y/o checkout
  // type: 'new' | 'increment'
  this.highlight={ itemId:null, type:null, seenSidebar:false, seenCheckout:false };
      this._lastShippingTier=null; // para animación tier
      this.init();
    }
    async init(){ await this.loadStripe(); this.subscribeCart(); this.setupEventListeners(); this.refreshCartUI(); }
    async loadStripe(){ try { const pk='pk_test_51OStPQFsXWOUKXs9S7ZnEuwcYJ1JDY6cF8M8VDc9vFDGJWBLfbZq9xA8YPtJeVdY8M7Z9mQnC4X8G7Y5vXdP8R100L0K0kBcF'; if(global.Stripe){ this.stripe=global.Stripe(pk); console.log('✅ Stripe cargado correctamente'); } else { console.warn('⚠️ Stripe SDK no está cargado'); } } catch(e){ console.error('❌ Error cargando Stripe:', e);} }
    subscribeCart(){ if(!global.CartModule){ console.warn('CartModule no disponible'); return; } this.cartSnapshot=mapCartSnapshot(global.CartModule.getSnapshot()); global.CartModule.subscribe(s=>{ this.cartSnapshot=mapCartSnapshot(s); this.refreshCartUI(); }); }
  addToCart(item){
    // Determinar si ya existía (increment) antes de mutar
    let type='new';
    try {
      const existing=(this.cartSnapshot.items||[]).find(i=> String(i.id)===String(item.id) && i.type===item.type && item.type!=='custom_artwork');
      if(existing) type='increment';
    } catch(_){}
    this.highlight={ itemId:String(item.id), type, seenSidebar:false, seenCheckout:false };
    global.CartModule.add(item);
    this.showCartNotification(`${type==='new'?'✅':'➕'} ${item.name} ${type==='new'?'añadido':'cantidad actualizada'}`);
    if(global.artPatronSystem) global.artPatronSystem.addPoints('cart_add');
  }
  removeFromCart(id){ global.CartModule.remove(String(id)); this.showCartNotification('🗑️ Item eliminado del carrito'); }
  updateQuantity(id,q){ global.CartModule.updateQuantity(String(id),q); }
    clearCart(){ global.CartModule.clear(); }
    refreshCartUI(){ this.updateCartDisplay(); }
    updateCartDisplay(){ this.updateCartIcon(); this.updateCartSidebar(); this.updateFloatingWidget(); }
  updateCartIcon(){ const el=document.querySelector('.cart-icon-count'); const count=this.cartSnapshot.items.reduce((s,i)=>s+i.quantity,0); if(el){ el.textContent=count; el.style.display=count>0?'block':'none'; } }
  bumpCounters(){ try { const navCount=document.querySelector('.cart-icon-count'); const widgetCount=document.getElementById('fcw-count'); [navCount, widgetCount].forEach(el=>{ if(!el) return; el.classList.remove('count-bump'); void el.offsetWidth; el.classList.add('count-bump'); setTimeout(()=> el.classList.remove('count-bump'), 650); }); } catch(_){} }
    updateCartSidebar(){ const sidebar=document.getElementById('cart-sidebar'); if(!sidebar) return; const content=sidebar.querySelector('.cart-content'); if(!content) return; if(this.cartSnapshot.items.length===0){ content.innerHTML=`<div class="empty-cart"><div class="empty-cart-icon">🛒</div><h3>Tu carrito está vacío</h3><p>¡Explora nuestras opciones y encuentra algo especial!</p><button onclick=\"paymentGateway.closeCart()\" class=\"btn-secondary\">Seguir Explorando</button></div>`; return; } let html='<div class="cart-items">'; this.cartSnapshot.items.forEach(item=>{ const rawId=String(item.id); const safeId=rawId.replace(/"/g,'&quot;'); let highlightClass=''; if(this.highlight.itemId && rawId===this.highlight.itemId && !this.highlight.seenSidebar){ highlightClass = this.highlight.type==='increment' ? ' increment-item-flash' : ' new-item-flash'; } html+=`<div class="cart-item${highlightClass}" data-item-id="${safeId}"><div class="cart-item-image">${item.image?`<img src="${item.image}" alt="${item.name}">`:'<div class="placeholder-image">🎨</div>'}</div><div class="cart-item-details"><h4>${item.name}</h4><p class="cart-item-description">${item.description}</p><div class="cart-item-price">$${item.price}</div>${item.type!=='custom_artwork'?`<div class="quantity-controls"><button onclick=\"paymentGateway.updateQuantity('${safeId}', ${item.quantity-1})\" ${item.quantity<=1?'disabled':''}>-</button><span class=\"quantity\">${item.quantity}</span><button onclick=\"paymentGateway.updateQuantity('${safeId}', ${item.quantity+1})\">+</button></div>`:`<div class=\"custom-artwork-note\">🎨 Encargo personalizado</div>`}</div><div class="cart-item-actions"><div class="cart-item-subtotal">$${item.price*item.quantity}</div><button onclick="paymentGateway.removeFromCart('${safeId}')" class="remove-item">🗑️</button></div></div>`; }); html+='</div>'; const breakdown=this.cartSnapshot.breakdown||{}; const discounts=breakdown.discounts||{}; const shippingTier=breakdown.shippingTier||null; const prog=breakdown.shippingProgress||{ nextTier:null, missing:0 }; const effectiveDiscountPct=this.cartSnapshot.subtotal>0? ((discounts.total/ this.cartSnapshot.subtotal)*100):0; const discountPctLabel=discounts.total>0? `<div class=\"cart-effective-discount\">Descuento efectivo: ${effectiveDiscountPct.toFixed(1)}%${discounts.appliedCap?' (CAP)':''}</div>`:''; let shippingHint=''; if(this.cartSnapshot.items.length>0){ if(shippingTier==='FREE'){ shippingHint='<div class=\"cart-shipping-hint success\">🚀 ¡Envío gratis alcanzado!</div>'; } else if(prog.nextTier){ shippingHint=`<div class=\"cart-shipping-hint\">Te faltan <strong>$${prog.missing}</strong> para ${prog.nextTier.tier==='FREE'?'envío gratis':'bajar envío a $'+prog.nextTier.shippingCost}.</div>`; } } const currentCoupon=this.cartSnapshot.appliedCoupon; const couponInput=`<div class=\"cart-coupon\"><label>Cupón:</label><div class=\"coupon-input-wrapper\">${currentCoupon?`<input type=\\"text\\" value=\\"${currentCoupon.code}\\" disabled /><button class=\\"clear-coupon-btn\\" title=\\"Quitar cupón\\">Quitar</button>`:`<input type=\\"text\\" class=\\"coupon-code-input\\" placeholder=\\"Ingresa cupón\\" /><button class=\\"apply-coupon-btn\\" title=\\"Aplicar cupón\\">Aplicar</button>`}</div><div class=\"coupon-feedback\" aria-live=\"polite\"></div></div>`; html+=`<div class=\"cart-summary\">${couponInput}<div class=\"cart-subtotal\"><span>Subtotal:</span><span>$${this.cartSnapshot.subtotal}</span></div>${discounts && discounts.total>0?`<div class=\\"cart-discount\\"><span>🎮 Descuentos:</span><span>-$${discounts.total}</span></div>`:''}${discounts && discounts.patron>0?`<div class=\\"cart-discount-detail\\"><span>• Patron:</span><span>-$${discounts.patron}${discounts.appliedCap?'*':''}</span></div>`:''}${discounts && discounts.coupon>0?`<div class=\\"cart-discount-detail\\"><span>• Cupón:</span><span>-$${discounts.coupon}${discounts.appliedCap?'*':''}</span></div>`:''}${discounts && discounts.appliedCap?`<div class=\\"cart-cap-note\\" title=\"CAP aplicado: límite 25%\">* CAP 25%</div>`:''}${discountPctLabel}${this.cartSnapshot.tax>0?`<div class=\\"cart-tax\\"><span>Impuestos (10%):</span><span>$${this.cartSnapshot.tax}</span></div>`:''}${this.cartSnapshot.shipping>0?`<div class=\\"cart-shipping\\"><span>Envío${shippingTier?` (${shippingTier})`:''}:</span><span>$${this.cartSnapshot.shipping}</span></div>`:''}${this.cartSnapshot.shipping===0 && shippingTier==='FREE'?`<div class=\\"cart-shipping\\"><span>Envío:</span><span>Gratis ✅</span></div>`:''}${shippingHint}<div class=\"cart-total\"><span>Total a Pagar:</span><span>$${this.cartSnapshot.total}</span></div><div class=\"cart-actions\"><button onclick=\"paymentGateway.openCheckout()\" class=\"btn-primary checkout-btn\">💳 Pagar $${this.cartSnapshot.total}</button><button onclick=\"paymentGateway.clearCart()\" class=\"btn-secondary clear-cart-btn\">🗑️ Vaciar Carrito</button></div></div>`; content.innerHTML=html; this.ensureTierHighlightCSS(); this.applyTierHighlight(content);
      if(this.highlight.itemId && !this.highlight.seenSidebar){
        const isOpen=sidebar.classList.contains('open');
        if(isOpen){
          const el=content.querySelector(`.cart-item[data-item-id="${CSS.escape(this.highlight.itemId)}"]`);
          if(el){
            setTimeout(()=>{
              el.classList.remove('new-item-flash');
              el.classList.remove('increment-item-flash');
              this.highlight.seenSidebar=true;
              if(this.highlight.seenCheckout){ this.highlight.itemId=null; }
            },1400);
          }
        }
      }
    } // end updateCartSidebar
    // (constructor duplicado eliminado por refactor)
    applyTierHighlight(container){ try { const tier = (this.cartSnapshot.breakdown||{}).shippingTier; if(!tier) return; if(tier !== this._lastShippingTier){ const el = container.querySelector('.cart-shipping, .order-shipping'); if(el){ el.classList.add('tier-changed'); setTimeout(()=> el.classList.remove('tier-changed'), 1200); } this._lastShippingTier = tier; } } catch(e){} }
    // Añadir estilo inline simple si no existe
    ensureTierHighlightCSS(){ if(document.getElementById('tier-highlight-style')) return; const style=document.createElement('style'); style.id='tier-highlight-style'; style.textContent=`.tier-changed { animation: tierFlash 1.2s ease; position: relative; }
@keyframes tierFlash { 0%{ background: #fff3cd; } 50%{ background:#ffe8a1; } 100%{ background:transparent; } }`; document.head.appendChild(style); }
    openCart(){ const el=document.getElementById('cart-sidebar'); if(el){ el.classList.add('open'); document.body.style.overflow='hidden'; } }
    closeCart(){ const el=document.getElementById('cart-sidebar'); if(el){ el.classList.remove('open'); document.body.style.overflow='auto'; } }
    toggleCart(){ const el=document.getElementById('cart-sidebar'); if(el){ el.classList.toggle('open'); document.body.style.overflow=el.classList.contains('open')?'hidden':'auto'; } }
    openCheckout(){ if(this.cartSnapshot.items.length===0){ alert('Tu carrito está vacío'); return; } const m=document.getElementById('checkout-modal'); if(m){ m.style.display='block'; document.body.style.overflow='hidden'; this.initializeCheckoutForm(); } }
    closeCheckout(){ const m=document.getElementById('checkout-modal'); if(m){ m.style.display='none'; document.body.style.overflow='auto'; } }
  initializeCheckoutForm(){ const c=document.querySelector('.checkout-content'); if(!c) return; c.innerHTML=this.generateCheckoutHTML(); this.setupCheckoutValidation(); this.applyCheckoutHighlight(); }
  applyCheckoutHighlight(){ try { if(!this.highlight.itemId) return; const container=document.querySelector('.checkout-content .order-items'); if(!container) return; const el=container.querySelector(`.order-item[data-item-id="${CSS.escape(this.highlight.itemId)}"]`); if(el && !this.highlight.seenCheckout){ setTimeout(()=>{ el.classList.remove('new-item-flash'); el.classList.remove('increment-item-flash'); this.highlight.seenCheckout=true; if(this.highlight.seenSidebar){ this.highlight.itemId=null; } },1400); } } catch(_){} }
  generateCheckoutHTML(){ const breakdown=this.cartSnapshot.breakdown||{}; const discounts=breakdown.discounts||{}; const shippingTier=breakdown.shippingTier||null; const prog=breakdown.shippingProgress||{nextTier:null,missing:0}; const effectiveDiscountPct=this.cartSnapshot.subtotal>0?((discounts.total/this.cartSnapshot.subtotal)*100):0; const discountPctLabel=discounts.total>0?`<div class="order-effective-discount">Descuento efectivo: ${effectiveDiscountPct.toFixed(1)}%${discounts.appliedCap?' (CAP)':''}</div>`:''; let shippingHint=''; if(shippingTier==='FREE'){ shippingHint='<div class="order-shipping-hint success">🚀 ¡Envío gratis alcanzado!</div>'; } else if(prog.nextTier){ shippingHint=`<div class="order-shipping-hint">Te faltan <strong>$${prog.missing}</strong> para ${prog.nextTier.tier==='FREE'?'envío gratis':'bajar envío a $'+prog.nextTier.shippingCost}.</div>`; } const currentCoupon=this.cartSnapshot.appliedCoupon; const couponInput = `<div class="order-coupon"><label>Cupón:</label><div class="coupon-input-wrapper">${currentCoupon?`<input type=\"text\" value=\"${currentCoupon.code}\" disabled /><button class=\"clear-coupon-btn\">Quitar</button>`:`<input type=\"text\" class=\"coupon-code-input\" placeholder=\"Ingresa cupón\" /><button class=\"apply-coupon-btn\">Aplicar</button>`}</div><div class="coupon-feedback" aria-live="polite"></div></div>`; const itemsHTML=this.cartSnapshot.items.map(i=>{ const rawId=String(i.id); let highlightClass=''; if(this.highlight.itemId && rawId===this.highlight.itemId && !this.highlight.seenCheckout){ highlightClass = this.highlight.type==='increment' ? ' increment-item-flash' : ' new-item-flash'; } return `<div class=\"order-item${highlightClass}\" data-item-id=\"${rawId.replace(/\"/g,'&quot;')}\"><span class=\"item-name\">${i.name} ${i.quantity>1?`(x${i.quantity})`:''}</span><span class=\"item-price\">$${i.price*i.quantity}</span></div>`; }).join(''); return `<div class="checkout-header"><h2>💳 Finalizar Compra</h2><button onclick="paymentGateway.closeCheckout()" class="close-checkout">×</button></div><div class="checkout-body"><div class="checkout-sections"><div class="checkout-section order-summary"><h3>📦 Resumen del Pedido</h3><div class="order-items">${itemsHTML}</div><div class="order-totals">${couponInput}<div class="order-subtotal"><span>Subtotal:</span><span>$${this.cartSnapshot.subtotal}</span></div>${discounts.total>0?`<div class=\"order-discount\"><span>🎮 Descuentos:</span><span>-$${discounts.total}</span></div>`:''}${discounts.patron>0?`<div class=\"order-discount-detail\"><span>• Patron:</span><span>-$${discounts.patron}${discounts.appliedCap?'*':''}</span></div>`:''}${discounts.coupon>0?`<div class=\"order-discount-detail\"><span>• Cupón:</span><span>-$${discounts.coupon}${discounts.appliedCap?'*':''}</span></div>`:''}${discounts.appliedCap?`<div class=\"order-cap-note\">* CAP 25% aplicado</div>`:''}${discountPctLabel}${this.cartSnapshot.tax>0?`<div class=\"order-tax\"><span>Impuestos (10%):</span><span>$${this.cartSnapshot.tax}</span></div>`:''}${this.cartSnapshot.shipping>0?`<div class=\"order-shipping\"><span>Envío${shippingTier?` (${shippingTier})`:''}:</span><span>$${this.cartSnapshot.shipping}</span></div>`:''}${this.cartSnapshot.shipping===0 && shippingTier==='FREE'?`<div class=\"order-shipping\"><span>Envío:</span><span>Gratis ✅</span></div>`:''}${shippingHint}<div class="order-total final"><span><strong>Total a Pagar:</strong></span><span><strong>$${this.cartSnapshot.total}</strong></span></div></div></div><div class="checkout-section customer-info"><h3>📝 Información de Contacto</h3><form id="checkout-form"><div class="form-row"><div class="form-group"><label for="firstName">Nombre *</label><input type="text" id="firstName" required></div><div class="form-group"><label for="lastName">Apellido *</label><input type="text" id="lastName" required></div></div><div class="form-group"><label for="email">Email *</label><input type="email" id="email" required></div><div class="form-group"><label for="phone">Teléfono</label><input type="tel" id="phone"></div>${this.hasPhysicalProducts()?`<h4>📍 Dirección de Envío</h4><div class=\"form-group\"><label for=\"address\">Dirección *</label><input type=\"text\" id=\"address\" required></div><div class=\"form-row\"><div class=\"form-group\"><label for=\"city\">Ciudad *</label><input type=\"text\" id=\"city\" required></div><div class=\"form-group\"><label for=\"zipCode\">Código Postal *</label><input type=\"text\" id=\"zipCode\" required></div></div><div class=\"form-group\"><label for=\"country\">País *</label><select id=\"country\" required><option value=\"\">Seleccionar país...</option><option value=\"ES\">España</option><option value=\"CO\">Colombia</option><option value=\"MX\">México</option><option value=\"US\">Estados Unidos</option><option value=\"AR\">Argentina</option></select></div>`:''}</form></div><div class="checkout-section payment-method"><h3>💳 Método de Pago</h3><div class="payment-options"><div class="payment-option"><input type="radio" id="stripe-card" name="payment-method" value="stripe" checked><label for="stripe-card"><span class="payment-icon">💳</span>Tarjeta de Crédito/Débito<small>Procesado por Stripe</small></label></div><div class="payment-option disabled"><input type="radio" id="paypal" value="paypal" disabled><label for="paypal"><span class="payment-icon">🅿️</span>PayPal<small>Próximamente</small></label></div></div><div id="stripe-card-element" class="stripe-element"></div><div id="stripe-card-errors" role="alert" class="stripe-errors"></div></div></div><div class="checkout-footer"><div class="security-badges"><div class="security-badge">🔒 SSL Seguro</div><div class="security-badge">✅ Stripe Verified</div><div class="security-badge">🛡️ Datos Protegidos</div></div><button id="submit-payment" class="btn-primary payment-submit-btn" disabled>💳 Completar información</button></div></div>`; }
    hasPhysicalProducts(){ return this.cartSnapshot.items.some(i=> i.type==='product' || i.type==='custom_artwork'); }
    setupCheckoutValidation(){ const form=document.getElementById('checkout-form'); const btn=document.getElementById('submit-payment'); if(!form||!btn) return; this.setupStripeElements(); const req=form.querySelectorAll('input[required], select[required]'); const validate=()=>{ let ok=true; req.forEach(f=>{ if(!f.value.trim()) ok=false; }); if(ok && this.stripeCardValid){ btn.disabled=false; btn.textContent=`💳 Pagar $${this.cartSnapshot.total}`; } else { btn.disabled=true; btn.textContent='💳 Completar información'; } }; req.forEach(f=>{ f.addEventListener('input',validate); f.addEventListener('change',validate); }); btn.addEventListener('click', e=>{ e.preventDefault(); this.processPayment(); }); }
    setupStripeElements(){ if(!this.stripe){ console.warn('Stripe no disponible'); return; } const elements=this.stripe.elements(); this.cardElement=elements.create('card',{ style:{ base:{ fontSize:'16px', color:'#333', fontFamily:'-apple-system, BlinkMacSystemFont, sans-serif', '::placeholder':{color:'#999'}}, invalid:{ color:'#e74c3c'} } }); const c=document.getElementById('stripe-card-element'); if(c) this.cardElement.mount('#stripe-card-element'); this.stripeCardValid=false; this.cardElement.on('change',({error})=>{ const err=document.getElementById('stripe-card-errors'); if(error){ err.textContent=error.message; this.stripeCardValid=false; } else { err.textContent=''; this.stripeCardValid=true; } const form=document.getElementById('checkout-form'); if(form) form.dispatchEvent(new Event('input')); }); }
  async processPayment(){ const btn=document.getElementById('submit-payment'); const form=document.getElementById('checkout-form'); if(!form||!btn) return; btn.disabled=true; btn.innerHTML='🔄 Procesando pago...'; try { const fd=new FormData(form); const data=Object.fromEntries(fd); const items=this.cartSnapshot.items.map(i=>({ id:i.id, quantity:i.quantity })); const couponCode = this.cartSnapshot.appliedCoupon?.code || null; 
      // Extraer puntos actuales del jugador (gamificación cliente). Esto es declarativo; el servidor aplicará mapping propio.
      const patronPoints = (window.artPatronSystem?.playerData?.totalPoints) || 0;
      const resp=await fetch('/api/payments/create-intent',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items, customer:{ email: data.email }, couponCode, patronPoints }) }); if(!resp.ok){ const j=await resp.json().catch(()=>({error:'Error'})); throw new Error(j.error || 'No se pudo crear intento de pago'); } const { clientSecret, orderId } = await resp.json(); btn.innerHTML='🔐 Confirmando tarjeta...'; if(!this.stripe || !this.cardElement) throw new Error('Stripe no inicializado'); const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret,{ payment_method:{ card:this.cardElement, billing_details:{ name:`${data.firstName||''} ${data.lastName||''}`.trim(), email:data.email||undefined } } }); if(error) throw new Error(error.message || 'Fallo al confirmar pago'); if(paymentIntent.status==='succeeded'){ this.handlePaymentSuccess({ success:true, paymentId: paymentIntent.id, orderId, amount:(paymentIntent.amount/100).toFixed(2), transactionId: paymentIntent.id }); } else if(['processing','requires_action'].includes(paymentIntent.status)) { btn.innerHTML='⚙️ Verificando autenticación...'; } else { throw new Error('Estado inesperado: '+paymentIntent.status); } } catch(e){ console.error('Error procesando pago real:', e); this.handlePaymentError(e.message || 'Error inesperado procesando el pago'); } }
    handlePaymentSuccess(r){ if(global.artPatronSystem){ const pts=Math.floor(this.cartSnapshot.total/10); global.artPatronSystem.addPoints('purchase', pts); } this.showPaymentSuccess(r); this.clearCart(); setTimeout(()=> this.closeCheckout(), 5000); }
    handlePaymentError(msg){ const btn=document.getElementById('submit-payment'); alert(`❌ Error en el pago: ${msg}`); if(btn){ btn.disabled=false; btn.innerHTML=`💳 Pagar $${this.cartSnapshot.total}`; } }
    showPaymentSuccess(r){ const c=document.querySelector('.checkout-content'); if(!c) return; c.innerHTML=`<div class="payment-success"><div class="success-animation">✅</div><h2>🎉 ¡Pago Exitoso!</h2><p>Gracias por tu compra. Tu pedido ha sido procesado correctamente.</p><div class="payment-details"><h3>Detalles de la transacción:</h3><div class="detail-row"><span>ID de Pago:</span><span>${r.paymentId}</span></div><div class="detail-row"><span>Monto:</span><span>$${r.amount}</span></div><div class="detail-row"><span>Estado:</span><span class="status-paid">Pagado</span></div></div><div class="next-steps-payment"><h3>📧 Próximos pasos:</h3><ul><li>Recibirás un email de confirmación</li><li>Santiago se contactará contigo en 24-48 horas</li><li>Para encargos: coordinaremos fotos de referencia</li><li>Te mantendremos informado del progreso</li></ul></div><div class="success-actions"><button onclick="paymentGateway.closeCheckout()"" class="btn-primary">✨ Continuar</button></div></div>`; }
    showCartNotification(msg){ let n=document.getElementById('cart-notification'); if(!n){ n=document.createElement('div'); n.id='cart-notification'; n.className='cart-notification'; document.body.appendChild(n);} n.textContent=msg; n.classList.add('show'); setTimeout(()=> n.classList.remove('show'),3000); }
    updateFloatingWidget(){ const w=document.getElementById('floating-cart-widget'); if(!w) return; const c=document.getElementById('fcw-count'); const t=document.getElementById('fcw-total'); const count=this.cartSnapshot.items.reduce((s,i)=>s+i.quantity,0); if(c) c.textContent=count; if(t) t.textContent=`$${this.cartSnapshot.total}`; w.style.display=count>0?'flex':'none'; }
    setupEventListeners(){
      // Eventos añadir al carrito y UI básica
    document.addEventListener('click', e=>{ if(e.target.matches('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn')){ const btn=e.target.matches('.add-to-cart-btn')? e.target : e.target.closest('.add-to-cart-btn'); const data=JSON.parse(btn.dataset.item || '{}');
      // Animación botón
      btn.classList.remove('adding'); void btn.offsetWidth; btn.classList.add('adding');
      this.addToCart(data);
      this.bumpCounters();
      const w=document.getElementById('floating-cart-widget'); if(w){ w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse'); } } });
      document.addEventListener('click', e=>{ const s=document.getElementById('cart-sidebar'); const b=document.querySelector('.cart-button'); if(s && s.classList.contains('open') && !s.contains(e.target) && !b?.contains(e.target)){ this.closeCart(); } });
      document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ this.closeCart(); this.closeCheckout(); } });
      const w=document.getElementById('floating-cart-widget'); if(w){ const open=()=> this.openCart(); w.addEventListener('click', open); w.addEventListener('keypress', ev=>{ if(['Enter',' '].includes(ev.key)){ ev.preventDefault(); open(); } }); }
      // Delegación cupones (sidebar + checkout)
      document.addEventListener('click', e=>{
        if(e.target.matches('.apply-coupon-btn')){
          const root = e.target.closest('.cart-coupon, .order-coupon');
          if(!root) return;
          const input = root.querySelector('.coupon-code-input');
          const feedback = root.querySelector('.coupon-feedback');
          const code = input?.value.trim();
          if(!code){ if(feedback) feedback.textContent='Ingresa un código'; return; }
          const points = (window.artPatronSystem?.playerData?.totalPoints) || 0;
          const res = window.CouponSystem?.apply(code, points);
          if(!res || !res.ok){ if(feedback) feedback.textContent = res?.reason || 'Cupón inválido'; return; }
          if(res.coupon){ window.CartModule.applyCoupon(res.coupon.code, res.coupon.percent); if(feedback) feedback.textContent = `Aplicado: ${res.coupon.code} (${res.coupon.percent}%)`; }
        }
        if(e.target.matches('.clear-coupon-btn')){
          window.CouponSystem?.clear();
          window.CartModule?.clearCoupon();
        }
      });
    }
  }
  let paymentGateway; document.addEventListener('DOMContentLoaded', ()=>{ 
    paymentGateway=new PaymentGateway(); 
    // Exponer globalmente para handlers inline (ej: botón "Carrito" en el navbar)
    window.paymentGateway = paymentGateway; 
    console.log('💳 Sistema de pagos inicializado (CartModule)'); 
  });
  global.PaymentGatewayAPI={ addToCart:(i)=>paymentGateway?.addToCart(i), openCart:()=>paymentGateway?.openCart(), openCheckout:()=>paymentGateway?.openCheckout(), getCart:()=> paymentGateway?.cartSnapshot || { items:[], total:0 } };
})(window);
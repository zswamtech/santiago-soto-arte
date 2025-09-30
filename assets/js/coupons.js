// 🎟️ CouponSystem - Gestión de cupones desbloqueados por puntos
// Reglas iniciales (iterable). Más adelante se puede migrar a backend dinámico.
(function(global){
  const COUPON_RULES = [
    { code:'PATRON5', percent:5, minPoints:300 },
    { code:'PATRON8', percent:8, minPoints:600 },
    { code:'PATRON10', percent:10, minPoints:1000 },
    { code:'PATRON15', percent:15, minPoints:2000 }
  ];

  function normalize(code){ return String(code||'').trim().toUpperCase(); }

  class CouponSystem {
    constructor(){
      this.applied = null; // { code, percent }
      this.listeners = new Set();
      this.cachedPoints = 0;
      try { global.addEventListener('artpatron:points-updated', (e)=>{ this.cachedPoints = e.detail.totalPoints; }); } catch(_){}
    }

    getUnlocked(points){
      return COUPON_RULES.filter(r=> points >= r.minPoints).map(r=> ({ code:r.code, percent:r.percent }));
    }

    validate(code, points){
      const norm = normalize(code);
      const rule = COUPON_RULES.find(r=> r.code === norm);
      if(!rule) return { ok:false, reason:'Código inválido' };
      if(points < rule.minPoints) return { ok:false, reason:`Necesitas ${rule.minPoints - points} puntos más` };
      return { ok:true, coupon:{ code:rule.code, percent:rule.percent } };
    }

    apply(code, points){
      const res = this.validate(code, points);
      if(!res.ok) return res;
      // Evitar re-aplicar mismo
      if(this.applied && this.applied.code === res.coupon.code){
        return { ok:true, coupon:this.applied, reused:true };
      }
      this.applied = res.coupon;
      this.emit('coupon:applied', { coupon:this.applied });
      return { ok:true, coupon:this.applied };
    }

    clear(){
      if(this.applied){
        const old = this.applied; this.applied=null; this.emit('coupon:cleared',{ coupon:old });
      }
    }

    getApplied(){ return this.applied; }

    on(fn){ this.listeners.add(fn); return ()=> this.listeners.delete(fn); }
    emit(type, detail){
      this.listeners.forEach(l=> { try { l({ type, detail }); } catch(_){ } });
      try { global.dispatchEvent(new CustomEvent(type,{ detail })); } catch(_){ }
    }
  }

  global.CouponSystem = new CouponSystem();
})(window);

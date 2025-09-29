// ==========================================
// SECCIÓN SOBRE MÍ - JAVASCRIPT
// ==========================================

// Crear partículas de pintura
function createPaintParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32'];
    
    // Limpiar partículas existentes
    container.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        container.appendChild(particle);
    }
}

// Calcular años y meses automáticamente
function updateArtisticCounters() {
    // Fecha de inicio de clases profesionales: Enero 2021 (4 años de clases)
    const startDrawing = new Date('2021-01-01');
    // Fecha de inicio con óleo: Diciembre 2023 (1 año)
    const startOil = new Date('2023-12-01');
    const now = new Date();
    
    // Calcular años de experiencia en dibujo
    const yearsExp = now.getFullYear() - startDrawing.getFullYear();
    let adjustedYears = yearsExp;
    
    // Ajustar si aún no ha pasado el mes/día de aniversario este año
    if (now.getMonth() < startDrawing.getMonth() || 
        (now.getMonth() === startDrawing.getMonth() && now.getDate() < startDrawing.getDate())) {
        adjustedYears--;
    }
    
    // Calcular meses con óleo
    let monthsOil = (now.getFullYear() - startOil.getFullYear()) * 12;
    monthsOil += now.getMonth() - startOil.getMonth();
    
    // Si no ha pasado el día del mes, restar uno
    if (now.getDate() < startOil.getDate()) {
        monthsOil--;
    }
    
    // Animar los contadores
    animateCounter('years-counter', adjustedYears);
    animateCounter('months-counter', monthsOil);
    
    console.log(`📊 Contadores actualizados: ${adjustedYears} años, ${monthsOil} meses con óleo`);
}

// Función para animar los contadores
function animateCounter(id, target) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// Efecto parallax suave en scroll
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index % 3) * 0.2;
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Observador para animar elementos cuando entran en el viewport
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar elementos animables
    const animatableElements = document.querySelectorAll('.timeline-item, .stat-card');
    animatableElements.forEach(el => observer.observe(el));
}

// Inicializar todo cuando el DOM esté listo
function initArtisticAbout() {
    console.log('🎨 Inicializando sección artística "Sobre Mí"...');
    
    // Crear partículas
    createPaintParticles();
    
    // Actualizar contadores
    updateArtisticCounters();
    
    // Iniciar efectos parallax
    initParallaxEffect();
    
    // Iniciar animaciones de scroll
    initScrollAnimations();
    
    // Actualizar contadores cada día (86400000 ms = 24 horas)
    setInterval(updateArtisticCounters, 86400000);
    
    console.log('✅ Sección artística inicializada correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArtisticAbout);
} else {
    initArtisticAbout();
}

// Exportar funciones para uso externo si es necesario
window.artisticAbout = {
    updateCounters: updateArtisticCounters,
    createParticles: createPaintParticles
};
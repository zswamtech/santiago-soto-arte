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
    // Fecha de inicio dibujando: 2016 (5 años de edad)
    const startDrawing = new Date('2016-01-01');
    // Fecha de inicio clases profesionales: 2021
    const startProfessional = new Date('2021-01-01');
    // Fecha de inicio con óleo: Octubre 2024
    const startOil = new Date('2024-10-01');
    const now = new Date();

    // Calcular años dibujando (desde 2016)
    let yearsDrawing = now.getFullYear() - startDrawing.getFullYear();
    if (now.getMonth() < startDrawing.getMonth()) {
        yearsDrawing--;
    }

    // Calcular años de formación profesional (desde 2021)
    let yearsProfessional = now.getFullYear() - startProfessional.getFullYear();
    if (now.getMonth() < startProfessional.getMonth()) {
        yearsProfessional--;
    }

    // Calcular meses con óleo (desde octubre 2024)
    let monthsOil = (now.getFullYear() - startOil.getFullYear()) * 12;
    monthsOil += now.getMonth() - startOil.getMonth();

    // Si no ha pasado el día del mes, restar uno
    if (now.getDate() < startOil.getDate()) {
        monthsOil--;
    }

    // Mínimo 1 mes para óleo (acabamos de empezar)
    monthsOil = Math.max(monthsOil, 1);

    // Animar los contadores
    animateCounter('years-counter', yearsDrawing);
    animateCounter('professional-years', yearsProfessional);
    animateCounter('months-counter', monthsOil);

    console.log(`📊 Contadores actualizados: ${yearsDrawing} años dibujando, ${yearsProfessional} años profesional, ${monthsOil} meses con óleo`);
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

// Función para mostrar galería de un período específico
function showTimelineGallery(period) {
    console.log(`🖼️ Mostrando galería del período: ${period}`);

    // Por ahora, abrir la sección de galería
    // En el futuro, esto podría filtrar obras por período
    const gallerySection = document.getElementById('galeria');
    if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth' });

        // Si existe el botón de galería real, activarlo
        setTimeout(() => {
            const realGalleryTab = document.querySelector('.gallery-tab[onclick*="real"]');
            if (realGalleryTab) {
                realGalleryTab.click();
            }
        }, 500);
    }
}

// Exportar funciones para uso global
window.showTimelineGallery = showTimelineGallery;

// Exportar funciones para uso externo si es necesario
window.artisticAbout = {
    updateCounters: updateArtisticCounters,
    createParticles: createPaintParticles,
    showTimelineGallery: showTimelineGallery
};
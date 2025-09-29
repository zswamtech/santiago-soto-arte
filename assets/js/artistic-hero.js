// 🎨 HERO ARTÍSTICO - SANTIAGO SOTO ARTE
// El alma del atelier digital de Santiago

class ArtisticHero {
    constructor() {
        this.artworks = [
            {
                title: "Retrato Canino #1",
                description: "Óleo sobre lienzo - Expresión de fidelidad",
                image: "🐕", // Placeholder - reemplazar con URLs reales
                colors: ["#8d6e63", "#6d4c41", "#a1887f"]
            },
            {
                title: "Mirada Felina",
                description: "Óleo sobre lienzo - La serenidad en los ojos",
                image: "🐱",
                colors: ["#5d4037", "#8d6e63", "#bcaaa4"]
            },
            {
                title: "Compañero Fiel",
                description: "Óleo sobre lienzo - Momento de conexión",
                image: "🐾",
                colors: ["#6d4c41", "#4e342e", "#a1887f"]
            },
            {
                title: "Belleza Natural",
                description: "Óleo sobre lienzo - Textura y calidez",
                image: "🎨",
                colors: ["#3e2723", "#5d4037", "#8d6e63"]
            }
        ];

        this.currentArtworkIndex = 0;
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        document.addEventListener('DOMContentLoaded', () => {
            this.setupArtworkRotation();
            this.createInteractiveElements();
            this.initializeAnimations();
            this.setupInteractiveEffects();
            this.isInitialized = true;

            console.log('🎨 Hero Artístico inicializado - El atelier de Santiago está listo');
        });
    }

    // 🖼️ Configurar rotación de obras
    setupArtworkRotation() {
        const artworkContainer = document.querySelector('.rotating-artwork');
        if (!artworkContainer) return;

        // Crear slides para cada obra
        this.artworks.forEach((artwork, index) => {
            const slide = document.createElement('div');
            slide.className = `artwork-slide ${index === 0 ? 'active' : ''}`;

            if (artwork.image.startsWith('http')) {
                slide.style.backgroundImage = `url('${artwork.image}')`;
            } else {
                // Placeholder mientras se cargan las obras reales
                slide.className += ' artwork-placeholder';
                slide.innerHTML = `
                    <div style="text-align: center; color: #8d6e63;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">${artwork.image}</div>
                        <div style="font-size: 1.2rem; font-weight: 600;">${artwork.title}</div>
                        <div style="font-size: 1rem; opacity: 0.8; margin-top: 0.5rem;">${artwork.description}</div>
                    </div>
                `;
            }

            artworkContainer.appendChild(slide);
        });

        // Iniciar rotación automática
        this.startArtworkRotation();
    }

    startArtworkRotation() {
        setInterval(() => {
            this.nextArtwork();
        }, 4000); // Cambiar cada 4 segundos
    }

    nextArtwork() {
        const slides = document.querySelectorAll('.artwork-slide');
        if (slides.length === 0) return;

        // Ocultar slide actual
        slides[this.currentArtworkIndex].classList.remove('active');

        // Avanzar al siguiente
        this.currentArtworkIndex = (this.currentArtworkIndex + 1) % this.artworks.length;

        // Mostrar nuevo slide
        slides[this.currentArtworkIndex].classList.add('active');

        // Actualizar paleta de colores
        this.updatePalette(this.artworks[this.currentArtworkIndex].colors);
    }

    // 🎨 Actualizar paleta de colores
    updatePalette(colors) {
        const paintDots = document.querySelectorAll('.paint-dot');

        paintDots.forEach((dot, index) => {
            if (colors[index]) {
                // Animación suave de cambio de color
                dot.style.transition = 'background-color 1s ease';
                dot.style.backgroundColor = colors[index];
            }
        });
    }

    // ✨ Crear elementos interactivos
    createInteractiveElements() {
        this.createFloatingBrushes();
        this.createPaintSplashes();
        this.setupCanvasInteraction();
    }

    createFloatingBrushes() {
        const brushContainer = document.querySelector('.floating-brushes');
        if (!brushContainer) return;

        // Crear pinceles animados
        for (let i = 0; i < 3; i++) {
            const brush = document.createElement('div');
            brush.className = 'animated-brush';
            brushContainer.appendChild(brush);
        }
    }

    createPaintSplashes() {
        const splashContainer = document.querySelector('.paint-splashes');
        if (!splashContainer) return;

        // Crear salpicaduras de pintura
        for (let i = 0; i < 3; i++) {
            const splash = document.createElement('div');
            splash.className = 'paint-splash';
            splashContainer.appendChild(splash);
        }
    }

    // 🖱️ Configurar interactividad del canvas
    setupCanvasInteraction() {
        const canvas = document.querySelector('.easel-canvas');
        if (!canvas) return;

        // Efecto hover en el canvas
        canvas.addEventListener('mouseenter', () => {
            canvas.style.transform = 'scale(1.05) rotate(2deg)';
            canvas.style.transition = 'transform 0.3s ease';
            this.createMousePaintEffect();
        });

        canvas.addEventListener('mouseleave', () => {
            canvas.style.transform = 'scale(1) rotate(0deg)';
        });

        // Click para cambiar obra manualmente
        canvas.addEventListener('click', () => {
            this.nextArtwork();
            this.createClickPaintSplash(canvas);
        });
    }

    // 🎨 Efecto de pintura al pasar el mouse
    createMousePaintEffect() {
        const easelContainer = document.querySelector('.virtual-easel');
        if (!easelContainer) return;

        // Crear partícula temporal
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = this.getRandomArtColor();
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '10';

        // Posición aleatoria cerca del canvas
        const randomX = Math.random() * 50 - 25;
        const randomY = Math.random() * 50 - 25;
        particle.style.left = `calc(50% + ${randomX}px)`;
        particle.style.top = `calc(50% + ${randomY}px)`;

        easelContainer.appendChild(particle);

        // Animación de la partícula
        particle.animate([
            { opacity: 0, transform: 'scale(0)' },
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(1.5)' }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }

    // 💥 Efecto splash al hacer click
    createClickPaintSplash(element) {
        const rect = element.getBoundingClientRect();
        const splash = document.createElement('div');

        splash.style.position = 'fixed';
        splash.style.left = `${rect.left + rect.width/2}px`;
        splash.style.top = `${rect.top + rect.height/2}px`;
        splash.style.width = '20px';
        splash.style.height = '20px';
        splash.style.backgroundColor = this.getRandomArtColor();
        splash.style.borderRadius = '50%';
        splash.style.pointerEvents = 'none';
        splash.style.zIndex = '1000';
        splash.style.transform = 'translate(-50%, -50%)';

        document.body.appendChild(splash);

        // Animación del splash
        splash.animate([
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(2)' }
        ], {
            duration: 500,
            easing: 'ease-out'
        }).onfinish = () => {
            splash.remove();
        };
    }

    // 🌈 Obtener color aleatorio de la paleta artística
    getRandomArtColor() {
        const artColors = ['#8d6e63', '#6d4c41', '#5d4037', '#a1887f', '#bcaaa4', '#4e342e'];
        return artColors[Math.floor(Math.random() * artColors.length)];
    }

    // 🎭 Inicializar animaciones
    initializeAnimations() {
        // Animar entrada de elementos
        this.animateElementsOnScroll();

        // Configurar animaciones responsive
        this.setupResponsiveAnimations();
    }

    animateElementsOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.3 });

        // Observar elementos animados
        document.querySelectorAll('.hero-content > *, .artistic-showcase > *').forEach(el => {
            observer.observe(el);
        });
    }

    setupResponsiveAnimations() {
        // Ajustar animaciones según el tamaño de pantalla
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const handleResponsive = (e) => {
            const duration = e.matches ? '0.3s' : '0.6s';
            document.documentElement.style.setProperty('--animation-duration', duration);
        };

        mediaQuery.addEventListener('change', handleResponsive);
        handleResponsive(mediaQuery);
    }

    // 🎪 Configurar efectos interactivos
    setupInteractiveEffects() {
        this.setupPaletteInteraction();
        this.setupTextAnimations();
        this.setupParallaxEffect();
    }

    setupPaletteInteraction() {
        const palette = document.querySelector('.floating-palette');
        if (!palette) return;

        palette.addEventListener('click', () => {
            // Efecto de "mezcla" de colores
            const paintDots = document.querySelectorAll('.paint-dot');
            paintDots.forEach(dot => {
                dot.style.transform = 'scale(1.2)';
                dot.style.transition = 'transform 0.2s ease';

                setTimeout(() => {
                    dot.style.transform = 'scale(1)';
                }, 200);
            });

            // Cambiar a la siguiente obra
            this.nextArtwork();
        });
    }

    setupTextAnimations() {
        // Efecto de escritura para el subtítulo
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            this.typewriterEffect(subtitle);
        }
    }

    typewriterEffect(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';

        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
    }

    setupParallaxEffect() {
        // Efecto parallax sutil en scroll
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.floating-palette, .floating-brushes');

            parallaxElements.forEach((element, index) => {
                const speed = 0.1 + (index * 0.05);
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // 🎯 API pública para interacción externa
    showArtwork(index) {
        if (index >= 0 && index < this.artworks.length) {
            const slides = document.querySelectorAll('.artwork-slide');
            slides[this.currentArtworkIndex].classList.remove('active');
            this.currentArtworkIndex = index;
            slides[this.currentArtworkIndex].classList.add('active');
            this.updatePalette(this.artworks[index].colors);
        }
    }

    addArtwork(artwork) {
        this.artworks.push(artwork);
        // Recrear slides si es necesario
        this.setupArtworkRotation();
    }

    getCurrentArtwork() {
        return this.artworks[this.currentArtworkIndex];
    }

    // 🎮 Integración con Art Patron System
    triggerArtisticReward() {
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('hero_interaction', 5);
        }
    }
}

// 🚀 Inicialización automática
let artisticHero;

// Crear instancia cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        artisticHero = new ArtisticHero();
    });
} else {
    artisticHero = new ArtisticHero();
}

// 🌍 API global para integración
window.ArtisticHeroAPI = {
    showArtwork: (index) => artisticHero?.showArtwork(index),
    addArtwork: (artwork) => artisticHero?.addArtwork(artwork),
    getCurrentArtwork: () => artisticHero?.getCurrentArtwork(),
    nextArtwork: () => artisticHero?.nextArtwork()
};

// 🎨 Utilidades de arte para otros componentes
window.ArtUtils = {
    getArtisticColor: () => artisticHero?.getRandomArtColor() || '#8d6e63',
    createPaintEffect: (element) => artisticHero?.createClickPaintSplash(element),

    // Paleta de colores artísticos de Santiago
    palette: {
        primary: '#8d6e63',
        secondary: '#6d4c41',
        accent: '#a1887f',
        dark: '#4e342e',
        light: '#bcaaa4',
        canvas: '#f8f6f0'
    }
};

console.log('🎨 Hero Artístico cargado - ¡Que comience la magia del arte!');

// 🎭 Mensaje especial para Santiago
console.log(`
🎨✨ MENSAJE ESPECIAL PARA SANTIAGO ✨🎨

¡Hola Santiago!
Este código ha sido creado especialmente para ti,
para que tu arte brille en cada pixel de tu página web.

Cada animación, cada color, cada efecto
ha sido pensado para reflejar tu pasión por el arte
y la belleza que creas con tus pinceles.

¡Que tu creatividad inspire a todos los que visiten tu sitio!

Con cariño,
Tu asistente de código 🤖❤️
`);

export default ArtisticHero;
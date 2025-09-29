// ✏️ HERO ESTILO LÁPIZ - SANTIAGO SOTO ARTE
// Cuaderno de bocetos juvenil y creativo

class PencilHero {
    constructor() {
        this.sketches = [
            {
                title: "Mi Perrito Favorito",
                description: "Boceto a lápiz - Práctica diaria",
                emoji: "🐕",
                style: "sketch"
            },
            {
                title: "Gatito Curioso",
                description: "Estudio de expresiones felinas",
                emoji: "🐱",
                style: "drawing"
            },
            {
                title: "Mascota Juguetona",
                description: "Capturando movimiento y alegría",
                emoji: "🐾",
                style: "portrait"
            },
            {
                title: "Compañero Fiel",
                description: "Retrato expresivo en carboncillo",
                emoji: "🎨",
                style: "realistic"
            },
            {
                title: "Amigo Peludo",
                description: "Técnica mixta - lápiz y difumino",
                emoji: "🖊️",
                style: "mixed"
            }
        ];

        this.currentSketchIndex = 0;
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        document.addEventListener('DOMContentLoaded', () => {
            this.setupSketchRotation();
            this.createPencils();
            this.setupInteractivity();
            this.initNotebookEffects();
            this.isInitialized = true;

            console.log('✏️ Cuaderno de bocetos listo - Santiago puede empezar a dibujar!');
        });
    }

    // 📝 Configurar rotación de bocetos
    setupSketchRotation() {
        const sketchContainer = document.querySelector('.rotating-sketches');
        if (!sketchContainer) return;

        // Crear slides para cada boceto
        this.sketches.forEach((sketch, index) => {
            const slide = document.createElement('div');
            slide.className = `sketch-slide ${index === 0 ? 'active' : ''}`;

            slide.innerHTML = `
                <div class="sketch-drawing" style="animation-delay: ${index * 0.5}s">
                    ${sketch.emoji}
                </div>
                <div class="sketch-title">${sketch.title}</div>
                <div class="sketch-description">${sketch.description}</div>
            `;

            sketchContainer.appendChild(slide);
        });

        // Iniciar rotación automática más lenta (juvenil y relajada)
        this.startSketchRotation();
    }

    startSketchRotation() {
        setInterval(() => {
            this.nextSketch();
        }, 5000); // Cada 5 segundos - más pausado y contemplativo
    }

    nextSketch() {
        const slides = document.querySelectorAll('.sketch-slide');
        if (slides.length === 0) return;

        // Ocultar slide actual con efecto suave
        slides[this.currentSketchIndex].classList.remove('active');

        // Avanzar al siguiente
        this.currentSketchIndex = (this.currentSketchIndex + 1) % this.sketches.length;

        // Mostrar nuevo slide
        slides[this.currentSketchIndex].classList.add('active');

        // Efecto visual de cambio de página
        this.createPageFlipEffect();
    }

    // 📄 Efecto de cambio de página
    createPageFlipEffect() {
        const notebook = document.querySelector('.notebook-page');
        if (!notebook) return;

        // Pequeña animación de "voltear página"
        notebook.style.transform = 'rotateY(5deg) scale(0.98)';
        notebook.style.transition = 'transform 0.3s ease';

        setTimeout(() => {
            notebook.style.transform = 'rotateY(0deg) scale(1)';
        }, 300);
    }

    // ✏️ Crear lápices flotantes
    createPencils() {
        const pencilContainer = document.querySelector('.floating-pencils');
        if (!pencilContainer) return;

        // Crear lápices animados más juveniles
        for (let i = 0; i < 3; i++) {
            const pencil = document.createElement('div');
            pencil.className = 'animated-pencil';
            pencil.style.setProperty('--rotation', `${25 + (i * 30)}deg`);
            pencilContainer.appendChild(pencil);
        }
    }

    // 🖱️ Configurar interactividad juvenil
    setupInteractivity() {
        const notebook = document.querySelector('.sketch-notebook');
        const tools = document.querySelectorAll('.sketch-tool');

        if (notebook) {
            // Hover suave en el cuaderno
            notebook.addEventListener('mouseenter', () => {
                this.createSparkles(notebook);
            });

            // Click para cambiar boceto manualmente
            notebook.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSketch();
                this.createClickEffect(e);

                // 🎮 Puntos por interacción
                if (typeof artPatronSystem !== 'undefined') {
                    artPatronSystem.addPoints('sketch_interaction', 3);
                }
            });
        }

        // Interactividad con herramientas
        tools.forEach(tool => {
            tool.addEventListener('click', () => {
                this.useSketchTool(tool);
            });
        });
    }

    // ✨ Crear efectos de brillos juveniles
    createSparkles(element) {
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.style.position = 'fixed';
                sparkle.style.left = `${rect.left + Math.random() * rect.width}px`;
                sparkle.style.top = `${rect.top + Math.random() * rect.height}px`;
                sparkle.style.width = '6px';
                sparkle.style.height = '6px';
                sparkle.style.background = `hsl(${Math.random() * 60 + 200}, 70%, 80%)`;
                sparkle.style.borderRadius = '50%';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '1000';
                sparkle.innerHTML = '✨';
                sparkle.style.fontSize = '12px';

                document.body.appendChild(sparkle);

                // Animación juvenil
                sparkle.animate([
                    {
                        opacity: 0,
                        transform: 'scale(0) rotate(0deg)'
                    },
                    {
                        opacity: 1,
                        transform: 'scale(1) rotate(180deg)'
                    },
                    {
                        opacity: 0,
                        transform: 'scale(0) rotate(360deg)'
                    }
                ], {
                    duration: 800 + Math.random() * 400,
                    easing: 'ease-out'
                }).onfinish = () => sparkle.remove();

            }, i * 100);
        }
    }

    // 🖱️ Efecto de click juvenil
    createClickEffect(event) {
        const colors = ['#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C', '#FFB6C1'];

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = `${event.clientX}px`;
                particle.style.top = `${event.clientY}px`;
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1001';

                document.body.appendChild(particle);

                const angle = (i / 8) * Math.PI * 2;
                const velocity = 50 + Math.random() * 30;
                const deltaX = Math.cos(angle) * velocity;
                const deltaY = Math.sin(angle) * velocity;

                particle.animate([
                    {
                        opacity: 1,
                        transform: 'translate(-50%, -50%) scale(1)'
                    },
                    {
                        opacity: 0,
                        transform: `translate(${deltaX - 50}%, ${deltaY - 50}%) scale(0)`
                    }
                ], {
                    duration: 600,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();

            }, i * 20);
        }
    }

    // 🛠️ Usar herramientas de boceto
    useSketchTool(tool) {
        const isEraser = tool.classList.contains('eraser');

        // Animación de uso
        tool.style.transform = 'scale(1.3) rotate(15deg)';
        tool.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            tool.style.transform = 'scale(1) rotate(0deg)';
        }, 150);

        if (isEraser) {
            this.createEraserEffect(tool);
        } else {
            this.createSharpenEffect(tool);
        }

        // Puntos por usar herramientas
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('tool_use', 2);
        }
    }

    // 🧽 Efecto de borrador
    createEraserEffect(tool) {
        const rect = tool.getBoundingClientRect();

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const eraseParticle = document.createElement('div');
                eraseParticle.style.position = 'fixed';
                eraseParticle.style.left = `${rect.left + rect.width/2}px`;
                eraseParticle.style.top = `${rect.top}px`;
                eraseParticle.style.width = '4px';
                eraseParticle.style.height = '4px';
                eraseParticle.style.background = '#f0f0f0';
                eraseParticle.style.borderRadius = '50%';
                eraseParticle.style.pointerEvents = 'none';
                eraseParticle.style.zIndex = '1000';

                document.body.appendChild(eraseParticle);

                eraseParticle.animate([
                    {
                        opacity: 0.8,
                        transform: 'translate(-50%, 0) scale(1)'
                    },
                    {
                        opacity: 0,
                        transform: `translate(-50%, -50px) scale(0.5)`
                    }
                ], {
                    duration: 500,
                    easing: 'ease-out'
                }).onfinish = () => eraseParticle.remove();

            }, i * 100);
        }
    }

    // 📐 Efecto de sacapuntas
    createSharpenEffect(tool) {
        const rect = tool.getBoundingClientRect();
        const sharpenColors = ['#DEB887', '#D2B48C', '#F4A460'];

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const shaving = document.createElement('div');
                shaving.style.position = 'fixed';
                shaving.style.left = `${rect.left + rect.width/2}px`;
                shaving.style.top = `${rect.top}px`;
                shaving.style.width = '3px';
                shaving.style.height = '8px';
                shaving.style.background = sharpenColors[Math.floor(Math.random() * sharpenColors.length)];
                shaving.style.borderRadius = '50% 50% 0 0';
                shaving.style.pointerEvents = 'none';
                shaving.style.zIndex = '1000';

                document.body.appendChild(shaving);

                const direction = (Math.random() - 0.5) * 60;

                shaving.animate([
                    {
                        opacity: 1,
                        transform: `translate(-50%, 0) rotate(${Math.random() * 360}deg)`
                    },
                    {
                        opacity: 0,
                        transform: `translate(${direction}%, -40px) rotate(${Math.random() * 360 + 180}deg)`
                    }
                ], {
                    duration: 800,
                    easing: 'ease-out'
                }).onfinish = () => shaving.remove();

            }, i * 80);
        }
    }

    // 📖 Efectos del cuaderno
    initNotebookEffects() {
        const notebook = document.querySelector('.notebook-page');
        if (!notebook) return;

        // Efecto de respiración sutil
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% probabilidad
                notebook.style.transform = 'scale(1.005)';
                notebook.style.transition = 'transform 0.8s ease';

                setTimeout(() => {
                    notebook.style.transform = 'scale(1)';
                }, 800);
            }
        }, 3000);
    }

    // 🎯 API pública
    getCurrentSketch() {
        return this.sketches[this.currentSketchIndex];
    }

    addSketch(sketch) {
        this.sketches.push(sketch);
        this.setupSketchRotation();
    }

    showSketch(index) {
        if (index >= 0 && index < this.sketches.length) {
            const slides = document.querySelectorAll('.sketch-slide');
            slides[this.currentSketchIndex].classList.remove('active');
            this.currentSketchIndex = index;
            slides[this.currentSketchIndex].classList.add('active');
            this.createPageFlipEffect();
        }
    }
}

// 🚀 Inicialización automática
let pencilHero;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pencilHero = new PencilHero();
    });
} else {
    pencilHero = new PencilHero();
}

// 🌍 API global para integración
window.PencilHeroAPI = {
    nextSketch: () => pencilHero?.nextSketch(),
    showSketch: (index) => pencilHero?.showSketch(index),
    getCurrentSketch: () => pencilHero?.getCurrentSketch(),
    addSketch: (sketch) => pencilHero?.addSketch(sketch)
};

// ✏️ Utilidades para otros componentes
window.SketchUtils = {
    createSparkles: (element) => pencilHero?.createSparkles(element),
    createClickEffect: (event) => pencilHero?.createClickEffect(event),

    // Paleta de colores juveniles
    colors: {
        pencil: '#8a8a8a',
        paper: '#fefefe',
        highlight: '#87CEEB',
        accent: '#98FB98',
        soft: '#DDA0DD'
    }
};

console.log('✏️ Cuaderno de bocetos cargado - ¡Arte juvenil en acción!');

// 🎨 Mensaje especial para Santiago (juvenil)
console.log(`
✏️📝 ¡HOLA SANTIAGO! 📝✏️

Este cuaderno digital ha sido creado especialmente para ti,
con colores suaves como el lápiz que tanto usas.

Cada boceto representa tu creatividad,
cada animación celebra tu juventud artística,
cada efecto refleja la magia de tus 14 años.

¡Que este cuaderno inspire tus próximas obras!

Con cariño juvenil,
Tu equipo creativo 🎨💙
`);

export default PencilHero;
// ✏️ SISTEMA DE TRAZOS DE LÁPIZ REALISTAS CON CANVAS
// Efectos artísticos de grafito para Santiago Soto Arte

class PencilStrokesEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.strokes = [];
        this.particlesContainer = document.querySelector('.graphite-particles');

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createGraphiteParticles();
        this.startDrawingAnimation();

        // Redimensionar canvas cuando cambie el tamaño de ventana
        window.addEventListener('resize', () => this.setupCanvas());

        console.log('✏️ Motor de trazos de lápiz iniciado');
    }

    setupCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }

    // 🎨 Crear partículas de polvo de grafito flotantes
    createGraphiteParticles() {
        if (!this.particlesContainer) return;

        const particleCount = 30; // Cantidad de partículas

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'graphite-particle';

            // Posición aleatoria
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;

            // Duración aleatoria (6-12s)
            const duration = 6 + Math.random() * 6;
            particle.style.setProperty('--duration', `${duration}s`);

            // Opacidad aleatoria
            const opacity = 0.3 + Math.random() * 0.4;
            particle.style.setProperty('--opacity', opacity);

            // Deriva horizontal aleatoria
            const drift = -30 + Math.random() * 60;
            particle.style.setProperty('--drift', `${drift}px`);

            // Delay aleatorio para que no todas empiecen juntas
            particle.style.animationDelay = `${Math.random() * 5}s`;

            // Tamaño aleatorio (2-5px)
            const size = 2 + Math.random() * 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            this.particlesContainer.appendChild(particle);
        }
    }

    // ✏️ Iniciar animación de dibujo continuo
    startDrawingAnimation() {
        this.drawRandomStrokes();
        this.drawShadingPatterns();

        // Dibujar nuevos trazos cada 3-5 segundos
        setInterval(() => {
            this.drawRandomStrokes();
        }, 3000 + Math.random() * 2000);

        // Dibujar sombreado artístico cada 5-8 segundos
        setInterval(() => {
            this.drawShadingPatterns();
        }, 5000 + Math.random() * 3000);
    }

    // 🎨 Dibujar patrones de sombreado artístico
    drawShadingPatterns() {
        const patternType = Math.random();

        if (patternType < 0.4) {
            this.drawCrossHatching();
        } else if (patternType < 0.7) {
            this.drawBlendedShading();
        } else {
            this.drawCircularShading();
        }
    }

    // 🎨 Dibujar trazos aleatorios de lápiz
    drawRandomStrokes() {
        const strokeCount = 2 + Math.floor(Math.random() * 3); // 2-4 trazos

        for (let i = 0; i < strokeCount; i++) {
            setTimeout(() => {
                this.drawPencilStroke();
            }, i * 500);
        }
    }

    // ✏️ Dibujar un trazo de lápiz individual con textura
    drawPencilStroke() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Posición aleatoria
        const startX = Math.random() * w;
        const startY = Math.random() * h;

        // Dirección y longitud del trazo
        const angle = Math.random() * Math.PI * 2;
        const length = 40 + Math.random() * 100;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Configurar estilo de lápiz
        this.ctx.strokeStyle = this.getGraphiteColor();
        this.ctx.lineWidth = 1 + Math.random() * 2;
        this.ctx.lineCap = 'round';
        this.ctx.globalAlpha = 0.15 + Math.random() * 0.15;

        // Aplicar textura de lápiz (línea irregular)
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = 'rgba(180, 180, 190, 0.3)';

        // Dibujar con curva suave
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);

        // Crear curva Bezier para trazo más natural
        const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 30;
        const cpY = (startY + endY) / 2 + (Math.random() - 0.5) * 30;
        this.ctx.quadraticCurveTo(cpX, cpY, endX, endY);

        this.ctx.stroke();

        // Añadir textura granulada de grafito
        this.addGraphiteTexture(startX, startY, endX, endY);

        // Limpiar el trazo después de 4-6 segundos (fade out)
        setTimeout(() => {
            this.fadeOutStroke();
        }, 4000 + Math.random() * 2000);
    }

    // 🎨 Añadir textura granulada de grafito
    addGraphiteTexture(x1, y1, x2, y2) {
        const particleCount = 8 + Math.floor(Math.random() * 12);

        for (let i = 0; i < particleCount; i++) {
            const t = Math.random(); // Posición a lo largo de la línea
            const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 5;
            const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 5;

            this.ctx.fillStyle = this.getGraphiteColor();
            this.ctx.globalAlpha = 0.08 + Math.random() * 0.12;

            const size = 0.5 + Math.random() * 1.5;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    // 🎨 Obtener color de grafito aleatorio
    getGraphiteColor() {
        const graphiteColors = [
            'rgba(192, 192, 192, 0.6)', // Plateado claro
            'rgba(180, 180, 190, 0.65)', // Gris azulado
            'rgba(176, 176, 176, 0.6)', // Gris medio
            'rgba(200, 200, 200, 0.55)', // Plateado brillante
            'rgba(168, 168, 168, 0.7)'  // Gris oscuro
        ];
        return graphiteColors[Math.floor(Math.random() * graphiteColors.length)];
    }

    // ✏️ TÉCNICA: Cross-Hatching (sombreado cruzado)
    drawCrossHatching() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Posición y tamaño del área de sombreado
        const x = Math.random() * (w - 100);
        const y = Math.random() * (h - 100);
        const size = 60 + Math.random() * 80;

        this.ctx.save();
        this.ctx.strokeStyle = this.getGraphiteColor();
        this.ctx.lineWidth = 0.5 + Math.random() * 0.5;
        this.ctx.globalAlpha = 0.08;

        // Primera capa: líneas paralelas 45°
        for (let i = 0; i < 15; i++) {
            const offset = (size / 15) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x + offset, y);
            this.ctx.lineTo(x + offset + size, y + size);
            this.ctx.stroke();
        }

        // Segunda capa: líneas cruzadas -45°
        this.ctx.globalAlpha = 0.06;
        for (let i = 0; i < 15; i++) {
            const offset = (size / 15) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x + offset, y + size);
            this.ctx.lineTo(x + offset + size, y);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Fade out después de 3-5 segundos
        setTimeout(() => this.fadeOutStroke(), 3000 + Math.random() * 2000);
    }

    // 🎨 TÉCNICA: Difuminado suave (blending)
    drawBlendedShading() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Posición del difuminado
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = 40 + Math.random() * 60;

        // Crear gradiente radial para difuminado
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(160, 160, 170, 0.15)');
        gradient.addColorStop(0.5, 'rgba(180, 180, 190, 0.08)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

        // Agregar textura granulada al difuminado
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;

            this.ctx.fillStyle = this.getGraphiteColor();
            this.ctx.globalAlpha = 0.04;
            const dotSize = 0.5 + Math.random();
            this.ctx.fillRect(px, py, dotSize, dotSize);
        }

        this.ctx.globalAlpha = 1;

        // Fade out
        setTimeout(() => this.fadeOutStroke(), 4000 + Math.random() * 2000);
    }

    // 🎨 TÉCNICA: Sombreado circular (tono artístico)
    drawCircularShading() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const centerX = Math.random() * w;
        const centerY = Math.random() * h;
        const radius = 30 + Math.random() * 50;
        const strokes = 20 + Math.floor(Math.random() * 20);

        this.ctx.save();
        this.ctx.strokeStyle = this.getGraphiteColor();
        this.ctx.lineWidth = 0.6;
        this.ctx.globalAlpha = 0.06;

        // Dibujar círculos concéntricos con variación
        for (let i = 0; i < strokes; i++) {
            const currentRadius = (radius / strokes) * i;
            const variation = (Math.random() - 0.5) * 5;

            this.ctx.beginPath();
            this.ctx.arc(
                centerX + variation,
                centerY + variation,
                currentRadius,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Fade out
        setTimeout(() => this.fadeOutStroke(), 3500 + Math.random() * 2000);
    }

    // 🌫️ Difuminar gradualmente el canvas (fade out)
    fadeOutStroke() {
        this.ctx.globalAlpha = 0.02;
        this.ctx.fillStyle = '#fafafa'; // Color del fondo
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }

    // 🎯 API pública
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCustomStroke(x1, y1, x2, y2, color = null, width = 2) {
        this.ctx.strokeStyle = color || this.getGraphiteColor();
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.globalAlpha = 0.3;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
}

// 🚀 Inicialización automática
let pencilStrokesEngine;

function initPencilStrokes() {
    const canvas = document.getElementById('pencil-strokes-canvas');
    if (canvas) {
        pencilStrokesEngine = new PencilStrokesEngine('pencil-strokes-canvas');
        console.log('✏️ Trazos de lápiz activados');
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilStrokes);
} else {
    initPencilStrokes();
}

// 🌍 API global
window.PencilStrokesAPI = {
    clear: () => pencilStrokesEngine?.clear(),
    drawStroke: (x1, y1, x2, y2, color, width) => pencilStrokesEngine?.drawCustomStroke(x1, y1, x2, y2, color, width),
    getEngine: () => pencilStrokesEngine
};

console.log('✏️ Motor de trazos de lápiz cargado - Arte en movimiento!');

// 🎮 Juegos interactivos para Santiago Soto Arte
// Sistema de gamificación para motivar al joven artista

class ArtGames {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.achievements = [];
        // 🎨 Teoría de color completa para el juego de mezclas
        this.colorTheory = {
            primary: {
                red: { hex: '#FF0000', name: 'Rojo', rgb: [255, 0, 0] },
                blue: { hex: '#0000FF', name: 'Azul', rgb: [0, 0, 255] },
                yellow: { hex: '#FFFF00', name: 'Amarillo', rgb: [255, 255, 0] }
            },
            secondary: {
                orange: { hex: '#FFA500', name: 'Naranja', rgb: [255, 165, 0] },
                green: { hex: '#008000', name: 'Verde', rgb: [0, 128, 0] },
                purple: { hex: '#800080', name: 'Púrpura', rgb: [128, 0, 128] }
            },
            tertiary: {
                vermillion: { hex: '#E34234', name: 'Bermellón', rgb: [227, 66, 52] },
                amber: { hex: '#FFBF00', name: 'Ámbar', rgb: [255, 191, 0] },
                chartreuse: { hex: '#7FFF00', name: 'Verde Lima', rgb: [127, 255, 0] },
                teal: { hex: '#008080', name: 'Verde Azulado', rgb: [0, 128, 128] },
                violet: { hex: '#8A2BE2', name: 'Violeta', rgb: [138, 43, 226] },
                rose: { hex: '#FF007F', name: 'Rosa Magenta', rgb: [255, 0, 127] }
            },
            neutral: {
                black: { hex: '#000000', name: 'Negro', rgb: [0, 0, 0] },
                white: { hex: '#FFFFFF', name: 'Blanco', rgb: [255, 255, 255] },
                gray: { hex: '#808080', name: 'Gris', rgb: [128, 128, 128] }
            }
        };

        // 🧪 Fórmulas de mezcla de colores
        this.colorMixtures = [
            // Primarios → Secundarios
            {
                color1: 'red', color2: 'yellow', result: 'orange',
                explanation: 'Rojo + Amarillo = Naranja (color cálido secundario)',
                difficulty: 'easy'
            },
            {
                color1: 'blue', color2: 'yellow', result: 'green',
                explanation: 'Azul + Amarillo = Verde (color fresco secundario)',
                difficulty: 'easy'
            },
            {
                color1: 'red', color2: 'blue', result: 'purple',
                explanation: 'Rojo + Azul = Púrpura (color frío secundario)',
                difficulty: 'easy'
            },

            // Primarios + Secundarios → Terciarios
            {
                color1: 'red', color2: 'orange', result: 'vermillion',
                explanation: 'Rojo + Naranja = Bermellón (terciario cálido)',
                difficulty: 'medium'
            },
            {
                color1: 'yellow', color2: 'orange', result: 'amber',
                explanation: 'Amarillo + Naranja = Ámbar (terciario luminoso)',
                difficulty: 'medium'
            },
            {
                color1: 'yellow', color2: 'green', result: 'chartreuse',
                explanation: 'Amarillo + Verde = Verde Lima (terciario vibrante)',
                difficulty: 'medium'
            },
            {
                color1: 'blue', color2: 'green', result: 'teal',
                explanation: 'Azul + Verde = Verde Azulado (terciario fresco)',
                difficulty: 'medium'
            },
            {
                color1: 'blue', color2: 'purple', result: 'violet',
                explanation: 'Azul + Púrpura = Violeta (terciario místico)',
                difficulty: 'medium'
            },
            {
                color1: 'red', color2: 'purple', result: 'rose',
                explanation: 'Rojo + Púrpura = Rosa Magenta (terciario intenso)',
                difficulty: 'medium'
            },

            // Con neutros (más avanzado)
            {
                color1: 'red', color2: 'black', result: 'maroon',
                explanation: 'Rojo + Negro = Granate (sombra cálida)',
                difficulty: 'hard',
                customResult: { hex: '#800000', name: 'Granate', rgb: [128, 0, 0] }
            },
            {
                color1: 'blue', color2: 'white', result: 'lightblue',
                explanation: 'Azul + Blanco = Azul Claro (tinte fresco)',
                difficulty: 'hard',
                customResult: { hex: '#ADD8E6', name: 'Azul Claro', rgb: [173, 216, 230] }
            }
        ];

        this.colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        this.init();
    }

    init() {
        this.createGameInterface();
        this.loadProgress();
    }

    // 🧪 Juego: Laboratorio de Mezclas de Color
    colorMixingGame() {
        const gameContainer = document.getElementById('game-container');

        // Seleccionar una mezcla aleatoria basada en el nivel del jugador
        let availableMixtures = this.colorMixtures.filter(mixture => {
            if (this.score < 50) return mixture.difficulty === 'easy';
            if (this.score < 150) return mixture.difficulty === 'easy' || mixture.difficulty === 'medium';
            return true; // Todas las dificultades
        });

        const currentMixture = availableMixtures[Math.floor(Math.random() * availableMixtures.length)];

        // Obtener colores para la mezcla
        const color1Data = this.getColorData(currentMixture.color1);
        const color2Data = this.getColorData(currentMixture.color2);
        const resultData = this.getResultColorData(currentMixture);

        // Crear opciones incorrectas inteligentes
        const wrongOptions = this.generateSmartWrongOptions(resultData, currentMixture.difficulty);
        const allOptions = [resultData, ...wrongOptions].sort(() => Math.random() - 0.5);

        gameContainer.innerHTML = `
            <div class="color-mixing-game">
                <h3>🧪 Laboratorio de Mezclas</h3>
                <div class="difficulty-badge difficulty-${currentMixture.difficulty}">
                    ${currentMixture.difficulty === 'easy' ? 'Básico' : currentMixture.difficulty === 'medium' ? 'Intermedio' : 'Avanzado'}
                </div>

                <div class="mixing-question">
                    <p class="question-text">¿Qué color se forma al mezclar?</p>
                    <div class="color-combination">
                        <div class="source-color">
                            <div class="color-sample" style="background-color: ${color1Data.hex}"></div>
                            <span class="color-name">${color1Data.name}</span>
                        </div>
                        <div class="mixing-symbol">+</div>
                        <div class="source-color">
                            <div class="color-sample" style="background-color: ${color2Data.hex}"></div>
                            <span class="color-name">${color2Data.name}</span>
                        </div>
                        <div class="mixing-symbol">=</div>
                        <div class="result-placeholder">?</div>
                    </div>
                </div>

                <div class="color-options-grid">
                    ${allOptions.map((option, index) => `
                        <button class="color-option-btn" onclick="artGames.checkColorMixing('${option.name}', '${resultData.name}', '${currentMixture.explanation}', ${index})">
                            <div class="color-sample" style="background-color: ${option.hex}"></div>
                            <span class="option-name">${option.name}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="mixing-stats">
                    <div class="stat">
                        <span class="stat-label">Puntuación</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Nivel</span>
                        <span class="stat-value">${this.getCurrentMixingLevel()}</span>
                    </div>
                </div>

                <div class="color-theory-tip">
                    <h4>💡 Tip de Santiago:</h4>
                    <p>${this.getColorTheoryTip(currentMixture)}</p>
                </div>
            </div>
        `;
    }

    // 🎨 Función auxiliar para obtener datos de color
    getColorData(colorName) {
        for (let category of ['primary', 'secondary', 'tertiary', 'neutral']) {
            if (this.colorTheory[category][colorName]) {
                return this.colorTheory[category][colorName];
            }
        }
        return { hex: '#000000', name: 'Desconocido', rgb: [0, 0, 0] };
    }

    getResultColorData(mixture) {
        if (mixture.customResult) {
            return mixture.customResult;
        }
        return this.getColorData(mixture.result);
    }

    // 🎯 Generar opciones incorrectas inteligentes
    generateSmartWrongOptions(correctResult, difficulty) {
        const allColors = Object.values(this.colorTheory).flatMap(category => Object.values(category));
        const wrongOptions = [];

        // Filtrar el color correcto
        const availableColors = allColors.filter(color => color.name !== correctResult.name);

        if (difficulty === 'easy') {
            // Para fácil: colores obviamente diferentes
            wrongOptions.push(
                availableColors.find(c => c.name === 'Azul') || availableColors[0],
                availableColors.find(c => c.name === 'Rojo') || availableColors[1],
                availableColors.find(c => c.name === 'Amarillo') || availableColors[2]
            );
        } else if (difficulty === 'medium') {
            // Para intermedio: colores similares pero incorrectos
            wrongOptions.push(
                availableColors.find(c => c.name === 'Violeta') || availableColors[0],
                availableColors.find(c => c.name === 'Verde Lima') || availableColors[1],
                availableColors.find(c => c.name === 'Ámbar') || availableColors[2]
            );
        } else {
            // Para avanzado: colores muy similares al correcto
            wrongOptions.push(
                availableColors.find(c => c.name === 'Gris') || availableColors[0],
                availableColors.find(c => c.name === 'Rosa Magenta') || availableColors[1],
                availableColors.find(c => c.name === 'Verde Azulado') || availableColors[2]
            );
        }

        return wrongOptions.filter(Boolean).slice(0, 3);
    }

    getCurrentMixingLevel() {
        if (this.score < 50) return 'Aprendiz';
        if (this.score < 150) return 'Artista';
        if (this.score < 300) return 'Maestro';
        return 'Experto';
    }

    getColorTheoryTip(mixture) {
        const tips = {
            'easy': [
                'Los colores primarios (rojo, azul, amarillo) son la base de todos los demás colores',
                'Mezclando dos primarios siempre obtienes un secundario',
                'Los colores cálidos (rojos, naranjas, amarillos) dan energía a las pinturas'
            ],
            'medium': [
                'Los colores terciarios se crean mezclando un primario con un secundario adyacente',
                'La temperatura del color afecta el estado de ánimo de la obra',
                'Cada color tiene un complementario que lo hace resaltar más'
            ],
            'hard': [
                'Agregar negro crea sombras (shades), agregar blanco crea tintes (tints)',
                'Los colores neutros ayudan a balancear composiciones vibrantes',
                'La saturación de un color puede cambiar completamente la sensación de una pintura'
            ]
        };

        const tipsList = tips[mixture.difficulty] || tips['easy'];
        return tipsList[Math.floor(Math.random() * tipsList.length)];
    }

    checkColorMixing(selectedName, correctName, explanation, optionIndex) {
        const isCorrect = selectedName === correctName;

        if (isCorrect) {
            this.score += 25; // Más puntos por la complejidad
            this.showMixingResult(true, explanation, selectedName);

            // 🎮 Integración con Art Patron System
            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('perfect_color_match');
                artPatronSystem.playerData.stats.perfectScores++;
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        } else {
            this.showMixingResult(false, explanation, correctName);

            // 🎮 Puntos básicos por jugar
            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('play_color_game');
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        }
    }

    showMixingResult(isCorrect, explanation, correctName) {
        const gameContainer = document.getElementById('game-container');
        const resultClass = isCorrect ? 'success' : 'incorrect';
        const resultIcon = isCorrect ? '🎨✨' : '🤔💭';
        const resultTitle = isCorrect ? '¡Perfecto!' : '¡Casi!';

        gameContainer.innerHTML = `
            <div class="mixing-result ${resultClass}">
                <div class="result-icon">${resultIcon}</div>
                <h3>${resultTitle}</h3>
                <div class="explanation">
                    <p><strong>${explanation}</strong></p>
                    ${!isCorrect ? `<p class="correct-answer">La respuesta correcta era: <strong>${correctName}</strong></p>` : ''}
                </div>
                <div class="score-update">
                    <p>Puntuación actual: <strong>${this.score}</strong></p>
                    <p>Nivel: <strong>${this.getCurrentMixingLevel()}</strong></p>
                </div>
                <button class="next-question-btn" onclick="artGames.colorMixingGame()">
                    ${isCorrect ? 'Siguiente Mezcla 🧪' : 'Intentar Otra ⚗️'}
                </button>
                <button class="back-to-menu-btn" onclick="artGames.showGameMenu()">
                    Volver al Menú 🏠
                </button>
            </div>
        `;
    }

    // 🏠 Mostrar menú de juegos
    showGameMenu() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <div class="welcome-game">
                <h3>¡Bienvenido al espacio creativo!</h3>
                <p>Elige un juego para desarrollar tu inspiración artística</p>
                <div class="game-benefits">
                    <h4>🎁 ¿Qué ganas jugando?</h4>
                    <ul>
                        <li>🎯 Puntos por cada actividad</li>
                        <li>🏆 Logros especiales por habilidades</li>
                        <li>💰 Descuentos reales en encargos (hasta 20%)</li>
                        <li>🎨 Apoyas el crecimiento de Santiago</li>
                    </ul>
                </div>
            </div>
        `;
    }

    checkColor(selected, correct) {
        if (selected === correct) {
            this.score += 10;
            this.showFeedback('¡Excelente elección artística! 🎨', 'success');

            // 🎮 Integración con Art Patron System
            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('perfect_color_match');
                artPatronSystem.playerData.stats.perfectScores++;
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        } else {
            this.showFeedback('Sigue practicando, cada color tiene su momento ✨', 'info');

            // 🎮 Puntos básicos por jugar
            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('play_color_game');
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        }
        setTimeout(() => this.colorGuessGame(), 1500);
    }

    // 🖼️ Juego: Memoria de Obras
    memoryGame() {
        const gameContainer = document.getElementById('game-container');
        const artCards = ['🐕', '🐱', '🐰', '🦎', '🐦', '🐢'];
        const shuffledCards = [...artCards, ...artCards].sort(() => Math.random() - 0.5);

        gameContainer.innerHTML = `
            <div class="memory-game">
                <h3>🧠 Memoria Artística</h3>
                <p>Encuentra las parejas de mascotas</p>
                <div class="memory-grid">
                    ${shuffledCards.map((card, index) =>
                        `<div class="memory-card" data-card="${card}" data-index="${index}">
                            <div class="card-front">🎨</div>
                            <div class="card-back">${card}</div>
                         </div>`
                    ).join('')}
                </div>
                <div class="score-display">Puntuación: ${this.score}</div>
            </div>
        `;

        this.setupMemoryGame();
    }

    setupMemoryGame() {
        const cards = document.querySelectorAll('.memory-card');
        let flippedCards = [];
        let matches = 0;

        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    flippedCards.push(card);

                    if (flippedCards.length === 2) {
                        if (flippedCards[0].dataset.card === flippedCards[1].dataset.card) {
                            matches++;
                            this.score += 20;
                            flippedCards = [];
                            if (matches === 6) {
                                this.showFeedback('¡Has completado tu galería mental! 🏆', 'success');

                                // 🎮 Juego completado perfectamente
                                if (typeof artPatronSystem !== 'undefined') {
                                    artPatronSystem.addPoints('memory_perfect_score');
                                    artPatronSystem.playerData.stats.perfectScores++;
                                    artPatronSystem.playerData.stats.gamesPlayed++;
                                }
                            } else {
                                // 🎮 Puntos por completar memoria
                                if (typeof artPatronSystem !== 'undefined') {
                                    artPatronSystem.addPoints('complete_memory_game');
                                }
                            }
                        } else {
                            setTimeout(() => {
                                flippedCards.forEach(c => c.classList.remove('flipped'));
                                flippedCards = [];
                            }, 1000);
                        }
                    }
                }
            });
        });
    }

    // 🎭 Generador de Ideas Creativas
    ideaGenerator() {
        const animals = ['perro golden', 'gato persa', 'conejo lop', 'loro colorido', 'pez betta', 'tortuga'];
        const styles = ['realista', 'abstracto', 'impresionista', 'pop art', 'acuarela', 'carboncillo'];
        const settings = ['en el parque', 'durmiendo', 'jugando', 'en la lluvia', 'al atardecer', 'con flores'];

        const randomIdea = {
            animal: animals[Math.floor(Math.random() * animals.length)],
            style: styles[Math.floor(Math.random() * styles.length)],
            setting: settings[Math.floor(Math.random() * settings.length)]
        };

        document.getElementById('game-container').innerHTML = `
            <div class="idea-generator">
                <h3>💡 Generador de Ideas</h3>
                <div class="idea-card">
                    <h4>Tu próxima obra podría ser:</h4>
                    <p><strong>Animal:</strong> ${randomIdea.animal}</p>
                    <p><strong>Estilo:</strong> ${randomIdea.style}</p>
                    <p><strong>Escenario:</strong> ${randomIdea.setting}</p>
                </div>
                <button onclick="artGames.ideaGenerator()" class="btn-primary">
                    Nueva Idea ✨
                </button>
                <button onclick="artGames.saveIdea('${JSON.stringify(randomIdea)}')" class="btn-secondary">
                    Guardar Idea 💾
                </button>
            </div>
        `;
    }

    saveIdea(ideaString) {
        const ideas = JSON.parse(localStorage.getItem('santiagoIdeas') || '[]');
        ideas.push(JSON.parse(ideaString));
        localStorage.setItem('santiagoIdeas', JSON.stringify(ideas));
        this.showFeedback('¡Idea guardada en tu biblioteca creativa! 📚', 'success');

        // 🎮 Puntos por guardar idea
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('save_idea');
            artPatronSystem.playerData.stats.ideasSaved++;
        }
    }

    // 📈 Sistema de Logros
    checkAchievements() {
        const achievements = [
            { id: 'first_game', name: 'Primer Juego', condition: () => this.score > 0 },
            { id: 'color_master', name: 'Maestro del Color', condition: () => this.score >= 100 },
            { id: 'memory_champion', name: 'Campeón de Memoria', condition: () => this.score >= 200 },
            { id: 'idea_collector', name: 'Coleccionista de Ideas', condition: () => {
                const ideas = JSON.parse(localStorage.getItem('santiagoIdeas') || '[]');
                return ideas.length >= 5;
            }}
        ];

        achievements.forEach(achievement => {
            if (achievement.condition() && !this.achievements.includes(achievement.id)) {
                this.achievements.push(achievement.id);
                this.showAchievement(achievement.name);
            }
        });
    }

    showAchievement(name) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement-popup';
        achievementDiv.innerHTML = `
            <div class="achievement-content">
                <h4>🏆 ¡Nuevo Logro!</h4>
                <p>${name}</p>
            </div>
        `;
        document.body.appendChild(achievementDiv);
        setTimeout(() => achievementDiv.remove(), 3000);
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }

    // 💾 Sistema de Progreso
    saveProgress() {
        localStorage.setItem('santiagoProgress', JSON.stringify({
            score: this.score,
            level: this.level,
            achievements: this.achievements
        }));
    }

    loadProgress() {
        const saved = localStorage.getItem('santiagoProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.score = progress.score || 0;
            this.level = progress.level || 1;
            this.achievements = progress.achievements || [];
        }
    }

    createGameInterface() {
        // Esta función se llamará desde el HTML para crear la interfaz de juegos
    }
}

// 🌟 Mensajes motivacionales para Santiago
const motivationalMessages = [
    "¡Tu arte trae alegría al mundo! 🌟",
    "Cada pincelada cuenta una historia única ✨",
    "El arte no tiene edad, tienes un don especial 🎨",
    "Tus mascotas pintadas cobran vida 💝",
    "Sigue creando, el mundo necesita tu arte 🌈"
];

function showMotivation() {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    const motivationDiv = document.createElement('div');
    motivationDiv.className = 'motivation-message';
    motivationDiv.innerHTML = `
        <div class="motivation-content">
            <h4>💫 Mensaje para Santiago</h4>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(motivationDiv);
    setTimeout(() => motivationDiv.remove(), 4000);
}

// Inicializar juegos cuando se cargue la página
let artGames;
document.addEventListener('DOMContentLoaded', function() {
    artGames = new ArtGames();
});
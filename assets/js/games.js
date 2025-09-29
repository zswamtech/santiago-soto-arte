// 🎮 Juegos interactivos para Santiago Soto Arte
// Sistema de gamificación para motivar al joven artista

class ArtGames {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.achievements = [];
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

    // 🎨 Juego: Adivina el Color
    colorGuessGame() {
        const gameContainer = document.getElementById('game-container');
        const randomColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];

        gameContainer.innerHTML = `
            <div class="color-game">
                <h3>🎨 Adivina el Color</h3>
                <div class="color-circle" style="background-color: ${randomColor}"></div>
                <p>¿Qué color usarías para pintar una mascota feliz?</p>
                <div class="color-options">
                    ${this.colorPalette.map(color =>
                        `<button class="color-btn" style="background-color: ${color}"
                         onclick="artGames.checkColor('${color}', '${randomColor}')"></button>`
                    ).join('')}
                </div>
                <div class="score-display">Puntuación: ${this.score}</div>
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
// 🎮 Sistema de Gamificación "Art Patron Rewards" - Santiago Soto Arte
// Sistema completo de puntos, niveles, logros y descuentos

class ArtPatronSystem {
    constructor() {
        this.playerData = this.loadPlayerData();
        this.pointsConfig = {
            // 🎯 Puntos por actividad
            activities: {
                play_color_game: 10,
                perfect_color_match: 25,
                complete_memory_game: 30,
                memory_perfect_score: 50,
                generate_idea: 5,
                save_idea: 15,
                daily_visit: 10,
                share_site: 20,
                gallery_interaction: 5,
                calculator_use: 15,
                contact_form: 40,
                first_time_bonus: 100
            },

            // 🏆 Niveles de patrocinador
            levels: [
                { name: "Art Curious", min: 0, max: 99, discount: 0, color: "#94a3b8" },
                { name: "Art Friend", min: 100, max: 299, discount: 5, color: "#06b6d4" },
                { name: "Art Supporter", min: 300, max: 599, discount: 8, color: "#8b5cf6" },
                { name: "Art Patron", min: 600, max: 999, discount: 12, color: "#f59e0b" },
                { name: "Art Champion", min: 1000, max: 1999, discount: 15, color: "#ef4444" },
                { name: "Art Legend", min: 2000, max: Infinity, discount: 20, color: "#10b981" }
            ],

            // 🎖️ Logros especiales
            achievements: {
                first_steps: {
                    name: "Primeros Pasos",
                    description: "Jugaste tu primer juego",
                    points: 50,
                    icon: "👶",
                    unlocked: false
                },
                color_master: {
                    name: "Maestro del Color",
                    description: "Acertaste 10 colores seguidos",
                    points: 100,
                    icon: "🎨",
                    unlocked: false
                },
                memory_wizard: {
                    name: "Mago de la Memoria",
                    description: "Completaste memoria sin errores",
                    points: 150,
                    icon: "🧠",
                    unlocked: false
                },
                idea_generator: {
                    name: "Generador de Ideas",
                    description: "Guardaste 5 ideas creativas",
                    points: 75,
                    icon: "💡",
                    unlocked: false
                },
                daily_patron: {
                    name: "Patrón Diario",
                    description: "Visitaste 7 días seguidos",
                    points: 200,
                    icon: "📅",
                    unlocked: false
                },
                art_ambassador: {
                    name: "Embajador del Arte",
                    description: "Compartiste el sitio 3 veces",
                    points: 120,
                    icon: "🌟",
                    unlocked: false
                },
                santiago_supporter: {
                    name: "Supporter de Santiago",
                    description: "Hiciste tu primer encargo",
                    points: 500,
                    icon: "🎖️",
                    unlocked: false
                }
            }
        };

        this.init();
    }

    init() {
        this.createPatronInterface();
        this.checkDailyVisit();
        this.updateDisplay();
        this.checkFirstTimeBonus();
    }

    // 💾 Gestión de datos del jugador
    loadPlayerData() {
        const defaultData = {
            totalPoints: 0,
            level: 0,
            achievements: {},
            stats: {
                gamesPlayed: 0,
                perfectScores: 0,
                ideasSaved: 0,
                daysVisited: 0,
                lastVisit: null,
                streak: 0,
                sharesCount: 0,
                calculatorUses: 0
            },
            history: []
        };

        const saved = localStorage.getItem('santiagoArtPatron');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    savePlayerData() {
        localStorage.setItem('santiagoArtPatron', JSON.stringify(this.playerData));
    }

    // 🎯 Sistema de puntos
    addPoints(activity, amount = null) {
        const points = amount || this.pointsConfig.activities[activity] || 0;
        this.playerData.totalPoints += points;

        // Registrar en historial
        this.playerData.history.unshift({
            activity,
            points,
            timestamp: Date.now(),
            description: this.getActivityDescription(activity)
        });

        // Mantener solo últimos 20 registros
        this.playerData.history = this.playerData.history.slice(0, 20);

        this.checkLevelUp();
        this.checkAchievements();
        this.savePlayerData();
        this.updateDisplay();
        // 🔔 Evento global para que otros módulos (ej. carrito) reaccionen a cambio de puntos / posible cambio descuento
        try {
            const discount = this.getPatronDiscount();
            window.dispatchEvent(new CustomEvent('artpatron:points-updated', { detail: { totalPoints: this.playerData.totalPoints, discount, activity, added: points } }));
        } catch(e) { /* noop */ }
        this.showPointsAnimation(points, activity);
    }

    getActivityDescription(activity) {
        const descriptions = {
            play_color_game: "Jugaste Adivina el Color",
            perfect_color_match: "¡Acertaste el color perfecto!",
            complete_memory_game: "Completaste Memoria Artística",
            memory_perfect_score: "¡Memoria perfecta sin errores!",
            generate_idea: "Generaste una nueva idea",
            save_idea: "Guardaste una idea creativa",
            daily_visit: "Visita diaria al sitio",
            share_site: "Compartiste el sitio",
            gallery_interaction: "Interactuaste con la galería",
            calculator_use: "Usaste la calculadora",
            contact_form: "Enviaste formulario de contacto",
            first_time_bonus: "¡Bienvenido al Art Patron System!"
        };
        return descriptions[activity] || activity;
    }

    // 🏆 Sistema de niveles
    getCurrentLevel() {
        return this.pointsConfig.levels.find(level =>
            this.playerData.totalPoints >= level.min &&
            this.playerData.totalPoints <= level.max
        );
    }

    getNextLevel() {
        const currentLevel = this.getCurrentLevel();
        return this.pointsConfig.levels.find(level => level.min > currentLevel.max);
    }

    checkLevelUp() {
        const newLevel = this.getCurrentLevel();
        const currentLevelIndex = this.pointsConfig.levels.findIndex(l => l === newLevel);

        if (currentLevelIndex > this.playerData.level) {
            this.playerData.level = currentLevelIndex;
            this.showLevelUpAnimation(newLevel);
        }
    }

    // 🎖️ Sistema de logros
    checkAchievements() {
        Object.keys(this.pointsConfig.achievements).forEach(key => {
            const achievement = this.pointsConfig.achievements[key];
            if (!this.playerData.achievements[key] && this.checkAchievementCondition(key)) {
                this.unlockAchievement(key, achievement);
            }
        });
    }

    checkAchievementCondition(achievementKey) {
        const stats = this.playerData.stats;

        switch (achievementKey) {
            case 'first_steps':
                return stats.gamesPlayed >= 1;
            case 'color_master':
                return stats.perfectScores >= 10;
            case 'memory_wizard':
                return stats.perfectScores >= 1;
            case 'idea_generator':
                return stats.ideasSaved >= 5;
            case 'daily_patron':
                return stats.streak >= 7;
            case 'art_ambassador':
                return stats.sharesCount >= 3;
            case 'santiago_supporter':
                return stats.calculatorUses >= 1 && this.playerData.history.some(h => h.activity === 'contact_form');
            default:
                return false;
        }
    }

    unlockAchievement(key, achievement) {
        this.playerData.achievements[key] = {
            ...achievement,
            unlocked: true,
            unlockedAt: Date.now()
        };

        this.addPoints('achievement', achievement.points);
        this.showAchievementUnlock(achievement);
    }

    // 📅 Sistema de visitas diarias
    checkDailyVisit() {
        const today = new Date().toDateString();
        const lastVisit = this.playerData.stats.lastVisit;

        if (lastVisit !== today) {
            // Nueva visita
            this.playerData.stats.daysVisited++;
            this.playerData.stats.lastVisit = today;

            // Check streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastVisit === yesterday.toDateString()) {
                this.playerData.stats.streak++;
            } else if (lastVisit !== null) {
                this.playerData.stats.streak = 1;
            } else {
                this.playerData.stats.streak = 1;
            }

            this.addPoints('daily_visit');
        }
    }

    checkFirstTimeBonus() {
        if (this.playerData.totalPoints === 0 && this.playerData.history.length === 0) {
            setTimeout(() => {
                this.addPoints('first_time_bonus');
                this.showWelcomeModal();
            }, 2000);
        }
    }

    // 💰 Integración con calculadora de precios
    getPatronDiscount() {
        const currentLevel = this.getCurrentLevel();
        return currentLevel ? currentLevel.discount : 0;
    }

    // 🎨 Interfaz de usuario
    createPatronInterface() {
        return `
            <div class="art-patron-system">
                <div class="patron-header">
                    <div class="patron-avatar">
                        <div class="avatar-ring">
                            <span class="patron-level-icon">🎨</span>
                        </div>
                    </div>

                    <div class="patron-info">
                        <h3 class="patron-name">Art Patron</h3>
                        <div class="patron-level">
                            <span class="level-name">${this.getCurrentLevel()?.name || 'Loading...'}</span>
                            <span class="level-discount">${this.getPatronDiscount()}% descuento</span>
                        </div>
                    </div>

                    <div class="patron-points">
                        <span class="points-amount">${this.playerData.totalPoints}</span>
                        <span class="points-label">puntos</span>
                    </div>
                </div>

                <div class="patron-progress">
                    <div class="progress-info">
                        <span>Progreso al siguiente nivel</span>
                        <span class="progress-numbers">
                            ${this.playerData.totalPoints} / ${this.getNextLevel()?.min || 'MAX'}
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgressPercentage()}%"></div>
                    </div>
                </div>

                <div class="patron-stats">
                    <div class="stat-item">
                        <span class="stat-number">${this.playerData.stats.gamesPlayed}</span>
                        <span class="stat-label">Juegos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.playerData.stats.streak}</span>
                        <span class="stat-label">Días seguidos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Object.keys(this.playerData.achievements).length}</span>
                        <span class="stat-label">Logros</span>
                    </div>
                </div>

                <div class="patron-benefits">
                    <h4>🎁 Beneficios de tu nivel:</h4>
                    <ul class="benefits-list">
                        <li>✨ ${this.getPatronDiscount()}% descuento en encargos</li>
                        <li>🎯 Acceso a juegos exclusivos</li>
                        <li>📧 Notificaciones de obras nuevas</li>
                        <li>🎨 Contenido behind-the-scenes</li>
                        ${this.getPatronDiscount() >= 10 ? '<li>💎 Prioridad en encargos</li>' : ''}
                        ${this.getPatronDiscount() >= 15 ? '<li>🖼️ Print gratis con cada encargo</li>' : ''}
                    </ul>
                </div>

                <div class="recent-activity">
                    <h4>📈 Actividad reciente:</h4>
                    <div class="activity-list">
                        ${this.playerData.history.slice(0, 3).map(entry => `
                            <div class="activity-entry">
                                <span class="activity-desc">${entry.description}</span>
                                <span class="activity-points">+${entry.points}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getProgressPercentage() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.getNextLevel();

        if (!nextLevel) return 100; // Máximo nivel

        const currentProgress = this.playerData.totalPoints - currentLevel.min;
        const totalNeeded = nextLevel.min - currentLevel.min;

        return Math.min(100, (currentProgress / totalNeeded) * 100);
    }

    updateDisplay() {
        const container = document.getElementById('patron-display');
        if (container) {
            container.innerHTML = this.createPatronInterface();
        }
    }

    // 🎬 Animaciones y efectos
    showPointsAnimation(points, activity) {
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.innerHTML = `
            <div class="points-popup-content">
                <span class="points-gained">+${points}</span>
                <span class="activity-name">${this.getActivityDescription(activity)}</span>
            </div>
        `;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(-50px)';
            setTimeout(() => popup.remove(), 300);
        }, 2000);
    }

    showLevelUpAnimation(newLevel) {
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h2>¡Nivel Subido!</h2>
                <p>Ahora eres un <strong style="color: ${newLevel.color}">${newLevel.name}</strong></p>
                <p>Nuevo descuento: <strong>${newLevel.discount}%</strong></p>
                <button onclick="this.parentElement.parentElement.remove()" class="celebrate-btn">
                    ¡Celebrar! 🎨
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-text">
                    <strong>¡Logro desbloqueado!</strong>
                    <span>${achievement.name}</span>
                </div>
                <span class="achievement-points">+${achievement.points}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'welcome-modal';
        modal.innerHTML = `
            <div class="welcome-content">
                <h2>🎨 ¡Bienvenido al Art Patron System!</h2>
                <p>Gana puntos jugando, interactuando y apoyando a Santiago.</p>
                <div class="welcome-benefits">
                    <div class="benefit">🎮 Juega y gana puntos</div>
                    <div class="benefit">🏆 Desbloquea logros</div>
                    <div class="benefit">💰 Obtén descuentos reales</div>
                    <div class="benefit">🎨 Apoya el arte de Santiago</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="start-btn">
                    ¡Comenzar mi journey! ✨
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 🔗 Integración con juegos existentes
    integratewithGames() {
        // Esta función será llamada desde los juegos existentes
        // para actualizar estadísticas y dar puntos
    }
}

// 🚀 Inicialización global
let artPatronSystem;
document.addEventListener('DOMContentLoaded', function() {
    artPatronSystem = new ArtPatronSystem();

    // Mostrar display cuando esté disponible
    setTimeout(() => {
        artPatronSystem.updateDisplay();
    }, 500);
});
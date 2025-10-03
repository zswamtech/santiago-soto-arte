/**
 * 🏆 Leaderboard - Salón de la Fama de Contribuidores
 * Sistema de ranking para reconocer a los mejores creadores de contenido
 */

(function(window) {
    'use strict';

    const Leaderboard = {
        isOpen: false,

        // Badges disponibles
        badges: {
            novice: { icon: '🌱', name: 'Novato', requirement: 1 },
            apprentice: { icon: '🌟', name: 'Aprendiz', requirement: 5 },
            artisan: { icon: '🎨', name: 'Artesano', requirement: 10 },
            master: { icon: '🖌️', name: 'Maestro', requirement: 20 },
            virtuoso: { icon: '💎', name: 'Virtuoso', requirement: 35 },
            legend: { icon: '👑', name: 'Leyenda', requirement: 50 },
            pioneer: { icon: '🔥', name: 'Pionero', requirement: 'early_adopter' },
            educator: { icon: '📚', name: 'Educador', requirement: 'high_quality' },
            creative: { icon: '✨', name: 'Creativo', requirement: 'unique_pairs' },
            consistent: { icon: '⚡', name: 'Consistente', requirement: 'streak' }
        },

        // Avatares de mascotas disponibles
        petAvatars: {
            dog: '🐶',
            cat: '🐱',
            bird: '🦜',
            rabbit: '🐰',
            hamster: '🐹',
            fish: '🐠',
            turtle: '🐢',
            wolf: '🐺',
            fox: '🦊',
            panda: '🐼'
        },

        /**
         * Abre el salón de la fama
         */
        open() {
            const container = document.getElementById('leaderboard-container');
            if (!container) {
                console.error('[Leaderboard] Container not found');
                return;
            }

            container.style.display = 'block';
            this.isOpen = true;
            this.render();

            // Analytics
            if (window.GameCore?.eventBus) {
                window.GameCore.eventBus.emit('leaderboard.opened', {
                    timestamp: Date.now()
                });
            }
        },

        /**
         * Cierra el salón de la fama
         */
        close() {
            const container = document.getElementById('leaderboard-container');
            if (container) {
                container.style.display = 'none';
                this.isOpen = false;
            }
        },

        /**
         * Obtiene datos de contribuidores
         */
        getContributorsData() {
            // Cargar contribuciones del localStorage
            const contributions = JSON.parse(localStorage.getItem('user_contributions') || '[]');

            // Agrupar por usuario
            const contributorMap = new Map();

            contributions.forEach(contrib => {
                const userId = contrib.userId || 'anonymous';

                if (!contributorMap.has(userId)) {
                    contributorMap.set(userId, {
                        userId: userId,
                        name: contrib.userName || this.generateAnonymousName(),
                        petName: contrib.petName || 'Compañero',
                        petType: contrib.petType || 'dog',
                        totalContributions: 0,
                        approvedContributions: 0,
                        pendingContributions: 0,
                        rejectedContributions: 0,
                        totalPoints: 0,
                        badges: [],
                        joinDate: contrib.submittedAt || new Date().toISOString(),
                        categories: new Set()
                    });
                }

                const contributor = contributorMap.get(userId);
                contributor.totalContributions++;

                if (contrib.status === 'approved') {
                    contributor.approvedContributions++;
                    contributor.totalPoints += this.getPointsForDifficulty(contrib.difficulty);
                } else if (contrib.status === 'pending') {
                    contributor.pendingContributions++;
                } else if (contrib.status === 'rejected') {
                    contributor.rejectedContributions++;
                }

                if (contrib.category) {
                    contributor.categories.add(contrib.category);
                }
            });

            // Convertir a array y calcular badges
            const contributors = Array.from(contributorMap.values()).map(contributor => {
                contributor.badges = this.calculateBadges(contributor);
                contributor.categories = Array.from(contributor.categories);
                return contributor;
            });

            // Ordenar por contribuciones aprobadas
            contributors.sort((a, b) => {
                if (b.approvedContributions !== a.approvedContributions) {
                    return b.approvedContributions - a.approvedContributions;
                }
                return b.totalPoints - a.totalPoints;
            });

            return contributors;
        },

        /**
         * Calcula los badges de un contribuidor
         */
        calculateBadges(contributor) {
            const badges = [];

            // Badges por cantidad de contribuciones
            const approved = contributor.approvedContributions;

            if (approved >= this.badges.legend.requirement) badges.push('legend');
            else if (approved >= this.badges.virtuoso.requirement) badges.push('virtuoso');
            else if (approved >= this.badges.master.requirement) badges.push('master');
            else if (approved >= this.badges.artisan.requirement) badges.push('artisan');
            else if (approved >= this.badges.apprentice.requirement) badges.push('apprentice');
            else if (approved >= this.badges.novice.requirement) badges.push('novice');

            // Badge de pionero (primeros 10 contribuidores)
            const joinDate = new Date(contributor.joinDate);
            const earlyAdopterCutoff = new Date('2025-02-01');
            if (joinDate < earlyAdopterCutoff) {
                badges.push('pioneer');
            }

            // Badge de educador (alta calidad - tasa de aprobación > 80%)
            const approvalRate = contributor.totalContributions > 0
                ? contributor.approvedContributions / contributor.totalContributions
                : 0;
            if (approvalRate >= 0.8 && contributor.totalContributions >= 5) {
                badges.push('educator');
            }

            // Badge de creativo (contribuciones en 3+ categorías)
            if (contributor.categories.length >= 3) {
                badges.push('creative');
            }

            return badges;
        },

        /**
         * Obtiene puntos por dificultad
         */
        getPointsForDifficulty(difficulty) {
            const points = {
                easy: 200,
                medium: 350,
                hard: 500
            };
            return points[difficulty] || 200;
        },

        /**
         * Genera nombre anónimo
         */
        generateAnonymousName() {
            const adjectives = ['Valiente', 'Creativo', 'Talentoso', 'Dedicado', 'Apasionado', 'Inspirado'];
            const nouns = ['Artista', 'Pintor', 'Creador', 'Maestro', 'Visionario'];

            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const num = Math.floor(Math.random() * 999);

            return `${adj} ${noun} #${num}`;
        },

        /**
         * Renderiza el leaderboard
         */
        render() {
            const container = document.getElementById('leaderboard-grid');
            if (!container) return;

            const contributors = this.getContributorsData();

            if (contributors.length === 0) {
                container.innerHTML = `
                    <div class="leaderboard-empty">
                        <div class="empty-icon">🎨</div>
                        <h4>Todavía no hay contribuidores</h4>
                        <p>¡Sé el primero en aportar un par creativo y aparecer en el Salón de la Fama!</p>
                        <button class="btn-primary" onclick="showContributionPortal(); Leaderboard.close();">
                            ➕ Hacer mi Primera Contribución
                        </button>
                    </div>
                `;
                return;
            }

            // Estadísticas generales
            const stats = this.calculateGlobalStats(contributors);
            const statsHTML = `
                <div class="leaderboard-stats">
                    <div class="stat-item">
                        <span class="stat-icon">👥</span>
                        <span class="stat-value">${contributors.length}</span>
                        <span class="stat-label">Contribuidores</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <span class="stat-value">${stats.totalApproved}</span>
                        <span class="stat-label">Pares Aprobados</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⏳</span>
                        <span class="stat-value">${stats.totalPending}</span>
                        <span class="stat-label">En Revisión</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-value">${stats.totalPoints.toLocaleString()}</span>
                        <span class="stat-label">Puntos Totales</span>
                    </div>
                </div>
            `;

            // Renderizar entradas
            const entriesHTML = contributors.map((contributor, index) => {
                return this.renderEntry(contributor, index);
            }).join('');

            container.innerHTML = statsHTML + '<div class="leaderboard-list">' + entriesHTML + '</div>';
        },

        /**
         * Renderiza una entrada del leaderboard
         */
        renderEntry(contributor, index) {
            const rank = index + 1;
            const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

            const petAvatar = this.petAvatars[contributor.petType] || '🐾';

            const badgesHTML = contributor.badges
                .map(badgeKey => {
                    const badge = this.badges[badgeKey];
                    return badge ? `<span class="badge-icon" title="${badge.name}">${badge.icon}</span>` : '';
                })
                .join('');

            const approvalRate = contributor.totalContributions > 0
                ? Math.round((contributor.approvedContributions / contributor.totalContributions) * 100)
                : 0;

            return `
                <div class="leaderboard-entry ${rankClass}" data-rank="${rank}">
                    <div class="entry-rank">
                        <span class="rank-number">${rankIcon || `#${rank}`}</span>
                    </div>

                    <div class="entry-avatar">
                        <div class="avatar-circle ${rankClass}">
                            ${petAvatar}
                        </div>
                    </div>

                    <div class="entry-info">
                        <div class="entry-name">
                            ${this.escapeHtml(contributor.name)}
                        </div>
                        <div class="entry-pet">
                            & ${this.escapeHtml(contributor.petName)}
                        </div>
                    </div>

                    <div class="entry-badges">
                        ${badgesHTML || '<span class="no-badges">—</span>'}
                    </div>

                    <div class="entry-stats">
                        <div class="stat-primary">
                            <span class="stat-number">${contributor.approvedContributions}</span>
                            <span class="stat-label">Aprobados</span>
                        </div>
                        <div class="stat-secondary">
                            <span class="approval-rate ${approvalRate >= 80 ? 'high' : approvalRate >= 50 ? 'medium' : 'low'}">
                                ${approvalRate}% aprobación
                            </span>
                        </div>
                    </div>

                    <div class="entry-points">
                        <span class="points-value">${contributor.totalPoints.toLocaleString()}</span>
                        <span class="points-label">pts</span>
                    </div>
                </div>
            `;
        },

        /**
         * Calcula estadísticas globales
         */
        calculateGlobalStats(contributors) {
            return contributors.reduce((stats, contributor) => {
                stats.totalApproved += contributor.approvedContributions;
                stats.totalPending += contributor.pendingContributions;
                stats.totalPoints += contributor.totalPoints;
                return stats;
            }, { totalApproved: 0, totalPending: 0, totalPoints: 0 });
        },

        /**
         * Escapa HTML para prevenir XSS
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Obtiene posición del usuario actual
         */
        getCurrentUserRank() {
            const contributors = this.getContributorsData();
            const userId = this.getCurrentUserId();

            const index = contributors.findIndex(c => c.userId === userId);
            return index >= 0 ? index + 1 : null;
        },

        /**
         * Obtiene ID del usuario actual
         */
        getCurrentUserId() {
            if (window.ContributionPortal?.getUserId) {
                return window.ContributionPortal.getUserId();
            }
            return localStorage.getItem('contribution_user_id') || 'anonymous';
        }
    };

    // Función global para abrir el salón de la fama
    window.showLeaderboard = function() {
        Leaderboard.open();
    };

    // Exponer para debugging
    window.Leaderboard = Leaderboard;

    console.log('[Leaderboard] Module loaded ✓');

})(window);

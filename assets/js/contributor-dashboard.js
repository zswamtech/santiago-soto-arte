/*
 * 📊 CONTRIBUTOR DASHBOARD
 * Panel personalizado para creadores de pares
 * Muestra estadísticas, ranking y logros
 */

(function(global) {

  // 🏆 Configuración de badges de contribuidor
  const CONTRIBUTOR_BADGES = {
    firstContribution: {
      id: 'first_contribution',
      name: 'Primera Contribución',
      icon: '🌟',
      requirement: 'Enviar primera contribución'
    },
    apprentice: {
      id: 'creator_apprentice',
      name: 'Creador Aprendiz',
      icon: '🎨',
      requirement: '1 par aprobado'
    },
    master: {
      id: 'creator_master',
      name: 'Maestro Creador',
      icon: '🖌️',
      requirement: '5 pares aprobados'
    },
    legend: {
      id: 'creator_legend',
      name: 'Leyenda Creativa',
      icon: '👑',
      requirement: '10 pares aprobados'
    },
    popular: {
      id: 'popular_creator',
      name: 'Creador Popular',
      icon: '🔥',
      requirement: '1000+ jugadas totales'
    },
    elite: {
      id: 'elite_creator',
      name: 'Elite',
      icon: '💎',
      requirement: 'Top 10 global'
    }
  };

  class ContributorDashboard {
    constructor() {
      this.container = document.getElementById('contributor-dashboard');
      if (!this.container) return;

      this.contributorData = this.loadContributorData();
      this.init();
    }

    init() {
      // Solo mostrar si el usuario es contribuidor
      if (!this.isContributor()) {
        this.container.style.display = 'none';
        return;
      }

      this.render();
      this.attachEventListeners();

      // Actualizar cada vez que cambian los puntos
      global.addEventListener('user:points-updated', () => this.render());
    }

    isContributor() {
      return this.contributorData.contributions.approved > 0 ||
             this.contributorData.contributions.pending > 0;
    }

    loadContributorData() {
      // Cargar datos del localStorage
      try {
        const saved = localStorage.getItem('contributorData');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}

      // Datos por defecto
      return {
        contributions: {
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0
        },
        stats: {
          totalPlays: 0,
          totalSuccesses: 0,
          averageSuccessRate: 0
        },
        ranking: {
          position: null,
          total: 100
        },
        badges: [],
        history: []
      };
    }

    saveContributorData() {
      try {
        localStorage.setItem('contributorData', JSON.stringify(this.contributorData));
      } catch (e) {
        console.error('Error saving contributor data:', e);
      }
    }

    calculateRanking() {
      // En producción, esto vendría del backend
      // Por ahora, calculamos basado en pares aprobados
      const approved = this.contributorData.contributions.approved;
      if (approved === 0) return null;

      // Simulación: cada par aprobado mejora el ranking
      const position = Math.max(1, 50 - (approved * 4));
      return position <= 10 ? position : position;
    }

    checkBadges() {
      const approved = this.contributorData.contributions.approved;
      const totalPlays = this.contributorData.stats.totalPlays;
      const ranking = this.calculateRanking();

      const newBadges = [];

      // Badges basados en pares aprobados
      if (approved >= 1 && !this.contributorData.badges.includes('creator_apprentice')) {
        newBadges.push('creator_apprentice');
      }
      if (approved >= 5 && !this.contributorData.badges.includes('creator_master')) {
        newBadges.push('creator_master');
      }
      if (approved >= 10 && !this.contributorData.badges.includes('creator_legend')) {
        newBadges.push('creator_legend');
      }

      // Badge por popularidad
      if (totalPlays >= 1000 && !this.contributorData.badges.includes('popular_creator')) {
        newBadges.push('popular_creator');
      }

      // Badge por ranking
      if (ranking && ranking <= 10 && !this.contributorData.badges.includes('elite_creator')) {
        newBadges.push('elite_creator');
      }

      // Agregar nuevos badges
      newBadges.forEach(badgeId => {
        if (!this.contributorData.badges.includes(badgeId)) {
          this.contributorData.badges.push(badgeId);
        }
      });

      return newBadges;
    }

    render() {
      const ranking = this.calculateRanking();
      const newBadges = this.checkBadges();

      // Obtener últimos 3 badges
      const recentBadges = this.contributorData.badges.slice(-3);

      this.container.innerHTML = `
        <div class="contributor-card patron-card">
          <div class="contributor-header patron-header">
            <h4>📊 Tu Estudio Creativo</h4>
          </div>

          <div class="contributor-stats patron-stats">
            <div class="stat-item">
              <span class="stat-label">Aprobados</span>
              <p class="stat-value">✅ ${this.contributorData.contributions.approved}</p>
            </div>
            <div class="stat-item">
              <span class="stat-label">En Revisión</span>
              <p class="stat-value">⏳ ${this.contributorData.contributions.pending}</p>
            </div>
            <div class="stat-item">
              <span class="stat-label">Ranking</span>
              <p class="stat-value">${ranking ? `🏆 #${ranking}` : '—'}</p>
            </div>
          </div>

          ${this.contributorData.stats.totalPlays > 0 ? `
          <div class="contributor-impact">
            <h5>📈 Impacto de tus Pares</h5>
            <div class="impact-stats">
              <div class="impact-item">
                <span class="impact-value">${this.contributorData.stats.totalPlays}</span>
                <span class="impact-label">jugadas totales</span>
              </div>
              <div class="impact-item">
                <span class="impact-value">${this.contributorData.stats.averageSuccessRate}%</span>
                <span class="impact-label">éxito promedio</span>
              </div>
            </div>
          </div>
          ` : ''}

          ${recentBadges.length > 0 ? `
          <div class="contributor-badges">
            <h5>🏆 Logros Recientes</h5>
            <div class="badges-earned">
              ${recentBadges.map(badgeId => {
                const badge = Object.values(CONTRIBUTOR_BADGES).find(b => b.id === badgeId);
                return badge ? `<span class="badge-icon" title="${badge.name}">${badge.icon}</span>` : '';
              }).join('')}
            </div>
          </div>
          ` : ''}

          <div class="contributor-actions">
            <button class="btn-secondary" id="view-contributions">
              📋 Ver Mis Contribuciones
            </button>
          </div>
        </div>
      `;

      // Notificar nuevos badges
      if (newBadges.length > 0) {
        this.showBadgeNotification(newBadges);
      }

      this.saveContributorData();
    }

    attachEventListeners() {
      const viewBtn = document.getElementById('view-contributions');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => this.openContributionsModal());
      }
    }

    openContributionsModal() {
      // Crear modal con todas las contribuciones
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content contributor-modal">
          <div class="modal-header">
            <h3>📋 Mis Contribuciones</h3>
            <button class="modal-close" id="close-contrib-modal">✕</button>
          </div>

          <div class="modal-body">
            <div class="contributions-summary">
              <div class="summary-stat">
                <span class="summary-value">${this.contributorData.contributions.approved}</span>
                <span class="summary-label">✅ Aprobados</span>
              </div>
              <div class="summary-stat">
                <span class="summary-value">${this.contributorData.contributions.pending}</span>
                <span class="summary-label">⏳ Pendientes</span>
              </div>
              <div class="summary-stat">
                <span class="summary-value">${this.contributorData.contributions.rejected}</span>
                <span class="summary-label">❌ Rechazados</span>
              </div>
            </div>

            <div class="contributions-list">
              <h4>Historial de Contribuciones</h4>
              ${this.contributorData.history.length > 0 ? `
                <div class="contribution-items">
                  ${this.contributorData.history.map(contrib => `
                    <div class="contribution-item status-${contrib.status}">
                      <div class="contrib-info">
                        <span class="contrib-name">${contrib.name}</span>
                        <span class="contrib-date">${new Date(contrib.date).toLocaleDateString()}</span>
                      </div>
                      <div class="contrib-meta">
                        <span class="contrib-difficulty">${contrib.difficulty}</span>
                        <span class="contrib-status">${this.getStatusLabel(contrib.status)}</span>
                      </div>
                      ${contrib.status === 'approved' && contrib.stats ? `
                        <div class="contrib-stats">
                          <span>${contrib.stats.plays} jugadas</span>
                          <span>${contrib.stats.successRate}% éxito</span>
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="empty-state">Aún no tienes contribuciones. ¡Crea tu primer par arriba!</p>
              `}
            </div>

            <div class="badges-showcase">
              <h4>🏆 Todos tus Logros</h4>
              <div class="badges-grid">
                ${Object.values(CONTRIBUTOR_BADGES).map(badge => {
                  const earned = this.contributorData.badges.includes(badge.id);
                  return `
                    <div class="badge-card ${earned ? 'earned' : 'locked'}">
                      <span class="badge-icon-large">${badge.icon}</span>
                      <span class="badge-name">${badge.name}</span>
                      <span class="badge-requirement">${badge.requirement}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Event listeners para cerrar
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'close-contrib-modal') {
          modal.classList.add('closing');
          setTimeout(() => modal.remove(), 300);
        }
      });

      // Animación de entrada
      setTimeout(() => modal.classList.add('show'), 10);
    }

    getStatusLabel(status) {
      const labels = {
        approved: '✅ Aprobado',
        pending: '⏳ En revisión',
        rejected: '❌ Rechazado'
      };
      return labels[status] || status;
    }

    showBadgeNotification(badgeIds) {
      badgeIds.forEach((badgeId, index) => {
        const badge = Object.values(CONTRIBUTOR_BADGES).find(b => b.id === badgeId);
        if (!badge) return;

        setTimeout(() => {
          const notification = document.createElement('div');
          notification.className = 'badge-notification';
          notification.innerHTML = `
            <div class="badge-notif-content">
              <span class="badge-notif-icon">${badge.icon}</span>
              <div class="badge-notif-text">
                <strong>¡Nuevo Logro!</strong>
                <span>${badge.name}</span>
              </div>
            </div>
          `;

          document.body.appendChild(notification);

          setTimeout(() => notification.classList.add('show'), 10);
          setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
          }, 4000);
        }, index * 500);
      });
    }

    // 📝 API pública para agregar contribución
    addContribution(pairData) {
      const contribution = {
        id: 'contrib_' + Date.now(),
        name: pairData.name || 'Par sin nombre',
        difficulty: pairData.difficulty,
        status: 'pending',
        date: Date.now(),
        stats: null
      };

      this.contributorData.history.unshift(contribution);
      this.contributorData.contributions.pending++;
      this.contributorData.contributions.total++;

      this.saveContributorData();
      this.render();

      return contribution.id;
    }

    // ✅ API pública para aprobar contribución
    approveContribution(contributionId, stats = null) {
      const contrib = this.contributorData.history.find(c => c.id === contributionId);
      if (!contrib) return;

      contrib.status = 'approved';
      contrib.stats = stats || { plays: 0, successRate: 0 };

      this.contributorData.contributions.pending--;
      this.contributorData.contributions.approved++;

      // Actualizar estadísticas totales
      if (stats) {
        this.contributorData.stats.totalPlays += stats.plays;
        this.contributorData.stats.totalSuccesses += Math.round(stats.plays * stats.successRate / 100);

        const totalAttempts = this.contributorData.stats.totalPlays;
        const totalSuccesses = this.contributorData.stats.totalSuccesses;
        this.contributorData.stats.averageSuccessRate = totalAttempts > 0
          ? Math.round((totalSuccesses / totalAttempts) * 100)
          : 0;
      }

      this.saveContributorData();
      this.render();
    }

    // ❌ API pública para rechazar contribución
    rejectContribution(contributionId, reason = '') {
      const contrib = this.contributorData.history.find(c => c.id === contributionId);
      if (!contrib) return;

      contrib.status = 'rejected';
      contrib.rejectionReason = reason;

      this.contributorData.contributions.pending--;
      this.contributorData.contributions.rejected++;

      this.saveContributorData();
      this.render();
    }
  }

  // Instancia global
  let dashboard = null;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      dashboard = new ContributorDashboard();
    });
  } else {
    dashboard = new ContributorDashboard();
  }

  // API pública
  global.ContributorDashboard = {
    addContribution: (pairData) => dashboard?.addContribution(pairData),
    approveContribution: (id, stats) => dashboard?.approveContribution(id, stats),
    rejectContribution: (id, reason) => dashboard?.rejectContribution(id, reason),
    getInstance: () => dashboard
  };

  console.log('📊 Contributor Dashboard cargado');

})(window);

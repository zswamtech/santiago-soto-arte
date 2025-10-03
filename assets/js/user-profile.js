/*
 * 👤 SISTEMA DE PERFIL DE USUARIO Y PUNTOS ACUMULATIVOS
 * Gestiona identidad, puntos permanentes, rangos y premios
 */

(function(global) {

  // 🎯 Configuración de rangos
  const RANKS = {
    aprendiz: { minPoints: 0, name: 'Aprendiz', icon: '🌱', discount: 0 },
    artista: { minPoints: 100, name: 'Artista', icon: '🎨', discount: 0 },
    pintor: { minPoints: 500, name: 'Pintor', icon: '🖌️', discount: 5 },
    maestro: { minPoints: 1000, name: 'Maestro', icon: '🎭', discount: 10 },
    granMaestro: { minPoints: 2500, name: 'Gran Maestro', icon: '👑', discount: 15 },
    leyenda: { minPoints: 5000, name: 'Leyenda', icon: '💎', discount: 20 }
  };

  // 🏆 Configuración de logros
  const ACHIEVEMENTS = {
    firstGame: { id: 'first_game', name: 'Primera Partida', icon: '🌟', points: 10 },
    perfect10: { id: 'perfect_10', name: 'Perfeccionista', icon: '🎯', points: 100 },
    streak10: { id: 'streak_10', name: 'Racha de Fuego', icon: '🔥', points: 200 },
    colorMaster: { id: 'color_master', name: 'Maestro del Color', icon: '🎨', points: 150 },
    ambassador: { id: 'ambassador', name: 'Embajador', icon: '👥', points: 500 },
    elite: { id: 'elite', name: 'Elite', icon: '💎', points: 1000 }
  };

  // 💾 Clase para manejar el perfil del usuario
  class UserProfile {
    constructor() {
      this.currentUser = null;
      this.init();
    }

    init() {
      // Cargar usuario existente o mostrar registro
      const saved = this.loadFromStorage();
      if (saved && saved.userId) {
        this.currentUser = saved;
      } else {
        // Usuario nuevo - mostrar formulario de registro al iniciar juego
        this.currentUser = this.createGuestProfile();
      }
    }

    // Crear perfil temporal de invitado
    createGuestProfile() {
      return {
        userId: 'guest_' + Date.now(),
        isGuest: true,
        profile: {
          name: 'Invitado',
          petName: null,
          email: null,
          registeredAt: Date.now()
        },
        stats: {
          totalPoints: 0,
          gamesPlayed: 0,
          perfectGames: 0,
          currentStreak: 0,
          longestStreak: 0,
          rank: 'aprendiz'
        },
        achievements: [],
        gameHistory: []
      };
    }

    // Registrar usuario con nombre y mascota
    register(name, petName, email = null) {
      if (!name || name.trim() === '') {
        return { success: false, error: 'El nombre es requerido' };
      }

      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      this.currentUser = {
        userId,
        isGuest: false,
        profile: {
          name: name.trim(),
          petName: petName ? petName.trim() : null,
          email: email ? email.trim() : null,
          registeredAt: Date.now()
        },
        stats: {
          totalPoints: 0,
          gamesPlayed: 0,
          perfectGames: 0,
          currentStreak: 0,
          longestStreak: 0,
          rank: 'aprendiz'
        },
        achievements: [],
        gameHistory: []
      };

      this.saveToStorage();
      this.awardAchievement('first_game'); // Logro por registrarse

      return { success: true, userId };
    }

    // Guardar partida y otorgar puntos
    saveGame(gameType, score, isPerfect = false) {
      if (!this.currentUser) return;

      // Calcular puntos ganados (basado en score del juego)
      let pointsEarned = Math.floor(score);

      // Bonus por juego perfecto
      if (isPerfect) {
        pointsEarned += 50;
        this.currentUser.stats.perfectGames++;
      }

      // Agregar al historial
      const gameRecord = {
        date: Date.now(),
        gameType,
        score,
        pointsEarned,
        isPerfect
      };

      this.currentUser.gameHistory.push(gameRecord);
      this.currentUser.stats.gamesPlayed++;
      this.currentUser.stats.totalPoints += pointsEarned;

      // Actualizar racha
      this.updateStreak();

      // Verificar logros
      this.checkAchievements();

      // Actualizar rango
      this.updateRank();

      // Guardar
      this.saveToStorage();

      // Disparar evento global
      try {
        global.dispatchEvent(new CustomEvent('user:points-updated', {
          detail: {
            totalPoints: this.currentUser.stats.totalPoints,
            pointsEarned,
            rank: this.currentUser.stats.rank
          }
        }));
      } catch (e) { }

      return {
        pointsEarned,
        totalPoints: this.currentUser.stats.totalPoints,
        newRank: this.getRankInfo(),
        newAchievements: []
      };
    }

    // Actualizar racha de días consecutivos
    updateStreak() {
      // TODO: Implementar lógica de racha (requiere fecha de última partida)
      const lastGame = this.currentUser.gameHistory[this.currentUser.gameHistory.length - 2];
      if (lastGame) {
        const daysSinceLastGame = Math.floor((Date.now() - lastGame.date) / (1000 * 60 * 60 * 24));
        if (daysSinceLastGame === 1) {
          this.currentUser.stats.currentStreak++;
          if (this.currentUser.stats.currentStreak > this.currentUser.stats.longestStreak) {
            this.currentUser.stats.longestStreak = this.currentUser.stats.currentStreak;
          }
        } else if (daysSinceLastGame > 1) {
          this.currentUser.stats.currentStreak = 1;
        }
      } else {
        this.currentUser.stats.currentStreak = 1;
      }
    }

    // Verificar logros desbloqueados
    checkAchievements() {
      const stats = this.currentUser.stats;

      // Perfeccionista: 10 partidas perfectas
      if (stats.perfectGames >= 10) {
        this.awardAchievement('perfect_10');
      }

      // Racha de fuego: 10 días consecutivos
      if (stats.currentStreak >= 10) {
        this.awardAchievement('streak_10');
      }

      // Elite: llegar a rango Leyenda
      if (stats.rank === 'leyenda') {
        this.awardAchievement('elite');
      }
    }

    // Otorgar logro
    awardAchievement(achievementId) {
      if (this.currentUser.achievements.includes(achievementId)) {
        return false; // Ya lo tiene
      }

      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) return false;

      this.currentUser.achievements.push(achievementId);
      this.currentUser.stats.totalPoints += achievement.points;

      try {
        global.dispatchEvent(new CustomEvent('user:achievement-unlocked', {
          detail: achievement
        }));
      } catch (e) { }

      return true;
    }

    // Actualizar rango según puntos
    updateRank() {
      const points = this.currentUser.stats.totalPoints;
      let newRank = 'aprendiz';

      for (const [key, rankData] of Object.entries(RANKS)) {
        if (points >= rankData.minPoints) {
          newRank = key;
        }
      }

      const oldRank = this.currentUser.stats.rank;
      this.currentUser.stats.rank = newRank;

      if (oldRank !== newRank) {
        try {
          global.dispatchEvent(new CustomEvent('user:rank-up', {
            detail: { oldRank, newRank, rankInfo: RANKS[newRank] }
          }));
        } catch (e) { }
      }
    }

    // Obtener información del rango actual
    getRankInfo() {
      return RANKS[this.currentUser.stats.rank];
    }

    // Obtener próximo rango
    getNextRank() {
      const currentPoints = this.currentUser.stats.totalPoints;
      const currentRank = this.currentUser.stats.rank;

      for (const [key, rankData] of Object.entries(RANKS)) {
        if (rankData.minPoints > currentPoints) {
          return {
            ...rankData,
            pointsNeeded: rankData.minPoints - currentPoints,
            progress: (currentPoints / rankData.minPoints) * 100
          };
        }
      }

      return null; // Ya es Leyenda
    }

    // Canjear premio
    claimReward(rewardId, pointsCost) {
      if (this.currentUser.stats.totalPoints < pointsCost) {
        return { success: false, error: 'Puntos insuficientes' };
      }

      this.currentUser.stats.totalPoints -= pointsCost;

      // Registrar recompensa canjeada
      if (!this.currentUser.rewards) {
        this.currentUser.rewards = { claimed: [] };
      }

      this.currentUser.rewards.claimed.push({
        rewardId,
        pointsCost,
        date: Date.now()
      });

      this.saveToStorage();

      return {
        success: true,
        remainingPoints: this.currentUser.stats.totalPoints
      };
    }

    // Guardar en localStorage
    saveToStorage() {
      try {
        localStorage.setItem('userProfile', JSON.stringify(this.currentUser));
      } catch (e) {
        console.error('Error saving user profile:', e);
      }
    }

    // Cargar de localStorage
    loadFromStorage() {
      try {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }

    // Obtener perfil actual
    getProfile() {
      return this.currentUser;
    }

    // Verificar si es invitado
    isGuest() {
      return this.currentUser?.isGuest === true;
    }
  }

  // Instancia global
  const userProfile = new UserProfile();

  // API pública
  global.UserProfile = {
    register: (name, petName, email) => userProfile.register(name, petName, email),
    saveGame: (gameType, score, isPerfect) => userProfile.saveGame(gameType, score, isPerfect),
    getProfile: () => userProfile.getProfile(),
    getRankInfo: () => userProfile.getRankInfo(),
    getNextRank: () => userProfile.getNextRank(),
    claimReward: (rewardId, pointsCost) => userProfile.claimReward(rewardId, pointsCost),
    isGuest: () => userProfile.isGuest(),
    getTotalPoints: () => userProfile.currentUser?.stats.totalPoints || 0,
    getAchievements: () => userProfile.currentUser?.achievements || [],
    RANKS,
    ACHIEVEMENTS
  };

  console.log('👤 Sistema de Perfil de Usuario cargado');

})(window);

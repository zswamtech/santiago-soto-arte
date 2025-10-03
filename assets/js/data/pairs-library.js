/*
 * 📚 BIBLIOTECA ESCALABLE DE PARES CREATIVOS
 * Sistema modular para agregar pares infinitamente
 * Soporta contribuciones de múltiples creadores
 */

(function(global) {

  // 🎯 Configuración global de puntuación
  const SCORING_CONFIG = {
    easy: { points: 10, penalty: 3 },
    medium: { points: 15, penalty: 5 },
    hard: { points: 25, penalty: 8 },
    expert: { points: 40, penalty: 12 }, // Nivel futuro
    bonusStreak: 5,
    bonusPerfect: 30 // Sin errores
  };

  // 🏆 Configuración de descuentos
  const DISCOUNT_CONFIG = {
    pointsPerDiscount: 50, // Cada 50 puntos = 5%
    discountPerStep: 5,    // 5% por paso
    maxDiscount: 20        // Máximo 20%
  };

  // 📚 Biblioteca principal de pares
  const PairsLibrary = {

    // Metadata de la biblioteca
    meta: {
      version: '1.0.0',
      totalPairs: 0,
      lastUpdated: Date.now(),
      contributors: []
    },

    // Colección de pares organizados por categoría
    categories: {

      // 🎨 Teoría del color
      colorTheory: {
        name: 'Teoría del Color',
        description: 'Mezclas de colores primarios y secundarios',
        icon: '🎨',
        pairs: []
      },

      // 🖌️ Técnicas de pintura
      techniques: {
        name: 'Técnicas de Pintura',
        description: 'Herramientas, métodos y estilos',
        icon: '🖌️',
        pairs: []
      },

      // 👨‍🎨 Pintores famosos
      painters: {
        name: 'Pintores Famosos',
        description: 'Artistas y sus obras icónicas',
        icon: '👨‍🎨',
        pairs: []
      },

      // 🎭 Emociones y arte
      emotions: {
        name: 'Emociones en Arte',
        description: 'Colores, formas y sentimientos',
        icon: '🎭',
        pairs: []
      },

      // 📐 Composición
      composition: {
        name: 'Composición Artística',
        description: 'Reglas y principios de diseño',
        icon: '📐',
        pairs: []
      },

      // 🌈 Naturaleza y arte
      nature: {
        name: 'Naturaleza en Arte',
        description: 'Elementos naturales y sus colores',
        icon: '🌈',
        pairs: []
      }
    },

    // 📊 Estadísticas de uso
    stats: {
      mostPlayed: {},
      successRate: {},
      contributorRanking: []
    },

    // 📈 Obtener estadísticas de un par específico
    getPairStats: function(pairId) {
      const plays = this.stats.mostPlayed[pairId] || 0;
      const successData = this.stats.successRate[pairId] || { attempts: 0, successes: 0 };
      const successRate = successData.attempts > 0
        ? Math.round((successData.successes / successData.attempts) * 100)
        : 0;

      return {
        plays,
        successRate
      };
    },

    // 📝 Registrar que un par fue jugado
    recordGameStats: function(pairId, wasSuccessful) {
      // Incrementar contador de jugadas
      if (!this.stats.mostPlayed[pairId]) {
        this.stats.mostPlayed[pairId] = 0;
      }
      this.stats.mostPlayed[pairId]++;

      // Actualizar tasa de éxito
      if (!this.stats.successRate[pairId]) {
        this.stats.successRate[pairId] = { attempts: 0, successes: 0 };
      }
      this.stats.successRate[pairId].attempts++;
      if (wasSuccessful) {
        this.stats.successRate[pairId].successes++;
      }

      // Guardar estadísticas en localStorage
      try {
        localStorage.setItem('pairsLibraryStats', JSON.stringify(this.stats));
      } catch (e) {
        console.warn('Could not save pair stats:', e);
      }
    },

    // 🔄 Cargar estadísticas desde localStorage
    loadStats: function() {
      try {
        const saved = localStorage.getItem('pairsLibraryStats');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.stats = { ...this.stats, ...parsed };
        }
      } catch (e) {
        console.warn('Could not load pair stats:', e);
      }
    }
  };

  // ➕ Función para agregar un nuevo par
  function addPair(categoryId, pairData) {
    // Validación de estructura
    if (!validatePair(pairData)) {
      console.error('❌ Par inválido:', pairData);
      return false;
    }

    // Asignar ID único si no existe
    if (!pairData.id) {
      pairData.id = generateUniqueId(categoryId);
    }

    // Agregar metadata
    pairData.meta = {
      createdAt: Date.now(),
      version: '1.0',
      approved: false, // Requiere aprobación
      ...pairData.meta
    };

    // Agregar a la categoría
    const category = PairsLibrary.categories[categoryId];
    if (!category) {
      console.error('❌ Categoría no existe:', categoryId);
      return false;
    }

    category.pairs.push(pairData);
    PairsLibrary.meta.totalPairs++;
    PairsLibrary.meta.lastUpdated = Date.now();

    // Registrar contribuidor
    if (pairData.contributor && !PairsLibrary.meta.contributors.includes(pairData.contributor)) {
      PairsLibrary.meta.contributors.push(pairData.contributor);
    }

    console.log('✅ Par agregado:', pairData.id, 'en categoría', categoryId);
    return true;
  }

  // 🔍 Validar estructura de un par
  function validatePair(pair) {
    const required = ['difficulty', 'card1', 'card2'];
    for (const field of required) {
      if (!pair[field]) {
        console.error(`❌ Campo requerido faltante: ${field}`);
        return false;
      }
    }

    // Validar dificultad
    if (!SCORING_CONFIG[pair.difficulty]) {
      console.error(`❌ Dificultad inválida: ${pair.difficulty}`);
      return false;
    }

    // Validar cards tienen type
    if (!pair.card1.type || !pair.card2.type) {
      console.error('❌ Cards deben tener type');
      return false;
    }

    return true;
  }

  // 🆔 Generar ID único
  function generateUniqueId(categoryId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${categoryId}_${timestamp}_${random}`;
  }

  // 🎲 Obtener pares aleatorios por dificultad
  function getRandomPairs(config = { easy: 4, medium: 4, hard: 2 }) {
    const selected = [];
    const allPairs = getAllApprovedPairs();

    // Agrupar por dificultad
    const byDifficulty = {
      easy: allPairs.filter(p => p.difficulty === 'easy'),
      medium: allPairs.filter(p => p.difficulty === 'medium'),
      hard: allPairs.filter(p => p.difficulty === 'hard')
    };

    // Seleccionar aleatoriamente
    for (const [difficulty, count] of Object.entries(config)) {
      const available = byDifficulty[difficulty] || [];
      const shuffled = shuffleArray([...available]);
      selected.push(...shuffled.slice(0, count));
    }

    return selected;
  }

  // 📋 Obtener todos los pares aprobados
  function getAllApprovedPairs() {
    const all = [];
    for (const category of Object.values(PairsLibrary.categories)) {
      const approved = category.pairs.filter(p => p.meta.approved === true);
      all.push(...approved);
    }
    return all;
  }

  // 🔀 Mezclar array
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 📊 Calcular puntuación
  function calculateScore(difficulty, hasStreak = false, isPerfect = false) {
    const config = SCORING_CONFIG[difficulty];
    let score = config.points;

    if (hasStreak) {
      score += SCORING_CONFIG.bonusStreak;
    }

    if (isPerfect) {
      score += SCORING_CONFIG.bonusPerfect;
    }

    return score;
  }

  // 💰 Calcular descuento según puntuación
  function calculateDiscount(totalScore) {
    const steps = Math.floor(totalScore / DISCOUNT_CONFIG.pointsPerDiscount);
    const discount = steps * DISCOUNT_CONFIG.discountPerStep;
    return Math.min(discount, DISCOUNT_CONFIG.maxDiscount);
  }

  // 📊 Registrar estadística de juego
  function recordGameStats(pairId, wasSuccessful) {
    if (!PairsLibrary.stats.mostPlayed[pairId]) {
      PairsLibrary.stats.mostPlayed[pairId] = { plays: 0, successes: 0 };
    }

    PairsLibrary.stats.mostPlayed[pairId].plays++;
    if (wasSuccessful) {
      PairsLibrary.stats.mostPlayed[pairId].successes++;
    }

    // Calcular tasa de éxito
    const stats = PairsLibrary.stats.mostPlayed[pairId];
    PairsLibrary.stats.successRate[pairId] = (stats.successes / stats.plays) * 100;
  }

  // 🏆 Obtener ranking de contribuidores
  function getContributorRanking() {
    const ranking = {};

    for (const category of Object.values(PairsLibrary.categories)) {
      for (const pair of category.pairs) {
        const contributor = pair.contributor || 'Anónimo';
        if (!ranking[contributor]) {
          ranking[contributor] = { pairs: 0, approved: 0, plays: 0 };
        }

        ranking[contributor].pairs++;
        if (pair.meta.approved) {
          ranking[contributor].approved++;
        }

        const stats = PairsLibrary.stats.mostPlayed[pair.id];
        if (stats) {
          ranking[contributor].plays += stats.plays;
        }
      }
    }

    // Convertir a array y ordenar
    return Object.entries(ranking)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.plays - a.plays);
  }

  // 💾 Exportar biblioteca a JSON
  function exportLibrary() {
    return JSON.stringify({
      meta: PairsLibrary.meta,
      categories: PairsLibrary.categories,
      config: {
        scoring: SCORING_CONFIG,
        discount: DISCOUNT_CONFIG
      }
    }, null, 2);
  }

  // 📥 Importar pares desde JSON
  function importPairs(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      for (const [categoryId, categoryData] of Object.entries(data.categories)) {
        if (PairsLibrary.categories[categoryId]) {
          for (const pair of categoryData.pairs) {
            addPair(categoryId, pair);
          }
        }
      }

      console.log('✅ Pares importados exitosamente');
      return true;
    } catch (e) {
      console.error('❌ Error al importar:', e);
      return false;
    }
  }

  // API pública
  const API = {
    // Gestión de pares
    addPair,
    getRandomPairs,
    getAllApprovedPairs,

    // Puntuación y descuentos
    calculateScore,
    calculateDiscount,
    getScoringConfig: () => SCORING_CONFIG,
    getDiscountConfig: () => DISCOUNT_CONFIG,

    // Estadísticas
    recordGameStats,
    getContributorRanking,
    getStats: () => PairsLibrary.stats,

    // Import/Export
    exportLibrary,
    importPairs,

    // Acceso directo
    library: PairsLibrary,
    categories: PairsLibrary.categories
  };

  // Exponer globalmente
  global.PairsLibrary = API;

  // Cargar estadísticas al inicializar
  PairsLibrary.loadStats();

  // 🧪 Crear datos de ejemplo para desarrollo (solo si no hay stats)
  if (Object.keys(PairsLibrary.stats.mostPlayed).length === 0) {
    // Agregar stats de ejemplo para el par de la comunidad
    PairsLibrary.stats.mostPlayed['color_purple_grapes'] = 247;
    PairsLibrary.stats.successRate['color_purple_grapes'] = {
      attempts: 247,
      successes: 198
    };

    // Guardar stats de ejemplo
    try {
      localStorage.setItem('pairsLibraryStats', JSON.stringify(PairsLibrary.stats));
    } catch (e) {}
  }

  console.log('📚 Biblioteca de Pares cargada');

})(window);

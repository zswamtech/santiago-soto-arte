/*
 * 🎨 SISTEMA DE PARES CREATIVOS E INTUITIVOS
 * Diseñado para ejercitar memoria y lógica visual
 * Niveles de dificultad: FÁCIL, MEDIO, DIFÍCIL
 */

(function(global) {

  const CreativePairs = {

    // 🖼️ OBRAS DE ARTE FAMOSAS (OPCIÓN A) - Imágenes reales integradas
    // Estos pares usan imágenes reales de fragmentos de obras famosas
    // Formato: { type: 'artwork-image', src: 'ruta/imagen.png', alt: 'descripción' }

    artworks_easy: [
      {
        id: 'art_noche_estrellada',
        difficulty: 'easy',
        category: 'famous-paintings',
        artist: 'Vincent van Gogh',
        artwork: 'La Noche Estrellada',
        year: 1889,
        card1: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_01_noche_estrellada_a.png',
          alt: 'Fragmento de La Noche Estrellada - Ciprés y pueblo iluminado'
        },
        card2: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_01_noche_estrellada_b.png',
          alt: 'Fragmento de La Noche Estrellada - Cielo con remolinos y luna'
        }
      },
      {
        id: 'color_mix_visual_azul_amarillo',
        difficulty: 'easy',
        category: 'color-theory-visual',
        artist: 'Teoría del Color',
        artwork: 'Mezcla Azul + Amarillo = Verde',
        year: null,
        card1: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_02_colores_amarillo_azul_a.png',
          alt: 'Mezcla visual de amarillo y azul con símbolo más'
        },
        card2: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_02_colores_amarillo_azul_b.png',
          alt: 'Resultado de mezcla: color verde'
        }
      },
      {
        id: 'color_mix_tubos_rojo_amarillo',
        difficulty: 'easy',
        category: 'color-theory-visual',
        artist: 'Teoría del Color',
        artwork: 'Mezcla Rojo + Amarillo = Naranja (Tubos de pintura)',
        year: null,
        card1: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_04_color_mix_a.png',
          alt: 'Tubos de pintura roja y amarilla mezclándose'
        },
        card2: {
          type: 'artwork-image',
          src: 'assets/img/memory-cards/par_04_color_mix_b.png',
          alt: 'Resultado de mezcla: color naranja'
        }
      }
    ],

    artworks_medium: [],
    artworks_hard: [],

    // 🎨 NIVEL FÁCIL: Mezclas de colores primarios (teoría del color básica)
    // Puntos: 8 por par
    easy: [
      // Mezcla de colores primarios
      {
        id: 'color_red_yellow',
        difficulty: 'easy',
        card1: {
          type: 'color-mix',
          colors: ['#FF0000', '#FFFF00'],
          labels: ['Rojo', 'Amarillo'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#FF8C00',
          name: 'Naranja'
        }
      },
      {
        id: 'color_blue_yellow',
        difficulty: 'easy',
        card1: {
          type: 'color-mix',
          colors: ['#0000FF', '#FFFF00'],
          labels: ['Azul', 'Amarillo'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#00FF00',
          name: 'Verde'
        }
      },
      {
        id: 'color_red_blue',
        difficulty: 'easy',
        card1: {
          type: 'color-mix',
          colors: ['#FF0000', '#0000FF'],
          labels: ['Rojo', 'Azul'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#8B00FF',
          name: 'Morado'
        }
      },
      // 🍊 Naranja visual (fruta) como resultado
      {
        id: 'color_orange_fruit',
        difficulty: 'easy',
        card1: {
          type: 'color-mix',
          colors: ['#FF0000', '#FFFF00'],
          labels: ['Rojo', 'Amarillo'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '🍊',
          size: 'xlarge',
          label: 'Naranja'
        }
      },
      // 🍇 Uvas moradas como resultado de rojo + azul (EJEMPLO: Contribución de la comunidad)
      {
        id: 'color_purple_grapes',
        difficulty: 'easy',
        // 👤 Información del creador (ejemplo)
        creator: {
          name: 'María García',
          country: 'Colombia',
          userId: 'user_maria_123'
        },
        pairId: 'color_purple_grapes', // ID para tracking de stats
        card1: {
          type: 'color-mix',
          colors: ['#FF0000', '#0000FF'],
          labels: ['Rojo', 'Azul'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '🍇',
          size: 'xlarge',
          label: 'Uvas'
        }
      }
    ],

    // 🧩 NIVEL MEDIO: Mezclas de colores secundarios + objetos naturales
    // Puntos: 15 por par
    medium: [
      // Verde + elementos naturales verdes
      {
        id: 'color_green_leaf',
        difficulty: 'medium',
        card1: {
          type: 'color-mix',
          colors: ['#0000FF', '#FFFF00'],
          labels: ['Azul', 'Amarillo'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '🍃',
          size: 'xlarge',
          label: 'Hoja Verde'
        }
      },
      // Marrón/Café (tonos tierra en pintura)
      {
        id: 'color_brown_earth',
        difficulty: 'medium',
        card1: {
          type: 'color-mix',
          colors: ['#FF8C00', '#000000'],
          labels: ['Naranja', 'Negro'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#8B4500',
          name: 'Café'
        }
      },
      // Rosa (mezcla rojo + blanco)
      {
        id: 'color_pink_flower',
        difficulty: 'medium',
        card1: {
          type: 'color-mix',
          colors: ['#FF0000', '#FFFFFF'],
          labels: ['Rojo', 'Blanco'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '🌸',
          size: 'xlarge',
          label: 'Flor Rosa'
        }
      },
      // Gris (blanco + negro)
      {
        id: 'color_gray_cloud',
        difficulty: 'medium',
        card1: {
          type: 'color-mix',
          colors: ['#FFFFFF', '#000000'],
          labels: ['Blanco', 'Negro'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '☁️',
          size: 'xlarge',
          label: 'Nube Gris'
        }
      }
    ],

    // 🔥 NIVEL DIFÍCIL: Colores complementarios + tonalidades complejas
    // Puntos: 25 por par
    hard: [
      // Azul oscuro (azul + negro) - sombras en pintura
      {
        id: 'color_dark_blue',
        difficulty: 'hard',
        card1: {
          type: 'color-mix',
          colors: ['#0000FF', '#000000'],
          labels: ['Azul', 'Negro'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#00008B',
          name: 'Azul Oscuro'
        }
      },
      // Verde oscuro (verde + negro) - follaje en sombra
      {
        id: 'color_dark_green',
        difficulty: 'hard',
        card1: {
          type: 'color-mix',
          colors: ['#00FF00', '#000000'],
          labels: ['Verde', 'Negro'],
          operator: '+'
        },
        card2: {
          type: 'color-result',
          color: '#006400',
          name: 'Verde Oscuro'
        }
      },
      // Melocotón (naranja + blanco) - tonos piel
      {
        id: 'color_peach_skin',
        difficulty: 'hard',
        card1: {
          type: 'color-mix',
          colors: ['#FF8C00', '#FFFFFF'],
          labels: ['Naranja', 'Blanco'],
          operator: '+'
        },
        card2: {
          type: 'emoji-single',
          emoji: '🍑',
          size: 'xlarge',
          label: 'Melocotón'
        }
      }
    ]
  };

  // Función helper para obtener pares aleatorios por dificultad
  // Soporta mezcla de pares de colores y obras de arte
  CreativePairs.getRandomPairs = function(easy = 4, medium = 4, hard = 2) {
    const selected = [];

    // Combinar pares de colores con obras de arte (cuando estén disponibles)
    const easyPool = [...this.easy];
    if (this.artworks_easy && this.artworks_easy.length > 0) {
      easyPool.push(...this.artworks_easy);
    }

    const mediumPool = [...this.medium];
    if (this.artworks_medium && this.artworks_medium.length > 0) {
      mediumPool.push(...this.artworks_medium);
    }

    const hardPool = [...this.hard];
    if (this.artworks_hard && this.artworks_hard.length > 0) {
      hardPool.push(...this.artworks_hard);
    }

    // Seleccionar pares fáciles aleatorios
    const easyShuffled = [...easyPool].sort(() => Math.random() - 0.5);
    selected.push(...easyShuffled.slice(0, easy));

    // Seleccionar pares medios aleatorios
    const mediumShuffled = [...mediumPool].sort(() => Math.random() - 0.5);
    selected.push(...mediumShuffled.slice(0, medium));

    // Seleccionar pares difíciles aleatorios
    const hardShuffled = [...hardPool].sort(() => Math.random() - 0.5);
    selected.push(...hardShuffled.slice(0, hard));

    return selected;
  };

  // Exponer globalmente
  global.CreativePairs = CreativePairs;

})(window);

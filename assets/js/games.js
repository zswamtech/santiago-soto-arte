// 🎮 Juegos interactivos para Santiago Soto Arte
// Sistema de gamificación para motivar al joven artista

class ArtGames {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.achievements = [];
        // 🎨 Teoría de color EXPANDIDA para el juego de mezclas
        this.colorTheory = {
            primary: {
                red: { hex: '#FF0000', name: 'Rojo', rgb: [255, 0, 0] },
                blue: { hex: '#0000FF', name: 'Azul', rgb: [0, 0, 255] },
                yellow: { hex: '#FFFF00', name: 'Amarillo', rgb: [255, 255, 0] }
            },
            secondary: {
                orange: { hex: '#FF8C00', name: 'Naranja', rgb: [255, 140, 0] },
                green: { hex: '#00FF00', name: 'Verde', rgb: [0, 255, 0] },
                purple: { hex: '#8B00FF', name: 'Púrpura', rgb: [139, 0, 255] }
            },
            tertiary: {
                vermillion: { hex: '#E34234', name: 'Bermellón', rgb: [227, 66, 52] },
                amber: { hex: '#FFBF00', name: 'Ámbar', rgb: [255, 191, 0] },
                chartreuse: { hex: '#7FFF00', name: 'Verde Lima', rgb: [127, 255, 0] },
                teal: { hex: '#008B8B', name: 'Verde Azulado', rgb: [0, 139, 139] },
                violet: { hex: '#8A2BE2', name: 'Violeta', rgb: [138, 43, 226] },
                rose: { hex: '#FF007F', name: 'Rosa Magenta', rgb: [255, 0, 127] }
            },
            earth: {
                sienna: { hex: '#A0522D', name: 'Siena', rgb: [160, 82, 45] },
                umber: { hex: '#635147', name: 'Tierra Sombra', rgb: [99, 81, 71] },
                ochre: { hex: '#CC7722', name: 'Ocre', rgb: [204, 119, 34] },
                terracotta: { hex: '#E2725B', name: 'Terracota', rgb: [226, 114, 91] },
                olive: { hex: '#808000', name: 'Verde Oliva', rgb: [128, 128, 0] },
                khaki: { hex: '#C3B091', name: 'Caqui', rgb: [195, 176, 145] }
            },
            neutral: {
                black: { hex: '#000000', name: 'Negro', rgb: [0, 0, 0] },
                white: { hex: '#FFFFFF', name: 'Blanco', rgb: [255, 255, 255] },
                gray: { hex: '#808080', name: 'Gris', rgb: [128, 128, 128] },
                warmgray: { hex: '#8B8680', name: 'Gris Cálido', rgb: [139, 134, 128] },
                coolgray: { hex: '#8C92AC', name: 'Gris Frío', rgb: [140, 146, 172] }
            },
            advanced: {
                maroon: { hex: '#800000', name: 'Granate', rgb: [128, 0, 0] },
                navy: { hex: '#000080', name: 'Azul Marino', rgb: [0, 0, 128] },
                indigo: { hex: '#4B0082', name: 'Índigo', rgb: [75, 0, 130] },
                crimson: { hex: '#DC143C', name: 'Carmesí', rgb: [220, 20, 60] },
                turquoise: { hex: '#40E0D0', name: 'Turquesa', rgb: [64, 224, 208] },
                coral: { hex: '#FF7F50', name: 'Coral', rgb: [255, 127, 80] },
                peach: { hex: '#FFE5B4', name: 'Durazno', rgb: [255, 229, 180] },
                mint: { hex: '#98FF98', name: 'Menta', rgb: [152, 255, 152] },
                lavender: { hex: '#E6E6FA', name: 'Lavanda', rgb: [230, 230, 250] },
                burgundy: { hex: '#800020', name: 'Borgoña', rgb: [128, 0, 32] }
            },
            skin: {
                lightskin: { hex: '#FFDFC4', name: 'Piel Clara', rgb: [255, 223, 196] },
                mediumskin: { hex: '#D4A574', name: 'Piel Media', rgb: [212, 165, 116] },
                darkskin: { hex: '#8D5524', name: 'Piel Oscura', rgb: [141, 85, 36] }
            }
        };

        // 🧪 Fórmulas de mezcla EXPANDIDAS (50+ combinaciones)
        this.colorMixtures = [
            // ========== NIVEL 1: BÁSICO (Primarios → Secundarios) ==========
            {
                color1: 'red', color2: 'yellow', result: 'orange',
                explanation: 'Rojo + Amarillo = Naranja. Esta es una de las mezclas secundarias fundamentales.',
                tip: 'Más rojo da un naranja rojizo, más amarillo da un naranja dorado',
                difficulty: 'easy', level: 1
            },
            {
                color1: 'blue', color2: 'yellow', result: 'green',
                explanation: 'Azul + Amarillo = Verde. El verde es el color de la naturaleza.',
                tip: 'Más azul da verde esmeralda, más amarillo da verde lima',
                difficulty: 'easy', level: 1
            },
            {
                color1: 'red', color2: 'blue', result: 'purple',
                explanation: 'Rojo + Azul = Púrpura. Color de realeza y misticismo.',
                tip: 'Más azul da violeta, más rojo da magenta',
                difficulty: 'easy', level: 1
            },

            // ========== NIVEL 2: INTERMEDIO (Primarios + Secundarios → Terciarios) ==========
            {
                color1: 'red', color2: 'orange', result: 'vermillion',
                explanation: 'Rojo + Naranja = Bermellón. Un rojo anaranjado vibrante usado en el arte tradicional.',
                tip: 'Color cálido perfecto para atardeceres',
                difficulty: 'medium', level: 2
            },
            {
                color1: 'yellow', color2: 'orange', result: 'amber',
                explanation: 'Amarillo + Naranja = Ámbar. Color dorado y luminoso.',
                tip: 'Ideal para capturar luz solar',
                difficulty: 'medium', level: 2
            },
            {
                color1: 'yellow', color2: 'green', result: 'chartreuse',
                explanation: 'Amarillo + Verde = Verde Lima. Color vibrante y energético.',
                tip: 'Perfecto para hojas primaverales',
                difficulty: 'medium', level: 2
            },
            {
                color1: 'blue', color2: 'green', result: 'teal',
                explanation: 'Azul + Verde = Verde Azulado (Teal). Color fresco y oceánico.',
                tip: 'Excelente para agua y cielos',
                difficulty: 'medium', level: 2
            },
            {
                color1: 'blue', color2: 'purple', result: 'violet',
                explanation: 'Azul + Púrpura = Violeta. Color profundo y místico.',
                tip: 'Usado en sombras y flores',
                difficulty: 'medium', level: 2
            },
            {
                color1: 'red', color2: 'purple', result: 'rose',
                explanation: 'Rojo + Púrpura = Rosa Magenta. Color intenso y expresivo.',
                tip: 'Perfecto para flores vibrantes',
                difficulty: 'medium', level: 2
            },

            // ========== NIVEL 3: COLORES CON NEUTROS ==========
            {
                color1: 'red', color2: 'black', result: 'maroon',
                explanation: 'Rojo + Negro = Granate. Un rojo oscuro y profundo.',
                tip: 'El negro crea "sombras" (shades) oscureciendo el color',
                difficulty: 'medium', level: 3
            },
            {
                color1: 'blue', color2: 'black', result: 'navy',
                explanation: 'Azul + Negro = Azul Marino. Color profundo del océano.',
                tip: 'Perfecto para cielos nocturnos',
                difficulty: 'medium', level: 3
            },
            {
                color1: 'red', color2: 'white', result: 'coral',
                explanation: 'Rojo + Blanco = Coral. Un rojo suavizado y delicado.',
                tip: 'El blanco crea "tintes" (tints) aclarando el color',
                difficulty: 'medium', level: 3
            },
            {
                color1: 'purple', color2: 'white', result: 'lavender',
                explanation: 'Púrpura + Blanco = Lavanda. Color suave y relajante.',
                tip: 'Ideal para tonos pastel',
                difficulty: 'medium', level: 3
            },
            {
                color1: 'green', color2: 'white', result: 'mint',
                explanation: 'Verde + Blanco = Menta. Verde claro y fresco.',
                tip: 'Perfecto para hojas jóvenes',
                difficulty: 'medium', level: 3
            },

            // ========== NIVEL 4: COLORES TIERRA ==========
            {
                color1: 'red', color2: 'yellow', result: 'ochre',
                explanation: 'Rojo + Amarillo (más tierra) = Ocre. Color natural y terroso.',
                tip: 'Con un poco de negro se vuelve más tierra',
                difficulty: 'hard', level: 4,
                customResult: { hex: '#CC7722', name: 'Ocre', rgb: [204, 119, 34] }
            },
            {
                color1: 'orange', color2: 'black', result: 'sienna',
                explanation: 'Naranja + Negro = Siena. Color tierra cálido usado por siglos.',
                tip: 'Base perfecta para retratos',
                difficulty: 'hard', level: 4,
                customResult: { hex: '#A0522D', name: 'Siena', rgb: [160, 82, 45] }
            },
            {
                color1: 'yellow', color2: 'black', result: 'olive',
                explanation: 'Amarillo + Negro = Verde Oliva. Verde apagado y natural.',
                tip: 'Muy usado en paisajes',
                difficulty: 'hard', level: 4,
                customResult: { hex: '#808000', name: 'Verde Oliva', rgb: [128, 128, 0] }
            },
            {
                color1: 'orange', color2: 'gray', result: 'terracotta',
                explanation: 'Naranja + Gris = Terracota. Color de arcilla cocida.',
                tip: 'El gris "apaga" colores creando tonos naturales',
                difficulty: 'hard', level: 4,
                customResult: { hex: '#E2725B', name: 'Terracota', rgb: [226, 114, 91] }
            },

            // ========== NIVEL 5: COLORES COMPLEJOS ==========
            {
                color1: 'purple', color2: 'black', result: 'indigo',
                explanation: 'Púrpura + Negro = Índigo. Azul profundo místico.',
                tip: 'Color entre azul y violeta',
                difficulty: 'hard', level: 5,
                customResult: { hex: '#4B0082', name: 'Índigo', rgb: [75, 0, 130] }
            },
            {
                color1: 'red', color2: 'gray', result: 'crimson',
                explanation: 'Rojo + Gris = Carmesí. Rojo apagado y elegante.',
                tip: 'Más sofisticado que el rojo puro',
                difficulty: 'hard', level: 5,
                customResult: { hex: '#DC143C', name: 'Carmesí', rgb: [220, 20, 60] }
            },
            {
                color1: 'teal', color2: 'white', result: 'turquoise',
                explanation: 'Verde Azulado + Blanco = Turquesa. Color de aguas tropicales.',
                tip: 'Color vibrante y refrescante',
                difficulty: 'hard', level: 5,
                customResult: { hex: '#40E0D0', name: 'Turquesa', rgb: [64, 224, 208] }
            },
            {
                color1: 'red', color2: 'purple', result: 'burgundy',
                explanation: 'Rojo + Púrpura (más negro) = Borgoña. Rojo vino profundo.',
                tip: 'Color de vino tinto',
                difficulty: 'hard', level: 5,
                customResult: { hex: '#800020', name: 'Borgoña', rgb: [128, 0, 32] }
            },

            // ========== NIVEL 6: TONOS DE PIEL (MUY IMPORTANTE PARA SANTIAGO) ==========
            {
                color1: 'orange', color2: 'white', result: 'lightskin',
                explanation: 'Naranja + Blanco = Base de Piel Clara. Fundamental para retratos.',
                tip: 'Agrega un toque de rojo para más calidez',
                difficulty: 'hard', level: 6,
                customResult: { hex: '#FFDFC4', name: 'Piel Clara', rgb: [255, 223, 196] }
            },
            {
                color1: 'sienna', color2: 'white', result: 'mediumskin',
                explanation: 'Siena + Blanco = Base de Piel Media. Tono intermedio cálido.',
                tip: 'Varía la proporción para diferentes tonos',
                difficulty: 'hard', level: 6,
                customResult: { hex: '#D4A574', name: 'Piel Media', rgb: [212, 165, 116] }
            },
            {
                color1: 'sienna', color2: 'umber', result: 'darkskin',
                explanation: 'Siena + Tierra Sombra = Base de Piel Oscura. Tono cálido profundo.',
                tip: 'Los tonos de piel siempre son cálidos, nunca grises puros',
                difficulty: 'hard', level: 6,
                customResult: { hex: '#8D5524', name: 'Piel Oscura', rgb: [141, 85, 36] }
            },

            // ========== BONOS: MÁS COMBINACIONES INTERMEDIAS ==========
            {
                color1: 'green', color2: 'gray', result: 'olive',
                explanation: 'Verde + Gris = Verde Oliva (alternativa). Tono natural apagado.',
                tip: 'Perfecto para follaje otoñal',
                difficulty: 'medium', level: 3,
                customResult: { hex: '#808000', name: 'Verde Oliva', rgb: [128, 128, 0] }
            },
            {
                color1: 'yellow', color2: 'white', result: 'peach',
                explanation: 'Amarillo + Blanco (con toque de rojo) = Durazno. Tono pastel cálido.',
                tip: 'Base para tonos de piel muy claros',
                difficulty: 'medium', level: 3,
                customResult: { hex: '#FFE5B4', name: 'Durazno', rgb: [255, 229, 180] }
            },
            {
                color1: 'blue', color2: 'gray', result: 'coolgray',
                explanation: 'Azul + Gris = Gris Frío. Gris con temperatura fría.',
                tip: 'Los grises nunca son neutros puros, siempre tienen temperatura',
                difficulty: 'medium', level: 4,
                customResult: { hex: '#8C92AC', name: 'Gris Frío', rgb: [140, 146, 172] }
            },
            {
                color1: 'orange', color2: 'gray', result: 'warmgray',
                explanation: 'Naranja + Gris = Gris Cálido. Gris con temperatura cálida.',
                tip: 'Usado en sombras cálidas',
                difficulty: 'medium', level: 4,
                customResult: { hex: '#8B8680', name: 'Gris Cálido', rgb: [139, 134, 128] }
            }
        ];

        this.colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];

        // 🐾 Base de datos expandida de animales con múltiples imágenes por raza
        this.animalCategories = {
            dogs: {
                name: 'Perros',
                emoji: '🐶',
                difficulty: 'medium',
                animals: [
                    {
                        name: 'Golden Retriever',
                        emoji: '🐕',
                        images: [
                            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Bulldog Francés',
                        emoji: '🐶',
                        images: [
                            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1549717064-b5b5b75589ca?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Pastor Alemán',
                        emoji: '🐕',
                        images: [
                            'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Labrador',
                        emoji: '🐶',
                        images: [
                            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Husky Siberiano',
                        emoji: '🐕',
                        images: [
                            'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Border Collie',
                        emoji: '🐶',
                        images: [
                            'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Beagle',
                        emoji: '🐶',
                        images: [
                            'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Poodle',
                        emoji: '🐩',
                        images: [
                            'https://images.unsplash.com/photo-1616190260687-b7ebf74727be?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            },
            cats: {
                name: 'Gatos',
                emoji: '🐱',
                difficulty: 'medium',
                animals: [
                    {
                        name: 'Persa',
                        emoji: '🐈',
                        images: [
                            'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Siamés',
                        emoji: '🐱',
                        images: [
                            'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Maine Coon',
                        emoji: '🐈',
                        images: [
                            'https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Bengalí',
                        emoji: '🐱',
                        images: [
                            'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Ragdoll',
                        emoji: '🐈',
                        images: [
                            'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1596854307809-6e791d9470fb?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Británico',
                        emoji: '🐱',
                        images: [
                            'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1557246865-dd6670e59771?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Sphynx',
                        emoji: '🐱',
                        images: [
                            'https://images.unsplash.com/photo-1593134257782-e18fd2619e2e?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Ruso Azul',
                        emoji: '🐈',
                        images: [
                            'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1567270671170-fdc10a5bf831?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            },
            horses: {
                name: 'Caballos',
                emoji: '🐎',
                difficulty: 'hard',
                animals: [
                    {
                        name: 'Pura Sangre',
                        emoji: '🐎',
                        images: [
                            'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Andaluz',
                        emoji: '🐴',
                        images: [
                            'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Mustang',
                        emoji: '🐎',
                        images: [
                            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1516627145497-ae4c1ba5e889?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Clídesdale',
                        emoji: '🐴',
                        images: [
                            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Frisón',
                        emoji: '🐎',
                        images: [
                            'https://images.unsplash.com/photo-1598298369380-b16fcde61566?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1567594567098-93a61b6ce2e5?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Appalosa',
                        emoji: '🐴',
                        images: [
                            'https://images.unsplash.com/photo-1602491282087-ac63c2e975ad?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1616781049963-f9e1aeeab040?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            },
            birds: {
                name: 'Aves',
                emoji: '🐦',
                difficulty: 'medium',
                animals: [
                    {
                        name: 'Canario',
                        emoji: '🐥',
                        images: [
                            'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Loro Africano',
                        emoji: '🦜',
                        images: [
                            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Cockatiel',
                        emoji: '🐦',
                        images: [
                            'https://images.unsplash.com/photo-1611689342806-0863700ce1dd?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Periquito',
                        emoji: '🦜',
                        images: [
                            'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Guacamayo',
                        emoji: '🐦',
                        images: [
                            'https://images.unsplash.com/photo-1534604973900-c43ab4c2e2ab?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Agapornis',
                        emoji: '🦜',
                        images: [
                            'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            },
            fish: {
                name: 'Peces',
                emoji: '🐟',
                difficulty: 'easy',
                animals: [
                    {
                        name: 'Betta',
                        emoji: '🐠',
                        images: [
                            'https://images.unsplash.com/photo-1520637836862-4d197d17c15a?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Goldfish',
                        emoji: '🐟',
                        images: [
                            'https://images.unsplash.com/photo-1565206077212-4bc12d4d2d7c?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1527097779432-57b1a2c6fb40?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Guppy',
                        emoji: '🐠',
                        images: [
                            'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Pez Ángel',
                        emoji: '🐟',
                        images: [
                            'https://images.unsplash.com/photo-1533460004989-cef01064af7e?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Teón',
                        emoji: '🐠',
                        images: [
                            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Disco',
                        emoji: '🐟',
                        images: [
                            'https://images.unsplash.com/photo-1520637836862-4d197d17c15a?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1533460004989-cef01064af7e?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            },
            reptiles: {
                name: 'Reptiles',
                emoji: '🦎',
                difficulty: 'hard',
                animals: [
                    {
                        name: 'Iguana Verde',
                        emoji: '🦎',
                        images: [
                            'https://images.unsplash.com/photo-1568393691622-c704ba503aad?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1601738881400-5cfd9f882b07?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Geco',
                        emoji: '🦎',
                        images: [
                            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1601738881400-5cfd9f882b07?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Dragón Barbudo',
                        emoji: '🦎',
                        images: [
                            'https://images.unsplash.com/photo-1567594567098-93a61b6ce2e5?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1568393691622-c704ba503aad?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Tortuga Rusa',
                        emoji: '🐢',
                        images: [
                            'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1606192998551-2d4b11ad0110?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Caméleon',
                        emoji: '🦎',
                        images: [
                            'https://images.unsplash.com/photo-1598298369380-b16fcde61566?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=300&h=300&fit=crop'
                        ]
                    },
                    {
                        name: 'Pitón Real',
                        emoji: '🐍',
                        images: [
                            'https://images.unsplash.com/photo-1516627145497-ae4c1ba5e889?w=300&h=300&fit=crop',
                            'https://images.unsplash.com/photo-1601738881400-5cfd9f882b07?w=300&h=300&fit=crop'
                        ]
                    }
                ]
            }
        };

        this.selectedCategory = null;
        this.init();
    }

    init() {
        this.createGameInterface();
        this.loadProgress();
    }

    // 🧪 Juego: Laboratorio de Mezclas de Color
    colorMixingGame() {
        const gameContainer = document.getElementById('game-container');

        // Determinar nivel desbloqueado real por puntuación
        const unlockedLevel = this.getUnlockedMixingLevel();

        // Filtrar mezclas por nivel desbloqueado y distribuir dificultad progresiva
        const availableMixtures = this.colorMixtures.filter(m => m.level <= unlockedLevel);
        const currentMixture = availableMixtures[Math.floor(Math.random() * availableMixtures.length)];

        // Guardar estado actual para manejo de intentos y penalización
        this.currentMixingChallenge = {
            mixture: currentMixture,
            attempts: 0,
            unlockedLevel
        };

        const color1Data = this.getColorData(currentMixture.color1);
        const color2Data = this.getColorData(currentMixture.color2);
        const resultData = this.getResultColorData(currentMixture);
        const wrongOptions = this.generateSmartWrongOptions(resultData, currentMixture, unlockedLevel);
        const allOptions = [resultData, ...wrongOptions].sort(() => Math.random() - 0.5);

        const progress = this.getProgressToNextLevel(unlockedLevel);
        const difficultyLabel = this.getDifficultyLabel(currentMixture.difficulty);

        gameContainer.innerHTML = `
            <div class="color-mixing-game">
                <div class="mixing-header">
                    <h3>🧪 Laboratorio de Mezclas</h3>
                    <div class="level-info">
                        <span class="badge level-badge">Nivel ${unlockedLevel}</span>
                        <span class="badge difficulty-${currentMixture.difficulty}">${difficultyLabel}</span>
                    </div>
                </div>
                <div class="level-progress-bar">
                    <div class="level-progress-fill" style="width:${progress.percent}%"></div>
                    <div class="level-progress-label">${progress.label}</div>
                </div>
                <div class="mixing-question">
                    <p class="question-text">¿Qué color se forma al mezclar?</p>
                    <div class="color-combination">
                        <div class="source-color">
                            <div class="color-sample" style="background-color:${color1Data.hex}"></div>
                            <span class="color-name">${color1Data.name}</span>
                        </div>
                        <div class="mixing-symbol">+</div>
                        <div class="source-color">
                            <div class="color-sample" style="background-color:${color2Data.hex}"></div>
                            <span class="color-name">${color2Data.name}</span>
                        </div>
                        <div class="mixing-symbol">=</div>
                        <div class="result-placeholder">?</div>
                    </div>
                </div>
                <div class="color-options-grid">
                    ${allOptions.map((option, idx) => `
                        <button class="color-option-btn" data-option-index="${idx}" onclick="artGames.checkColorMixing('${option.name}')">
                            <div class="color-sample" style="background-color:${option.hex}"></div>
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
                        <span class="stat-label">Intentos</span>
                        <span class="stat-value attempts-value">0</span>
                    </div>
                </div>
                <div class="color-theory-tip">
                    <h4>💡 Tip de Santiago</h4>
                    <p>${this.getColorTheoryTip(currentMixture)}</p>
                </div>
                <div class="mixing-footer">
                    <button class="back-to-menu-btn" onclick="artGames.showGameMenu()">Menú 🏠</button>
                </div>
            </div>
        `;
    }

    // 🎨 Función auxiliar para obtener datos de color por clave técnica
    getColorData(colorName) {
        const categories = Object.keys(this.colorTheory);
        for (let category of categories) {
            if (this.colorTheory[category][colorName]) {
                return this.colorTheory[category][colorName];
            }
        }
        return { hex: '#000000', name: 'Desconocido', rgb: [0, 0, 0] };
    }

    // 🔍 Buscar color por nombre (en español) para comparación
    findColorByDisplayName(displayName) {
        const categories = Object.keys(this.colorTheory);
        for (let category of categories) {
            for (let key in this.colorTheory[category]) {
                if (this.colorTheory[category][key].name === displayName) {
                    return this.colorTheory[category][key];
                }
            }
        }
        return null;
    }

    getResultColorData(mixture) {
        if (mixture.customResult) {
            return mixture.customResult;
        }
        return this.getColorData(mixture.result);
    }

    // 🎯 Generar opciones incorrectas inteligentes (ahora con niveles)
    generateSmartWrongOptions(correctResult, mixture, unlockedLevel) {
        const allColors = Object.values(this.colorTheory).flatMap(category => Object.values(category));
        const pool = allColors.filter(c => c.name !== correctResult.name);

        // Estrategia basada en dificultad + nivel
        const difficulty = mixture.difficulty;
        let candidates;
        if (difficulty === 'easy') {
            // Diferentes en categoría (elegir primarios/secundarios contrastantes)
            candidates = pool.filter(c => ['Rojo','Azul','Amarillo','Verde','Naranja','Púrpura'].includes(c.name));
        } else if (difficulty === 'medium') {
            // Colores cercanos en matiz (terciarios relacionados)
            candidates = pool.filter(c => ['Ámbar','Verde Lima','Bermellón','Violeta','Rosa Magenta','Verde Azulado','Lavanda','Turquesa','Menta'].includes(c.name));
        } else {
            // Avanzado: similar en temperatura / valor
            candidates = pool.filter(c => ['Gris Cálido','Gris Frío','Borgoña','Granate','Índigo','Carmesí','Siena','Ocre','Terracota','Verde Oliva','Piel Media','Piel Oscura'].includes(c.name));
        }

        if (!candidates || candidates.length < 3) candidates = pool; // fallback

        // Mezclar y tomar 3
        const wrong = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
        return wrong;
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

    checkColorMixing(selectedDisplayName) {
        if (!this.currentMixingChallenge) return;
        const state = this.currentMixingChallenge;
        state.attempts++;
        const mixture = state.mixture;
        const correctColor = this.getResultColorData(mixture);
        const isCorrect = selectedDisplayName === correctColor.name;

        // Actualizar intentos en UI
        const attemptsEl = document.querySelector('.attempts-value');
        if (attemptsEl) attemptsEl.textContent = state.attempts;

        if (isCorrect) {
            const base = 10 + (mixture.level * 5);
            const penalty = (state.attempts - 1) * 5;
            const earned = Math.max(5, base - penalty);
            this.score += earned;

            // Recalcular nivel desbloqueado después de sumar
            const prevUnlocked = state.unlockedLevel;
            const newUnlocked = this.getUnlockedMixingLevel();
            const levelUp = newUnlocked > prevUnlocked;

            this.showMixingResult(true, mixture, correctColor, state.attempts, earned, levelUp);

            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('perfect_color_match');
                artPatronSystem.playerData.stats.perfectScores++;
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        } else {
            // Señalar botón incorrecto
            const buttons = document.querySelectorAll('.color-option-btn');
            buttons.forEach(btn => {
                if (btn.textContent.includes(selectedDisplayName)) {
                    btn.classList.add('option-wrong');
                    setTimeout(() => btn.classList.remove('option-wrong'), 900);
                }
                btn.disabled = btn.textContent.includes(selectedDisplayName) || btn.classList.contains('option-correct');
            });

            if (typeof artPatronSystem !== 'undefined') {
                artPatronSystem.addPoints('play_color_game');
                artPatronSystem.playerData.stats.gamesPlayed++;
            }
        }
    }

    showMixingResult(isCorrect, mixture, correctColor, attempts, earnedPoints, levelUp) {
        const gameContainer = document.getElementById('game-container');
        const color1 = this.getColorData(mixture.color1);
        const color2 = this.getColorData(mixture.color2);
        const progress = this.getProgressToNextLevel(this.getUnlockedMixingLevel());

        if (!isCorrect) return; // Solo mostramos pantalla final cuando acierta

        gameContainer.innerHTML = `
            <div class="mixing-result success">
                <div class="result-icon">🎨✨</div>
                <h3>¡Correcto!</h3>
                <div class="mixing-formula-visual">
                    <div class="formula-color"><div class="color-sample" style="background:${color1.hex}"></div><span>${color1.name}</span></div>
                    <div class="mixing-symbol">+</div>
                    <div class="formula-color"><div class="color-sample" style="background:${color2.hex}"></div><span>${color2.name}</span></div>
                    <div class="mixing-symbol">=</div>
                    <div class="formula-color highlight"><div class="color-sample" style="background:${correctColor.hex}"></div><span>${correctColor.name}</span></div>
                </div>
                <div class="explanation">
                    <p><strong>${mixture.explanation}</strong></p>
                    <p class="tip-line">Tip: ${mixture.tip || 'Observa cómo la proporción cambia el matiz.'}</p>
                </div>
                <div class="score-update">
                    <p>Puntos ganados: <strong>+${earnedPoints}</strong> (Intentos: ${attempts})</p>
                    <p>Puntuación total: <strong>${this.score}</strong></p>
                </div>
                <div class="level-progress-bar compact">
                    <div class="level-progress-fill" style="width:${progress.percent}%"></div>
                    <div class="level-progress-label">${progress.label}</div>
                </div>
                ${levelUp ? `<div class="level-up-banner">🚀 ¡Nuevo nivel desbloqueado! ${this.getNextLevelFeature(this.getUnlockedMixingLevel())}</div>` : ''}
                <div class="actions">
                    <button class="next-question-btn" onclick="artGames.colorMixingGame()">Siguiente Mezcla 🧪</button>
                    <button class="back-to-menu-btn" onclick="artGames.showGameMenu()">Menú 🏠</button>
                </div>
            </div>
        `;
    }

    // 🧱 Lógica de niveles por puntuación -> nivel máximo de mezcla desbloqueado
    getUnlockedMixingLevel() {
        const s = this.score;
        if (s >= 600) return 6;
        if (s >= 450) return 5;
        if (s >= 300) return 4;
        if (s >= 200) return 3;
        if (s >= 100) return 2;
        return 1;
    }

    getProgressToNextLevel(currentLevel) {
        const thresholds = { 1: 100, 2: 200, 3: 300, 4: 450, 5: 600 };
        const currentScore = this.score;
        if (currentLevel >= 6) return { percent: 100, label: 'Máximo nivel alcanzado' };
        const target = thresholds[currentLevel];
        const prev = currentLevel === 1 ? 0 : thresholds[currentLevel - 1];
        const span = target - prev;
        const progress = Math.min(1, (currentScore - prev) / span);
        return { percent: Math.round(progress * 100), label: `Avance a nivel ${currentLevel + 1}: ${Math.min(currentScore - prev, span)}/${span}` };
    }

    getDifficultyLabel(difficulty) {
        switch (difficulty) {
            case 'easy': return 'Básico';
            case 'medium': return 'Intermedio';
            case 'hard': return 'Avanzado';
            default: return difficulty;
        }
    }

    getNextLevelFeature(level) {
        const map = {
            2: 'Aparecen colores terciarios ✨',
            3: 'Se añaden mezclas con neutros ⚖️',
            4: 'Llegan tonos tierra �',
            5: 'Colores complejos y riqueza tonal 🔮',
            6: '¡Tonos de piel realistas para retratos! 👤'
        };
        return map[level] || '';
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

    // 🖼️ Juego: Memoria de Obras - Selector de Categoría
    memoryGame() {
        if (!this.selectedCategory) {
            this.showCategorySelection();
        } else {
            this.startMemoryGameWithCategory();
        }
    }

    // 🎯 Mostrar selector de categoría
    showCategorySelection() {
        const gameContainer = document.getElementById('game-container');
        const categories = Object.keys(this.animalCategories);

        gameContainer.innerHTML = `
            <div class="category-selection">
                <h3>🧠 Memoria Artística</h3>
                <p>Elige una categoría de animales para empezar</p>
                <div class="category-grid">
                    ${categories.map(categoryKey => {
                        const category = this.animalCategories[categoryKey];
                        return `
                            <button class="category-btn" onclick="artGames.selectCategory('${categoryKey}')">
                                <div class="category-icon">${category.emoji}</div>
                                <div class="category-name">${category.name}</div>
                                <div class="category-count">${category.animals.length} razas</div>
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="game-info">
                    <h4>🎮 ¿Cómo jugar?</h4>
                    <ul>
                        <li>Escoge tu categoría favorita de animales</li>
                        <li>Encuentra las parejas de razas específicas</li>
                        <li>¡Gana más puntos con categorías más difíciles!</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // 🎯 Seleccionar categoría
    selectCategory(categoryKey) {
        this.selectedCategory = categoryKey;
        this.startMemoryGameWithCategory();
    }

    // 🎮 Iniciar juego con categoría específica
    startMemoryGameWithCategory() {
        const gameContainer = document.getElementById('game-container');
        const category = this.animalCategories[this.selectedCategory];

        // Tomar 6 animales aleatorios de la categoría (o todos si hay menos de 6)
        const availableAnimals = [...category.animals];
        const gameAnimals = [];

        // Seleccionar animales únicos hasta tener 6 (o todos los disponibles)
        for (let i = 0; i < Math.min(6, availableAnimals.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableAnimals.length);
            const selectedAnimal = availableAnimals.splice(randomIndex, 1)[0];

            // Crear dos instancias del mismo animal con imágenes diferentes
            const animal1 = {
                ...selectedAnimal,
                uniqueId: `${selectedAnimal.name}_1`,
                image: this.getRandomImageForAnimal(selectedAnimal)
            };
            const animal2 = {
                ...selectedAnimal,
                uniqueId: `${selectedAnimal.name}_2`,
                image: this.getRandomImageForAnimal(selectedAnimal)
            };

            // Asegurar que las imágenes sean diferentes si hay múltiples
            if (selectedAnimal.images && selectedAnimal.images.length > 1 && animal1.image === animal2.image) {
                const otherImages = selectedAnimal.images.filter(img => img !== animal1.image);
                animal2.image = otherImages[Math.floor(Math.random() * otherImages.length)];
            }

            gameAnimals.push(animal1, animal2);
        }

        // Mezclar las cartas
        const shuffledCards = gameAnimals.sort(() => Math.random() - 0.5);

        gameContainer.innerHTML = `
            <div class="memory-game">
                <div class="game-header">
                    <h3>🧠 Memoria Artística - ${category.name}</h3>
                    <p>Encuentra las parejas de ${category.name.toLowerCase()}</p>
                    <div class="difficulty-indicator difficulty-${category.difficulty}">
                        Dificultad: ${category.difficulty === 'easy' ? 'Fácil' : category.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                    </div>
                    <button class="change-category-btn" onclick="artGames.selectedCategory = null; artGames.memoryGame()">
                        Cambiar Categoría 🔄
                    </button>
                </div>
                <div class="memory-grid">
                    ${shuffledCards.map((animal, index) =>
                        `<div class="memory-card" data-card="${animal.name}" data-unique-id="${animal.uniqueId}" data-index="${index}">
                            <div class="card-front">🎨</div>
                            <div class="card-back">
                                ${animal.image ?
                                    `<img src="${animal.image}" alt="${animal.name}" class="animal-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                                    ''
                                }
                                <div class="animal-fallback" ${animal.image ? 'style="display:none"' : ''}>
                                    <div class="animal-emoji">${animal.emoji}</div>
                                    <div class="animal-name">${animal.name}</div>
                                </div>
                                <div class="animal-name-overlay">${animal.name}</div>
                            </div>
                         </div>`
                    ).join('')}
                </div>
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">Puntuación</span>
                        <span class="stat-value">${this.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Categoría</span>
                        <span class="stat-value">${category.emoji} ${category.name}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Bonificación</span>
                        <span class="stat-value">+${this.getCategoryBonus(this.selectedCategory)} pts</span>
                    </div>
                </div>
            </div>
        `;

        this.setupMemoryGame(gameAnimals.length / 2); // Dividir por 2 porque son pares
    }

    setupMemoryGame(totalPairs = 6) {
        const cards = document.querySelectorAll('.memory-card');
        let flippedCards = [];
        let matches = 0;
        const category = this.animalCategories[this.selectedCategory];

        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    flippedCards.push(card);

                    if (flippedCards.length === 2) {
                        if (flippedCards[0].dataset.card === flippedCards[1].dataset.card) {
                            matches++;
                            // Puntos variables según la dificultad de la categoría
                            const categoryBonus = this.getCategoryBonus(this.selectedCategory);
                            this.score += (20 + categoryBonus);

                            // Efecto visual de éxito
                            flippedCards.forEach(card => {
                                card.classList.add('matched');
                            });

                            flippedCards = [];

                            // Actualizar puntuación en pantalla
                            this.updateScoreDisplay();

                            if (matches === totalPairs) {
                                setTimeout(() => {
                                    this.showMemoryGameComplete(category, totalPairs);
                                }, 500);

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

    // 🎯 Bonificación por categoría basada en dificultad
    getCategoryBonus(categoryKey) {
        const category = this.animalCategories[categoryKey];
        const difficultyBonuses = {
            'easy': 5,
            'medium': 10,
            'hard': 20
        };
        return difficultyBonuses[category?.difficulty] || 5;
    }

    // 🇮🇲 Seleccionar imagen aleatoria para el animal
    getRandomImageForAnimal(animal) {
        if (animal.images && animal.images.length > 0) {
            const randomIndex = Math.floor(Math.random() * animal.images.length);
            return animal.images[randomIndex];
        }
        return null; // Fallback a emoji si no hay imágenes
    }

    // 📊 Actualizar puntuación en pantalla
    updateScoreDisplay() {
        const scoreElement = document.querySelector('.stat-value');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            scoreElement.classList.add('score-update-animation');
            setTimeout(() => {
                scoreElement.classList.remove('score-update-animation');
            }, 500);
        }
    }

    // 🏆 Mostrar pantalla de juego completado
    showMemoryGameComplete(category, totalPairs) {
        const gameContainer = document.getElementById('game-container');
        const categoryBonus = this.getCategoryBonus(this.selectedCategory);
        const totalScore = (20 + categoryBonus) * totalPairs;

        gameContainer.innerHTML = `
            <div class="memory-complete">
                <div class="celebration-icon">🏆✨</div>
                <h3>¡Felicidades!</h3>
                <p class="complete-message">Has completado la galería de <strong>${category.name}</strong></p>

                <div class="game-results">
                    <div class="result-stat">
                        <span class="result-label">Parejas encontradas</span>
                        <span class="result-value">${totalPairs}/${totalPairs}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-label">Puntos ganados</span>
                        <span class="result-value">+${totalScore}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-label">Bonificación ${category.name}</span>
                        <span class="result-value">+${categoryBonus} por pareja</span>
                    </div>
                    <div class="result-stat total">
                        <span class="result-label">Puntuación total</span>
                        <span class="result-value">${this.score}</span>
                    </div>
                </div>

                <div class="next-actions">
                    <button class="btn-primary" onclick="artGames.selectedCategory = null; artGames.memoryGame()">
                        Probar otra categoría 🎯
                    </button>
                    <button class="btn-secondary" onclick="artGames.startMemoryGameWithCategory()">
                        Jugar de nuevo 🔄
                    </button>
                    <button class="btn-tertiary" onclick="artGames.showGameMenu()">
                        Menú principal 🏠
                    </button>
                </div>

                <div class="achievement-message">
                    <p>💡 <em>Cada categoría tiene diferentes razas y dificultades. ¡Descubre todas!</em></p>
                </div>
            </div>
        `;
    }

    // 🎭 Generador de Ideas Creativas Avanzado
    ideaGenerator() {
        // 🐾 Base de datos rica de animales con personalidad
        const animals = [
            { name: 'Golden Retriever', personality: 'leal y juguetón', features: 'pelaje dorado ondulado' },
            { name: 'Gato Persa', personality: 'elegante y sereno', features: 'pelaje largo y sedoso' },
            { name: 'Husky Siberiano', personality: 'aventurero y libre', features: 'ojos azules penetrantes' },
            { name: 'Conejo Lop', personality: 'tierno y curioso', features: 'orejas caídas distintivas' },
            { name: 'Loro Guacamayo', personality: 'vibrante y social', features: 'plumas multicolores brillantes' },
            { name: 'Pez Betta', personality: 'elegante y misterioso', features: 'aletas flotantes como seda' },
            { name: 'Tortuga Marina', personality: 'sabia y ancestral', features: 'caparazón con patrones únicos' },
            { name: 'Caballo Árabe', personality: 'noble y poderoso', features: 'crines al viento' },
            { name: 'Gato Maine Coon', personality: 'majestuoso y gentil', features: 'tamaño imponente' },
            { name: 'Border Collie', personality: 'inteligente y atlético', features: 'mirada intensa y alerta' }
        ];

        // 🎨 Estilos artísticos con técnicas específicas
        const styles = [
            { name: 'Acuarela', technique: 'transparencias y fluidez', mood: 'etéreo y suave' },
            { name: 'Óleo', technique: 'empastes y texturas ricas', mood: 'clásico y profundo' },
            { name: 'Acrílico', technique: 'colores vibrantes y versatilidad', mood: 'moderno y expresivo' },
            { name: 'Carboncillo', technique: 'contrastes dramáticos', mood: 'íntimo y emotivo' },
            { name: 'Pastel', technique: 'colores suaves y difuminados', mood: 'delicado y nostálgico' },
            { name: 'Impresionista', technique: 'pinceladas sueltas y luz', mood: 'luminoso y espontáneo' },
            { name: 'Hiperrealista', technique: 'detalles precisos', mood: 'impactante y técnico' },
            { name: 'Abstracto', technique: 'formas y colores puros', mood: 'libre y conceptual' },
            { name: 'Pop Art', technique: 'colores saturados y contrastes', mood: 'divertido y audaz' },
            { name: 'Puntillismo', technique: 'pequeños puntos de color', mood: 'meticuloso y único' }
        ];

        // 🌅 Escenarios atmosféricos con iluminación específica
        const scenarios = [
            { name: 'atardecer dorado', lighting: 'luz cálida y suave', emotion: 'nostálgico' },
            { name: 'mañana brumosa', lighting: 'luz difusa y misteriosa', emotion: 'sereno' },
            { name: 'tormenta eléctrica', lighting: 'contrastes dramáticos', emotion: 'intenso' },
            { name: 'jardín primaveral', lighting: 'luz natural filtrada', emotion: 'alegre' },
            { name: 'bosque encantado', lighting: 'rayos de luz entre árboles', emotion: 'mágico' },
            { name: 'playa al amanecer', lighting: 'reflejo dorado en agua', emotion: 'esperanzador' },
            { name: 'nieve silenciosa', lighting: 'luz fría y cristalina', emotion: 'tranquilo' },
            { name: 'campo de lavanda', lighting: 'luz violeta suave', emotion: 'romántico' },
            { name: 'biblioteca antigua', lighting: 'luz cálida de velas', emotion: 'contemplativo' },
            { name: 'terraza urbana', lighting: 'luces de ciudad', emotion: 'cosmopolita' }
        ];

        // 🎨 Paletas de colores específicas
        const colorPalettes = [
            { name: 'Cálida', colors: ['dorados', 'naranjas', 'rojos terracota'], feeling: 'acogedor' },
            { name: 'Fría', colors: ['azules', 'verdes', 'violetas'], feeling: 'sereno' },
            { name: 'Terrosa', colors: ['marrones', 'ocres', 'beiges'], feeling: 'natural' },
            { name: 'Pastel', colors: ['rosas suaves', 'azul cielo', 'verde menta'], feeling: 'delicado' },
            { name: 'Vibrante', colors: ['magenta', 'amarillo intenso', 'turquesa'], feeling: 'energético' },
            { name: 'Monocromática', colors: ['gradaciones de un solo color'], feeling: 'elegante' },
            { name: 'Complementaria', colors: ['colores opuestos en el círculo cromático'], feeling: 'dinámico' },
            { name: 'Analógica', colors: ['colores vecinos armonizados'], feeling: 'equilibrado' }
        ];

        // 🎯 Elementos compositivos
        const compositions = [
            { name: 'Regla de los tercios', focus: 'punto focal descentrado', impact: 'natural y equilibrado' },
            { name: 'Simetría', focus: 'balance perfecto', impact: 'formal y estático' },
            { name: 'Diagonal dinámica', focus: 'líneas guía en diagonal', impact: 'movimiento y energía' },
            { name: 'Primer plano dramático', focus: 'sujeto muy cercano', impact: 'íntimo e impactante' },
            { name: 'Contraste de tamaños', focus: 'elementos grandes vs pequeños', impact: 'jerarquía visual' },
            { name: 'Marco natural', focus: 'encuadre dentro del encuadre', impact: 'profundidad y foco' },
            { name: 'Espacio negativo', focus: 'protagonismo del vacío', impact: 'minimalista y poderoso' }
        ];

        // 🎨 Generar combinación aleatoria
        const randomIdea = {
            animal: animals[Math.floor(Math.random() * animals.length)],
            style: styles[Math.floor(Math.random() * styles.length)],
            scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
            palette: colorPalettes[Math.floor(Math.random() * colorPalettes.length)],
            composition: compositions[Math.floor(Math.random() * compositions.length)]
        };

        // 🎯 Generar consejos específicos basados en la combinación
        const advice = this.generateArtisticAdvice(randomIdea);
        const inspiration = this.generateInspiration(randomIdea);

        document.getElementById('game-container').innerHTML = `
            <div class="idea-generator-advanced">
                <div class="generator-header">
                    <h3>🎨 Estudio de Inspiración Artística</h3>
                    <p>Combinación única generada para Santiago</p>
                </div>

                <div class="idea-showcase">
                    <div class="main-concept">
                        <h4>✨ Tu próxima obra maestra</h4>
                        <div class="concept-title">
                            "${randomIdea.animal.name} ${randomIdea.scenario.name}"
                        </div>
                        <div class="concept-subtitle">Estilo ${randomIdea.style.name}</div>
                    </div>

                    <div class="idea-details">
                        <div class="detail-card subject-card">
                            <div class="card-icon">🐾</div>
                            <div class="card-content">
                                <h5>Sujeto Principal</h5>
                                <p><strong>${randomIdea.animal.name}</strong></p>
                                <p class="detail-desc">Personalidad: ${randomIdea.animal.personality}</p>
                                <p class="detail-feature">Destacar: ${randomIdea.animal.features}</p>
                            </div>
                        </div>

                        <div class="detail-card style-card">
                            <div class="card-icon">🎨</div>
                            <div class="card-content">
                                <h5>Técnica Artística</h5>
                                <p><strong>${randomIdea.style.name}</strong></p>
                                <p class="detail-desc">${randomIdea.style.technique}</p>
                                <p class="detail-feature">Sensación: ${randomIdea.style.mood}</p>
                            </div>
                        </div>

                        <div class="detail-card scenario-card">
                            <div class="card-icon">🌅</div>
                            <div class="card-content">
                                <h5>Atmósfera</h5>
                                <p><strong>${randomIdea.scenario.name}</strong></p>
                                <p class="detail-desc">${randomIdea.scenario.lighting}</p>
                                <p class="detail-feature">Emoción: ${randomIdea.scenario.emotion}</p>
                            </div>
                        </div>

                        <div class="detail-card palette-card">
                            <div class="card-icon">🎭</div>
                            <div class="card-content">
                                <h5>Paleta de Colores</h5>
                                <p><strong>${randomIdea.palette.name}</strong></p>
                                <p class="detail-desc">${randomIdea.palette.colors.join(', ')}</p>
                                <p class="detail-feature">Sensación: ${randomIdea.palette.feeling}</p>
                            </div>
                        </div>

                        <div class="detail-card composition-card">
                            <div class="card-icon">📐</div>
                            <div class="card-content">
                                <h5>Composición</h5>
                                <p><strong>${randomIdea.composition.name}</strong></p>
                                <p class="detail-desc">${randomIdea.composition.focus}</p>
                                <p class="detail-feature">Impacto: ${randomIdea.composition.impact}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="inspiration-section">
                    <div class="advice-card">
                        <h5>💡 Consejo Técnico</h5>
                        <p>${advice}</p>
                    </div>
                    <div class="inspiration-card">
                        <h5>🌟 Inspiración</h5>
                        <p>${inspiration}</p>
                    </div>
                </div>

                <div class="generator-actions">
                    <button onclick="artGames.ideaGenerator()" class="btn-primary generate-btn">
                        🎲 Nueva Combinación
                    </button>
                    <button onclick="artGames.saveAdvancedIdea('${JSON.stringify(randomIdea)}')" class="btn-secondary save-btn">
                        💾 Guardar en Biblioteca
                    </button>
                    <button onclick="artGames.showSavedIdeas()" class="btn-tertiary library-btn">
                        📚 Ver Biblioteca (${this.getSavedIdeasCount()})
                    </button>
                </div>

                <div class="creativity-quote">
                    <p><em>"${this.getRandomCreativeQuote()}"</em></p>
                </div>
            </div>
        `;
    }

    // 🎯 Generar consejos artísticos específicos
    generateArtisticAdvice(idea) {
        const adviceMap = {
            'Acuarela': [
                'Deja que el agua haga parte del trabajo. Los accidentes felices son tu mejor aliado.',
                'Trabaja de claro a oscuro. Una vez que apliques un tono oscuro, será difícil aclararlo.',
                'Usa papel de acuarela de buena calidad. Absorberá mejor el agua sin ondularse.'
            ],
            'Óleo': [
                'Trabaja en capas. Empieza con tonos generales y refina los detalles gradualmente.',
                'Recuerda la regla "graso sobre magro". Mezcla más medio en cada capa superior.',
                'Los óleos te dan tiempo. Puedes trabajar y retocar durante horas o incluso días.'
            ],
            'Carboncillo': [
                'Usa el lado del carboncillo para sombras amplias y la punta para detalles precisos.',
                'El papel texturado es tu amigo. Te ayudará a crear efectos naturales.',
                'No temas ensuciar tus dedos. Son herramientas de difuminado perfectas.'
            ]
        };

        const styleAdvice = adviceMap[idea.style.name] || [
            'Confía en tu instinto artístico. La técnica es importante, pero la emoción es lo que conecta.',
            'Observa cómo la luz interactúa con tu sujeto. La luz es la que da vida a cualquier pintura.',
            'No busques la perfección en el primer intento. El arte es un proceso de descubrimiento.'
        ];

        return styleAdvice[Math.floor(Math.random() * styleAdvice.length)];
    }

    // 🌟 Generar inspiración contextual
    generateInspiration(idea) {
        const inspirations = [
            `Imagina la conexión emocional entre tú y ${idea.animal.name}. ¿Qué historia quiere contar su mirada?`,
            `La luz ${idea.scenario.lighting} creará sombras únicas. Úsalas para dar profundidad y misterio.`,
            `Los tonos ${idea.palette.colors.join(' y ')} evocarán ${idea.palette.feeling} en quien vea tu obra.`,
            `Piensa en cómo ${idea.animal.name} se movería en ${idea.scenario.name}. El movimiento implícito da vida.`,
            `La técnica ${idea.style.name} te permitirá expresar la personalidad ${idea.animal.personality} de manera única.`,
            `Usa la composición ${idea.composition.name} para guiar la mirada del espectador hacia lo más importante.`
        ];

        return inspirations[Math.floor(Math.random() * inspirations.length)];
    }

    // 💾 Guardar idea avanzada
    saveAdvancedIdea(ideaString) {
        const ideas = JSON.parse(localStorage.getItem('santiagoAdvancedIdeas') || '[]');
        const idea = JSON.parse(ideaString);
        idea.timestamp = new Date().toLocaleDateString();
        idea.id = Date.now();

        ideas.push(idea);
        localStorage.setItem('santiagoAdvancedIdeas', JSON.stringify(ideas));
        this.showFeedback('💎 Idea maestra guardada en tu biblioteca de inspiración!', 'success');

        // 🎮 Puntos por guardar idea avanzada
        if (typeof artPatronSystem !== 'undefined') {
            artPatronSystem.addPoints('save_advanced_idea');
            artPatronSystem.playerData.stats.ideasSaved++;
        }
    }

    // 📊 Contar ideas guardadas
    getSavedIdeasCount() {
        const ideas = JSON.parse(localStorage.getItem('santiagoAdvancedIdeas') || '[]');
        return ideas.length;
    }

    // 📚 Mostrar biblioteca de ideas
    showSavedIdeas() {
        const ideas = JSON.parse(localStorage.getItem('santiagoAdvancedIdeas') || '[]');

        if (ideas.length === 0) {
            this.showFeedback('Tu biblioteca está vacía. ¡Guarda algunas ideas primero!', 'info');
            return;
        }

        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <div class="ideas-library">
                <div class="library-header">
                    <h3>📚 Biblioteca de Inspiración</h3>
                    <p>Tus ${ideas.length} ideas guardadas</p>
                </div>

                <div class="ideas-grid">
                    ${ideas.reverse().slice(0, 9).map(idea => `
                        <div class="saved-idea-card" onclick="artGames.expandIdea('${idea.id}')">
                            <div class="idea-preview">
                                <h4>"${idea.animal.name} ${idea.scenario.name}"</h4>
                                <p class="idea-style">${idea.style.name}</p>
                                <div class="idea-tags">
                                    <span class="tag palette-tag">${idea.palette.name}</span>
                                    <span class="tag composition-tag">${idea.composition.name}</span>
                                </div>
                                <p class="idea-date">💡 ${idea.timestamp}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="library-actions">
                    <button onclick="artGames.ideaGenerator()" class="btn-primary">
                        🎨 Generar Nueva Idea
                    </button>
                    <button onclick="artGames.showGameMenu()" class="btn-tertiary">
                        🏠 Volver al Menú
                    </button>
                </div>
            </div>
        `;
    }

    // 🎭 Frases creativas motivacionales
    getRandomCreativeQuote() {
        const quotes = [
            "Todo artista fue primero un amateur. - Ralph Waldo Emerson",
            "La creatividad es la inteligencia divirtiéndose. - Albert Einstein",
            "El arte no reproduce lo visible, sino que hace visible lo invisible. - Paul Klee",
            "Cada pincelada cuenta una historia que solo tú puedes narrar.",
            "La inspiración existe, pero tiene que encontrarte trabajando. - Pablo Picasso",
            "No hay nada más hermoso que la expresión auténtica de tu alma en el lienzo.",
            "Los grandes artistas no nacen, se hacen pincelada a pincelada.",
            "Tu mirada única es lo que hace especial cada obra que creas."
        ];

        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    // 🔄 Compatibilidad con versión anterior
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
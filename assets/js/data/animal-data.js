/*
 * ArtBreeds v2 - Dataset limpio y consistente de razas con variantes.
 * Estructura: ArtBreeds = { version, categories: { clave: { name, emoji, style, breeds:[ { id, name, images:[ {variant, src, alt, ...} ] } ] } } }
 * Este dataset alimenta el memory-game accesible (modo variantes, mitades y pistas).
 * NOTA: Rutas de imágenes son placeholders; se pueden ir poblando progresivamente.
 */
(function(global){
  const mkImg = (path, alt, variant=1) => ({ variant, src: path, alt, license: 'provisional', source: 'AI placeholder' });

  const ArtBreeds = {
    version: 2,
    categories: {
      mamiferos: {
        name: 'Mamíferos', emoji: '🐾', style: 'ilustración digital semirrealista',
        breeds: [
          { id: 'lobo_gris', name: 'Lobo Gris', images: [
            mkImg('assets/img/mamiferos/lobo_gris/lobo_gris_v1.png','Lobo gris – perfil 3/4 mirando a la izquierda',1),
            mkImg('assets/img/mamiferos/lobo_gris/lobo_gris_v2.png','Lobo gris – frontal cabeza inclinada',2),
            mkImg('assets/img/mamiferos/lobo_gris/lobo_gris_v3.png','Lobo gris – perfil completo sentado',3)
          ]},
          { id: 'zorro_artico', name: 'Zorro Ártico', images: [
            mkImg('assets/img/mamiferos/zorro_artico/zorro_artico_v1.png','Zorro ártico – pelaje blanco perfil 3/4',1),
            mkImg('assets/img/mamiferos/zorro_artico/zorro_artico_v2.png','Zorro ártico – frontal mirada directa',2)
          ]}
        ]
      },
      aves: {
        name: 'Aves', emoji: '🦜', style: 'acuarela luminosa',
        breeds: [
          { id: 'guacamayo_azul_amarillo', name: 'Guacamayo Azul y Amarillo', images: [
            mkImg('assets/img/aves/guacamayo/guacamayo_v1.png','Guacamayo azul y amarillo – pose perfil 3/4',1),
            mkImg('assets/img/aves/guacamayo/guacamayo_v2.png','Guacamayo azul y amarillo – frontal alas semiabiertas',2)
          ]},
          { id: 'colibri_esmeralda', name: 'Colibrí Esmeralda', images: [
            mkImg('assets/img/aves/colibri_esmeralda/colibri_esmeralda_v1.png','Colibrí esmeralda – suspendido libando flor',1),
            mkImg('assets/img/aves/colibri_esmeralda/colibri_esmeralda_v2.png','Colibrí esmeralda – vista lateral alas rápidas',2)
          ]},
          { id: 'buho_nival', name: 'Búho Nival', images: [
            mkImg('assets/img/aves/buho_nival/buho_nival_v1.png','Búho nival – posado frontal',1),
            mkImg('assets/img/aves/buho_nival/buho_nival_v2.png','Búho nival – vuelo alas extendidas',2)
          ]}
        ]
      },
      reptiles: {
        name: 'Reptiles', emoji: '🦎', style: 'ilustración naturalista limpia',
        breeds: [
          { id: 'camaleon_velado', name: 'Camaleón Velado', images: [
            mkImg('assets/img/reptiles/camaleon_velado/camaleon_velado_v1.png','Camaleón velado – sobre rama perfil',1),
            mkImg('assets/img/reptiles/camaleon_velado/camaleon_velado_v2.png','Camaleón velado – cabeza giro leve',2)
          ]},
          { id: 'tortuga_verde', name: 'Tortuga Verde', images: [
            mkImg('assets/img/reptiles/tortuga_verde/tortuga_verde_v1.png','Tortuga verde – nado lateral',1),
            mkImg('assets/img/reptiles/tortuga_verde/tortuga_verde_v2.png','Tortuga verde – vista superior nadando',2)
          ]},
            { id: 'iguana_marina', name: 'Iguana Marina', images: [
            mkImg('assets/img/reptiles/iguana_marina/iguana_marina_v1.png','Iguana marina – reposo rocas',1),
            mkImg('assets/img/reptiles/iguana_marina/iguana_marina_v2.png','Iguana marina – perfil cabeza elevada',2)
          ]}
        ]
      },
      peces: {
        name: 'Peces', emoji: '🐟', style: 'ilustración digital colorida limpia',
        breeds: [
          { id: 'pez_betta', name: 'Pez Betta', images: [
            mkImg('assets/img/peces/pez_betta/pez_betta_v1.png','Pez betta – perfil aletas desplegadas',1),
            mkImg('assets/img/peces/pez_betta/pez_betta_v2.png','Pez betta – nadando hacia arriba',2),
            mkImg('assets/img/peces/pez_betta/pez_betta_v3.png','Pez betta – vista 3/4 trasera',3)
          ]},
          { id: 'pez_angel', name: 'Pez Ángel', images: [
            mkImg('assets/img/peces/pez_angel/pez_angel_v1.png','Pez ángel – perfil estático',1),
            mkImg('assets/img/peces/pez_angel/pez_angel_v2.png','Pez ángel – 3/4 girando',2),
            mkImg('assets/img/peces/pez_angel/pez_angel_v3.png','Pez ángel – frontal delgado',3)
          ]},
          { id: 'pez_cirujano_azul', name: 'Pez Cirujano Azul', images: [
            mkImg('assets/img/peces/pez_cirujano_azul/pez_cirujano_azul_v1.png','Pez cirujano azul – perfil nadando',1),
            mkImg('assets/img/peces/pez_cirujano_azul/pez_cirujano_azul_v2.png','Pez cirujano azul – vista superior calmada',2),
            mkImg('assets/img/peces/pez_cirujano_azul/pez_cirujano_azul_v3.png','Pez cirujano azul – primer plano curioso',3)
          ]},
          { id: 'guppy', name: 'Guppy', images: [
            mkImg('assets/img/peces/guppy/guppy_v1.png','Guppy – cola extendida lateral',1),
            mkImg('assets/img/peces/guppy/guppy_v2.png','Guppy – vista 3/4 nadando ascendente',2)
          ]},
          { id: 'pez_payaso', name: 'Pez Payaso', images: [
            mkImg('assets/img/peces/pez_payaso/pez_payaso_v1.png','Pez payaso – perfil entre anémonas',1),
            mkImg('assets/img/peces/pez_payaso/pez_payaso_v2.png','Pez payaso – frontal ligero',2)
          ]},
          { id: 'koi', name: 'Koi', images: [
            mkImg('assets/img/peces/koi/koi_v1.png','Koi – vista superior patrón naranja y blanco',1),
            mkImg('assets/img/peces/koi/koi_v2.png','Koi – perfil ondulando en agua clara',2)
          ]}
        ]
      },
      perros: {
        name: 'Perros', emoji: '🐶', style: 'ilustración digital semirrealista amigable',
        breeds: [
          { id: 'golden_retriever', name: 'Golden Retriever', images: [
            mkImg('assets/img/perros/golden_retriever/golden_retriever_v1.png','Golden Retriever – postura sentado frontal',1),
            mkImg('assets/img/perros/golden_retriever/golden_retriever_v2.png','Golden Retriever – perfil caminando',2)
          ]},
          { id: 'bulldog_frances', name: 'Bulldog Francés', images: [
            mkImg('assets/img/perros/bulldog_frances/bulldog_frances_v1.png','Bulldog francés – sentado frontal pecho ancho',1),
            mkImg('assets/img/perros/bulldog_frances/bulldog_frances_v2.png','Bulldog francés – perfil corto robusto',2)
          ]},
          { id: 'husky_siberiano', name: 'Husky Siberiano', images: [
            mkImg('assets/img/perros/husky_siberiano/husky_siberiano_v1.png','Husky siberiano – postura de pie perfil 3/4',1),
            mkImg('assets/img/perros/husky_siberiano/husky_siberiano_v2.png','Husky siberiano – cabeza primer plano ojos claros',2)
          ]}
        ]
      },
      gatos: {
        name: 'Gatos', emoji: '🐱', style: 'ilustración digital refinada',
        breeds: [
          { id: 'gato_siames', name: 'Gato Siamés', images: [
            mkImg('assets/img/gatos/gato_siames/gato_siames_v1.png','Gato siamés – sentado elegante perfil 3/4',1),
            mkImg('assets/img/gatos/gato_siames/gato_siames_v2.png','Gato siamés – acostado patas extendidas mirada frontal',2),
            mkImg('assets/img/gatos/gato_siames/gato_siames_v3.png','Gato siamés – primer plano rostro ojos azules',3)
          ]},
          { id: 'gato_persa', name: 'Gato Persa', images: [
            mkImg('assets/img/gatos/gato_persa/gato_persa_v1.png','Gato persa – sentado frontal pelaje voluminoso',1),
            mkImg('assets/img/gatos/gato_persa/gato_persa_v2.png','Gato persa – perfil 3/4 mostrando cola',2),
            mkImg('assets/img/gatos/gato_persa/gato_persa_v3.png','Gato persa – tumbado relajado ojos entrecerrados',3)
          ]},
          { id: 'gato_bengala', name: 'Gato de Bengala', images: [
            mkImg('assets/img/gatos/gato_bengala/gato_bengala_v1.png','Gato de Bengala – pose de acecho',1),
            mkImg('assets/img/gatos/gato_bengala/gato_bengala_v2.png','Gato de Bengala – de pie perfil 3/4 rosetas',2),
            mkImg('assets/img/gatos/gato_bengala/gato_bengala_v3.png','Gato de Bengala – sentado alerta mirando arriba',3)
          ]},
          { id: 'gato_maine_coon', name: 'Gato Maine Coon', images: [
            mkImg('assets/img/gatos/gato_maine_coon/gato_maine_coon_v1.png','Gato Maine Coon – sentado frontal imponente',1),
            mkImg('assets/img/gatos/gato_maine_coon/gato_maine_coon_v2.png','Gato Maine Coon – perfil completo destacando cola',2),
            mkImg('assets/img/gatos/gato_maine_coon/gato_maine_coon_v3.png','Gato Maine Coon – primer plano rostro mechones',3)
          ]},
          { id: 'gato_sphynx', name: 'Gato Sphynx', images: [
            mkImg('assets/img/gatos/gato_sphynx/gato_sphynx_v1.png','Gato sphynx – sentado escultural 3/4',1),
            mkImg('assets/img/gatos/gato_sphynx/gato_sphynx_v2.png','Gato sphynx – acurrucado formando bola',2),
            mkImg('assets/img/gatos/gato_sphynx/gato_sphynx_v3.png','Gato sphynx – de pie estirándose',3)
          ]}
        ]
      },
      // 🎨 QUIZ VISUAL DE COLORES (extraído del Laboratorio de Mezclas)
      colorQuiz: {
        name: 'Quiz de Colores', emoji: '🎨', style: 'visual interactivo',
        visualPairs: [
          {
            id: 'color_mix_1',
            type: 'color-visual',
            card1: {
              type: 'question',
              colors: ['#FF0000', '#FFFF00'], // Rojo + Amarillo
              labels: ['Rojo', 'Amarillo'],
              operator: '+'
            },
            card2: {
              type: 'answer',
              color: '#FF8C00', // Naranja
              name: 'Naranja'
            }
          },
          {
            id: 'color_mix_2',
            type: 'color-visual',
            card1: {
              type: 'question',
              colors: ['#0000FF', '#FFFF00'], // Azul + Amarillo
              labels: ['Azul', 'Amarillo'],
              operator: '+'
            },
            card2: {
              type: 'answer',
              color: '#00FF00', // Verde
              name: 'Verde'
            }
          },
          {
            id: 'color_mix_3',
            type: 'color-visual',
            card1: {
              type: 'question',
              colors: ['#FF0000', '#0000FF'], // Rojo + Azul
              labels: ['Rojo', 'Azul'],
              operator: '+'
            },
            card2: {
              type: 'answer',
              color: '#8B00FF', // Púrpura
              name: 'Púrpura'
            }
          }
        ]
      },
      caballos: {
        name: 'Caballos', emoji: '🐴', style: 'ilustración ecuestre estilizada',
        breeds: [
          { id: 'caballo_andaluz', name: 'Caballo Andaluz', images: [
            mkImg('assets/img/caballos/caballo_andaluz/caballo_andaluz_v1.png','Caballo andaluz – postura de perfil recogido',1),
            mkImg('assets/img/caballos/caballo_andaluz/caballo_andaluz_v2.png','Caballo andaluz – trote elegante 3/4',2),
            mkImg('assets/img/caballos/caballo_andaluz/caballo_andaluz_v3.png','Caballo andaluz – cabeza primer plano crin ondulada',3)
            // pares especiales split (Par 1)
            ,{ variant: 'split_left_v1', src: 'assets/img/caballos/caballo_andaluz/split/caballo_andaluz_split_left_v1.png', alt: 'Mitad izquierda de ilustración de caballo andaluz estilizado, cuello arqueado y crin ondulada parcial.', role: 'split-left', pairGroup: 'split_v1' }
            ,{ variant: 'split_right_v1', src: 'assets/img/caballos/caballo_andaluz/split/caballo_andaluz_split_right_v1.png', alt: 'Mitad derecha de ilustración de caballo andaluz estilizado, lomo, grupa y cola elegante.', role: 'split-right', pairGroup: 'split_v1' }
          ]},
          { id: 'caballo_arabe', name: 'Caballo Árabe', images: [
            mkImg('assets/img/caballos/caballo_arabe/caballo_arabe_v1.png','Caballo árabe – perfil estilizado cola alta',1),
            mkImg('assets/img/caballos/caballo_arabe/caballo_arabe_v2.png','Caballo árabe – galope ligero suspendido',2)
            // Par 2 variantes complementarias (acción vs postura)
            ,{ variant: 'action_v1', src: 'assets/img/caballos/caballo_arabe/caballos_caballo_arabe_action_v1.png', alt: 'Caballo árabe en galope elegante vista 3/4, crin y cola en movimiento.', role: 'action', pairGroup: 'arabian_pose_v1' }
            ,{ variant: 'stance_v1', src: 'assets/img/caballos/caballo_arabe/caballos_caballo_arabe_stance_v1.png', alt: 'Caballo árabe de pie en postura serena vista 3/4, cuello arqueado y cola elevada.', role: 'stance', pairGroup: 'arabian_pose_v1' }
          ]},
          { id: 'caballo_percheron', name: 'Percherón', images: [
            mkImg('assets/img/caballos/caballo_percheron/caballo_percheron_v1.png','Caballo Percherón – postura robusta frontal',1),
            mkImg('assets/img/caballos/caballo_percheron/caballo_percheron_v2.png','Caballo Percherón – perfil mostrando masa muscular',2)
          ]},
          { id: 'caballo_cuarto_milla', name: 'Cuarto de Milla', images: [
            mkImg('assets/img/caballos/caballo_cuarto_milla/caballo_cuarto_milla_v1.png','Caballo Cuarto de Milla – salida explosiva',1),
            mkImg('assets/img/caballos/caballo_cuarto_milla/caballo_cuarto_milla_v2.png','Caballo Cuarto de Milla – perfil calmado en descanso',2)
          ]},
          { id: 'caballo_frison', name: 'Frisón', images: [
            mkImg('assets/img/caballos/caballo_frison/caballo_frison_v1.png','Caballo frisón – trote elevado crin larga',1),
            mkImg('assets/img/caballos/caballo_frison/caballo_frison_v2.png','Caballo frisón – perfil completo negro brillante',2),
            mkImg('assets/img/caballos/caballo_frison/caballo_frison_v3.png','Caballo frisón – primer plano cabeza elegante',3)
          ]}
        ],
        // 🎯 NUEVA ESTRUCTURA: Pares híbridos (imágenes complementarias + quiz)
        // Modo 'hybrid' mezclará estos pares para crear un juego más desafiante
        hybridPairs: [
          // Par 1: Imágenes complementarias (2 imágenes diferentes que forman un conjunto conceptual)
          {
            id: 'pair_andaluz_complemento',
            type: 'image-complement',
            pairKey: 'caballo_andaluz',
            card1: {
              img: './Gemini_Generated_Image_kv4p7mkv4p7mkv4p.png',
              alt: 'Caballo Andaluz blanco – vista completa de perfil',
              description: 'Vista completa'
            },
            card2: {
              img: './B2333418-EF2A-4A30-8D32-53EA78DB25EE.png',
              alt: 'Caballo Andaluz blanco – mitad frontal con cabeza y cuello',
              description: 'Detalle frontal'
            }
          },
          // Par 2: Imágenes complementarias (mismo concepto, variaciones)
          {
            id: 'pair_andaluz_complemento_2',
            type: 'image-complement',
            pairKey: 'caballo_andaluz',
            card1: {
              img: './Gemini_Generated_Image_kv4p7mkv4p7mkv4p.png',
              alt: 'Caballo Andaluz blanco – vista completa',
              description: 'Caballo completo'
            },
            card2: {
              img: './1AA0EF81-ECBC-47C3-80DD-FA09348ABC93.png',
              alt: 'Caballo Andaluz blanco – mitad posterior con lomo y cola',
              description: 'Detalle posterior'
            }
          },
          // Par 3: Quiz integrado (pregunta ↔ respuesta)
          {
            id: 'quiz_andaluz_origen',
            type: 'quiz',
            pairKey: 'caballo_andaluz',
            card1: {
              text: '¿De qué región de España es originario el caballo Andaluz?',
              isQuestion: true
            },
            card2: {
              text: 'Andalucía',
              isAnswer: true
            }
          },
          // Par 4: Quiz integrado
          {
            id: 'quiz_andaluz_caracteristica',
            type: 'quiz',
            pairKey: 'caballo_andaluz',
            card1: {
              text: '¿Cuál es la característica más distintiva del Andaluz?',
              isQuestion: true
            },
            card2: {
              text: 'Su cuello arqueado y crin ondulada',
              isAnswer: true
            }
          },
          // Par 5: Quiz sobre caballos Árabes
          {
            id: 'quiz_arabe_cola',
            type: 'quiz',
            pairKey: 'caballo_arabe',
            card1: {
              text: '¿Qué característica tiene la cola del caballo Árabe?',
              isQuestion: true
            },
            card2: {
              text: 'Cola alta y elegante',
              isAnswer: true
            }
          },
          // Par 6: Quiz sobre Frisón
          {
            id: 'quiz_frison_color',
            type: 'quiz',
            pairKey: 'caballo_frison',
            card1: {
              text: '¿De qué color es típicamente el caballo Frisón?',
              isQuestion: true
            },
            card2: {
              text: 'Negro brillante',
              isAnswer: true
            }
          }
        ]
      },
      // 🐱 Categoría Gatos con pares híbridos
      gatos_hybrid: {
        name: 'Gatos (Híbrido)', emoji: '🐱', style: 'ilustración digital refinada',
        breeds: [], // Se mantiene la estructura breeds vacía para no duplicar
        hybridPairs: [
          // Pares de quiz para gatos
          {
            id: 'quiz_siames_origen',
            type: 'quiz',
            pairKey: 'gato_siames',
            card1: { text: '¿De qué país es originario el gato Siamés?', isQuestion: true },
            card2: { text: 'Tailandia (antiguo Siam)', isAnswer: true }
          },
          {
            id: 'quiz_siames_ojos',
            type: 'quiz',
            pairKey: 'gato_siames',
            card1: { text: '¿De qué color son los ojos del gato Siamés?', isQuestion: true },
            card2: { text: 'Azul intenso', isAnswer: true }
          },
          {
            id: 'quiz_persa_pelaje',
            type: 'quiz',
            pairKey: 'gato_persa',
            card1: { text: '¿Cómo es el pelaje del gato Persa?', isQuestion: true },
            card2: { text: 'Largo, denso y voluminoso', isAnswer: true }
          },
          {
            id: 'quiz_bengala_patron',
            type: 'quiz',
            pairKey: 'gato_bengala',
            card1: { text: '¿Qué patrón tiene el pelaje del gato de Bengala?', isQuestion: true },
            card2: { text: 'Rosetas y manchas tipo leopardo', isAnswer: true }
          }
        ]
      },
      // 🐶 Categoría Perros con pares híbridos
      perros_hybrid: {
        name: 'Perros (Híbrido)', emoji: '🐶', style: 'ilustración digital semirrealista amigable',
        breeds: [],
        hybridPairs: [
          {
            id: 'quiz_golden_temperamento',
            type: 'quiz',
            pairKey: 'golden_retriever',
            card1: { text: '¿Cuál es el temperamento típico del Golden Retriever?', isQuestion: true },
            card2: { text: 'Amigable, leal y gentil', isAnswer: true }
          },
          {
            id: 'quiz_golden_actividad',
            type: 'quiz',
            pairKey: 'golden_retriever',
            card1: { text: '¿Qué actividad le encanta al Golden Retriever?', isQuestion: true },
            card2: { text: 'Nadar y recuperar objetos', isAnswer: true }
          },
          {
            id: 'quiz_bulldog_origen',
            type: 'quiz',
            pairKey: 'bulldog_frances',
            card1: { text: '¿De qué país es el Bulldog Francés?', isQuestion: true },
            card2: { text: 'Francia', isAnswer: true }
          },
          {
            id: 'quiz_husky_ojos',
            type: 'quiz',
            pairKey: 'husky_siberiano',
            card1: { text: '¿De qué colores pueden ser los ojos del Husky?', isQuestion: true },
            card2: { text: 'Azules, marrones o heterocromía', isAnswer: true }
          }
        ]
      }
      // Nota: se ha integrado la categoría Caballos (horses) para unificar origen de datos.
    }
  };

  global.ArtBreeds = ArtBreeds;
})(window);

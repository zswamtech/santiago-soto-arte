# Roadmap Futuro (Propuesta)

## Principios de Diseño

- Aprendizaje lúdico primero: cada mecánica debe reforzar comprensión de color/arte.
- Sesiones cortas encadenables (5–10 min) con capas meta (rachas, sorpresas, progresión).
- Accesibilidad y performance no negociables.
- Instrumentación ligera para iterar balance (telemetría anónima opcional futura).

## Fase 1: Consolidación y Calidad

1. Panel Hub Avanzado
   - Historial de near-miss y sorpresas recientes.
   - Barra de progreso XP con hover que muestra XP faltante.
2. Telemetría Local Opt-In
   - Registro de eventos (conteo) para analizar frecuencia de triggers sorpresa.
   - Export JSON manual para análisis.
3. Mejoras Accesibilidad
   - Modo alto contraste.
   - Preferencias de animación (reducir motion).
4. Power-Ups Funcionales
   - Implementar efectos reales: "Hint Color", "Freeze Timer", "Second Chance".

## Fase 2: Nuevos Contenidos Educativos

1. Puzzle Deslizable 3x3 (Imagen colorida)
   - Métricas: movimientos, tiempo, eficiencia.
   - Integración micro-rewards por resolver bajo umbral moves.
2. Generador Inspiración (Prompt Artístico)
   - Semillas temáticas + paleta generada.
   - Recompensa XP si el usuario guarda una paleta (registro evento creativo).
3. Speed Color Match
   - Rondas rápidas reconocer tono exacto.
   - Highscore con curva de dificultad acelerada.
4. Modo Desafíos (Challenge Rotations)
   - Set semanal rotativo de retos compuestos (ej: completar X memoria + Y quiz con accuracy conjunta ≥70%).

## Fase 3: Social / Competitivo (Opcional)

1. Leaderboards Local / Pseudónimos
   - Tabla local top 10 por juego.
   - Hash anónimo si se sube a un backend futuro.
2. Ghost Replays (Memoria)
   - Guardar secuencia de flips (timestamps) para reproducir un "fantasma".
3. Retos Asíncronos
   - Generar un seed que otro jugador puede cargar para intentar superar.

## Fase 4: Economía Suave y Personalización

1. Sistema de Monedas Suave ("Pigmentos")
   - Ganar con logros/semanales, gastar en temas visuales o marcos.
2. Coleccionables
   - Paletas raras desbloqueables (probabilidad en memory perfecto + rápido).
3. Taller de Paletas
   - Mezclar colores guardados, compartir (export JSON / clipboard).

## Fase 5: IA y Generativas (Exploratorio)

1. Sugerencias de Combinaciones Armoniosas (modelo heurístico o API externa).
2. Explicaciones Dinámicas en Quiz
   - Feedback textual adaptado a error (e.g. confunde saturación vs luminosidad).
3. Generador de Ejercicios Paramétricos
   - Crea sets de cartas memory con temáticas (calidez, complementarios).

## Fase 6: Multiplayer Ligero (Stretch)

1. Modo Turnos Memory
   - Alternar turnos; penalizaciones por fallo consecutivo.
2. Quiz Duelo Asíncrono
   - Jugador A establece marca, Jugador B intenta superarla (seed).
3. Eventos Temporales
   - Fin de semana con modificadores (doble energía, sorpresas elevadas).

## Refactors Técnicos Propuestos

- Extraer EventBus a módulo independiente testable (facilitar mocks).
- Unificar payload `game.completed` (baseXP, scoreFinal, accuracy?, durationMs obligatorio).
- Mecanismo de middlewares para XP (ej: near-miss boost, doubleXP, streak modifier) en cadena controlada.
- Namespacing CSS de juegos (evitar colisiones globales).
- Sistema de Feature Flags simple (GameCore.flags) persistible.

## Métricas de Éxito (Indicativas)

- Retención sesión: >=3 juegos por sesión promedio.
- Ratio near-miss aceptado/redimido: 40–60%.
- % dailies completados/día: 55–70% (balance adecuado).
- Tiempo medio memoria: 70–90s tras 1 día de aprendizaje (objetivo formativo).

## Riesgos / Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Saturación de notificaciones | Rate-limit por categoría + mergeKey ya implementado |
| Inflación XP con sorpresas | Ajustar multiplicadores y colocar cooldown invisible por tipo |
| Complejidad de estado creciente | Refactor a store central (proxy) antes de Fase 3 |
| Fatiga cognitiva | Modo Focus (desactiva sorpresas/near-miss temporalmente) |

## Backlog de Ideas Rápidas

- Easter egg: comando secreto que cambia tema a escala de grises.
- Modo "Zen" memory: sin tiempo, recompensa solo por precisión.
- Log de eventos en overlay dev (tecla debug).
- Integración PWA (instalable offline).

## Próximos 3 Sprints (Ejemplo)

Sprint 1: Hub avanzado, power-ups reales, payload unificado game.completed.
Sprint 2: Puzzle deslizable, Speed Color Match MVP, store central.
Sprint 3: Challenge rotations, monedas suaves, coleccionables paletas.

---
*Documento vivo. Repriorizar según feedback usuario real y telemetría.*

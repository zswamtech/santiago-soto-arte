# Arquitectura Juegos y Gamificación

## Visión General

El sistema de minijuegos se modularizó para soportar escalabilidad, accesibilidad y gamificación avanzada (XP, objetivos diarios, energía creativa, recompensas).

## Módulos Principales

- core.js: Registro dinámico de juegos, eventBus central, feature flags.

- storage.js: Persistencia (localStorage) con versión y patch incremental.

- achievements.js: Definición + evaluación de logros mediante eventos.

- hub.js: UI central que lista juegos, muestra racha, objetivos diarios, energía.

- memory-game.js: Juego accesible (grid ARIA, navegación teclado, announcer SR).

- quiz-game.js: Quiz de teoría del color con banco de 20 preguntas escalonadas.

- color-mixing.js: Módulo puente hacia la lógica heredada.

- xp.js: Sistema de XP y niveles (1-20) con curva adaptable.

- powerups.js: Estructura inicial para power-ups educativos.

- gamification.js: SessionManager, ProgressionSystem (diario/semanal), energía creativa.

- notifications.js: Overlay no intrusivo de notificaciones (logros, XP, energía, milestones).

## Flujo de Eventos (eventBus)

Eventos base emitidos por juegos:

- game.played { id }

- game.completed { id, matches?, attempts?, durationMs?, score? }

- score.changed { game, delta }

- quiz.started / quiz.answered / quiz.completed

- xp.gained { amount, reason }

- level.up { level }

- achievement.unlocked { id }

- energy.gained / energy.spent

- progression.objectiveCompleted / progression.weeklyCompleted

## Objetivos Diarios / Semanales

Se regeneran al cambiar día/semana. Persisten en `GameStorage.gamification.daily` y `.weekly`.

Al completarse otorgan XP y emiten eventos para el overlay.

## Energía Creativa

No se consume pasivamente: se gana por minuto (con bonus de racha), por matches, logros y scoring. Se gasta para efectos próximos (doble XP, saltar desafíos, etc.).

## Extender un Juego Nuevo

1. Crear `assets/js/games/<nombre>.js` con IIFE.

2. Registrar con `GameCore.registerGame({ id, title, icon, mount, unmount })`.

3. Emitir `game.played` al iniciar y `game.completed` al terminar.

4. Para XP: usar `GameXP.addXP(monto, 'reason')` (si XP cargado).

5. Añadir estilos inline o consolidar en un CSS común posterior.

## Añadir Objetivo Diario Personalizado

- Editar `generateDailyObjectives()` en `gamification.js`.

- Definir: id, name, description, xp, target, type (evento), matcher(payload), stat (acumulador numérico opcional).

## Notificaciones

`GameNotifications.push({ type, title, message, icon, mergeKey })`.

Tipos: achievement, tip, milestone, energy, xp.

## Accesibilidad

- memory-game: roles ARIA grid/gridcell, progressbar con aria-valuenow, announcer polite/assertive.

- quiz-game: progressbar, aria-live feedback.

- notifications: role status (no robo foco).

## Próximas Mejores Prácticas (Pendientes)

- Near-miss + retry boost.

- Recompensas sorpresa.

- Micro-recompensas visuales (animaciones canvas / CSS).

- Documentar test manual y agregar suite e2e ligera.

## Licencia

Ver LICENSE principal.

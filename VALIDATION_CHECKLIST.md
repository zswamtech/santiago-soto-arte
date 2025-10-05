# Checklist de Validación Manual Juegos & Gamificación

> Objetivo: Verificar que las funciones clave (carga, navegación, persistencia, feedback, accesibilidad y sistemas de gamificación) operan correctamente en escenarios base y edge.

## 1. Carga Inicial

- [ ] La página principal carga sin errores en consola.
- [ ] `GameCore` emite `core.ready` (si existe) o se inicializa sin warnings críticos.
- [ ] Se inyectan estilos de notificaciones (ver elemento `#game-notifications-root`).
- [ ] Se crea/actualiza el entry de `gamification` en localStorage.

## 2. Hub / Navegación

- [ ] Listado de juegos visible (memoria, quiz, mixing...).
- [ ] Cambiar de un juego a otro limpia la UI anterior (sin restos visuales).
- [ ] Panel muestra streak y energía inicial.
- [ ] Daily objectives renderizados (3 items) y progresan tras acciones.
- [ ] Weekly challenge visible con nombre y progreso inicial 0.

## 3. Memory Game

- [ ] Se puede iniciar partida y voltear cartas con teclado (Tab + Enter/Espacio).
- [ ] ARIA roles en el grid y las cartas (role="button" / `aria-pressed` o similar) correctos.
- [ ] Al hacer match se incrementa puntuación y se emite `score.changed`.
- [ ] Al terminar se emite `game.completed` con `accuracy` y `durationMs`.
- [ ] XP otorgado por matches y bonus final aparece (notificación si >=30 XP total en un evento).
- [ ] Objetivo diario "Explorador Cromático" avanza solo si accuracy ≥65%.

## 4. Quiz Game

- [ ] Preguntas cargan y se puede seleccionar respuesta via teclado.
- [ ] Respuesta correcta emite `score.changed` y/o evento propio (quiz.answered) con flag `correct`.
- [ ] Preguntas de basePoints ≥20 pueden detonar micro recompensa perfect timing.
- [ ] Completar quiz emite `game.completed` (si implementado en actual versión) o al menos últimos eventos esperados.

## 5. Color Mixing / Otros Juegos

- [ ] Acciones que suben puntuación emiten `score.changed`.
- [ ] Objetivo diario "Mezcla Perfecta" progresa (3 incrementos positivos sin fallos contados correctamente si la lógica actual lo permite).

## 6. XP & Niveles

- [ ] `xp.gained` aparece en consola/inspector con amount correcto.
- [ ] Al superar threshold se emite `level.up` y notificación de nivel.
- [ ] Efecto `doubleXP` (si se usa power-up o near-miss aceptado) duplica solo la siguiente fuente planificada.

## 7. Energía Creativa

- [ ] Energía inicial aparece (puede ser 0-valor previo guardado).
- [ ] Ganar partida memory suma energía proporcional a matches (evento `energy.gained`).
- [ ] Ganar logro suma energía (25 por config).
- [ ] Gastar energía (si UI implementa un botón de prueba) reduce y emite `energy.spent`.
- [ ] Bonus de racha (streak) refleja incremento de ganancia por minuto (observar tras 1 tick minuto o forzar manualmente reloj).

## 8. Daily & Weekly

- [ ] Completar un daily emite `progression.objectiveCompleted`.
- [ ] Weekly incrementa progreso cuando se cumplen condiciones (ej. speed-week con partidas <120s).
- [ ] Cambio de día (forzar editando localStorage date) regenera objectives con version correcta.

## 9. Micro-Rewards

- [ ] Combo x3 visible (notificación) al encadenar 3 `score.changed` rápidos.
- [ ] Combo x5 extiende la secuencia y muestra mayor XP.
- [ ] Fast completion (<60s memory) otorga micro.fastCompletion.
- [ ] Perfect timing quiz aparece con preguntas de mayor basePoints.

## 10. Near-Miss

- [ ] Partida memory con accuracy 0.61–0.64 genera oferta near-miss (notificación con botón).
- [ ] Aceptar oferta muestra boost activo y duplica siguiente XP base del mismo juego.
- [ ] Oferta expira tras ~90s si no se usa (notificación de expiración).

## 11. Surprise System

- [ ] Al obtener un `xp.gained >=30` varias veces, ocasionalmente (poca prob) se dispara lucky burst (duplicación) — difícil, verificar en consola.
- [ ] Puntuación palíndroma produce XP sorpresa (probar manipulando deltas en dev).
- [ ] Racha (streak) número primo ≥5 dispara sorpresa.
- [ ] Quiet period (>90s sin XP) seguido de game.played da pulse XP.
- [ ] Memory perfecto (≥90% <90s) puede dar carta misteriosa de energía.

## 12. Notificaciones / UX

- [ ] Solamente 1 visible a la vez (cola funciona).
- [ ] Notificaciones con mergeKey se agrupan (ej. múltiples XP bursts).
- [ ] Botón de acción en near-miss dispara evento apropiado.
- [ ] Accesible: role="status" y aria-live="polite" presentes.

## 13. Persistencia

- [ ] Refresh conserva XP total, nivel, energía y progreso diarios.
- [ ] Cambio manual de localStorage version diaria fuerza regeneración en siguiente carga.
- [ ] Objetivos completados no se reactivan tras refresh.

## 14. Accesibilidad Global

- [ ] Navegación por Tab recorre elementos interactivos en orden lógico.
- [ ] Contraste suficiente para textos claves (ver herramienta DevTools Lighthouse > Accessibility).
- [ ] Se puede jugar memory y quiz sin mouse.
- [ ] No se generan traps de foco (Esc o tabulación salen correctamente de overlays, si hubiera).

## 15. Rendimiento Básico

- [ ] No hay crecimiento indefinido de listeners (abrir y cerrar juegos varias veces, contar event listeners en devtools si procede).
- [ ] Animaciones fluidas (no jank evidente en scroll o flips).

## 16. Errores / Consola

- [ ] Cero errores rojos tras un ciclo completo (abrir cada juego, completar memory, responder quiz, triggers micro/near/surprise).
- [ ] Warnings aceptables documentados (si alguno queda, listar causa y plan).

## 17. Edge Cases

- [ ] Memory: completar con 100% accuracy (objetivo no se sobre incrementa; micro/perfect triggers coherentes).
- [ ] Quiz: abandonar a mitad (si UI permite) no rompe estado global.
- [ ] Near-miss aceptado y luego refresh antes de redimir: no genera error (oferta ephemeral desaparece sin crash).
- [ ] Score grande mantiene formato correcto en notificaciones (no overflow layout).

## 18. Registro / Trazabilidad (opcional)

- [ ] Se puede seguir la secuencia de eventos clave en consola (core, game.completed, xp.gained, micro.*, nearMiss.*, surprise.*) para auditoría manual.

---
### Resultado

- [ ] Checklist completado en fecha: ____
- Observaciones
  - (añadir notas)

### Acciones derivadas

- [ ] Ajustar probabilidades sorpresa
- [ ] Mejorar mensaje accesible en near-miss
- [ ] Añadir panel histórico de sorpresas


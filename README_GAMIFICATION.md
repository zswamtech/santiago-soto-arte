# Gamificación - Roadmap y Diseño

Este documento describe la estrategia de gamificación para la plataforma de arte, alineada con el modelo de descuentos (Art Patron) y la evolución hacia engagement, retención y monetización ética.

---

## Objetivos Estratégicos

1. Aumentar retención y frecuencia de visita (sesiones semanales / usuario).
2. Incrementar conversión asistida: usuarios con puntos/cuenta realizan más compras.
3. Canalizar comportamiento deseado (descubrir obras, compartir, wishlist, feedback).
4. Crear progresión significativa sin devaluar el valor percibido de las obras.
5. Minimizar superficie de abuso (multi-cuentas, automatización de puntos, brute-force de desafíos).

---

## Principios de Diseño

- Server authoritative: Toda modificación de puntos en backend (fase 1 en adelante).
- Progresión legible: Claridad en lo que falta para siguiente nivel/recompensa.
- Recompensas mezcladas: Monetarias (% descuento limitado) + cosméticas (badges, titles) + acceso (previews anticipadas).
- Fair play by design: Límites diarios y antifraude determinista + heurístico.
- Extensible: Tablas y eventos diseñados para agregar nuevas misiones sin migraciones destructivas.
- Observabilidad: Métricas desde el día 1 (earn_rate, redemption_rate, fraude sospechoso, churn por nivel).

---

## Fases del Roadmap

### Fase 0 (Actual) - Fundaciones Existentes

- Juegos front (color mixing, memory, idea generator, motivation) sin persistencia server.
- Sistema Art Patron local: puntos ↔ descuentos convertidos (frontend) con validación final en backend vía cupones.
- Pricing engine robusto con CAP y combinación proporcional patron + cupón.
- Cupones respaldados en DB + redención idempotente.

### Fase 1 - Persistencia Server y Normalización

**Objetivo:** Migrar cálculo y almacenamiento de puntos al backend.

Componentes:

- Tabla `users` (o `patrons`) mínima (id, created_at, last_active_at, country_code).
- Tabla `user_points_ledger` (id, user_id, delta, reason, metadata JSONB, created_at, checksum opcional).
- Tabla `user_state` (user_id PK, total_points_cache, level, daily_earn_counter, last_reset_at).
- Endpoint `POST /api/gamification/earn` (tipos: VISIT, GAME_WIN, SHARE, WISHLIST_ADD). Server valida límites.
- Endpoint `GET /api/gamification/state` (puntos, nivel, próximos umbrales, boosts activos).
- Normalizar conversión puntos→descuento como catálogo controlado (p.ej. mapping en tabla `reward_catalog`).
- Bloquear conversión repetida abusiva (cooldown por reward_type o flag `consumable`).

Seguridad / Antifraude inicial:

- Rate limit earn por ip+user+reason.
- Hash stateless (HMAC) opcional en eventos front para tamper detection básica.
- Verificación referer/origin y lista blanca dominios.

### Fase 2 - Misiones y Logros Iniciales

**Objetivo:** Introducir objetivos explícitos que estructuran engagement.

Tablas nuevas:

- `missions` (id, code, type: DAILY|WEEKLY|ONCE, target, reward_points, enabled, starts_at, ends_at).
- `mission_progress` (id, mission_id, user_id, progress_current, completed_at, updated_at).
- `achievements` (id, code, criteria JSONB, reward_points, badge_asset, enabled).
- `achievement_unlocks` (id, achievement_id, user_id, unlocked_at).

Lógica:

- Evaluación incremental basada en eventos (observer pattern en backend).
- Recompensa emitida vía ledger (razón: MISSION_COMPLETION / ACHIEVEMENT_UNLOCK).

Endpoints:

- `GET /api/gamification/missions` (lista con estado user).
- `POST /api/gamification/missions/claim` (idempotente, valida completion).

### Fase 3 - Tienda de Recompensas y Conversiones Avanzadas

**Objetivo:** Permitir gastar puntos en variedad de recompensas.

Tablas:

- `reward_catalog` (id, code, category: DISCOUNT|COSMETIC|ACCESS|BOOST, payload JSONB, cost_points, enabled).
- `reward_redemptions` (id, reward_id, user_id, consumed_at, metadata JSONB, order_id nullable).

Tipos de recompensa:

- Descuentos one-shot (genera cupón interno dinámico, vence en X días).
- Badge estético (aparece en perfil / hover).
- Acceso anticipado (feature flag o gating en frontend / backend).
- Boost temporal (p.ej. +20% puntos de juegos durante 1h) con tabla `user_active_effects`.

### Fase 4 - Niveles, Rachas y Boosters

**Objetivo:** Aumentar motivación a largo plazo.

Agregar a `user_state`:

- `streak_days`, `streak_last_day`, `level_exp`, `next_level_exp`.
- Fórmula niveles: curva sub-lineal inicial, luego exponencial suave.
- Racha otorga multiplicador de earn (persistido en `user_active_effects`).

### Fase 5 - Social Ligero y Compartibilidad

**Objetivo:** Aumentar alcance orgánico.

Elementos:

- Perfil público opcional: alias, avatar, badges.
- Leaderboards filtrados (global semanal / mensual) con tabla `leaderboard_snapshots`.
- Invitaciones referidos: tabla `referrals` (referrer_user_id, referred_user_id, status, reward_granted_at).

### Fase 6 - Analítica, Antifraude Iterativa y Ajuste Dinámico

**Objetivo:** Escalar con integridad.

Herramientas:

- Modelos heurísticos (z-score earn_rate vs media nivel).
- Lista gris / flags en `user_state` (enum: NORMAL|REVIEW|SUSPENDED_PARTIAL|BANNED_EARN).
- Recomputo batch consistencia: sumar ledger y reconciliar con cache.
- Panel interno (inicialmente CSV export + Metabase / Superset).

### Fase 7 - Experimentos y Personalización

**Objetivo:** Optimizar.

- Feature flags por cohorte (tabla `experiments`, `experiment_assignments`).
- Ajuste dinámico de misiones (A/B): diferentes targets o rewards.
- Segmentación basada en valor (RFM tags en user_state).

---

## Modelo de Datos (Esquema Resumido)

```sql
users(id PK, created_at, last_active_at, country_code)
user_state(user_id PK FK→users.id, total_points_cache, level, level_exp, next_level_exp, daily_earn_counter, last_reset_at, streak_days, streak_last_day, status)
user_points_ledger(id PK, user_id FK→users.id, delta INT, reason TEXT, metadata JSONB, created_at, checksum)
missions(id PK, code UNIQUE, type, target INT, reward_points INT, enabled BOOL, starts_at, ends_at)
mission_progress(id PK, mission_id FK, user_id FK, progress_current INT, completed_at, updated_at)
achievements(id PK, code UNIQUE, criteria JSONB, reward_points INT, badge_asset TEXT, enabled BOOL)
achievement_unlocks(id PK, achievement_id FK, user_id FK, unlocked_at)
reward_catalog(id PK, code UNIQUE, category, payload JSONB, cost_points INT, enabled BOOL)
reward_redemptions(id PK, reward_id FK, user_id FK, consumed_at, metadata JSONB, order_id nullable FK)
user_active_effects(id PK, user_id FK, effect_code, multiplier NUMERIC, expires_at, source ENUM)
referrals(id PK, referrer_user_id FK, referred_user_id FK, status, created_at, reward_granted_at)
leaderboard_snapshots(id PK, period_code, generated_at, payload JSONB)
experiments(id PK, code UNIQUE, config JSONB, enabled BOOL)
experiment_assignments(id PK, experiment_id FK, user_id FK, variant TEXT, assigned_at)
```

---

## Flujos Clave

### Earn Points (Fase 1)

1. Front dispara `POST /api/gamification/earn` con `{reason: GAME_WIN, context}`.
2. Backend valida límites (diarios, por reason, cooldown).
3. Inserta en ledger (transacción) y actualiza `user_state.total_points_cache`.
4. Retorna nuevo balance y progresión nivel.

### Redención de Recompensa (Fase 3)

1. Usuario elige reward (catálogo cacheado en frontend).
2. Front llama `POST /api/gamification/redeem`.
3. Backend: chequea puntos suficientes + estado reward.
4. Transacción: inserta redemption, ledger delta negativo, genera artefacto (cupón / badge / efecto).
5. Respuesta con payload operable (ej: código cupón efímero).

### Misión Completion (Fase 2)

1. Evento (wishlist add) trigger → worker interno incrementa `mission_progress`.
2. Si `progress_current >= target` se marca `completed_at`.
3. Usuario llama claim: se verifica idempotencia y se emite reward.

---

## Endpoints Propuestos (Resumen)

- `POST /api/gamification/earn`
- `GET /api/gamification/state`
- `GET /api/gamification/missions`
- `POST /api/gamification/missions/claim`
- `GET /api/gamification/rewards/catalog`
- `POST /api/gamification/redeem`
- `GET /api/gamification/leaderboard?period=weekly`

(Posteriores: referrals, experiments.)

---

## Métricas & Observabilidad Inicial

- `earn_events_total{reason}`
- `earn_points_sum{reason}`
- `redemptions_total{category}`
- `avg_points_before_first_purchase` (cohorte conversión)
- `fraud_flagged_users_total`
- `mission_completion_rate{mission_code}`
- `daily_active_patrons` / `weekly_active_patrons`

Dashboards básicos: distribución puntos (percentiles), embudo earn→redeem, ratio multi-redeem fallidos.

---

## Antifraude (Evolutivo)

- Nivel 1: Rate limits, reason caps, IP clustering simple.
- Nivel 2: Heurísticas (earn/minuto, repetición patrón razones).
- Nivel 3: ML ligero (anomalía) + acción escalonada (flag → revisión → suspensión parcial → bloqueo earn).
- Nivel 4: Device fingerprint + correlación referidos.

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Inflación puntos | Devalúa descuentos | Curva progresiva costos + topes diarios |
| Abuso multi-cuenta | Coste financiero | Heurística IP + fingerprint + referidos cruzados |
| Fuga lógica front (earn local) | Inyección falsos puntos | Server authoritative, ignorar totales cliente |
| Bloqueos migratorios | Retraso roadmap | Tablas aditivas, evitar renames destructivos |
| Latencia earn percibida | Menor engagement | Cache write-behind y respuesta optimista (opc.) |

---

## Backlog Técnico Posterior

- Worker async para procesamiento de eventos masivos.
- Compresión ledger histórico (roll-ups mensuales).
- Export Metabase / Superset + definiciones métricas versionadas.
- Sistema de badges dinámicos (plantillas).
- Webhook interno para disparar notificaciones (email / push futuro).

---

## Prioridades Inmediatas

1. Implementar Fase 1 mínima (users, ledger, state, earn + state endpoints).
2. Migrar conversión puntos→descuento a reward_catalog (eliminar lógica ad-hoc front).
3. Añadir límites diarios configurables (ENV o tabla config).
4. Instrumentar métricas base y logging estructurado.

---

## Acciones Sociales → Cupones (Esquema Provisional)

Objetivo: Introducir un puente claro entre acciones sociales (engagement / difusión) y recompensas concretas (cupones escalonados) sin abrir una superficie amplia de fraude en la fase inicial.

### Catálogo Inicial de Acciones (Reason Codes)

| Código (reason) | Descripción | Limitación Inicial | Puntos Base | Desbloqueo / Efecto |
|-----------------|------------|--------------------|------------:|---------------------|
| SOCIAL_SHARE    | Usuario comparte una obra (botón share con verificación básica) | 3 por día | 20 | Progresa hacia cupón SOCIAL5 tras 5 shares válidos (rolling window 14d) |
| WISHLIST_ADD    | Añade obra a wishlist / favoritos | 10 por día | 5 | Al llegar a 25 wishlist total: desbloquea PATRON8 (si no lo tenía) |
| COMMENT_ART     | (Futuro) Comentario moderado aprobado | 5 por día | 15 | Con 10 comentarios aprobados: +150 puntos bonus |
| STREAK_7        | Completa racha de 7 días de visita (VISIT_DAILY) | 1 cada 7d | 0 | Genera cupón temporal STREAK10 (expira en 72h) |
| REFERRAL_VALID  | Referido completa primera compra | 10 por mes | 0 | Genera cupón REFERRAL10 de un solo uso |

Nota: Algunos generan puntos directos, otros generan cupones (reward) o ambos. Se almacenará el evento en ledger con `delta` correspondiente (o 0 si sólo genera cupón) y una entrada en `reward_redemptions` cuando corresponda.

### Tabla / Esquema Requerido (Fase 1.5)

Se puede usar `user_points_ledger` para registrar la acción y un micro-módulo de agregación:

```sql
social_action_counters(
  user_id FK,
  action_code TEXT,
  period_start DATE,  -- para límites diarios / semanales
  count INT,
  last_occurred_at TIMESTAMP
)
```

Índice sugerido: `(user_id, action_code, period_start)`.

### Flujo Ejemplo: SOCIAL_SHARE → SOCIAL5

1. Front ejecuta `navigator.share()` o fallback copy link y llama `POST /api/gamification/earn { reason: 'SOCIAL_SHARE', context:{ artworkId } }`.
2. Backend valida rate limit y registra ledger (+20) y aumenta contador.
3. Si contador acumulado (lifetime_valid_shares) == 5 y usuario no tiene reward SOCIAL5:
   - Inserta en `reward_redemptions` un cupón dinámico (code generado, percent=5, expires_at=+14d, scope user).
   - Devuelve payload `{ newReward: { code, percent, expiresAt } }`.
4. Front muestra modal “Cupón SOCIAL5 desbloqueado”.

### Cupón Temporal por Racha (STREAK10)

Al cerrar día 7 consecutivo:

```js
if (state.streak_days == 7 && !hasActiveReward('STREAK10')) {
  createReward({ code: generateScoped('STREAK10'), percent: 10, expires: now+72h, category: 'DISCOUNT', tags:['streak'] });
}
```

### Prevención de Abuso Inicial

- Shares: verificar `document.referrer` / origin y exigir cooldown mínimo (ej: 30s entre shares que cuentan) + hash de URL compartida para evitar spam de la misma obra en boucles rápidos.
- Wishlist: ignorar toggles repetidos (solo incrementa en transición false→true). Registrar `artworkId` en metadata ledger para auditorías.
- Comentarios: sólo cuentan cuando pasan moderación (flag `approved=true`).
- Racha: calcular server-side comparando `last_active_at :: DATE` y el día actual.
- Referidos: cupón sólo se genera cuando el referido completa una compra `paid` (hook en webhook de pago con order.customer_email correlacionado a referral.pending).

### Métricas Nuevas Propuestas

- `social_share_valid_total` / `social_share_blocked_total`.
- `coupon_generation_total{source=SOCIAL_SHARE|STREAK|REFERRAL}`.
- `streak_retention_rate` (usuarios que completan ≥1 racha en 30d / usuarios activos 30d).
- `referral_conversion_rate` (referidos que compran / referidos registrados).

### Orden de Implementación Recomendado

1. Añadir counters agregados (persistencia mínima) y endpoints extienden `earn` (sin UI extra).
2. Implementar generación automática de cupones discretos (prefijo + hash corto) ligados a user.
3. Integrar front: notificaciones de reward (`window.dispatchEvent(new CustomEvent('reward_unlocked', {detail}))`).
4. Telemetría + dashboards básicos.
5. Moderación de comentarios (si se prioriza la acción COMMENT_ART).

### Consideraciones Futuras

- Escalada a leaderboard: ranking por “difusión” (shares efectivos) con penalización por patrones anómalos.
- Limitación geográfica si se detectan granjas de referidos.
- Firma de acciones sensibles (HMAC) si se incrementa abuso.

Esta sección es provisional y se consolidará en la fase 2–3 del roadmap dependiendo de telemetría inicial de engagement.

---

## Notas de Implementación

- Usar transacciones para (ledger insert + cache update) con verificación del total recomputado cada N operaciones (consistencia eventual).
- `user_points_ledger.checksum`: HMAC(delta||reason||created_at||user_id) para detectar alteraciones manuales.
- Los boosts se aplican multiplicando delta antes de persistir (explicar en metadata el breakdown).
- Mantener funciones puras para fórmula de niveles (probadas con tests).

---

## Ejemplo de Razones (reason ENUM / constantes)

VISIT_DAILY, GAME_WIN, WISHLIST_ADD, SHARE_SOCIAL, MISSION_REWARD, ACHIEVEMENT_UNLOCK, REWARD_REDEMPTION, PURCHASE_BONUS.

---

## Consideraciones de Seguridad

- No exponer puntos firmados por cliente; siempre recomputar server.
- Validar que redenciones de descuento generan cupones internos scoped a user_id (evita filtraciones).
- Limitar enumeración de rewards: paginar y filtrar por enabled.

---

## Roadmap Visual (Resumen)

F0: Juegos locales → F1: Ledger server → F2: Misiones/Achievements → F3: Tienda Rewards → F4: Niveles/Rachas → F5: Social → F6: Antifraude avanzado → F7: Experimentos.

---

## Cierre

Este roadmap puede ajustarse tras telemetría inicial (primeras 2 semanas post Fase 1). Mantener foco en integridad y claridad de progresión evita deuda temprana y maximiza valor de cada iteración.

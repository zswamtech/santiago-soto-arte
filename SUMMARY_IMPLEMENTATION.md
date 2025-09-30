# Resumen Final de Implementación (Pagos, Descuentos y Gamificación Interina)

Fecha: 2025-09-30

## 1. Alcance Completado

| Área | Estado | Notas Clave |
|------|--------|-------------|
| Pricing Engine | ✅ | Shipping escalonado (tiers), CAP 25% reescalando proporcional, combinación patron+cupón |
| Cupones | ✅ | Tablas `coupons`, `coupon_redemptions`, redención idempotente vía webhook Stripe |
| Persistencia Órdenes | ✅ | Tabla `orders` con snapshot pricing completo + flags y porcentajes aplicados |
| Webhooks Stripe | ✅ | Firma verificada, idempotencia (`webhook_events` + índice redención) |
| Descuento Patron Server | ✅ | Mapping puntos→% en backend; ignora porcentajes cliente |
| Snapshot Puntos | ✅ | Columna `patron_points_snapshot` (migración 004) auditiva |
| Documentación Pagos | ✅ | `README_PAYMENTS.md` actualizado con estado interino y mitigaciones |
| Roadmap Gamificación | ✅ | `README_GAMIFICATION.md` + sección Acciones Sociales→Cupones |
| Acciones Sociales Diseño | ✅ | Esquema provisional (share, wishlist, streak, referral, comment) |

## 2. Arquitectura Actual (Vista Lógica)

Frontend:

- CartModule + PaymentGateway → construyen `items`, muestran shipping progress y descuentos.
- ArtPatronSystem (local) mantiene puntos y niveles (no autoridad). Envía `patronPoints` como dato declarativo.

Backend (funciones /api/payments):

- `create-intent` → valida entrada, deriva patron % (mapping), aplica cupón (DB), ejecuta `computePricing`, crea PaymentIntent, persiste orden.
- `webhook` → procesa `payment_intent.succeeded`, marca orden `paid`, registra redención cupón.
- Repositorio `order-repository` con adapter Postgres + fallback memoria.

Persistencia (Postgres):

- `orders`, `webhook_events`, `coupons`, `coupon_redemptions`, `schema_migrations` (+ nuevas columnas de porcentajes y snapshot puntos).

## 3. Modelo de Datos Relevante (Extracto Simplificado)

```sql
orders(id PK, provider, provider_ref, status, currency,
       subtotal, discount_total, tax, shipping, total,
       shipping_tier, discount_cap_applied BOOLEAN,
       discounts JSON, items JSON, pricing_snapshot JSON,
       customer_email, customer_name,
       patron_percent_applied INT, coupon_percent_applied INT,
       coupon_code TEXT, patron_points_snapshot INT,
       created_at, updated_at)

coupons(code PK, percent, max_uses, uses, enabled, expires_at, created_at)

coupon_redemptions(id PK, code FK→coupons, order_id, user_id, redeemed_at)
webhook_events(event_id PK, provider, order_id, type, raw JSON, created_at)
```

## 4. Flujo de Descuentos y CAP (Ejemplo)

1. Cliente envía 980 `patronPoints` y `couponCode = PATRON10`.
2. Backend mapea 980 → 12% patron (ejemplo de tramo) y obtiene cupón 10%.
3. Suma teórica: 22% (< 25%) → no reescalado. `discounts = { patron: X, coupon: Y, total: X+Y, appliedCap:false }`.
4. Shipping se calcula sobre `netAfterDiscount`.
5. Si cupón fuera 15% y patron 15% (30% teórico): factor = 25/30 = 0.833..., se multiplican cada componente y se ajusta redondeo sobre descuento patron.

## 5. Seguridad y Mitigaciones Vigentes

- Server authoritative en: precio unitario oficial, descuentos aplicados, shipping, impuestos, CAP.
- Cupón validado en DB (evita percent arbitrario front).
- Mapping patron puntos→% truncado por CAP (límite financiero estricto).
- Webhook idempotente y persistente.
- Snapshot pricing inmutable por orden (`pricing_snapshot`).

## 6. Limitaciones / Deuda Técnica

| Ítem | Riesgo | Estado Actual | Plan Próximo |
|------|--------|---------------|--------------|
| Ledger de puntos | Inflación silenciosa | No implementado | Fase 1 gamificación (users + ledger) |
| Validación desbloqueo cupón por puntos | Uso anticipado | No verificada | Cruzar puntos reales vs catálogo |
| Firma snapshot carrito | Manipulación en tránsito | No firmada | HMAC `{items, couponCode, patronPercent}` en create-intent |
| Métricas antifraude | Ceguera inicial | Limitado a logs | Prometheus counters earn/redemption |
| Multi-proveedor (Nequi/Wompi) | Riesgo divergencia | Stub parcial | Adapter común + estado provider |
| Reintentos PaymentIntent front | Duplicidad UI | Controlado por Stripe | Añadir lock en localStorage idempotente |

## 7. Próximos Pasos Priorizados (Roadmap Técnico Corto)

1. Fase 1 Gamificación: `users`, `user_points_ledger`, `user_state`, `earn` & `state` endpoints.
2. Sustituir envío `patronPoints` → obtener nivel y puntos desde backend autenticado.
3. Firmar snapshot de intent (HMAC secreto server) y verificar en webhook para detectar manipulación.
4. Métricas: publicar `pricing_discount_cap_hits_total`, `coupon_redemptions_total`, `patron_discount_distribution_bucket`.
5. Panel admin simple (JSON + basic auth) para activar/desactivar cupones y ver órdenes recientes.
6. Integrar expiración dinámica de cupones y (opcional) uso único por usuario.
7. Preparar adapter segundo proveedor de pago (interfaz común: createIntent, parseWebhook).

## 8. Tokenización / Futuro (High-Level)

- Encapsular órdenes “tokenizables” con metadata on-chain (fase exploratoria) solo tras estabilizar pagos multiplataforma.
- Requiere: hash de la obra + provenance chain + disclaimers legales.

## 9. Recomendaciones de Hardening Inmediato

- Activar logs estructurados (JSON) para create-intent / webhook.
- Añadir cabecera de versión pricing (`X-Pricing-Schema: v1`) para facilitar cambios compatibles.
- Implementar test de regresión para reescalado CAP (ensayar varios pares porcentuales).
- Monitorizar latencia create-intent (p90) y establecer budget < 250ms.

## 10. Checklist de Cierre (Esta Iteración)

- [x] Persistencia de descuentos y snapshot puntos
- [x] CAP proporcional robusto
- [x] Redención cupones idempotente
- [x] Documentación de estado interino y mitigaciones
- [x] Roadmap social → cupones documentado

## 11. Indicadores Clave a Medir Después de Activar Fase 1

| Métrica | Objetivo Inicial |
|---------|------------------|
| avg_points_before_purchase | Establecer baseline (comparar conversión) |
| coupon_use_rate | < 35% órdenes (evitar erosión margen) |
| cap_activation_rate | < 10% (si sube, revisar estructura percent) |
| time_to_paid (intent→webhook) | p95 < 8s |
| duplicate_webhook_events | ~0 (solo reintentos Stripe) |

## 12. Resumen Ejecutivo

La base de pagos y descuentos cumple con principios de seguridad financiera (server authoritative + CAP). El “riesgo interino” de puntos manipulables está acotado y claramente documentado. Para avanzar sin deuda acumulativa es crítico priorizar el ledger de puntos y firmar snapshots antes de expandir engagement social o múltiples proveedores de pago.

> Estado: Plataforma lista para evolucionar a gamificación persistente y analítica antifraude mínima sin necesidad de refactors disruptivos.

---
Autor: Equipo Técnico Santiago Soto Arte

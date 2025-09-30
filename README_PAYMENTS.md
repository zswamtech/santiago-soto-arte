# Pagos Reales - Arquitectura y Procedimientos

Esta guía documenta cómo está implementado el flujo de pagos (Stripe PaymentIntents) y los pasos profesionales para operar en producción.

## Flujo General

1. Frontend envía items (id, quantity) a `POST /api/payments/create-intent`.
2. Backend valida, recalcula precios oficiales y crea PaymentIntent Stripe.
3. Respuesta: `clientSecret` + `orderId`.
4. Frontend confirma tarjeta con `stripe.confirmCardPayment` usando Elements.
5. Stripe procesa (3DS si aplica) -> estado `succeeded`.
6. Webhook `/api/payments/webhook` marca orden como `paid`.
7. UI muestra éxito y se limpia el carrito.

## Endpoints

- `POST /api/payments/create-intent` → body: `{ items:[{id,quantity}], customer? }`
- `POST /api/payments/webhook` → Stripe envía eventos (firma verificada).

## Orden Interna

Estructura (memoria temporal):

```json
{
  "orderId": "ord_...",
  "items": [ { "id":"canvas_small", "quantity":2, "unitAmount":50000, "lineTotal":100000 } ],
  "pricing": { "subtotal": 100000, "discount":0, "tax":10000, "shipping":15000, "total":125000 },
  "status": "pending|paid|failed",
  "paymentIntentId": "pi_...",
  "provider": "stripe"
}
```

## Seguridad Clave

- Montos se calculan solo server-side (`computePricing`).
- Catálogo controlado en `api/payments/util/pricing.js`.
- Webhook verifica firma (`STRIPE_WEBHOOK_SECRET`).
- Idempotencia: Registro de `event.id` procesados.
- Nunca exponer `STRIPE_SECRET_KEY` en frontend.

## Variables de Entorno (.env)

Ver `.env.example` y configurar en Vercel.

## Estados de Pago

- `pending` → creado
- `paid` → confirmado (webhook)
- `failed` → fallo final
Otros estados futuros: `refunded`, `canceled`.

## Próximos Pasos Recomendados

## Persistencia de Órdenes (Repository)

Se implementó un repositorio con adapter Postgres y fallback en memoria.

### Flujo de creación (create-intent)

1. Se calcula pricing autoritativo.
2. Se crea PaymentIntent (Stripe) y se obtiene `paymentIntent.id`.
3. Se persiste orden en tabla `orders` (o memoria si no hay `POSTGRES_URL`).

### Flujo webhook

- Verifica idempotencia consultando `webhook_events` o set en memoria.
- Actualiza estado `pending -> paid` o `failed` sin retroceder desde `paid`.

### Tablas principales

```sql
-- Ver migrations/001_init.sql
SELECT * FROM orders LIMIT 1;
SELECT * FROM webhook_events LIMIT 1;
```

### Campos críticos

- `pricing_snapshot`: JSON congelado para auditoría (no recalcular históricos).
- `discounts`: desglose actual de fuentes de descuento.
- `discount_cap_applied`: boolean que señala uso del CAP 25%.

### Idempotencia

- PK en `webhook_events.event_id` previene reprocesar.
- Fallback: set en memoria si DB no disponible.

### Fallback Strategy

Si falla conexión Postgres: se loguea warning y se usa memoria (solo recomendado en dev). En producción preferir fallo explícito para no perder órdenes.

### Próxima evolución

- Añadir `order_events` para histórico granular.
- Endpoint admin: lista filtrada por `status` y rango de fechas.
- Validar firma adicional para futuros proveedores.

## Pricing v2 (Avanzado)

Se implementó una capa de pricing avanzado tanto en frontend (`CartModule`) como en backend (`computePricing`) con las siguientes reglas. (Actualizado: refinamiento incluye `netAfterDiscount`, `shippingProgress` y visualizaciones de conversión.)

### 1. Descuentos

- Fuentes actuales: Programa Art Patron (porcentual) y placeholder de cupón (todavía 0%).
- CAP global: El total combinado de descuentos no puede exceder 25% del subtotal. Si ocurre, se reescala proporcionalmente y se marca `appliedCap=true`.
- Breakdown de descuentos:

```json
"discounts": {
  "patron": 12000,
  "coupon": 0,
  "total": 12000,
  "appliedCap": false
}
```

### 2. Shipping Escalonado (solo si hay item físico o custom)

Basado en subtotal neto tras descuentos:

| Neto (COP) | Shipping | Tier |
|-----------:|---------:|------|
| < 100.000  | 18.000   | T1   |
| 100k–199.999 | 15.000 | T2   |
| 200k–299.999 | 10.000 | T3   |
| ≥ 300k     | 0        | FREE |

Campos adicionales en breakdown:

- `shippingTier`: tier actual.
- `shippingProgress`: objeto `{ nextTier: { tier, threshold, shippingCost }, missing }` o `nextTier: null` si FREE o no hay mejora posterior.


### 3. Impuestos

- 10% aplicado a base neta si existe al menos un producto físico o custom.

### 4. Estructura Breakdown Backend (refinada)

```json
{
  "subtotal": 180000,
  "discounts": {
    "patron": 18000,
    "coupon": 0,
    "total": 18000,
    "appliedCap": false
  },
  "netAfterDiscount": 162000,
  "shipping": 10000,
  "shippingTier": "T3",
  "shippingProgress": {
    "nextTier": { "tier": "FREE", "threshold": 300000, "shippingCost": 0 },
    "missing": 138000
  },
  "tax": 16200,
  "total": 188200
}

Nota: `netAfterDiscount` es la base para determinar el tier de shipping. `missing` se expresa en centavos (COP). La UI formatea a pesos.

Campo derivado en UI (no parte del breakdown backend): `effectiveDiscountPercent = discounts.total / subtotal * 100` (con CAP visible si `appliedCap=true`).
```

### 5. Validación

- Casos nuevos en `TEST_PLAN.md`: CAL7 (tiers), CAL8 (CAP) y CAL9 (hint shipping / progreso próximo tier).
- Frontend refleja mismos cálculos para UX inmediata; backend sigue siendo autoridad.

### 6. Futuro

- Añadir cupones reales (campo `couponPercent`) – UI ya tiene placeholder deshabilitado.
- Parametrizar tiers vía archivo de configuración o panel admin.
- Registrar histórico de cambios de reglas para auditoría.


- Persistencia real (DB) reemplazando `order-store.js`.
- Emails post pago (SendGrid, Resend).
- Integrar Wompi/Nequi: endpoint que crea transacción y escucha su webhook con mismo `orderId`.
- Encriptar/firmar cookies con `orderId` para seguimiento.
- Panel interno para revisar órdenes.

### (Stub) Flujo Nequi / Wompi

1. Frontend llama a `POST /api/payments/nequi-init` con items.
2. Se crea orden interna (provider = wompi) y se devuelve referencia simulada.
3. Respuesta contiene `nextAction.url` (stub). En real: redirigir a checkout Wompi o mostrar QR.
4. Usuario paga con Nequi en Wompi.
5. Wompi envía webhook (pendiente de implementar) a `/api/payments/wompi-webhook`.
6. Webhook verifica integridad (firma HMAC con WOMPI_PRIVATE_KEY) y actualiza orden a `paid`.
7. UI puede hacer polling a un endpoint `/api/payments/order-status?orderId=...`.

Archivos involucrados del stub:
 
- `api/payments/nequi-init.js`

Para implementación real: seguir documentación oficial Wompi, crear hash firmado para `integrity_signature` y manejar estados `APPROVED`, `DECLINED`, `VOIDED`, etc.

## Pruebas Requeridas

| Caso | Acción | Resultado |
|------|--------|-----------|
| Pago éxito | Tarjeta 4242 4242… | Orden → paid |
| 3DS | Tarjeta 4000 0027 6000 3184 | Requiere autenticación |
| Fondos insuficientes | 4000 0000 0000 9995 | failed |
| Reintento red | Repetir confirmCardPayment | Un solo cobro |
| Webhook duplicado | reenviar evento | Ignorado (idempotencia) |

## Checklist Go-Live

- [ ] Claves live agregadas en Vercel (no commit)
- [ ] Webhook live configurado y probado (Stripe CLI)
- [ ] Domain verificado HTTPS
- [ ] Legal: términos, privacidad, reembolsos
- [ ] Revisar rounding (centavos) y currency final
- [ ] Logs verificados sin datos sensibles

## Stripe CLI (Testing)

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Notas

## Migraciones

Ejecutar migraciones (requiere variable `POSTGRES_URL`):

```bash
npm run migrate
```

El script `scripts/run-migrations.js`:

- Detecta archivos en `./migrations` ordenados por prefijo numérico.
- Crea tabla `schema_migrations` si no existe.
- Aplica sólo las versiones no registradas.
- Hace `BEGIN/COMMIT` y rollback en error.

Agregar una nueva migración:

1. Crear archivo `migrations/002_descripcion.sql`.
2. Incluir SQL idempotente (usar `IF NOT EXISTS`).
3. Ejecutar `npm run migrate`.
4. Verificar con `SELECT * FROM schema_migrations;`.

### Integración CI

El workflow `.github/workflows/ci-migrations.yml` ejecuta:

1. Postgres servicio efímero.
2. `npm install`.
3. `npm run migrate` (verifica idempotencia / sintaxis).
4. Pequeño smoke para asegurar presencia del endpoint de pago.

Fallo en migraciones bloquea merge, evitando despliegues con esquemas desactualizados.


Implementación minimalista: cambiar `automatic_payment_methods` si deseas controlar métodos manualmente. Para multi-proveedor, crear adapter adicional.

---
Autor: Equipo Técnico Santiago Soto Arte

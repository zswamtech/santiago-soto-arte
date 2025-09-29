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

Implementación minimalista: cambiar `automatic_payment_methods` si deseas controlar métodos manualmente. Para multi-proveedor, crear adapter adicional.

---
Autor: Equipo Técnico Santiago Soto Arte

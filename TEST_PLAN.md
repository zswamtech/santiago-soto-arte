# Plan de Pruebas y Checklist Go-Live

## Objetivo

Asegurar que el flujo de carrito y pagos (Stripe PaymentIntent + stub Nequi/Wompi) funciona de forma consistente, segura y resiliente antes de pasar a producción.

---
 
## Alcance

Incluye:

- Estado y persistencia del carrito (CartModule).
- Cálculos de subtotal, descuento, impuestos y envío.
- UI (sidebar, widget flotante, checkout, accesibilidad básica).
- Flujo Stripe (create-intent + confirmCardPayment + webhook).
- Stub Nequi/Wompi (`/api/payments/nequi-init`).
- Idempotencia webhooks y protección contra manipulación de montos.

No incluye (futuro):

- Persistencia en base de datos de órdenes.
- Integración real Wompi/Nequi.
- Emails transaccionales.

---
 
## Matriz de Casos (Stripe)


| # | Caso | Pasos Clave | Resultado Esperado |
|---|------|-------------|--------------------|
| 1 | Pago exitoso | Carrito con 2 ítems, checkout, tarjeta test válida | Pantalla éxito, webhook marca paid |
| 2 | Tarjeta declinada | Usar 4000 0000 0000 9995 | Error visible, permite reintento |
| 3 | 3DS requerido | Usar 4000 0027 6000 3184 (autenticar) | Fluye a success tras 3DS |
| 4 | Cancelar 3DS | Iniciar 3DS y cerrar/cancelar | Estado pendiente/reintento claro |
| 5 | Reintento tras fallo | Fallar, modificar carrito, pagar | Nuevo PaymentIntent con monto actualizado |
| 6 | Manipulación montos | Alterar price en dev tools antes de POST | Backend corrige / ignora manipulación |
| 7 | Webhook post-cierre | Confirmar pago y cerrar pestaña | Orden pasa a paid vía webhook |
| 8 | Webhook duplicado | Reenviar mismo evento (stripe CLI) | Segundo ignorado (idempotencia) |
| 9 | Evento desconocido | Enviar tipo arbitrario | Log “unhandled” sin 500 |
|10 | Latencia alta | Throttling red en confirm | Spinner y no doble envío |
|11 | Clave Stripe inválida | Cambiar temporalmente secret | 500 controlado + mensaje usuario |
|12 | Timeout confirmación | Offline antes de confirm | Mensaje conexión, reintento posible |
|13 | Webhook primero | Simular retraso respuesta create-intent | Estado final consistente (paid) |

---
 
## Casos Stub Nequi/Wompi

| # | Caso | Pasos | Resultado |
|---|------|-------|----------|
|14 | Inicio stub | curl POST /api/payments/nequi-init | JSON con orderId, reference, nextAction |
|15 | Reintentos | Llamar 2 veces consecutivas | Referencias distintas |
|16 | Estructura | Validar campos provider/method | provider=wompi, method=nequi |

---
 
## Carrito / Estado

| # | Caso | Resultado |
|---|------|-----------|
|17 | Persistencia reload | Carrito intacto tras refresh |
|18 | Sync multi-tab | Cambios reflejados en otra pestaña |
|19 | Checkout vacío | Bloquea pago, alerta clara |
|20 | Cantidades edge | qty=0 elimina, qty alta correcta |
|21 | Impuestos/envío | Cálculo consistente, sin NaN |
|22 | Evento cart:updated | Listener recibe snapshot válido |
|23 | Widget pulsos rápidos | Animación reinicia sin glitch |
|24 | Accesibilidad teclado | Enter/Space abre, Escape cierra |
|25 | Redondeos | Totales coherentes con suma ítems |

---
 
## Seguridad / Robustez

| # | Caso | Resultado |
|---|------|-----------|
|26 | SKU inexistente | 400 validación |
|27 | Cantidad negativa | Rechazo / normalización segura |
|28 | Doble click pagar | Un solo intent creado |
|29 | Replay webhook viejo | No cambia updatedAt relevante |
|30 | Stress adds/removes | Sin bloqueos ni degradación severa |

---
 
## Cálculo Avanzado (Pricing v2)

| # | Caso | Resultado |
|---|------|-----------|
|31 | CAL7 Shipping escalonado | Cruzar límites (<100k, 100k, 200k, 300k neto). Esperado: shipping 18000→15000→10000→0 consistente |
|32 | CAL8 CAP descuento | Forzar >25% descuentos combinados. Esperado: descuento total limitado a 25% y breakdown indica CAP |
|33 | CAL9 Hint próximo tier | Carrito físico con netAfterDiscount ligeramente bajo al umbral: verificar `shippingProgress.missing` >0 y hint UI “Te faltan $X…”; al superar umbral, hint cambia o desaparece mostrando nuevo tier / envío gratis |

---

## Persistencia de Órdenes

| # | Caso | Resultado |
|---|------|-----------|
|34 | ORD1 Crear y leer | Orden creada aparece en DB (SELECT * WHERE id=...) con pricing_snapshot inmutable |
|35 | ORD2 Webhook duplicado | Segundo evento misma id no cambia updated_at ni estado |
|36 | ORD3 Estado no retrocede | Intentar marcar failed tras paid no altera estado paid |
|37 | ORD4 Fallback memoria | Sin POSTGRES_URL se crea en store memoria y no lanza 500 |

---
 
## Datos a Verificar por Caso

- Estado final (pending → paid / failed).
- Montos (frontend vs backend) coherentes.
- Logs de errores sin stack leaks sensibles.
- Idempotencia: no repite transiciones.
- Accesibilidad: foco y navegación básica.

---
 
## Checklist Go-Live

 
### Infraestructura

- [ ] Variables en Vercel (live): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
- [ ] Webhook configurado en Stripe apuntando a prod.
- [ ] Timezone unificado (UTC) para auditoría.

 
### Código / Config

- [ ] Sin console.log sensibles (solo info).
- [ ] Precios autoritativos solo backend.
- [ ] Header de seguridad (Vercel / meta) revisado.

 
### Pagos

- [ ] Prueba real con tarjeta mínima.
- [ ] Reembolso manual documentado.
- [ ] Moneda consistente (COP o USD) y rounding claro.

 
### Webhooks

- [ ] Evento duplicado ignorado.
- [ ] Signature inválida → 400.
- [ ] Retraso UI no rompe reconciliación.

 
### Carrito

- [ ] Versionado schema (bump futuro si cambia estructura).
- [ ] Fallback si localStorage bloqueado (sin crash).

 
### Seguridad

- [ ] No claves en Network inspector.
- [ ] Montos recalculados server-side.
- [ ] Dependencia stripe fijada (no range inseguro).

### UX / Accesibilidad

- [ ] Focus al abrir/cerrar panel.
- [ ] Mensajes en español y claros.
- [ ] Loading states visibles (botón deshabilitado).

### Observabilidad

- [ ] Logs de intent failed identificables.
- [ ] Métrica manual (conteo intents vs success) inicial plan.

### Documentación

- [ ] README actualizado.
- [ ] .env.example sin valores reales.
- [ ] Plan de pruebas (este archivo) enlazado internamente.

### Contingencia

- [ ] Procedimiento si Stripe cae (mensaje + método alternativo futuro).
- [ ] Plan rollback (commit hash estable).

### Post Go-Live

- [ ] Reconciliar primer día totales Stripe vs ventas esperadas.
- [ ] Revisar eventos no manejados en logs.

---
 
## Guía Rápida de Ejecución de Pruebas

1. Limpiar localStorage (para reproducibilidad).
2. Añadir ítems variados (product + custom_artwork si aplica).
3. Validar UI widget y sidebar antes de pago.
4. Ejecutar casos 1–13 (Stripe). Priorizar fallos temprano.
5. Validar persistencia (casos 17–18) abriendo segunda pestaña.
6. Forzar manipulaciones (casos 6, 26–27) desde DevTools.
7. Simular duplicados webhook (stripe CLI) y observar idempotencia.
8. Registrar hallazgos y marcar checklist.

---

## Estrategia de Re-ejecución

Si un caso crítico falla (1, 2, 6, 8, 28):

- Bloquear despliegue.
- Crear issue con: descripción, pasos, logs, snapshot payload.
- Corregir → re-ejecutar casos dependientes + smoke (1, 7, 8).

---

## Riesgos Abiertos / Futuro

| Riesgo | Mitigación Futura |
|--------|-------------------|
| In-memory store órdenes | Persistir en DB (SQLite / KV) |
| Falta de reintento webhook automático | Implementar DLQ / requeue simple |
| Sin antifraude adicional | Añadir verificación address + correo |
| Sin logging estructurado | Introducir endpoint log collector / 3rd-party |

---

## Estado

Este documento cubre versión inicial modular (CartModule v1). Actualizar cuando se introduzca persistencia o multi-método real (Wompi).

---

© 2025 Santiago Soto Arte

# Guía de Validación Funcional (Carrito + Pagos)

Esta guía describe pasos concretos y ordenados para validar el flujo completo: añadir productos, persistencia, checkout y pago (Stripe), así como condiciones de error principales.

---

## 1. Preparación del Entorno

1. Abrir el sitio en una ventana limpia (sin cache forzada si hubo cambios grandes).
2. Abrir Herramientas de Desarrollador (Console + Network preserve log).
3. Limpiar `localStorage` manualmente (`localStorage.removeItem('santiago_soto_cart')`).
4. Verificar que el widget flotante del carrito NO se muestre al iniciar.

Resultado esperado: Sin errores en consola al cargar.

---

## 2. Añadir Ítems al Carrito

1. Añadir un ítem tipo producto (con botón `.add-to-cart-btn`).
2. Observar notificación y widget aparece con count=1 y total correcto.
3. Añadir el mismo ítem de nuevo → quantity debe incrementarse y subtotal reflejar multiplicación.
4. Añadir un segundo ítem distinto (si existe) o un encargo personalizado.
5. Abrir sidebar (click widget) y validar listado, subtotales y total.

Resultado esperado: Cálculo subtotal = suma(price * quantity) de cada línea.

---

## 3. Persistencia y Multi-Pestaña

1. Mantener la pestaña A abierta; abrir una nueva pestaña B con la misma URL.
2. Confirmar que B muestra mismo conteo y totales tras carga.
3. En pestaña B incrementar cantidad de un ítem (+).
4. Cambiar a pestaña A y verificar actualización automática (evento storage).
5. Refrescar A y confirmar estado consistente.

Resultado esperado: Ambas vistas sincronizadas; sin duplicaciones.

---

## 4. Modificación de Cantidades y Eliminación

1. En el sidebar, disminuir cantidad hasta 1 y luego intentar un “-” adicional (debe quedar deshabilitado/impedir <1).
2. Pulsar eliminar (🗑️) en un ítem.
3. Verificar recálculo de subtotal / total y desaparición del item.
4. Usar “Vaciar Carrito” y confirmar estado vacío (mensaje vacío y widget oculto).

Resultado esperado: Nunca cantidades negativas; widget desaparece si no hay items.

---

## 5. Descuentos / Impuestos / Envío

1. Si el sistema de gamificación otorga descuento, simular puntos necesarios (o forzar en consola `artPatronSystem.addPoints('purchase', 500)` si existe API) y volver a añadir un ítem.
2. Confirmar línea “Descuento Art Patron” aparece cuando >0.
3. Asegurar impuestos (10%) solo aparecen si hay producto físico ó custom (no solo digitales).
4. Verificar envío: flat 15 se aplica si subtotal con descuento < 250; si superas 250 se muestra 0 ó desaparece línea.

Resultado esperado: total = (subtotal - descuento) + tax + shipping.

---

## 6. Checkout (Stripe)

1. Con carrito con al menos 1 ítem físico, abrir checkout.
2. Validar que botón “💳 Completar información” está deshabilitado inicialmente.
3. Completar campos requeridos (Nombre, Apellido, Email y Dirección si aplica).
4. Introducir tarjeta de prueba Stripe (ej: 4242 4242 4242 4242, fecha futura, CVC 123, zip cualquiera).
5. Verificar botón actualiza a “Pagar $X”.
6. Hacer click y observar transición: “Procesando pago…” → “Confirmando tarjeta…”.
7. Tras éxito, pantalla de confirmación con ID y monto.

Resultado esperado: Carrito se vacía; widget desaparece después; no errores en consola.

---

## 7. Errores de Pago Simulados

1. Repetir checkout con tarjeta decline: 4000 0000 0000 9995.
2. Esperar mensaje de error (alert) y botón vuelve a estado pagable.
3. Reemplazar tarjeta por válida y reintentar → éxito.
4. 3DS: usar 4000 0027 6000 3184 para forzar autenticación y completar.
5. Cancelar modal 3DS (cuando aparezca) para verificar reintento posible.

Resultado esperado: No se crean duplicados de PaymentIntent visibles (consola / network). Reintento funcional.

---

## 8. Manipulación Cliente (Resiliencia)

1. Antes de pagar, en DevTools modificar dataset del botón add-to-cart para poner `price: 1` en un producto caro y añadir.
2. Observar que backend recalcula de todos modos (confirmar amount server en network de `/create-intent`).
3. Forzar payload manual (Fetch manual en console) con SKU inexistente → esperar 400.

Resultado esperado: Monto final difiere si manipulado; error controlado en SKU inválido.

---

## 9. Webhooks (Manual / Opcional)

1. Usar stripe CLI (si disponible local) para reenviar un `payment_intent.succeeded` con mismo ID.
2. Verificar que la lógica (logs) no duplica estado.
3. Enviar evento tipo desconocido → log “unhandled”.

Resultado esperado: Idempotencia preservada.

---

## 10. Accesibilidad Básica

1. Navegar con Tab hasta widget flotante → Enter abre carrito.
2. Press Escape dentro del sidebar → se cierra.
3. En checkout, Tab traversal ordenado; errores de tarjeta muestran texto legible.

Resultado esperado: No focus atrapado; botones tienen rol semántico correcto.

---

## 11. Limpieza y Estado Final

1. Tras pruebas, carrito vacío y sin errores residuales en console.
2. `localStorage.getItem('santiago_soto_cart')` devuelve estructura limpia.

---

## 12. Registro de Resultados (Sugerido)

| Caso | OK / Fallo | Notas | Acción Correctiva |
|------|-----------|-------|-------------------|
| 1-2  |           |       |                   |
| 3-5  |           |       |                   |
| 6    |           |       |                   |
| 7    |           |       |                   |
| 8    |           |       |                   |
| 9    |           |       |                   |
| 10   |           |       |                   |

### 12.1 Uso del Logger Automático (Opcional)

Se ha incluido un módulo `validation-logger.js` que permite registrar resultados directamente en la UI.

Activación:

1. Abrir la URL con el parámetro `?qa=1` (ej: `https://localhost:3000/?qa=1`).
2. Aparecerá un panel flotante “QA Logger” en la esquina inferior izquierda.

Campos del panel:

- Caso: identificador corto (ej: `6`, `7a`, `SEC-2`).
- Estado: `OK`, `FALLO`, `NA`.
- Notas: observaciones puntuales.

Acciones:

- Guardar: crea o actualiza el caso.
- Export: descarga un `.md` con tabla de resultados y timestamp.
- Clear: limpia todos los registros (requiere confirmación).
- ×: cierra el panel (persisten los datos en localStorage).

API en consola:

```js
ValidationLogger.addOrUpdate('6', 'OK', 'Flujo de pago exitoso');
ValidationLogger.list();
ValidationLogger.exportMarkdown();
```

Persistencia:

- Clave localStorage: `validation_log_v1`.
- Se puede respaldar manualmente copiando el JSON.

Recomendación:

- Mantener IDs alineados con los bloques de esta guía para trazabilidad.

---

## 13. Criterios de Aprobación

- Todos los casos críticos (2,5,6,7,8) OK.
- No memory leaks visibles (listeners duplicados) tras varias aperturas de checkout.
- Carrito siempre coherente tras reload y multi-tab.
- Ningún cálculo inconsistente en impuestos o envío.

---

## 14. Próximos Pasos (Post Validación)

- Persistencia órdenes en backend (DB / KV) antes de ir a producción real.
- Endpoint para consultar estado de orden por ID.
- Integración real Wompi/Nequi + webhook.
- Email de confirmación (SendGrid / Resend / SES).
- Métricas básicas (intentos vs éxito) e informes.

---

© 2025 Santiago Soto Arte

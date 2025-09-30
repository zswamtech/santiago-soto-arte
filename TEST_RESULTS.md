# Resultados de Pruebas Manuales

Fecha inicio: 2025-09-29
Entorno: Navegador Desktop (indicar Chrome/Firefox + versión) | Vercel Preview/Local
Parametros URL sugeridos: `?qa=1&debugCart=1`

## Leyenda Estados
 
- OK: Comportamiento conforme
- FALLO: Se reproduce defecto
- NA: No aplica en este entorno

---
 
## 1. Carrito - Operaciones Básicas

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| C1 | Añadir primer ítem | Click botón producto (mug) | OK | Widget aparece, count=1 | - |
| C2 | Incrementar cantidad mismo ítem | Añadir mismo producto 2 veces | OK | Qty=2, subtotal lineal | - |
| C3 | Añadir segundo ítem distinto | Añadir camiseta tras taza | OK | 2 items listados | - |
| C4 | Decrementar cantidad | Botón '-' hasta 1 |  |  |  |
| C5 | Evitar <1 | Botón '-' en qty=1 (disabled) |  |  |  |
| C6 | Eliminar ítem | Botón 🗑️ |  |  |  |
| C7 | Vaciar carrito | Botón 'Vaciar Carrito' |  |  |  |

## 2. Persistencia & Multi-Tab

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| P1 | Persistencia tras reload | Añadir, recargar página | OK | Estado restaurado desde localStorage | - |
| P2 | Sincronía multi-tab add | Pestaña A add, ver B |  |  |  |
| P3 | Sincronía multi-tab qty | Cambiar qty en B, ver A |  |  |  |
| P4 | Clear sincronizado | Vaciar en A, ver B |  |  |  |

## 3. Cálculos (Precios / Reglas)

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| CAL1 | Subtotal correcto | 2 items con qty | OK | Suma coincide con tabla items | - |
| CAL2 | Descuento aplicado (si aplica) | Forzar puntos descuento |  |  |  |
| CAL3 | Impuesto solo físicos | Solo productos físicos presentes |  |  |  |
| CAL4 | Envío aplicado < 250 | Total < 250 |  |  |  |
| CAL5 | Envío gratis >= 250 | Total >= 250 |  |  |  |
| CAL6 | Total = (subtotal - desc) + tax + envío | Ver fórmula final |  |  |  |

## 4. Checkout (Stripe UI)

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| CH1 | Botón pagar bloqueado inicio | Abrir checkout sin llenar | OK | Botón disabled y texto 'Completar información' | - |
| CH2 | Validación campos obligatorios | Llenar/limpiar campos |  |  |  |
| CH3 | Tarjeta válida éxito | 4242... pago | OK | Pantalla éxito y carrito limpiado | - |
| CH4 | Tarjeta decline | 4000 0000 0000 9995 |  |  |  |
| CH5 | Reintento tras decline | Cambiar a válida |  |  |  |
| CH6 | 3DS autenticación | 4000 0027 6000 3184 |  |  |  |
| CH7 | Limpieza post-éxito | Carrito vacío tras éxito |  |  |  |

## 5. Resiliencia / Seguridad Cliente

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| SEC1 | Manipular price en dataset | Alterar price en botón antes de click | OK | Backend recalcula; mismatch detectado | - |
| SEC2 | SKU inválido create-intent | Payload manual a endpoint |  |  |  |
| SEC3 | Totales no negativos | Forzar descuento > subtotal |  |  |  |

## 6. Accesibilidad / UX

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| UX1 | Abrir widget con teclado | Tab + Enter sobre widget | OK | Sidebar abre y focus visible | - |
| UX2 | Escape cierra sidebar | Esc cuando abierto |  |  |  |
| UX3 | Focus no atrapado | Navegar con Tab fuera modal |  |  |  |

## 7. Webhooks / Idempotencia (Opcional Local)

| Caso | Descripción | Pasos clave | Estado | Notas | Acción Correctiva |
|------|------------|------------|--------|-------|-------------------|
| WH1 | Reenvío webhook succeeded | stripe CLI resend |  |  |  |
| WH2 | Evento desconocido ignorado | Enviar tipo random |  |  |  |
| WH3 | No duplicar orden | Mismo intent 2 veces |  |  |  |

---
 
## Resumen Ejecutivo

- Casos ejecutados: X/Y
- Casos críticos fallidos: (enumerar)
- Bloqueadores para release: (si existen)

 
## Observaciones Globales

(Notas generales sobre performance, UX, logs, consola, etc.)

 
## Recomendaciones

- (Lista corta de mejoras detectadas)

---
Generado manualmente. Añadir resultados reales completando la tabla y usar `ValidationLogger` para respaldo.

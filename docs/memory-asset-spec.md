# Especificación de Assets para el Juego de Memoria

> Versión: 0.1 (borrador)
> Última actualización: 2025-09-30

## Objetivos

Estandarizar cómo se generan, nombran, describen y agrupan las imágenes (y pistas) usadas en los modos del juego de memoria:

- `variants` (dos imágenes iguales o variantes visuales muy similares)
- `split` (mitades izquierda/derecha de una misma obra o composición)
- `clues` (parejas imagen + pista textual)
- Futuro: `semantic`, `silhouette`, `style-shift`

## Tipos de Par (Pair Types)

| Tipo | Descripción | Uso en modo | Requisitos mínimos |
|------|-------------|-------------|--------------------|
| identical | Duplicado exacto | variants | 1 archivo base + duplicación lógica |
| variant | Dos renders distintos de misma entidad/raza | variants | Diferencias sutiles, misma identidad |
| split | Mitad izquierda y derecha cortadas limpiamente | split | Alineación perfecta, misma resolución |
| action-vs-stance | Acción dinámica vs postura neutra | variants / futuro semantic | Claridad de contraste sin cambiar identidad |
| image+clue | Imagen emparejada con texto | clues | Texto breve, inequívoco, sin spoilers de otros pares |
| style-shift (futuro) | Misma entidad en dos estilos artísticos | variants / style-shift | Estilos contrastantes, mismo framing |
| silhouette (futuro) | Imagen normal + silueta monocroma | semantic | Silueta limpia, sin fondo ruidoso |

## Convenciones de Nombres de Archivos

Formato general:

```text
<categoria>/<raza>/<raza>__<descriptor>__<variantId>.<ext>
```

Para splits:

```text
<categoria>/<raza>/split/<raza>__split-L__<pairGroup>.<ext>
<categoria>/<raza>/split/<raza>__split-R__<pairGroup>.<ext>
```

Para action vs stance:

```text
<categoria>/<raza>/<raza>__action__<pairGroup>.<ext>
<categoria>/<raza>/<raza>__stance__<pairGroup>.<ext>
```

Para clues (si la pista se genera como archivo separado opcional):

```text
<categoria>/<raza>/clues/<raza>__clue-<slug>__<pairGroup>.txt
```

### Reglas

- `raza` en snake_case sin tildes (ej: `caballo_andaluz`).
- `pairGroup` único por par conceptual (ej: `andaluz_frontal_01`).
- Evitar espacios; solo guiones bajos y medios.
- Extensiones preferidas: `.webp` (optimizado), `.png` (si transparencia), `.jpg` (solo fotografías base).

## Metadatos (Dataset JSON / ArtBreeds)

Cada variante/entrada puede incluir:

```ts
interface RawImageItem {
  id: string;              // caballo_andaluz_split_L_01
  src: string;             // assets/img/caballos/caballo_andaluz/split/caballo_andaluz__split-L__andaluz_frontal_01.webp
  alt: string;             // "Caballo andaluz – mitad izquierda" (lenguaje claro)
  role?: 'split-left' | 'split-right' | 'clue' | 'image' | 'action' | 'stance';
  pairGroup?: string;      // andaluz_frontal_01
  clue?: string;           // "Raza ibérica conocida por su elegancia"
  type?: string;           // clasificador libre: 'variant' | 'split' | 'action-stance' | 'clue-pair'
}
```

Campos obligatorios por tipo:

| Tipo | id | src | alt | role | pairGroup | clue |
|------|----|-----|-----|------|-----------|------|
| identical/variant | ✔ | ✔ | ✔ | (opcional) | (recomendado) | ✖ |
| split | ✔ | ✔ | ✔ | ✔ (split-left/right) | ✔ | ✖ |
| action-vs-stance | ✔ | ✔ | ✔ | ✔ (action/stance) | ✔ | ✖ |
| image+clue | ✔ | ✔ | ✔ | 'image' / 'clue' | ✔ | (solo en role clue) ✔ |

## Alt Text (Accesibilidad)

Principios:

1. Describir entidad y diferencia distintiva ("Caballo árabe en postura dinámica" vs "Caballo árabe quieto de perfil").
2. Evitar redundancia de "Imagen de".
3. Mantener longitud recomendada: 45–90 caracteres.
4. Para mitades: indicar lado y sujeto ("Caballo andaluz – mitad derecha").
5. Para pistas textuales (role=clue): resumen semántico sin nombrar directamente si el modo implica deducción.

Checklist rápido:

- [ ] Incluye especie/raza
- [ ] Indica la variación (acción, mitad, estilo)
- [ ] No excede ~100 caracteres
- [ ] No repite el id literal

## Pairing Logic (Referencia Implementación)

| Modo | Cómo se considera match | Fuente actual | Notas |
|------|-------------------------|---------------|-------|
| variants | id iguales duplicados | useMemoryGame.buildVariantsDeck | Duplicación lógica en memoria |
| split | par left/right mismo pairGroup | buildSplitDeck | Generar ids derivados (baseId-L/R) |
| clues | imagen + clue mismo pairGroup | (pendiente) | Requiere expandir builder |

## Recomendaciones Visuales

- Resolución base sugerida: 512x512 (cuadrado) o 3:4 consistente.
- Fondos: neutros y uniformes para evitar pistas involuntarias.
- Iluminación: consistente dentro del par.
- Para split: recorte exacto sin solapamiento ni gap al recomponer.
- Compresión: WebP calidad 80+ sin artefactos evidentes.

## Validación de un Nuevo Lote

Antes de integrar:

1. Ejecutar script de verificación (futuro) que valide naming + roles.
2. Revisar alt text manualmente (lista diffs).
3. Probar en modo `variants` y `split` (si aplica) local.
4. Medir peso total < 1.5 MB por 12 imágenes.

## Ejemplos Concretos

Split Andaluz:

```text
assets/img/caballos/caballo_andaluz/split/caballo_andaluz__split-L__andaluz_frontal_01.webp
assets/img/caballos/caballo_andaluz/split/caballo_andaluz__split-R__andaluz_frontal_01.webp
```

Action/Stance Árabe:

```text
assets/img/caballos/caballo_arabe/caballo_arabe__stance__arabe_pose_01.webp
assets/img/caballos/caballo_arabe/caballo_arabe__action__arabe_pose_01.webp
```

## Roadmap Próximo

- v0.2: Añadir sección "script de validación" + plantilla de generación.
- v0.3: Definir taxonomía de estilos (impresionista, realista, lowpoly, etc.).
- v0.4: Añadir guidelines para color/background normalizado.
- v1.0: Congelar especificación y automatizar CI de assets.

## Licenciamiento y Ética

- No usar obras con copyright sin permiso explícito.
- Generaciones AI deben ser revisadas para sesgos (anatómicos, culturales).
- Mantener trazabilidad de origen (prompt o fuente interna) fuera del bundle público.

---
Feedback pendiente: completar sección clues cuando se implemente builder definitivo.

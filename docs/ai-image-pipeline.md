# Pipeline de Imágenes IA para Memoria Artística

> Versión 1.0 – Documento vivo. Define cómo generamos, validamos, integramos y mantenemos imágenes estilizadas (tipo pintura / ilustración) para el juego de memoria conceptual por razas.

## 1. Objetivo

Crear conjuntos de imágenes consistentes (2–5 variantes por raza / especie) que refuercen: aprendizaje visual, reconocimiento conceptual y reto cognitivo (distinguir variantes sin depender de duplicados exactos). Las cartas son pares de la MISMA raza pero con dos imágenes distintas.

## 2. Principios Visuales

- Estilo por categoría (ejemplos):
  - Perros / Mamíferos: ilustración digital semirrealista amigable.
  - Aves: acuarela luminosa con bordes suaves.
  - Reptiles: ilustración naturalista limpia de sombreado suave.
  - Peces: digital estilizada colorida con énfasis en silueta y paleta.
- Fondo: degradado o lavado minimalista (no escenas complejas) para evitar distracción.
- Colores: mantener paleta madre (≥70% consistencia) + variaciones controladas.
- Sin texto, logos, marcas de agua, tipografía incidental, ni props dominantes.
- Composición: sujeto ocupa 70–85% del encuadre (closer para variaciones de primer plano).

## 3. Estructura de Datos (Dataset)

Ubicación: `assets/js/data/animal-data.js`

```js
ArtBreeds.categories = {
  perros: {
    style: 'ilustración digital semirrealista amigable',
    breeds: [
      { id: 'golden_retriever', name: 'Golden Retriever', images: [ { variant, src, alt, license, source } ] },
      // ...
    ]
  },
  peces: { /* ... */ }
};
```

Reglas:

- `id`: snake_case sin tildes.
- Al menos 2 imágenes por raza para entrar en el juego.
- Variante 1 y 2 obligatorias; 3+ opcionales para rejugabilidad avanzada.

## 4. Convención de Rutas & Nombres

```text
assets/img/{categoria}/{id}/{id}_v{n}.png
```

Ejemplo: `assets/img/perros/golden_retriever/golden_retriever_v2.png`

Opcional: sufijo descriptor si hay muchas variantes: `_perfil`, `_frontal`, etc. (Se puede incorporar más adelante al alt text, no al nombre base para simplicidad inicial.)

## 5. Flujo de Generación (Gemini u otro modelo)

1. Seleccionar categoría y raza.
2. Aplicar Prompt Maestro (ver sección 6) + variaciones.
3. Generar 3 variantes (mantener la misma seed si el motor soporta consistencia; variar sólo pose / orientación / iluminación).
4. Exportar PNG 1024x1365 (3:4) o 1024x1024 (se recorta después si hace falta uniformidad).
5. Revisar QC (sección 8).
6. Renombrar y colocar en carpeta final.
7. Actualizar `animal-data.js` añadiendo entradas definitivas (sustituir placeholders AI placeholder).

## 6. Prompt Maestro (Plantilla)

```text
Genera una ilustración de {nombreES} ({nombreCientificoOpcional}) perteneciente a la categoría {categoriaES}. 
Estilo: {estiloCategoria}. 
Rasgos distintivos: {rasgosClave}. 
Paleta base: {paletaBase}. 
Variación específica: {variacion}. 
Composición: sujeto centrado ocupando ~{ocupacion}% del encuadre sobre fondo {tipoFondo}. 
Iluminación: {iluminacion}. 
Nivel de detalle: {detalle}. 
Evitar estrictamente: texto, marcas de agua, logos, elementos complejos, accesorios artificiales. 
Formato: vertical 3:4. 
Negative prompt: text, watermark, logo, signature, human hands, extra limbs, distortion, glitch, oversaturated, busy background, heavy noise, deformed anatomy.
```

### Ejemplo (Golden Retriever Variante 1)

```text
Genera una ilustración de un Golden Retriever amigable, perteneciente a la categoría Perros. Estilo: ilustración digital semirrealista con bordes suaves y ligera textura de pincel. Rasgos distintivos: pelaje dorado medio ondulado, orejas caídas medianas, mirada amable. Paleta base: dorado cálido, crema, ámbar claro. Variación específica: postura frontal sentado con ligera sonrisa relajada. Composición: ocupa ~80% del encuadre sobre fondo degradado crema a dorado pálido. Iluminación: cálida envolvente tarde. Nivel de detalle: medio-alto sin sobrecarga. Evitar estrictamente: texto, marcas de agua, logos, fondo complejo. Formato 3:4. Negative prompt: text, watermark, logo, signature, distortion, busy background.
```

## 7. Variantes & Diferenciación

Ejes recomendados para variar sin romper identidad:

- Pose (frontal, perfil, 3/4, movimiento, reposo).
- Ángulo (ligeramente superior, nivel de ojos, leve vista dorsal).
- Iluminación (difusa neutra, cálida tarde, fría matinal).
- Proximidad (cuerpo completo vs primer plano cabeza).
- Orientación (izquierda / derecha) sin espejar anómalamente textos (no aplica al no haber texto en escena).

Evitar cambiar simultáneamente más de 2 ejes clave → mantiene reconocimiento.

## 8. Control de Calidad (Checklist)

Aceptar sólo si:

- (Anatomía) Sin deformaciones evidentes ni extremidades extra.
- (Identidad) Rasgos clave presentes y coherentes en todas las variantes.
- (Paleta) Colores dentro del rango definido, sin saturación excesiva.
- (Fondo) Limpio / mínimo; no compite con el sujeto.
- (Text-free) Sin texto, marcas, números, firmas.
- (Escala) Sujeto ocupa ~70–85% excepto primer plano intencional.
- (Consistencia) Variantes se perciben como la misma raza, no especies diferentes.

Rechazar si cualquiera: texto emergente, glitch severo, contraste irreal, desenfoque ilegible, proporciones grotescas.

## 9. Alt Text & Accesibilidad

Formato recomendado:

```text
<Raza> – <descriptor pose / variación>, estilo {descriptorEstilo}
```

Ej: `Golden Retriever – perfil caminando, estilo semirrealista`

Evitar repetir la raza dos veces sin descriptor. Mantener longitud < 90 caracteres.

## 10. Actualización del Dataset

Pasos seguros:

1. Añadir nuevas imágenes en su carpeta.
2. Editar `animal-data.js`: insertar nuevo objeto en `images[]`.
3. Incluir `alt` curado (no copiar prompt completo; sólo esencia).
4. Bump opcional de `ArtBreeds.version` si se hace un lote grande.

## 11. Integración en Juego

- El motor selecciona 2 variantes distintas por raza.
- Si una raza tiene >2 variantes, aumenta rejugabilidad (selección aleatoria).
- Placeholder 🎨 se elimina automáticamente al haber `img` real.

## 12. Gestión de Licencias

Campos:

- `license`: `provisional`, `internal-ai`, `cc-by`, `custom`.
- `source`: Motor / modelo usado (ej. `Gemini 1.5 Pro`).

Cuando se finalice una imagen:

- Reemplazar `provisional` → `internal-ai` (si uso interno controlado) o licencia correspondiente.
- Documentar lote en changelog interno (futuro `docs/image-changelog.md`).

## 13. Estrategia de Seeds

- Usar una semilla fija por raza para garantizar coherencia morfológica.
- Cambiar sólo detalles en prompt (pose / luz) para variantes 2–3.
- Si un resultado no convence, generar nueva seed y repetir las 3 variantes para mantener familia consistente.

## 14. Automatización (Futuro)

Ideas:

- Script que valide existencia de archivos vs dataset y reporte faltantes.
- Linter de alt text (longitud, duplicados, falta de descriptor).
- Generador de spritesheet miniatura para pre-carga.

## 15. Ejemplo de Lote JSON (Para Gemini)

```json
[
  {
    "breed": "golden_retriever",
    "variant": 1,
    "seedSuggestion": 5217,
    "prompt": "... (prompt variante 1 resumido) ..."
  },
  {
    "breed": "golden_retriever",
    "variant": 2,
    "seedSuggestion": 5217,
    "prompt": "..."
  },
  {
    "breed": "golden_retriever",
    "variant": 3,
    "seedSuggestion": 5217,
    "prompt": "..."
  }
]
```

## 16. Roadmap Visual

- Fase 1 (actual): Placeholders + primeras 3 variantes perros/peces.
- Fase 2: Sustitución con imágenes finales + QA.
- Fase 3: Categoría Gatos + expansión Aves (añadir tercera variante).
- Fase 4: Modos de dificultad (mayor número de razas, timer cognitivo, distractores suaves de fondo tonal).
- Fase 5: Métricas cognitivas (tiempo de emparejado por categoría / tipo de variación).

## 17. Preguntas Frecuentes

**¿Puedo usar fotos reales?** Recomendada ilustración estilizada consistente; fotos mezcladas degradan cohesión.
**¿Puedo añadir fondos complejos?** Sólo si se introduce un modo temático y se valida legibilidad.
**¿Cómo manejo fallos de carga?** El componente aplica filtro gris y alt 'Imagen no disponible'.

---
Mantener este documento actualizado tras cada lote importante.

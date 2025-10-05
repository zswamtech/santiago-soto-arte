# 📋 RESPUESTAS A PREGUNTAS DE CLAUDE OPUS

## 1️⃣ **Sistema de gamificación - Conexión con carrito**

### ✅ **Mecánica YA IMPLEMENTADA**:

```javascript
// El sistema ya funciona así:
const discount = Math.min(20, Math.floor(finalScore / 50) * 5);
// 5% cada 50 puntos, máximo 20%
```

**Tabla de conversión actual**:
- 50 puntos = 5% descuento
- 100 puntos = 10% descuento
- 150 puntos = 15% descuento
- 200+ puntos = 20% descuento (máximo)

**El descuento se guarda en `localStorage`** y se aplica automáticamente en el carrito de compras junto con otros descuentos (patrón, cupón).

---

## 2️⃣ **Formato visual preferido**

### ✅ **OPCIÓN C: Combinación mixta**

**Por qué esta opción**:
- ✅ **Colores sólidos** para mezclas simples (rojo+amarillo→naranja)
- ✅ **Objetos naturales** para resultados visuales (naranja→🍊 fruta)
- ✅ **Flexibilidad** para conceptos complejos (pintores, técnicas)

**Coherencia con diseño existente**:
- El juego actual tiene un diseño **premium moderno** con:
  - Fondo degradado azul/morado
  - Cartas con reverso rojo/rosa degradado
  - Efectos de sombra y brillo
  - Estilo limpio y profesional (NO infantil)

**Por favor, mantén coherencia con este estilo**: moderno, limpio, profesional, con buenos contrastes.

---

## 3️⃣ **Distribución de dificultad**

### ✅ **OPCIÓN A: 4 fáciles + 4 medios + 2 difíciles**

**Justificación**:
1. Santiago tiene **14 años** - el público objetivo incluye jóvenes
2. Queremos que sea **accesible** pero educativo
3. Los usuarios deben poder **completar el juego** para obtener descuento
4. Pares fáciles = **motivación inicial** (éxito rápido)
5. Pares difíciles = **desafío final** (más puntos)

**Puntuación esperada**:
- 4 pares fáciles × 10 puntos = 40 pts
- 4 pares medios × 15 puntos = 60 pts
- 2 pares difíciles × 25 puntos = 50 pts
- **Total base**: 150 puntos = **15% descuento** (sin bonos)

Con racha y sin errores pueden llegar a **20% descuento** (máximo).

---

## 4️⃣ **Estilo visual preferido**

### ✅ **OPCIÓN C: Combinación mixta**

**Desglose por tipo de par**:

### **FÁCILES (4 pares) - Colores sólidos + Objetos naturales**:
- **Pregunta**: Carta dividida verticalmente con 2 colores + símbolo "+" en el centro
- **Respuesta**: Puede ser:
  - Opción A: Color sólido (toda la carta pintada)
  - Opción B: Objeto natural del color (🍊 naranja, 🍃 hoja verde, 🍇 uvas, 🌸 flor rosa)

**Preferencia**: Mezcla ambas opciones (2 pares con color sólido, 2 pares con objetos naturales)

### **MEDIOS (4 pares) - Combinación**:
- Tonalidades complejas con **colores sólidos** (café, gris, melocotón)
- Pueden usar **objetos naturales** si ayuda a la claridad (ej: 🍑 melocotón para tonos piel)

### **DIFÍCILES (2 pares) - Ilustraciones/Iconografía artística**:
- **Técnicas de pintura**: Pincel→Trazo, Espátula→Textura
- **Pintores famosos**: Van Gogh autorretrato→Girasoles
- **Composición**: Línea horizontal→Calma/Horizonte
- **Emociones**: Colores cálidos→Sol/Fuego

**Preferencia**: Usa **ilustraciones minimalistas** estilo flat design (NO fotografías, NO realismo excesivo)

---

## 🎨 **PALETA DE COLORES ESPECÍFICA**

### **Para mezclas de colores primarios**:
- Rojo: `#FF0000`
- Amarillo: `#FFFF00`
- Azul: `#0000FF`
- Verde: `#00FF00`
- Naranja: `#FF8C00`
- Morado: `#8B00FF`
- Rosa: `#FFB6C1`

### **Para tonalidades complejas**:
- Café/Marrón: `#8B4500`
- Gris: `#808080`
- Melocotón: `#FFDAB9`
- Blanco: `#FFFFFF`
- Negro: `#000000`

---

## 📦 **FORMATO DE ENTREGA ESPERADO**

Por favor, entrega cada par con:

1. **Descripción visual detallada** de cada carta
2. **Código SVG/HTML** listo para integrar
3. **Nivel de dificultad** (Fácil/Medio/Difícil)
4. **Puntuación** (10/15/25)
5. **Conexión artística** (por qué se relaciona con el arte)

---

## ✅ **RESUMEN DE PREFERENCIAS**

| Pregunta | Respuesta |
|----------|-----------|
| **Gamificación** | Ya implementada: 5% cada 50 pts, máx 20% |
| **Formato visual** | Combinación mixta (colores + objetos + ilustraciones) |
| **Distribución** | 4 fáciles + 4 medios + 2 difíciles |
| **Estilo** | Moderno, limpio, profesional, alto contraste |

---

## 🚀 **SOLICITUD FINAL**

**Claude Opus, por favor crea los 10 pares completos con artefactos visuales listos para integrar.**

¡Gracias!

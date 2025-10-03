# 🎯 Juego de Memoria Híbrido - Documentación

## 📋 Resumen

Se ha implementado exitosamente un **modo híbrido** para el juego de Memoria Artística que combina:
- ✅ Pares de imágenes complementarias (dos imágenes diferentes que forman un conjunto)
- ✅ Pares de quiz integrados (pregunta ↔ respuesta)
- ✅ Todo mezclado en un solo tablero de juego

## 🎮 Características del Modo Híbrido

### Tipos de Pares

1. **Pares de Imágenes Complementarias** (`image-complement`)
   - Dos imágenes diferentes que conceptualmente se complementan
   - Ejemplo: Vista completa de caballo ↔ Detalle de cabeza del mismo caballo
   - Pueden ser variaciones artísticas de la misma raza/animal

2. **Pares de Quiz** (`quiz`)
   - Una carta muestra la pregunta (fondo amarillo con ❓)
   - Otra carta muestra la respuesta (fondo verde con 💡)
   - Relacionadas con características de los animales de la categoría

### Categorías Implementadas

#### 🐴 Caballos (con modo híbrido completo)
- **2 pares de imágenes complementarias**: Usando las imágenes del caballo andaluz blanco
- **4 pares de quiz**: Preguntas sobre Andaluz, Árabe y Frisón

#### 🐱 Gatos (modo híbrido - solo quiz por ahora)
- **4 pares de quiz**: Sobre Siamés, Persa, Bengala

#### 🐶 Perros (modo híbrido - solo quiz por ahora)
- **4 pares de quiz**: Sobre Golden Retriever, Bulldog Francés, Husky

## 🎨 Modos de Juego Disponibles

El selector de modo ahora incluye 4 opciones:

1. **Variantes (conceptual)**: Dos imágenes diferentes del mismo animal
2. **Mitades (componer imagen)**: Dos mitades de una imagen que se fusionan al acertar
3. **Pistas (texto + imagen)**: Imagen ↔ Texto descriptivo
4. **🎯 Híbrido (imágenes + quiz)**: ¡NUEVO! Mezcla de todo

## 📂 Estructura de Datos

### Formato de Pares Híbridos

```javascript
hybridPairs: [
  // Par de imágenes complementarias
  {
    id: 'pair_andaluz_complemento',
    type: 'image-complement',
    pairKey: 'caballo_andaluz',
    card1: {
      img: 'ruta/imagen1.png',
      alt: 'Descripción de imagen 1',
      description: 'Vista completa'
    },
    card2: {
      img: 'ruta/imagen2.png',
      alt: 'Descripción de imagen 2',
      description: 'Detalle frontal'
    }
  },

  // Par de quiz
  {
    id: 'quiz_andaluz_origen',
    type: 'quiz',
    pairKey: 'caballo_andaluz',
    card1: {
      text: '¿De qué región de España es originario el caballo Andaluz?',
      isQuestion: true
    },
    card2: {
      text: 'Andalucía',
      isAnswer: true
    }
  }
]
```

## 🎯 Cómo Funciona el Juego

### Mecánica de Juego
1. Usuario selecciona categoría "Caballos"
2. Usuario selecciona modo "🎯 Híbrido"
3. El juego mezcla aleatoriamente hasta 6 pares (máximo 12 cartas)
4. Los pares pueden ser:
   - 2 imágenes complementarias que se emparejan
   - 1 pregunta que empareja con su respuesta
5. Puntuación y mecánicas normales del juego de memoria

### Puntuación
- Mismas reglas que otros modos
- Bonus por racha de aciertos
- Penalización por fallos

## 📁 Archivos Modificados

### 1. `/assets/js/data/animal-data.js`
- ✅ Agregada estructura `hybridPairs` a categoría `caballos`
- ✅ Creadas nuevas categorías `gatos_hybrid` y `perros_hybrid`
- ✅ Incluye 2 pares de imágenes + 6 pares de quiz

### 2. `/assets/js/games/memory-game.js`
- ✅ Nuevo modo `hybrid` en el selector
- ✅ Lógica para cargar y renderizar pares híbridos
- ✅ Renderizado especial para cartas de quiz (con iconos y colores)
- ✅ Soporte para anuncios de accesibilidad
- ✅ Manejo de volteo de cartas de texto

### 3. `/index.html`
- ✅ Consolidados los dos juegos de memoria en uno solo
- ✅ Botón "🧠 Memoria Artística" ahora featured
- ✅ Eliminado el juego de memoria clásico (legacy)

## 🚀 Próximos Pasos

### 1. Generar Más Imágenes Complementarias

Para cada categoría de animales, necesitas crear pares de imágenes artísticas que se complementen:

#### Ideas para Pares de Imágenes:
- **Caballo Árabe**:
  - Galope ↔ Pose estática
  - Vista lateral ↔ Vista frontal

- **Gatos**:
  - Siamés sentado ↔ Siamés acostado
  - Persa de frente ↔ Persa de perfil

- **Perros**:
  - Golden cachorro ↔ Golden adulto
  - Husky con ojos azules ↔ Husky con ojos marrones

#### Recomendaciones para las Imágenes:
- Estilo: Óleo o ilustración artística
- Resolución: Mínimo 300x300px
- Formato: PNG con fondo transparente o con fondo artístico
- Consistencia: Mismo estilo artístico dentro de cada par

### 2. Usar Claude en la App para Generar Imágenes

Puedes usar Claude (versión con generación de imágenes) para crear los pares:

**Prompt sugerido:**
```
Genera dos ilustraciones al óleo de un [animal específico, ej: Gato Siamés]
que se complementen artísticamente:

1. Primera imagen: [descripción de pose/ángulo]
2. Segunda imagen: [descripción de pose/ángulo complementaria]

Estilo: Óleo suave, fondo difuminado, iluminación natural
Tamaño: 512x512px
Paleta: Colores cálidos y naturales
```

### 3. Agregar Más Pares de Quiz

Para cada categoría, puedes agregar más preguntas/respuestas:

**Ejemplos de preguntas interesantes:**
- Características físicas distintivas
- Origen geográfico
- Temperamento típico
- Datos curiosos
- Historia de la raza

### 4. Expandir a Otras Categorías

Las siguientes categorías ya tienen estructura `breeds` en `animal-data.js`
y pueden recibir `hybridPairs`:

- 🐾 Mamíferos (Lobo, Zorro Ártico)
- 🦜 Aves (Guacamayo, Colibrí, Búho)
- 🦎 Reptiles (Camaleón, Tortuga, Iguana)
- 🐟 Peces (Betta, Ángel, Koi, Guppy)

## 🎨 Integración con Generación de Imágenes

### Flujo de Trabajo Recomendado:

1. **Identificar par a crear**
   - Elige animal y categoría
   - Define las dos poses/variantes complementarias

2. **Generar con Claude App**
   - Usa prompts específicos para óleo/ilustración
   - Genera ambas imágenes del par
   - Descarga como PNG

3. **Agregar al proyecto**
   - Guarda imágenes en carpeta apropiada
   - Actualiza `animal-data.js` con las rutas
   - Prueba en el juego

4. **Iterar**
   - Ajusta estilo si es necesario
   - Mantén consistencia entre pares

## 🐛 Problemas Conocidos

- Las imágenes actuales están en la raíz del proyecto
- Idealmente deberían moverse a `/assets/img/caballos/` para organización
- Algunas categorías solo tienen quiz, sin pares de imágenes aún

## ✅ Testing Checklist

- [x] Selector de modo híbrido funciona
- [x] Cartas de quiz se renderizan con colores correctos
- [x] Pares de imágenes complementarias funcionan
- [x] Pares de quiz funcionan
- [x] Mezcla aleatoria de ambos tipos de pares
- [x] Puntuación y racha funcionan
- [x] Accesibilidad (anuncios, teclado)
- [ ] Todas las categorías tienen pares híbridos
- [ ] Imágenes organizadas en carpetas correctas

## 📞 Soporte

Para agregar más contenido o modificar el juego:
1. Edita `/assets/js/data/animal-data.js`
2. Agrega nuevos pares a la sección `hybridPairs`
3. Sigue el formato de los ejemplos existentes
4. Recarga la página y prueba

---

¡Disfruta creando contenido artístico para el juego! 🎨✨

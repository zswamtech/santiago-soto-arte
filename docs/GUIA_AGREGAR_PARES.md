# 📖 GUÍA RÁPIDA: Cómo Agregar Nuevos Pares

## 🎯 Para Santiago y Futuros Contribuidores

Esta guía te explica cómo agregar nuevos pares creativos al juego de memoria.

---

## 📝 MÉTODO 1: Código JavaScript (Desarrolladores)

### **Paso 1: Abrir el archivo de biblioteca**

Abre: `/assets/js/data/pairs-library.js`

### **Paso 2: Agregar el par usando la API**

```javascript
// Ejemplo: Agregar un par de mezcla de colores
PairsLibrary.addPair('colorTheory', {
  id: 'color_red_yellow_orange', // Único y descriptivo
  difficulty: 'easy', // easy, medium, hard, expert
  contributor: 'Santiago Soto', // Tu nombre

  card1: {
    type: 'color-mix',
    data: {
      colors: ['#FF0000', '#FFFF00'],
      labels: ['Rojo', 'Amarillo'],
      operator: '+'
    }
  },

  card2: {
    type: 'color-result',
    data: {
      color: '#FF8C00',
      name: 'Naranja'
    }
  },

  artConnection: 'Mezcla de pigmentos primarios en pintura al óleo',
  learningGoal: 'Entender teoría del color básica',

  meta: {
    approved: true, // Cambiar a true cuando esté listo
    version: '1.0'
  }
});
```

### **Paso 3: Guardar y refrescar**

1. Guarda el archivo
2. Refresca el navegador
3. Juega para verificar que funcione

---

## 📦 MÉTODO 2: JSON (No-Desarrolladores)

### **Paso 1: Crear archivo JSON**

Crea un archivo `mi-par.json` con esta estructura:

```json
{
  "category": "colorTheory",
  "pairs": [
    {
      "id": "color_red_yellow_orange",
      "difficulty": "easy",
      "contributor": "Santiago Soto",

      "card1": {
        "type": "color-mix",
        "data": {
          "colors": ["#FF0000", "#FFFF00"],
          "labels": ["Rojo", "Amarillo"],
          "operator": "+"
        }
      },

      "card2": {
        "type": "color-result",
        "data": {
          "color": "#FF8C00",
          "name": "Naranja"
        }
      },

      "artConnection": "Mezcla de pigmentos primarios",
      "learningGoal": "Teoría del color básica",

      "meta": {
        "approved": true,
        "version": "1.0"
      }
    }
  ]
}
```

### **Paso 2: Importar el archivo**

En la consola del navegador (F12), ejecuta:

```javascript
// Leer tu archivo JSON
fetch('mi-par.json')
  .then(r => r.json())
  .then(data => {
    PairsLibrary.importPairs(data);
    console.log('✅ Par importado!');
  });
```

---

## 🎨 CATEGORÍAS DISPONIBLES

| ID | Nombre | Descripción |
|----|--------|-------------|
| `colorTheory` | Teoría del Color | Mezclas de colores primarios y secundarios |
| `techniques` | Técnicas de Pintura | Herramientas, métodos y estilos |
| `painters` | Pintores Famosos | Artistas y sus obras icónicas |
| `emotions` | Emociones en Arte | Colores, formas y sentimientos |
| `composition` | Composición Artística | Reglas y principios de diseño |
| `nature` | Naturaleza en Arte | Elementos naturales y colores |

---

## 🎯 NIVELES DE DIFICULTAD

| Nivel | Puntos | Penalización | Descripción |
|-------|--------|--------------|-------------|
| `easy` | 10 | 3 | Obvio y directo (colores primarios) |
| `medium` | 15 | 5 | Requiere razonamiento (tonalidades) |
| `hard` | 25 | 8 | Conocimiento artístico avanzado |
| `expert` | 40 | 12 | Solo para expertos en arte |

---

## 🖼️ TIPOS DE CARTAS DISPONIBLES

### **1. color-mix** (Mezcla de colores)
```javascript
{
  type: 'color-mix',
  data: {
    colors: ['#FF0000', '#FFFF00'], // Array de 2 colores hex
    labels: ['Rojo', 'Amarillo'],   // Nombres (opcional)
    operator: '+'                    // Operador visual
  }
}
```

### **2. color-result** (Resultado de color)
```javascript
{
  type: 'color-result',
  data: {
    color: '#FF8C00',  // Color hex del resultado
    name: 'Naranja'    // Nombre (opcional)
  }
}
```

### **3. emoji-single** (Emoji grande)
```javascript
{
  type: 'emoji-single',
  data: {
    emoji: '🍊',      // Emoji unicode
    size: 'xlarge',   // xlarge, large, medium
    label: 'Naranja'  // Texto (opcional)
  }
}
```

### **4. color-triple-mix** (Mezcla de 3 colores)
```javascript
{
  type: 'color-triple-mix',
  data: {
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    labels: ['R', 'G', 'B'],
    operator: '+'
  }
}
```

---

## ✅ CHECKLIST ANTES DE AGREGAR

Antes de marcar `approved: true`, verifica:

- [ ] El par tiene conexión clara con el arte
- [ ] Es visualmente intuitivo (sin texto)
- [ ] No duplica un par existente
- [ ] La dificultad es apropiada
- [ ] Funciona en el juego (probado)
- [ ] Los colores son correctos (#hex válidos)
- [ ] El contributor está bien escrito

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema: El par no aparece en el juego**

**Solución**:
1. Verifica que `meta.approved: true`
2. Refresca el navegador (Ctrl+F5)
3. Abre la consola (F12) y busca errores

### **Problema: Los colores se ven mal**

**Solución**:
1. Usa colores hex válidos: `#FF0000` (6 dígitos)
2. Verifica que sean colores RGB estándar
3. Prueba en modo oscuro y claro

### **Problema: ID duplicado**

**Solución**:
```javascript
// Generar ID único automáticamente
const uniqueId = `color_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
```

---

## 📊 VERIFICAR TUS PARES

### **Ver todos los pares aprobados**:
```javascript
console.table(PairsLibrary.getAllApprovedPairs());
```

### **Ver estadísticas**:
```javascript
console.log(PairsLibrary.getStats());
```

### **Exportar biblioteca completa**:
```javascript
const json = PairsLibrary.exportLibrary();
console.log(json);
// Copiar y pegar en un archivo .json
```

---

## 🎉 EJEMPLO COMPLETO

```javascript
// Par completo: Azul + Amarillo = Verde + Hoja
PairsLibrary.addPair('colorTheory', {
  id: 'color_blue_yellow_green_leaf',
  difficulty: 'medium',
  contributor: 'Santiago Soto',

  card1: {
    type: 'color-mix',
    data: {
      colors: ['#0000FF', '#FFFF00'],
      labels: ['Azul', 'Amarillo'],
      operator: '+'
    }
  },

  card2: {
    type: 'emoji-single',
    data: {
      emoji: '🍃',
      size: 'xlarge',
      label: 'Hoja Verde'
    }
  },

  artConnection: 'Verde es un color secundario usado para representar naturaleza y vida en el arte',
  learningGoal: 'Mezclar colores primarios para obtener verdes naturales',

  meta: {
    approved: true,
    createdAt: Date.now(),
    version: '1.0'
  }
});

console.log('✅ Par agregado: Azul + Amarillo = Hoja Verde');
```

---

## 🆘 ¿NECESITAS AYUDA?

1. Revisa la documentación completa: `/docs/SISTEMA_CONTRIBUCION.md`
2. Ve ejemplos en: `/assets/js/data/creative-pairs.js`
3. Contacta a Santiago: santiago@example.com (futuro)

---

**¡Felices contribuciones!** 🎨

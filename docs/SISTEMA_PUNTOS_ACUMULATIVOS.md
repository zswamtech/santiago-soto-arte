# 🏆 SISTEMA DE PUNTOS ACUMULATIVOS - Arte & Comunidad

**Versión**: 1.0
**Fecha**: 2025-10-01
**Misión**: Crear una comunidad de amantes del arte que aprenden, comparten y ganan

---

## 🎯 VISIÓN GENERAL

### **Concepto**:
Los usuarios **acumulan puntos permanentes** jugando, creando pares y participando en la comunidad. Los puntos se canjean por premios reales (cuadros de Santiago, descuentos, productos exclusivos).

### **Diferencia con descuentos**:
- **Descuentos**: Temporales, para usar en compra inmediata
- **Puntos**: Permanentes, acumulables, canjeables por premios

---

## 👤 SISTEMA DE IDENTIDAD PERSONALIZADA

### **Registro del Usuario** (Primera vez que juega):

```
┌─────────────────────────────────────────┐
│  🎨 ¡Bienvenido a Arte Santiago Soto!  │
├─────────────────────────────────────────┤
│                                         │
│  Para guardar tu progreso y participar │
│  en premios, cuéntanos sobre ti:       │
│                                         │
│  📝 Tu nombre:                          │
│  [________________]                     │
│                                         │
│  🐾 Nombre de tu mascota:               │
│  [________________]                     │
│  (Opcional, pero nos encanta saberlo)  │
│                                         │
│  📧 Email:                              │
│  [________________]                     │
│  (Para notificarte de premios)         │
│                                         │
│  [ ] Acepto términos y condiciones     │
│                                         │
│  [Comenzar a Jugar 🎮]                 │
└─────────────────────────────────────────┘
```

### **Perfil del Usuario**:

```json
{
  "userId": "unique_id_12345",
  "profile": {
    "name": "María González",
    "petName": "Luna",
    "petType": "Perro",
    "email": "maria@example.com",
    "avatar": "default_dog.png",
    "registeredAt": 1704067200000
  },
  "stats": {
    "totalPoints": 1523,
    "gamesPlayed": 42,
    "perfectGames": 8,
    "currentStreak": 5,
    "longestStreak": 12,
    "rank": "Maestro del Color",
    "badges": ["🌟 Primera Partida", "🔥 Racha de 5", "🎨 100 Puntos"]
  },
  "rewards": {
    "claimedRewards": ["descuento_10%_feb2025"],
    "availablePoints": 1523
  }
}
```

---

## 💎 SISTEMA DE PUNTOS PERMANENTES

### **Cómo se Ganan Puntos**:

| Actividad | Puntos | Frecuencia |
|-----------|--------|------------|
| **Jugar Laboratorio** | 50-100 pts | Ilimitado |
| **Jugar Memoria** | 100-200 pts | Ilimitado |
| **Completar sin errores** | +50 pts | Por partida |
| **Racha de 5 días** | +100 pts | Una vez por semana |
| **Compartir en redes** | +25 pts | Una vez al día |
| **Crear un par aprobado** | +500 pts | Por par |
| **Invitar un amigo** | +200 pts | Por referido |
| **Comprar un cuadro** | +1000 pts | Por compra |

### **Puntos NO Caducan**:
✅ Se acumulan permanentemente
✅ No se pierden si no juegas
✅ Se pueden canjear en cualquier momento

---

## 🏅 RANGOS Y NIVELES

### **Sistema de Rangos** (Basado en puntos totales):

| Rango | Puntos Necesarios | Beneficio |
|-------|-------------------|-----------|
| 🌱 **Aprendiz** | 0-99 | Acceso básico |
| 🎨 **Artista** | 100-499 | Badge exclusivo |
| 🖌️ **Pintor** | 500-999 | 5% descuento permanente |
| 🎭 **Maestro** | 1,000-2,499 | 10% descuento + envío gratis |
| 👑 **Gran Maestro** | 2,500-4,999 | 15% descuento + acceso VIP |
| 💎 **Leyenda** | 5,000+ | 20% descuento + cuadro gratis |

### **Beneficios por Rango**:

**🎨 Artista** (100 pts):
- Badge dorado en perfil
- Acceso a pares exclusivos

**🖌️ Pintor** (500 pts):
- 5% descuento permanente (se suma a descuentos de juego)
- Nombre en "Hall of Fame"

**🎭 Maestro** (1,000 pts):
- 10% descuento permanente
- Envío gratis en todas las compras
- Invitación a eventos virtuales de Santiago

**👑 Gran Maestro** (2,500 pts):
- 15% descuento permanente
- Acceso VIP a lanzamientos
- Video personalizado de Santiago agradeciendo

**💎 Leyenda** (5,000 pts):
- 20% descuento permanente
- Cuadro pequeño gratis (20×30 cm)
- Mención en redes sociales de Santiago
- Beta tester de nuevos pares

---

## 🎁 SISTEMA DE PREMIOS CANJEABLES

### **Tienda de Premios**:

```
┌─────────────────────────────────────────┐
│  🎁 CANJEAR PUNTOS                      │
├─────────────────────────────────────────┤
│                                         │
│  💰 Descuentos:                         │
│  • 5% descuento  → 200 pts             │
│  • 10% descuento → 400 pts             │
│  • 15% descuento → 600 pts             │
│  • 20% descuento → 1000 pts            │
│                                         │
│  🎨 Productos Físicos:                  │
│  • Libreta de bocetos → 800 pts        │
│  • Set de pinceles → 1200 pts          │
│  • Póster firmado → 1500 pts           │
│  • Cuadro pequeño → 5000 pts           │
│  • Retrato mascota → 10000 pts         │
│                                         │
│  ✨ Experiencias:                       │
│  • Clase virtual 1h → 1000 pts         │
│  • Visita al taller → 3000 pts         │
│  • Sesión personalizada → 8000 pts     │
│                                         │
│  🌟 Exclusivos:                         │
│  • Par personalizado → 2000 pts        │
│  • Mención en IG → 500 pts             │
│  • Video dedicado → 1500 pts           │
└─────────────────────────────────────────┘

Tus puntos disponibles: 1,523 pts
```

---

## 🏆 TABLA DE CLASIFICACIÓN GLOBAL

### **Leaderboard Público**:

```
┌────────────────────────────────────────────────┐
│  🏆 TOP 10 JUGADORES - TODOS LOS TIEMPOS       │
├────┬───────────────┬─────────┬────────┬────────┤
│ #  │ Jugador       │ Mascota │ Puntos │ Rango  │
├────┼───────────────┼─────────┼────────┼────────┤
│ 🥇 │ María G.      │ Luna    │ 15,234 │ 💎     │
│ 🥈 │ Carlos R.     │ Max     │ 12,891 │ 💎     │
│ 🥉 │ Ana M.        │ Coco    │ 9,456  │ 👑     │
│  4 │ Pedro L.      │ Toby    │ 8,123  │ 👑     │
│  5 │ Laura S.      │ Bella   │ 7,234  │ 👑     │
│  6 │ Diego F.      │ Rocky   │ 6,789  │ 🎭     │
│  7 │ Carmen H.     │ Mia     │ 5,901  │ 🎭     │
│  8 │ Jorge P.      │ Zeus    │ 5,432  │ 🎭     │
│  9 │ Isabel R.     │ Luna    │ 4,876  │ 🎭     │
│ 10 │ Roberto M.    │ Simba   │ 4,321  │ 🎭     │
└────┴───────────────┴─────────┴────────┴────────┘

Tu posición: #23 con 1,523 puntos
```

### **Categorías de Clasificación**:

1. **Global** (todos los tiempos)
2. **Mensual** (resetea cada mes, premios mensuales)
3. **Semanal** (competencia rápida)
4. **Por Mascota** (clasificación de perros vs gatos vs caballos)

---

## 🎮 GAMIFICACIÓN AVANZADA

### **Desafíos Semanales**:

```
┌─────────────────────────────────────────┐
│  🎯 DESAFÍO DE LA SEMANA                │
├─────────────────────────────────────────┤
│                                         │
│  "Maestro de los Colores Cálidos"      │
│                                         │
│  Completa 5 partidas de Memoria         │
│  acertando todos los pares de:          │
│  • Rojo + Amarillo → Naranja            │
│  • Naranja + Blanco → Melocotón         │
│                                         │
│  Progreso: ███░░ 3/5                    │
│                                         │
│  Recompensa: +300 pts + Badge           │
│  Tiempo restante: 3 días 14h           │
└─────────────────────────────────────────┘
```

### **Logros (Achievements)**:

| Badge | Nombre | Requisito | Puntos |
|-------|--------|-----------|--------|
| 🌟 | Primera Partida | Jugar por primera vez | +10 |
| 🎯 | Perfeccionista | 10 partidas sin errores | +100 |
| 🔥 | Racha de Fuego | Racha de 10 días | +200 |
| 🎨 | Maestro del Color | Completar todos los pares de colores | +150 |
| 🖌️ | Conocedor de Arte | Identificar 50 pares de pintores | +250 |
| 👥 | Embajador | Invitar 10 amigos | +500 |
| 💎 | Elite | Llegar a rango Leyenda | +1000 |

---

## 🌟 SISTEMA DE CONTRIBUCIÓN DE PARES

### **Crear Pares = Ganar Puntos**:

```
1. Usuario propone un par creativo
2. Comunidad vota (like/dislike)
3. Santiago revisa y aprueba
4. Usuario gana 500 pts + crédito en el juego
```

### **Incentivos para Creadores**:

| Logro | Puntos |
|-------|--------|
| Primer par aprobado | +500 pts |
| Par con 100+ jugadas | +200 pts |
| Par con 90%+ éxito | +300 pts |
| Top 10 pares del mes | +1000 pts |

### **Créditos en el Juego**:

Cada par muestra:
```
┌─────────────────────┐
│  🎨 Creado por:     │
│  María González     │
│  Con su mascota:    │
│  Luna 🐕           │
│                     │
│  ⭐ 1,234 jugadas   │
│  💯 92% éxito       │
└─────────────────────┘
```

---

## 📊 DASHBOARD DEL USUARIO

```
┌──────────────────────────────────────────────┐
│  👤 PERFIL DE MARÍA                          │
├──────────────────────────────────────────────┤
│                                              │
│  🐾 Mascota: Luna (Labrador)                │
│  🏅 Rango: 🎭 Maestro (1,523 pts)           │
│  🔥 Racha actual: 5 días                    │
│                                              │
│  📊 ESTADÍSTICAS:                            │
│  • Partidas jugadas: 42                     │
│  • Partidas perfectas: 8 (19%)              │
│  • Tiempo total jugado: 3h 24m              │
│  • Pares favoritos: Rojo+Amarillo→Naranja   │
│                                              │
│  🎁 PRÓXIMO PREMIO:                          │
│  ███████░░░ 77% para Pintor (500 pts)       │
│                                              │
│  🏆 LOGROS RECIENTES:                        │
│  🌟 Primera Partida                         │
│  🔥 Racha de 5 días                         │
│  🎨 50 Pares Descubiertos                   │
│                                              │
│  [Ver Tabla de Clasificación]               │
│  [Canjear Puntos]                           │
│  [Crear un Par]                             │
└──────────────────────────────────────────────┘
```

---

## 🎁 PREMIOS MENSUALES AUTOMÁTICOS

### **Sorteo del Mes**:

**Todos los que tienen 100+ puntos participan**

Premios:
- **1er lugar**: Cuadro mediano personalizado (mascota)
- **2do lugar**: Set premium de arte
- **3er lugar**: 50% descuento en próxima compra
- **4to-10mo lugar**: 20% descuento

**Probabilidad de ganar aumenta con puntos**:
- 100 pts = 1 ticket
- 500 pts = 5 tickets
- 1000 pts = 15 tickets
- 5000 pts = 100 tickets

---

## 💡 ESTRATEGIA DE ENGAGEMENT

### **Flujo del Usuario Nuevo**:

```
DÍA 1:
• Registro (nombre + mascota)
• Tutorial interactivo
• Primera partida → Gana 100 pts + Badge
• Mensaje: "¡Sigue así! A 400 pts tienes 10% descuento"

DÍA 3:
• Notificación: "¡Luna extraña jugar! 🐕"
• Desafío rápido de 2 min
• Gana 50 pts

DÍA 7:
• Logro desbloqueado: "Racha de 7 días" (+200 pts)
• Ahora tienes 500 pts → Rango Pintor
• Beneficio: 5% descuento permanente

DÍA 30:
• Invitación a sorteo mensual
• Propuesta: "Crea tu primer par" (+500 pts)
• Comunidad te da feedback
```

### **Retención**:

**Notificaciones Push** (con permiso):
- "¡Tu racha termina en 3 horas!"
- "Nuevo desafío semanal disponible"
- "Estás a 50 pts de Maestro"
- "Sorteo mensual mañana - participa"

**Emails** (semanal):
- Resumen de progreso
- Posición en tabla de clasificación
- Nuevos pares disponibles
- Premios canjeables

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Base de Datos** (Estructura JSON):

```javascript
// localStorage (temporal, cliente)
{
  "userId": "user_12345",
  "sessionPoints": 150, // Puntos de esta sesión
  "lastSync": 1704067200000
}

// Backend (permanente, servidor)
{
  "users": {
    "user_12345": {
      "profile": {...},
      "stats": {...},
      "history": [
        {
          "date": "2025-10-01",
          "game": "memory",
          "score": 165,
          "pointsEarned": 150,
          "badges": ["🎯 Perfeccionista"]
        }
      ]
    }
  }
}
```

### **API Endpoints**:

```javascript
// Registrar usuario
POST /api/users/register
Body: { name, petName, email }
Response: { userId, token }

// Guardar partida
POST /api/games/save
Body: { userId, game, score, points }
Response: { totalPoints, newRank, badges }

// Obtener leaderboard
GET /api/leaderboard?category=global&limit=10
Response: [{ rank, name, petName, points }]

// Canjear premio
POST /api/rewards/claim
Body: { userId, rewardId, pointsCost }
Response: { success, remainingPoints }
```

---

## 📈 MÉTRICAS DE ÉXITO

### **KPIs a Trackear**:

| Métrica | Objetivo Mes 1 | Objetivo Mes 6 |
|---------|----------------|----------------|
| Usuarios registrados | 100 | 1,000 |
| Tasa de retención (7 días) | 40% | 60% |
| Puntos promedio por usuario | 300 | 1,500 |
| Pares creados por comunidad | 10 | 100 |
| Tasa de canje de premios | 20% | 40% |

---

## 🚀 ROADMAP

### **Fase 1: MVP** (Mes 1-2):
- ✅ Sistema de puntos básico
- ✅ Registro de usuarios
- ✅ Tabla de clasificación
- ⬜ Premios canjeables (descuentos)

### **Fase 2: Gamificación** (Mes 3-4):
- ⬜ Sistema de rangos y niveles
- ⬜ Badges y logros
- ⬜ Desafíos semanales
- ⬜ Notificaciones

### **Fase 3: Comunidad** (Mes 5-6):
- ⬜ Creación de pares por usuarios
- ⬜ Votación comunitaria
- ⬜ Sorteos mensuales
- ⬜ Integración redes sociales

### **Fase 4: Expansión** (Mes 7+):
- ⬜ Torneos competitivos
- ⬜ Equipos y clanes (por mascotas)
- ⬜ Marketplace de pares
- ⬜ API pública

---

## 💎 VALOR ÚNICO

**Lo que diferencia este sistema**:

1. **Conexión emocional**: Nombre + mascota crea identidad
2. **Comunidad activa**: Crear pares = parte del juego
3. **Premios reales**: No solo digital, cuadros físicos
4. **Educación artística**: Aprender mientras juegas
5. **Apoyo al artista**: Cada punto = engagement con Santiago

---

**¡Este sistema transforma jugadores ocasionales en una comunidad leal de amantes del arte!** 🎨✨

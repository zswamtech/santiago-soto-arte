# 🎨 Santiago Soto Arte

[![CI - Migrations](https://github.com/zswamtech/santiago-soto-arte/actions/workflows/ci-migrations.yml/badge.svg)](../../actions/workflows/ci-migrations.yml)

<div align="center">
  <img src="assets/images/logosantiagoarte1.png" alt="Santiago Soto Arte Logo" width="200" height="200" style="border-radius: 50%;">
</div>

Bienvenido al repositorio oficial de **Santiago Soto Arte**, un proyecto creativo y educativo que combina **pintura tradicional al óleo** con **tecnología digital**. Aquí desarrollamos un portafolio web interactivo para mostrar, aprender e innovar con las obras de **Santiago Soto**, un joven artista de 14 años apasionado por pintar mascotas de forma realista.

🌐 [Visita el dominio oficial](https://santiagosoto.art)

---

## ✨ Objetivos del Proyecto

- Crear un **portafolio digital** para exhibir las pinturas de Santiago.
- Explorar el uso de tecnologías web para **interactividad y creatividad**.
- Desarrollar actividades dinámicas: juegos, minijuegos, concursos, realidad aumentada y galerías 3D.
- Usar este proyecto como un espacio de **aprendizaje en programación y arte digital** para Santiago.
- Explorar a futuro ideas como **tokenización de obras** y experiencias inmersivas.

---

## 📚 Aprendizaje

Más allá de mostrar obras, este proyecto es un **laboratorio de aprendizaje**. Hemos creado el archivo [`aprendizaje.md`](./aprendizaje.md) para documentar paso a paso los lenguajes, herramientas y tecnologías que usamos.

Esto permite que Santiago (y cualquier visitante) entienda el **para qué** de cada parte:
- **HTML** → estructura.
- **CSS** → estilos y diseño.
- **JavaScript** → interactividad y juegos.
- **GitHub y Hostinger** → colaboración y publicación en línea.

---

## 🚀 Tecnologías principales

- **HTML5** – estructura de las páginas.
- **CSS3** – estilos y diseño responsivo.
- **JavaScript (ES6)** – interactividad, dinámicas y juegos.
- **Node.js + Live Server** – entorno de desarrollo local.
- **GitHub** – control de versiones y colaboración.
- **Hostinger** – hosting y dominio oficial.

Próximamente integraremos:
- **Three.js** (galerías 3D).
- **WebXR/AR** (realidad aumentada).
- **Tokenización (NFTs, exploratorio).**

---

## 🏆 Gamificación (Roadmap)

Hemos definido un plan de gamificación por fases (F0–F7) que cubre desde los juegos locales actuales hasta un ecosistema completo con misiones, logros, tienda de recompensas, niveles, rachas, componentes sociales, antifraude avanzado y experimentación.

- Documento completo: [README_GAMIFICATION.md](./README_GAMIFICATION.md)
- Estado actual: Fase 0 (juegos frontend + sistema de puntos local) → preparando Fase 1 (persistencia server y ledger de puntos).
- Principios clave: server authoritative, progresión clara, mezcla de recompensas (descuento / cosmético / acceso), antifraude incremental y métricas desde el inicio.

Si quieres contribuir a esta parte, revisa primero el roadmap para proponer mejoras alineadas a la fase vigente.

---

## 🔐 Autenticación y Tokens (Plan Futuro)

El proyecto ya incluye una base conceptual para integrar autenticación con **access tokens de vida corta** y **refresh tokens** mediante el módulo `assets/js/auth.js`:

- Uso centralizado de `authFetch()` para llamadas protegidas.
- Manejo automático de 401 por expiración (`token_expired`).
- Refresh único concurrente (cola de peticiones en espera).
- Documentación planificada en `AUTH_TOKEN_FLOW.md` (en preparación / o futura ampliación).

Ejemplo mínimo (cuando exista backend):

```html
<script src="assets/js/auth.js"></script>
<script>
  // setInitialAccessToken('ACCESS_TOKEN_INICIAL');
  // getProtectedJson('/api/perfil')
  //   .then(data => console.log('Perfil', data))
  //   .catch(console.error);
</script>
```

> Nota: El refresh token debe entregarse como **cookie httpOnly Secure** por el backend. El frontend nunca lo guarda en localStorage.

Próximos pasos posibles:

- Endpoint `/auth/login` y `/auth/refresh` en un micro backend.
- Decodificar `exp` del JWT para refresh proactivo.
- Añadir `logout` + revocación.

---

## 🧩 Estructura del Proyecto

```text
santiago_soto_arte/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       └── logosantiagoarte1.png
├── index.html
├── package.json
├── aprendizaje.md
└── README.md
```

---

## 🌟 Cómo colaborar

Este proyecto está abierto a la colaboración, siempre con respeto y foco en el **aprendizaje de Santiago**. Cualquier sugerencia, mejora o nueva idea puede hacerse mediante **Pull Requests** o **Issues**.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Eres libre de usar y modificar este código, siempre reconociendo la autoría de Santiago Soto Arte.

---

✍️ Proyecto en desarrollo por **Santiago Soto** y **Andrés Soto**, con apoyo de IA copilotos.

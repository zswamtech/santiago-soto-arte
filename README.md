<!-- markdownlint-disable MD033 -->
# Santiago Soto Arte

<div align="center">

  <h1>🎨 Santiago Soto Arte</h1>

  <p>
    <a href="../../actions/workflows/ci-migrations.yml">
      <img alt="CI - Migrations" src="https://github.com/zswamtech/santiago-soto-arte/actions/workflows/ci-migrations.yml/badge.svg" />
    </a>
  </p>

  <p>
    <img src="assets/images/favicon.svg" alt="Logo Santiago Soto Arte" width="160" height="160" />
  </p>

  <p>
    <img alt="Gamification" src="https://img.shields.io/badge/Gamification-F0%20(local)-blue" />
    <img alt="Pricing CAP" src="https://img.shields.io/badge/Pricing_CAP-25%25_enforced-brightgreen" />
    <img alt="Coupons" src="https://img.shields.io/badge/Coupons-DB%20+%20Idempotent-success" />
    <img alt="Patron Discount" src="https://img.shields.io/badge/Patron%20Discount-Server%20Mapping-informational" />
    <img alt="Ledger" src="https://img.shields.io/badge/Points_Ledger-Pending%20(F1)-yellow" />
    <img alt="Snapshot HMAC" src="https://img.shields.io/badge/Snapshot_HMAC-TBD-lightgrey" />
    <img alt="Última Migración" src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/zswamtech/santiago-soto-arte/feat/ui-extend-cart-hero/badges/migration-badge.json" />
  </p>

  <p>
    Portafolio web interactivo que une <b>pintura al óleo</b> y <b>tecnología</b> para aprender, jugar e inspirar.<br/>
    🌐 <a href="https://santiagosoto.art" target="_blank">santiagosoto.art</a>
  </p>

</div>

---

## ✨ Objetivos

- Portafolio digital de obras de Santiago.
- Interactividad creativa (juegos, minijuegos, galerías 3D).
- Espacio de aprendizaje en programación y arte digital.
- Exploración futura: AR/WebXR, tokenización, experiencias inmersivas.

---

## 📚 Aprendizaje

Consulta [`aprendizaje.md`](./aprendizaje.md) para el paso a paso: **HTML** (estructura), **CSS** (estilos), **JS** (interactividad), **GitHub** y publicación.

---

## 🚀 Stack

- HTML5, CSS3, JavaScript (ES6)
- Node + live-server (dev local)
- GitHub (código) + Vercel (hosting) + Hostinger (dominio)
- Próximo: Three.js (galería 3D), WebXR/AR

---

## 🧩 Juegos (Memoria Artística)

- Flip contemplativo (≈1.85s), UX accesible y “mantener abiertas hasta el siguiente clic”.
- Librería de pares dinámica con `assets/img/memory-cards/pairs.json` → probabilidad uniforme y escalable a 20+ pares.
- Precarga de imágenes y controles educativos (títulos/segmentos).

Para agregar pares: sube `par_XX_*.png` y añade una entrada al `pairs.json` (no hace falta tocar JS).

---

## 🧪 Ejecutar en local

```bash
npm install
npm run dev
```

Abre <http://localhost:3000/>

---

## ☁️ Despliegue

- Hosting: Vercel (sitio estático). Configuración en `vercel.json`.
- Dominio: santiagosoto.art (DNS en Hostinger → A @ 76.76.21.21 y CNAME www e5ea44e0d6f77726.vercel-dns-017.com).
- Producción: rama `main`.

---

## 🏆 Gamificación

Roadmap por fases (F0–F7). Ver [README_GAMIFICATION.md](./README_GAMIFICATION.md). Estado: F0, preparando F1 (ledger).

---

## 📄 Licencia

MIT — con reconocimiento a Santiago Soto Arte.

---

Hecho con ❤️ por **Santiago Soto** y **Andrés Soto**.


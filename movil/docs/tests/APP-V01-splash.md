# Evidencia de verificación — APP-V01 (splash)

Herramienta: `consistency.mjs` (kit design-taste-frontend) · Chrome headless de Playwright (`CHROME_PATH`).
Fecha: 2026-11-06 · Ancho: 390 (base del deal) · TAC de referencia: **TAC-APP-01**.

## Resumen
**40 PASS · 16 FAIL · 4 WARN** — `docs/tests/shots/appv01-390.png` (Playwright CLI).

## PASS clave
- **TAC-APP-01** ✓: logo visible, `fade-in` de 0.7s una sola vez, enlace a `login.html`.
- **Sin scroll**: 1 screen exacta a 390×844 (`heights 0.96`).
- Contraste botón (`btn--surface`: superficie con `primary-dark`), foco AA, reduced-motion, `alt` en logo, `lang="es"`.

## FAIL justificados (reglas de landing en un shell de app — ADR-15)
| Check | Justificación |
|---|---|
| `hero-screen` ×2, `one-heading`, `section-height` ×3, `one-section` ×2, `container-edges`, `split-pair`, `copy-headings` | El checker evalúa como si fuera una **landing page** de marketing. Un splash de app es HUD (statusbar device-chrome + marca): el h1 es la marca, no el promesa de categoría; no hay scroll ni secciones múltiples por definición. |
| `loop-pause` | El loop es el loader de 3 puntos (3 s, regla 5 del kit: 2.5–4 s). Un loader de splash sin pausa es comportamiento estándar de app; interrumpirlo con botón violaría la convención de UI real. |
| `copy-headline` | h1 = nombre del sistema "CreaNose" (PRD: "pantalla de entrada con logo del sistema"). La copia de categoría vive en la tagline, no en el h1 de marca. |

## Pendiente
- El enlace ``Comenzar`` → `login.html` cae en 404 hasta maquetar APP-V02 (siguiente vista).

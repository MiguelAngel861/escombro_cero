# Evidencia de verificación — APP-V02 (login)

Żródło: navegación real con playwright-cli sobre `http://127.0.0.1:4173` (`python3 -m http.server` de `dist/`),
según TAC-APP-02 y SPEC-A08. Fecha: 2026-11-07 · emulación móvil (base 390 del deal).

## Checklist TAC-APP-02 — todos en verde
| Criterio | Resultado |
|---|---|
| Regex demo de correo | `RX_CORREO` en `src/scripts/login.ts` |
| Muestra `.field--error` con formato inválido | `getComputedStyle(.field-error).display === "block"` con `no-es-correo` |
| Deshabilita el submit | `btn.disabled=true` con error y con campo vacío (estado inicial `[invalid]`) |
| Formato válido habilita avanza | `btn.disabled=false` con `ana@correo.com` |
| Sesión simulada (ADR-04) | `localStorage cnsv1:sesion = {"rol":"ciudadano","correo":"ana@correo.com"}` |
| Navega a APP-V04 | `location.href menu.html` — click lleva a `/menu.html` (404 hasta APP-V04) |
| Links | splash → login ✓; login → registro.html (404 hasta APP-V03, declarado) |

## Verificación de entorno (splash APP-V01 con el mismo playwright-cli run)
- 5 requests, **todas locales** (NFR-S01 sin llamadas externas) ✓
- Fuentes locales cargadas: `document.fonts.check` → Host Grotesk `true` · JetBrains Mono `true` ✓
- Splash sin scroll (`scrollHeight == innerHeight`) ✓
- Favicon 404 del splash corregido con `<link rel="icon" href="assets/logo.svg">`

## Pendientes declarados
- ~~`registro.html` (APP-V03) y `menu.html` (APP-V04) no existen aún → 404 esperado.~~
  **Resuelto 2026-11-07**: V03 y V04 existen y están verificados (`APP-V03-registro.md`,
  `APP-V04-menu.md`). La campaña completa de V01…V10 en `APP-CAMPAIGN.md`.

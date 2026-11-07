# Evidencia de verificación — APP-V03 (registro)

Fuente: navegación real con playwright-cli sobre `http://127.0.0.1:4173` (`dist/` build).
Fecha: 2026-11-07 · emulación móvil 390 · captura: `shots/appv03.png`.

## Checklist TAC-APP-03 / SPEC-A08 — todos en verde
| Criterio | Resultado |
|---|---|
| Campos requeridos con validación demo | nombre ≥3, correo `RX_CORREO`, teléfono 9 dígitos, contraseña ≥6 |
| Muestra `.field--error` con valor inválido | `getComputedStyle(.field-error).display === "block"` + `aria-invalid` |
| Deshabilita submit | `btn.disabled=true` inicial y con cualquier campo inválido |
| Válido habilita | `btn.disabled=false` con `Ana Torres / ana@correo.com / 999000111 / 123456` |
| Toggle contraseña | `aria-pressed` + `type password↔text` + texto Mostrar/Ocultar |
| Sesión simulada (ADR-04) | submit → `cnsv1:sesion` + `cnsv1:usuario` → navega a `menu.html` |

## Verificación de entorno
- Requests locales solamente (NFR-S01) ✓
- Fuentes locales: Host Grotesk y JetBrains Mono vía `document.fonts.check` ✓
- Link cruzado a `login.html` funcional ✓

## Checker kit
`consistency.mjs` no aplica checks incidentales a formularios de app; los FAIL (hero-screen,
section-height sobre statusbar/bottom-nav) se justifican en `APP-CAMPAIGN.md` (ADR-15).

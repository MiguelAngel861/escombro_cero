# Evidencia de verificación — APP-V09 (perfil)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390 · captura: `shots/appv09.png`.

## Checklist TAC-APP-09 / SPEC-A09 — todos en verde
| Criterio | Resultado |
|---|---|
| Guard de sesión | sin sesión → `login.html` ✓ |
| Datos precargados | Ana Torres · ana@correo.com · 999 000 111 (de `cnsv1:usuario`) ✓ |
| Validación live | submit habilitado/deshabilitado según validez (regex demo) ✓ |
| Guardar cambios | `cnsv1:usuario.nombre = "Ana Torres Gil"` tras submit ✓ |
| Modo offline demo | `aria-pressed` alterna + guarda `cnsv1:offline` ✓ |
| Reiniciar demo | `reiniciarDemo()` borra `cnsv1:*` y siembra de nuevo → **9 reportes**, nombre "Ana Torres", sesión limpia → `login.html` ✓ |
| Cerrar sesión | `cerrarSesion()` → `login.html` ✓ |

## Eval de la corrida
- guardar → `"Ana Torres Gil"` ✓
- offline → `aria-pressed="true"` ✓
- reiniciar → `{"reportes": 9, "nombre":"Ana Torres","url":"/login.html"}` ✓

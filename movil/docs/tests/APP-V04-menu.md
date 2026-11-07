# Evidencia de verificación — APP-V04 (menú)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390.
Captura: `shots/appv04.png`.

## Checklist TAC — todos en verde
| Criterio | Resultado |
|---|---|
| Guard de sesión | sin `cnsv1:sesion` → redirige a `login.html` (verificado con shooter de perfil limpio) |
| Saludo personalizado | `#greet-name` = "Hola, Ana" (del `cnsv1:usuario`) |
| Contadores | activos **6** (estados ≠ recolectado/expirado), recolectados **1** |
| Sub de accesos | "Último: R-00X · <estado>" leído de data, nunca hard-code (SPEC-C04) |
| Bottom-nav | 5 slots: Inicio · Nuevo · Reportes · Mapa · Perfil, `aria-current` en Inicio |
| Accesos rápidos | 3 tarjetas `a.card--tapp` con hover lift (regla 5) |

## Verificación
- `eval` → `{"hola":"Hola, Ana","activos":"6","recolectados":"1","nav":5}` ✓
- ~Shot renderiza contadores correctos y nav completa ✓

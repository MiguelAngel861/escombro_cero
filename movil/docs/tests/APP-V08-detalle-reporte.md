# Evidencia de verificación — APP-V08 (detalle de reporte)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390 · captura: `shots/appv08-detalle.png`.

## Checklist TAC-APP-08 / SPEC-A05 — todos en verde
| Criterio | Resultado |
|---|---|
| Operativa con `?id=` | `detalle-reporte.html?id=R-003` renderiza datos de R-003 ✓ |
| Foto placeholder | `img.mini-map` `tipo-mezclado.svg` (ADR-09) ✓ |
| Mini-mapa SVG | polígono + pin color de estado + ubicación ✓ |
| Campos completos | Volumen 6.0 m³ · Tipo · Ubicación · Zona ✓ |
| Timeline | `estados.padre`: pendiente→en_revision→programado; done 3, futuro 3 ✓ |
| Banner novedad CU-04 | `banner-cambios` (comparado con `cnsv1:visto-detalle`) ✓ |
| Rechazado | R-008: motivo "sin foto verificable" + botón **Corregir y reenviar** → `nuevo-reporte.html?id=R-008&mode=edit` ✓ |
| Sin modo edición | R-003 no muestra botón de reenvío ✓ |

## Eval de la corrida
- R-003: `{"estado":"Programado","done":3,"futuro":3,"banner":true}` ✓
- R-008: heading "Demolición" · badge "Rechazado" · "Motivo del rechazo" · link "Corregir y reenviar" ✓

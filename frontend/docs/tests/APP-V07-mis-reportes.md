# Evidencia de verificación — APP-V07 (mis reportes)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390 · captura: `shots/appv07.png`.

## Checklist TAC-APP-07 / SPEC-A04 / RB-04 — todos en verde
| Criterio | Resultado |
|---|---|
| Guard de sesión | sin `cnsv1:sesion` → `login.html` (demonstrado con shooter de perfil limpio) ✓ |
| Tarjetas | ID, fecha formateada, tipo, volumen m³, ubicación corta, `status-badge` ✓ |
| 6 estados cubiertos | badges `[pendiente, en_revision, programado, recolectado, rechazado, expirado]` (R-009 añadido al dataset) ✓ |
| Chips de filtro | Todos + 6 estados, `chip--on` exclusivo; filtro "Programado" → 1 tarjeta ✓ |
| Sub contador | "8 reportes — toca una tarjeta para ver el detalle." (sin R-010 tras reinicio) ✓ |
| Duplicado (RB-08) | R-007 lleva badge bis "duplicado" (alerta en tarjeta ✓ ×2 bis) ✓ |
| Novedad CU-04 | toast "Actualización en tus reportes" + dot azul en tab Reportes ✓ |
| Cards enlazadas | `a.card--tapp` → `detalle-reporte.html?id=R-00X` sin subrayado (fix `a.card`) ✓ |

## Eval de la corrida
`{"cards":9,"badges":["pendiente","en_revision","programado","recolectado","pendiente","pendiente","pendiente","rechazado","rechazado","expirado","pendiente"],"dupAlert":2}` +
filtro programado → `{"filtro":"programado","visibles":1}` ✓
(9 cards = 8 del seed + R-010 creado en el flujo V05 de la misma campaña.)

## Checker kit (muestra, 390)
FAILs `hero-screen/section-height/no-visual` consistente en la App-shell — justificados en `APP-CAMPAIGN.md` (ADR-15).

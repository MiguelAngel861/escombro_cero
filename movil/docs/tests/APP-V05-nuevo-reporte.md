# Evidencia de verificación — APP-V05 (nuevo reporte) + APP-V06 banner (SPEC-A03)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390.
Capturas: `shots/appv05-reporte.png`, `shots/appv06-zona.png` (pantalla dedicada: `APP-V06-validacion-zona.md`).

## Checklist TAC-APP-04 / SPEC-A01 — todos en verde
| Criterio | Resultado |
|---|---|
| Cámara simulada (ADR-09) | `#btn-foto` → placeholder SVG + `img-capture--filled` |
| Metadatos en foto | badge `.meta-gps` = "GPS ✓ · 14:32 ✓" (RB-12 demo) |
| Catálogo de tipos | 5 opciones renderizadas de `TIPOS_ESCOMBRO` (SPEC-C04) |
| Catálogo de volumen | 5 chips (0.8 / 2.5 / 6 / 6.5 / 10 m³), **selección única** (fix 2026-11-07: antes `chip--on` se marcaba en todos) |
| Dirección manual | campo `#f-dir` (opcional; vacío → "Calle demo 1 (GPS)"); se guarda en `reporte.ubicacion` |
| Descripción opcional | `textarea#f-desc`, `min-height: 150px` (agrandado por feedback) |
| Submit deshabilitado | `btn-enviar.disabled=true` hasta foto+tipo+volumen ✓ |
| Banner de zona (APP-V06 in-form) | informativo (verde/rojo); el escenario alterna desde `validacion-zona.html` — el toggle por click en el banner causaba rechazos accidentales al tocar Enviar |
| Modo edición (SPEC-A05, fix 2026-11-07) | `?id=R-008&mode=edit` → título "Corregir reporte", campos precargados, botón "Reenviar reporte"; submit restaura `pendiente` sobre el MISMO id, conserva tipo/volumen originales si no se tocan, y redirige al detalle |
| Fecha del reporte | parseable `YYYY-MM-DDTHH:mm` (regresión TAC-APP-06 cubierta) |

## Flujo completo verificado (E2E)
1. foto → GPS ✓ · 14:32 ✓ ✓
2. tipo "Demolición" → placeholder cambia a `tipo-demolicion.svg` ✓
3. volumen "1–3 m³" → botón habilitado ✓
4. enviar → toast "Reporte enviado" → inserta **R-010** con estado `pendiente` en `cnsv1:reportes` (n=10) ✓
5. redirección a `mis-reportes.html` tras 1.4 s ✓

## Fallback fuera de zona (RB-01)
Con banner en rojo (escenario simulado desde `validacion-zona.html`), enviar muestra toast
"Fuera de zona (demo): reporte rechazado" y **no** persiste el reporte ✓

## E2E del fix 2026-11-07 (playwright)
- dirección manual → R-010 con `ubicacion="Av. Los Próceres, cuadra 4"` ✓
- chips: `{"chipsOn":["1–3 m³"],"una":true}` ✓
- edit R-008 → estado `pendiente`, `volumenM3 1.5` intacto, historial 3, redirect a detalle ✓
- capturas: `shots/appv05-reporte.png` (form normal) · `shots/appv08-editor.png` (modo "Corregir reporte") · `shots/appv08-reenviado.png` (detalle tras reenviar)

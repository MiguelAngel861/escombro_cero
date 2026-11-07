# Evidencia de verificación — APP-V06 (validación de zona, pantalla dedicada)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390.
Capturas: `shots/appv06-zona.png` (escenario dentro), `shots/appv06-fuera.png` (escenario fuera).
Nota de arquitectura: SPEC-A03 — el resultado vive como banner dentro de APP-V05; esta pantalla
dedicada existe **solo para la demo** mostrando ambos resultados.

## Checklist — todos en verde
| Criterio | Escenario "dentro" | Escenario "fuera" |
|---|---|---|
| Chip activo | `#tab-dentro` `chip--on` + `aria-selected=true` ✓ | `#tab-fuera` ✓ |
| Punto GPS | `#gps-dot` cx=165 (dentro del polígono), fill verde ✓ | cx=320, fill `--state-rechazado` ✓ |
| Polígono | fill `--state-recolectado-bg`, stroke primario ✓ | fill `--state-rechazado-bg`, stroke rojo ✓ |
| Banner | "Dentro de zona ✓" — reporte → fila pendiente del tablero ✓ | "Fuera de zona ✗" — rechazo con motivo `fuera_zona` (RB-01) ✓ |
| Volver | link a `nuevo-reporte.html` funcional ✓ | ✓ |

## Verificación eval
- `{"tabOn":"tab-dentro","banner":"Dentro de zona ✓"}` ✓
- click `#tab-fuera` → `{"tabOn":"tab-fuera","banner":"Fuera de zona ✗","gpsFill":"var(--state-rechazado)"}"` ✓

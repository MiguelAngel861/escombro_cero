# Evidencia de verificación — APP-V10 (mapa de reportes)

Fuente: playwright-cli sobre `http://127.0.0.1:4173` · 2026-11-07 · 390 · captura: `shots/appv10.png`.

## Checklist TAC-APP-10 / SPEC-A06 — todos en verde
| Criterio | Resultado |
|---|---|
| SVG estático | viewBox 340×320, polígono zona piloto + calles de referencia ✓ |
| Pines por reporte | 9 `<g.pin-map>` con `data-id` para sincronía con tarjetas ✓ |
| Leyenda por estado | 6 span (llave de color `--state-<estado>`, ADR-14/15) ✓ |
| Tarjetas sincronizadas | 9 `a.card` en `#lista-pines` resaltan el pin vía `data-id` (hover/focus/pointer) ✓ |
| Pin clicable | tap en pin navega a `detalle-reporte.html?id=<id>` ✓ |
| Posiciones sin colisiones | `posDe` hash ×131 mod 2009 + offsets (fix de banda acumulada) → puntos repartidos ✓ |
| Guard de sesión | sin `cnsv1:sesion` → `login.html` ✓ |

## Eval de la corrida
`{"pines":9,"tarjetas":9,"leyenda":6,"sub":"9 repo..."}` ✓

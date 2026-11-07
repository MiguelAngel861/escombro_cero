# Campaña de verificación APP (APP-V01…V10) — resumen

Fecha: 2026-11-06/07 · servidor `http://127.0.0.1:4173` (`python3 -m http.server` de `dist/`,
build versionado) · herramienta: `playwright-cli` + `shoot.mjs`/`consistency.mjs` del kit
`design-taste-frontend` (CHROME_PATH = Chromium de Playwright).

## Resultado por vista

| Vista | Verificación E2E (playwright) | Screenshot | Resultado |
|---|---|---|---|
| APP-V01 splash | 5 requests locales, fuentes, sin scroll | `shots/appv01-390.png` | PASS |
| APP-V02 login | TAC-APP-02 completo (ver doc propia) | `shots/appv02-login.png` | PASS |
| APP-V03 registro | validación demo + toggle pwd + sesión | `shots/appv03.png` | PASS |
| APP-V04 menú | saludo/contadores 6-y-1/nav 5, guard | `shots/appv04.png` | PASS |
| APP-V05 nuevo reporte | foto+GPS, 5 tipos, 5 volúmenes, R-010 insertado | `shots/appv05-reporte.png` | PASS |
| APP-V06 zona (banner + pantalla) | tabs dentro/fuera mueven GPS y banner | `shots/appv06.{html,zona,fuera}.png` | PASS |
| APP-V07 mis reportes | 9 tarjetas, badges 6 estados, chips, duplicado | `shots/appv07.png` | PASS |
| APP-V08 detalle | timeline, banner CU-04, motivo+corregir R-008 | `shots/appv08-detalle.png` | PASS |
| APP-V09 perfil | guardar/offline/reiniciar/salir | `shots/appv09.png` | PASS |
| APP-V10 mapa | 9 pines ↔ 9 tarjetas, leyenda 6 colores | `shots/appv10.png` | PASS |

Flujo maestro ejecutado de punta a punta con una sola sesión playwright-cli:
splash → login → menú → nuevo-reporte (R-010 pendiente) → mis-reportes → detalle (R-003/R-008)
→ mapa → perfil (guardar / offline / reiniciar → dataset 9 + redirección a login) ✓

## Guard de sesión (SPEC-A10 / ADR-10) — validado dos veces

Las vistas protegidas redirigen a `login.html` sin `cnsv1:sesion`. Esto se demostró de forma
accidental-feliz: las capturas hechas por `shoot.mjs` (perfil limpio) salieron con el login —
el guard funcionó. Las capturas finales se tomaron sembrando la sesión con playwright-cli.

## Checker del kit (consistency.mjs) — muestra: mis-reportes, nuevo-reporte, mapa (390)

Los FAIL/WARN agresivos del kit corresponden a supuestos de **landing de marketing** que no
aplican a una vista de app; se justifican aquí (ADR-15, exención regla-3 de vistas de datos):

| FAIL/WARN | Por qué no aplica |
|---|---|
| `no-visual`, `copy-headline`, `copy-buttons` | el checker sin sesión ve el contenido de **login.html** por la redirección del guard — el contenido real lo verificaron las capturas |
| `hero-screen`, `section-height`, `one-section` | una app no tiene secciones de marketing: el "statusbar" simulado (9:41 · GPS · 82%) y el `bottom-nav` son piezas del shell, no secciones |
| `hover` (enlaces) | la capa de motion existe (`.btn`, `.chip`, `a.card--tapp` caminan al hover/press) |

## Cambios aplicados sobre hallazgos (agréguese al log)

- `posDe` del mapa: nueva dispersión (×131 mod 2009, +offsets) — pines ya no se acumulan en banda.
- `a.card { text-decoration: none }` en componentes — las tarjetas-enlace sin subrayado del U-A.
- Fix de carrera en el bucle de capturas: header/re-shot por vista con `sleep` tras el `goto`.
- **Fix por feedback del usuario (2026-11-07, APP-V05/APP-V08):**
  1. Modo edición implementado (SPEC-A05): "Corregir y reenviar" precarga y el submit ahora restaura `pendiente` sobre el mismo id (antes el `?id=&mode=edit` se ignoraba y el banner cambiaba de escenario por error al tocar Enviar → parecía que "no se registraba nada"). También el toggle de escenario se movió a la vista dedicada V06.
  2. Chips de volumen: selección única (`chip--on` en el elegido; antes quedaban todos marcados).
  3. Descripción: textarea de 96→150 px.
  4. Dirección manual: campo `#f-dir` opcional; vacío usa "Calle demo 1 (GPS)".
- **Fix B1 — crash en APP-V07 "Mis reportes" (2026-11-07):** `Uncaught TypeError: cannot read
  properties of null (reading 'toFixed')` cuando `localStorage` contenía una fila con
  `volumenM3` nulo (debe haber venido de una corrida anterior); la lista quedaba vacía (0 tarjetas).
  Doble defensa en `store.losReportes()`: `sanea()` repara campos fuera de catálogo/numéricos
  (estado→pendiente, tipo→otros, volumen→0, historial→[pendiente]) y persiste el saneado;
  V07 (y por extensión V08/V10, que leen del mismo store) vuelve a renderizar. Reproducido con
  datos corruptos inyectados: 0 tarjetas + TypeError → tras el fix, 8 tarjetas y V08/V10 OK.

## Entorno final

- `pnpm run build` verde (css → `tsc` → copia assets/vistas a `dist/`); `tsc --noEmit` = 0 errores.
- 11 HTML en `dist/` (10 vistas APP + paleta interna `paleta.html`, fuera del flujo demo).

## Desviaciones justificadas (visto con SPEC)

- `programado` teal `#00838f` (SPEC §6.5 decía "violeta" — prohibido por el kit; ADR-14/15).
- Kit regime aplicado como barra de calidad: el SPEC gana en modelo de datos y arquitectura.

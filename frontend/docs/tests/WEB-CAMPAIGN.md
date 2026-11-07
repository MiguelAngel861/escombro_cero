# Campaña de Verificación Visual y Funcional — Plataforma Web (WEB-V01 a WEB-V12)

Resultados de la verificación de todas las vistas web del sistema **Escombro 0** (Reto #3 UNCSM, Managua, Nicaragua), ejecutados en navegador Chromium headless (1440x900) vía `playwright-cli` y renderizados estáticamente desde `dist/web/`.

---

## 1. Resumen de Vistas Web Implementadas y Verificadas

| ID Vista | Nombre / Propósito | Archivo HTML | Script TypeScript | Captura de Evidencia | Estado |
|---|---|---|---|---|---|
| **WEB-V01** | Inicio de sesión con selector de rol institucional | `login.html` | `web-login.ts` | `shots/web/WEB-V01-login.png` | ✅ Aprobado |
| **WEB-V02** | Tablero de operaciones split 60/40 (lista + mapa SVG con pines por estado) | `tablero.html` | `web-tablero.ts` | `shots/web/WEB-V02-tablero.png` | ✅ Aprobado |
| **WEB-V03** | Asignación de brigada (modal operador + fecha estimada → `programado`) | En `tablero.html` y `detalle-reporte.html` | `web-tablero.ts`, `web-detalle.ts` | `shots/web/WEB-V03-asignacion-modal.png` | ✅ Aprobado |
| **WEB-V04** | Registro oficial de recolección (volumen m³, peso kg, destino DE-*, fotos antes/después, validación RB-06) | `registro-recoleccion.html` | `web-recoleccion.ts` | `shots/web/WEB-V04-registro-recoleccion.png` <br> `shots/web/WEB-V04-rb06-discrepancia-modal.png` | ✅ Aprobado |
| **WEB-V05** | Cambio de estado y rechazo con motivo oficial del catálogo | En `detalle-reporte.html` | `web-detalle.ts` | `shots/web/WEB-V05-rechazo-modal.png` | ✅ Aprobado |
| **WEB-V06** | Reapertura de caso (solo admin, justificación técnica obligatoria $\ge 20$ caracteres, RB-14) | En `detalle-reporte.html` | `web-detalle.ts` | `shots/web/WEB-V06-reapertura-modal.png` | ✅ Aprobado |
| **WEB-V07** | Catálogo de destinos autorizados (capacidad, ocupación %, tipo de valorización, modal nuevo destino) | `destinos.html` | `web-destinos.ts` | `shots/web/WEB-V07-destinos.png` | ✅ Aprobado |
| **WEB-V08** | Exportación de datos (tabla 10 columnas obligatorias PRD §6.2 + modal CSV simulado) | `exportacion.html` | `web-exportacion.ts` | `shots/web/WEB-V08-exportacion-modal.png` | ✅ Aprobado |
| **WEB-V09** | Gestión de usuarios y brigadistas (tabla de supervisores/operadores, activar/desactivar, modal usuario) | `usuarios.html` | `web-usuarios.ts` | `shots/web/WEB-V09-usuarios.png` | ✅ Aprobado |
| **WEB-V10** | Métricas de impacto (4 KPIs principales, desglose por material, distribución FSM, ocupación de destinos) | `metricas.html` | `web-metricas.ts` | `shots/web/WEB-V10-metricas.png` | ✅ Aprobado |
| **WEB-V11** | Historial cronológico de recolecciones (código `REC-###`, filtros por operador, destino y búsqueda rápida) | `historial.html` | `web-historial.ts` | `shots/web/WEB-V11-historial.png` | ✅ Aprobado |
| **WEB-V12** | Ficha detallada de reporte (dossier, coordenadas, mapa mini SVG, fotos, timeline FSM, barra de acciones por rol) | `detalle-reporte.html` | `web-detalle.ts` | `shots/web/WEB-V12-detalle-reporte.png` | ✅ Aprobado |

---

## 2. Verificación de Reglas de Negocio Institucionales

1. **RB-03 / RB-06 (Volumen y Discrepancia en Terreno):**
   - El formulario `WEB-V04` valida en tiempo real si el volumen cargado por la brigada supera la estimación ciudadana. Al detectar exceso, bloquea el envío y despliega modal que exige explicación técnica $\ge 20$ caracteres antes de persistir.
2. **RB-10 (Control de Acceso por Roles):**
   - El shell (`web-shell.ts`) oculta automáticamente del menú lateral los módulos administrativos (`destinos`, `metricas`, `exportacion`, `usuarios`) cuando el rol activo es Operador. El selector superior conmuta la identidad entre Supervisor (`AD-01`) y Operador (`OP-01`).
3. **RB-14 (Reapertura Restringida):**
   - En `WEB-V12`, solo el rol Administrador tiene habilitado el botón "Reabrir Reporte" para casos en `recolectado` o `rechazado`. El modal valida contador de caracteres $\ge 20$ para habilitar la confirmación y añade el nuevo estado al historial FSM.
4. **Paleta Institucional y Tipografía (DESIGN.md):**
   - Verde primario `#2e7d32`, teal `#00838f` para estado `programado` (cero violeta/púrpura), fuentes variables `Host Grotesk` y monoespaciada `JetBrains Mono` para coordenadas y códigos.

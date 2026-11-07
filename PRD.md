# PRD — Prototipo de vistas: Sistema de registro de escombros (App móvil + Web)

**Producto:** Prototipo de vistas (mockups/wireframes) — reto #3 "Escombros a recursos"  
**Fase:** Planeación de prototipado (solo diseño de interfaces)  
**Autor:** Ingeniería de Sistemas  
**Fecha:** Noviembre 2026  
**Contexto:** Primer Torneo Académico de Retos Interdisciplinarios "Comandante Carlos Fonseca Amador" — Universidad Nacional Casimiro Sotelo Montenegro (UNCSM), Managua, Nicaragua  
**Reto asignado:** Reto #3 — Escombros a recursos  
**Rol de Ingeniería de Sistemas:** Diseñar y entregar únicamente las **vistas/pantallas** (interfaz de usuario) de dos plataformas: (1) app móvil para reporte de escombros y (2) plataforma web para registro de puntos de recolección y sus datos.  
**Alcance estricto:** Prototipado de vistas únicamente. No hay backend, no hay base de datos, no hay servidor, no hay lógica de negocio ejecutable, no hay exportación real de datos, no hay autenticación funcional. Todo lo relativo a negocio, venta, cotización, Modelo Canvas, pitch y diseño 3D le corresponde a las otras carreras del equipo interdisciplinario y está fuera de este documento.

---

## 1. Resumen ejecutivo y visión del prototipo

### 1.1 Visión
Entregar un conjunto de vistas (pantallas) que simulen el comportamiento de dos plataformas: una app móvil donde un ciudadano reporta escombros en una zona determinada, y una web donde un operador registra el lugar y datos de cada punto de recolección. El prototipo sirve como soporte visual para el pitch y para demostrar el flujo tecnológico propuesto por Ingeniería de Sistemas dentro del reto #3.

### 1.2 Objetivo del producto (en una frase)
Diseñar las vistas de una app móvil y una web que ilustren cómo se registrarían digitalmente los escombros y sus puntos de recolección, sin desarrollar funcionalidad backend.

---

## 2. Planteamiento del problema (desde el prototipo)

| Área | Descripción (desde Ingeniería de Sistemas) |
|------|--------------------------------------------|
| **Problema principal** | No existe una representación visual de cómo se capturaría digitalmente la ubicación, tipo y volumen de escombros, ni cómo se registrarían los puntos de recolección. |
| **Causa raíz** | Falta de un prototipo de interfaces que muestre el flujo de datos entre ciudadano, operador y administrador. |
| **Impacto** | El equipo interdisciplinario no cuenta con un参照 visual para el Modelo Canvas, el cálculo de impacto ambiental ni el diseño 3D del producto reciclado. |
| **Oportunidad** | Crear vistas realistas que comuniquen la solución tecnológica propuesta, aunque no sean funcionales. |

---

## 3. Público objetivo y actores (vista del prototipo)

### 3.1 Actores representados en las vistas

| Actor | Rol en las vistas | Dispositivo | Qué se muestra en su pantalla |
|-------|-------------------|-------------|------------------------------|
| **Ciudadano reportante** | Persona que reporta escombros | App móvil (mockup Android/iOS) | Pantallas de login, registro, nuevo reporte con foto/GPS/tipo/volumen, mis reportes y estados. |
| **Operador de recolección** | Brigadista que recoge el escombro | Web (mockup tablet/PC) | Pantallas de login, tablero de reportes asignados, formulario de registro de recolección (lugar, fecha, volumen m³, destino, fotos antes/después). |
| **Administrador / Supervisor** | Encargado que valida y asigna | Web (mockup PC) | Pantallas de tablero general, validación de reportes, asignación de brigada, exportación simulada de datos, gestión de usuarios. |

### 3.2 Zona geográfica representada en las vistas
Una zona piloto delimitada del municipio de Managua (polígono o coordenadas de referencia definidas por el comité organizador / alcaldía). Las vistas mostrarán validación de zona (dentro/fuera de cobertura).

---

## 4. Objetivos del prototipo (solo vistas)

| ID | Objetivo | Entregable asociado | Meta MVP |
|----|----------|---------------------|----------|
| OBJ-01 | Diseñar vistas de la app móvil para reporte de escombros. | Mockups de todas las pantallas del ciudadano | 100 % de flujos diseñados |
| OBJ-02 | Diseñar vistas de la web para registro de recolección. | Mockups de todas las pantallas de operador y admin | 100 % de flujos diseñados |
| OBJ-03 | Simular el flujo de trazabilidad de un escombro (reporte → asignación → recolección). | Prototipo navegable (wireframes conectados) | 1 flujo completo demostrable |
| OBJ-04 | Proveer pantallas que apoyen el pitch de 1 minuto. | Imágenes o renders de las vistas principales | Disponibles para el pitch |
| OBJ-05 | Entregar dataset simulado (imágenes de exportación) para el equipo interdisciplinario. | Capturas de pantalla de tabla de exportación CSV/Excel | 1 vista de exportación simulada |

---

## 5. Alcance del prototipo (fase de planeación)

### 5.1 Dentro del alcance — Solo diseño de vistas

**App móvil — Vistas de reporte de escombros**
- Pantalla de bienvenida / splash.
- Pantalla de inicio de sesión (simulada, sin backend).
- Pantalla de registro de usuario (simulada, sin backend).
- Pantalla principal / menú del ciudadano.
- Pantalla "Nuevo reporte": cámara/galería (simulada), captura de GPS (simulada), selector de tipo de escombro, selector de volumen en m³, campo de descripción, botón "Enviar" (simulado).
- Pantalla de validación de zona: mensaje "Dentro de la zona" o "Fuera de cobertura".
- Pantalla "Mis reportes": lista con estados (Pendiente / En revisión / Programado / Recolectado / Rechazado / Expirado).
- Pantalla de detalle de reporte con estado y notificación simulada.
- Pantalla de edición de perfil.
- Pantalla de mapa simple de reportes propios (estático).

**Web — Vistas de registro de recolección**
- Pantalla de inicio de sesión con roles (operador / administrador).
- Pantalla de tablero de reportes: lista y mapa estático de la zona, filtros por estado y tipo.
- Pantalla de validación y asignación de brigada (solo administrador).
- Pantalla de formulario de registro de recolección: lugar (coordenadas), fecha/hora, tipo y volumen en m³, peso estimado, destino (catálogo), fotos antes y después (placeholders), operador responsable, vehículo.
- Pantalla de cambio de estado: "Programado", "Recolectado", "Rechazado" (con motivo).
- Pantalla de reapertura/anulación de recolección (solo administrador).
- Pantalla de historial de recolecciones.
- Pantalla de catálogo de destinos y puntos de acopio.
- Pantalla de gestión de usuarios y roles (solo administrador).
- Pantalla de exportación simulada: tabla de reportes y recolecciones con botón "Descargar CSV" (sin descarga real).
- Pantalla de métricas simples: tarjetas con totales (reportes, recolectados, volumen m³, % cobertura).

### 5.2 Fuera del alcance (no se desarrolla)

- Backend, servidor, API, base de datos.
- Autenticación real (login con credenciales válidas).
- Almacenamiento de fotos reales.
- Geolocalización GPS real.
- Envío de notificaciones push, SMS o email.
- Exportación real de archivos CSV/Excel (solo vista simulada).
- Modo offline real.
- Sincronización de datos.
- Cálculo de volumen, peso o métricas reales.
- Diseño en 3D del producto final (adoquines, bloques, mobiliario).
- Modelo Canvas, pitch, cotización, venta en línea.
- Cualquier lógica ejecutable.

---

## 6. Funcionalidades del prototipo (solo vistas ilustrativas)

### 6.1 App móvil — Vistas

| ID | Vista | Descripción (solo visual) |
|----|-------|---------------------------|
| APP-V01 | Bienvenida / Splash | Pantalla de entrada con logo del sistema. |
| APP-V02 | Inicio de sesión | Formulario simulado de correo/teléfono y contraseña. |
| APP-V03 | Registro de usuario | Formulario simulado de nombre, correo/teléfono y contraseña. |
| APP-V04 | Menú principal | Opciones: Nuevo reporte, Mis reportes, Perfil. |
| APP-V05 | Nuevo reporte | Captura de foto (placeholder), GPS (simulado), tipo de escombro, volumen m³, descripción, botón Enviar. |
| APP-V06 | Validación de zona | Mensaje de dentro/fuera de la zona determinada. |
| APP-V07 | Mis reportes | Lista de reportes con estados simulados. |
| APP-V08 | Detalle de reporte | Vista de detalle con cambio de estado simulado y notificación in-app. |
| APP-V09 | Edición de perfil | Formulario simulado de datos personales. |
| APP-V10 | Mapa de reportes propios | Mapa estático con marcadores de reportes. |

### 6.2 Web — Vistas

| ID | Vista | Descripción (solo visual) |
|----|-------|---------------------------|
| WEB-V01 | Inicio de sesión | Formulario simulado con selector de rol (operador / administrador). |
| WEB-V02 | Tablero de reportes | Lista y mapa estático de reportes, filtros por estado y tipo. |
| WEB-V03 | Asignación de brigada | Vista de administrador para asignar reporte a operador (estado Programado). |
| WEB-V04 | Registro de recolección | Formulario con lugar, fecha, volumen m³, destino, fotos antes/después, responsable, vehículo. |
| WEB-V05 | Cambio de estado | Botones simulados para Recolectado / Rechazado con motivo. |
| WEB-V06 | Reapertura de recolección | Vista solo administrador con justificación escrita. |
| WEB-V07 | Catálogo de destinos | Lista de lugares autorizados (relleno, planta, acopio). |
| WEB-V08 | Exportación simulada | Tabla de datos con botón "Descargar CSV" sin acción real. |
| WEB-V09 | Gestión de usuarios | Vista solo administrador para crear/editar/desactivar operadores. |
| WEB-V10 | Métricas simples | Tarjetas con totales simulados. |
| WEB-V11 | Historial de recolecciones | Listado con filtro por fecha y operador. |

---

## 7. Casos de uso del prototipo (flujo de pantallas)

### CU-01 — Ciudadano reporta escombro (vistas app)
- **Actor:** Ciudadano reportante.
- **Flujo de pantallas:** Bienvenida → Login → Menú principal → Nuevo reporte (foto, GPS, tipo, volumen m³, enviar) → Validación de zona → Mis reportes (estado Pendiente).
- **Resultado:** Se recorren las vistas que ilustran el reporte de un escombro.

### CU-02 — Administrador valida y asigna (vistas web)
- **Actor:** Administrador.
- **Flujo de pantallas:** Login (rol admin) → Tablero → Detalle de reporte → Validar → Asignar a operador → Estado Programado.
- **Resultado:** Se recorre la vista de validación y asignación.

### CU-03 — Operador registra recolección (vistas web)
- **Actor:** Operador de recolección.
- **Flujo de pantallas:** Login (rol operador) → Mis reportes asignados → Seleccionar reporte → Registro de recolección (lugar, fecha, volumen m³, destino, fotos antes/después) → Guardar → Estado Recolectado.
- **Resultado:** Se recorre la vista de formulario de recolección.

### CU-04 — Administrador rechaza reporte (vistas web)
- **Actor:** Administrador.
- **Flujo de pantallas:** Tablero → Seleccionar reporte → Marcar Rechazado con motivo → Notificación simulada al ciudadano.
- **Resultado:** Se recorre la vista de rechazo.

### CU-05 — Ciudadano corrige y reenvía (vistas app)
- **Actor:** Ciudadano reportante.
- **Flujo de pantallas:** Notificación in-app simulada → Mis reportes → Seleccionar Rechazado → Corregir campos → Reenviar → Estado Pendiente.
- **Resultado:** Se recorre la vista de corrección y reenvío.

### CU-06 — Exportación simulada de datos (vistas web)
- **Actor:** Administrador.
- **Flujo de pantallas:** Pantalla de exportación → Seleccionar rango de fechas → Ver tabla de datos → Botón Descargar CSV (sin acción real).
- **Resultado:** Se muestra la vista de exportación simulada para uso del equipo interdisciplinario.

---

## 8. Reglas de negocio ilustrativas (solo para el diseño de vistas)

| ID | Regla | Cómo se muestra en las vistas |
|----|-------|------------------------------|
| RB-01 | Zona de cobertura | Vista muestra mensaje "Fuera de cobertura" si se simula GPS fuera del polígono. |
| RB-02 | Campos obligatorios | Vista muestra mensajes de error si falta foto, tipo o volumen m³ al pulsar Enviar. |
| RB-03 | Unidad de medida m³ | Todas las vistas de volumen usan m³ como unidad. |
| RB-04 | Ciclo de vida del reporte | Las vistas muestran los estados: Pendiente → En revisión → Programado → Recolectado / Rechazado / Expirado. |
| RB-05 | Responsabilidad de recolección | Solo la vista de operador con reporte asignado muestra el botón de registrar recolección. |
| RB-06 | Volumen recogido vs. reportado | Vista muestra validación simulada si el volumen recogido excede el reportado. |
| RB-07 | Trazabilidad | Las vistas muestran usuario/operador asociado y timestamps simulados. |
| RB-08 | Duplicados | Vista de administrador alerta posible duplicado (mismo punto, misma hora). |
| RB-09 | Caducidad de reporte pendiente | Vista muestra estado "Expirado" para reportes antiguos sin validar. |
| RB-10 | Acceso por rol | Las vistas de admin (asignar, rechazar, exportar, gestionar usuarios) no aparecen para el rol operador. |
| RB-11 | Residuos peligrosos | Vista muestra validación obligatoria de admin antes de asignar si el tipo es "peligroso". |
| RB-12 | Validación de foto | Vista muestra mensaje si falta metadata de GPS/timestamp en la foto simulada. |
| RB-13 | Modo offline | Vista muestra indicador "Sin conexión - guardando localmente". |
| RB-14 | Reapertura de recolección | Vista solo admin permite reabrir con justificación escrita. |

---

## 9. Criterios de aceptación a nivel de vistas (UI/UX)

### 9.1 App móvil

**CA-APP-V01 — Pantallas completas**
- Se entregan mockups de todas las pantallas del ciudadano: bienvenida, login, registro, menú, nuevo reporte, validación de zona, mis reportes, detalle, perfil, mapa.

**CA-APP-V02 — Nuevo reporte**
- La vista "Nuevo reporte" incluye: área de foto (placeholder), indicador de GPS, selector de tipo de escombro, selector de volumen en m³, campo de descripción y botón Enviar.

**CA-APP-V03 — Estados de reporte**
- La vista "Mis reportes" muestra al menos los estados: Pendiente, En revisión, Programado, Recolectado, Rechazado, Expirado.

**CA-APP-V04 — Notificación in-app simulada**
- La vista de detalle de reporte muestra un aviso de cambio de estado (ej. "Tu reporte ha sido recolectado").

### 9.2 Web

**CA-WEB-V01 — Pantallas por rol**
- Se entregan mockups diferenciados para operador y administrador. El operador no ve pantallas de admin (asignación masiva, exportación, gestión de usuarios).

**CA-WEB-V02 — Tablero**
- La vista del tablero incluye lista de reportes y mapa estático de la zona con filtros por estado y tipo.

**CA-WEB-V03 — Formulario de recolección**
- La vista de registro de recolección incluye: lugar/coordenadas, fecha/hora, volumen m³, destino, placeholders de fotos antes/después, operador y vehículo.

**CA-WEB-V04 — Exportación simulada**
- La vista de exportación muestra una tabla con columnas: reporte ID, fecha, tipo, volumen m³, ubicación, estado, operador, fecha recolección, destino, volumen recogido m³, y un botón "Descargar CSV" sin acción real.

**CA-WEB-V05 — Métricas**
- La vista de métricas muestra tarjetas con totales simulados: total reportes, total recolectados, volumen m³ acumulado, % de cobertura.

---

## 10. Métricas de éxito del prototipo (entrega de vistas)

| KPI | Definición | Meta MVP |
|-----|------------|----------|
| Pantallas diseñadas (app) | # de vistas de app móvil entregadas | Todas las APP-V01 a V10 |
| Pantallas diseñadas (web) | # de vistas de web entregadas | Todas las WEB-V01 a V11 |
| Flujo navegable | Existe un prototipo conectado que recorre CU-01 a CU-06 | 1 flujo completo demostrable |
| Imágenes para el pitch | # de capturas/renders de vistas principales listas para el pitch | ≥ 5 imágenes |
| Vista de exportación simulada | 1 pantalla que muestra tabla de datos con botón CSV sin acción real | Disponible |

---

## 11. Suposiciones y restricciones (prototipo de vistas)

- Se asume que el comité del torneo define y entrega el polígono de la zona piloto antes de finalizar los mockups.
- Las vistas (wireframes) se maquetan directamente **desde cero en HTML5 + CSS3 nativo con TypeScript**; no se usa herramienta externa de diseño (sin Figma, Sketch ni similares). Entregable: vistas estáticas y/o prototipo navegable en navegador, sin código backend.
- Restricción de rol: este documento cubre únicamente el **diseño de vistas** de las dos plataformas. No hay desarrollo de software funcional, backend, base de datos ni lógica ejecutable.
- El prototipo es solo para soporte visual del pitch y del Modelo Canvas del torneo; no es un sistema operativo.

---

## 12. Decisiones abiertas (para validar con el equipo)

1. [x] **Resuelto:** las vistas se maquetan directamente desde cero en HTML5 + CSS3 nativo + TypeScript (wireframes en código, sin herramienta de diseño externa).
2. [ ] Confirmar zona piloto y sus coordenadas/polígono con el comité o alcaldía.
3. [ ] Definir catálogo cerrado de tipos de escombro y cuáles se consideran "peligrosos" (con Ingeniería Ambiental y Civil).
4. [ ] Definir catálogo de destinos autorizados (relleno sanitario, planta de transformación, acopio temporal).
5. [ ] Definir si se entrega solo imágenes estáticas o también un prototipo navegable (clickable prototype).
6. [ ] Definir formato de entrega de las vistas (imágenes/snapshots del prototipo HTML desplegado, enlace a GitHub Pages, etc.).

---

## 13. Vínculo con el torneo (función de Ingeniería de Sistemas)

| Entregable torneo | Cómo apoya este PRD desde Ingeniería de Sistemas |
|-------------------|--------------------------------------------------|
| Sistema de registro de escombros | Este PRD define las **vistas** de las dos plataformas que Ingeniería de Sistemas presenta como soporte tecnológico: app móvil de reporte y web de registro de recolección. |
| Apoyo tecnológico al equipo | Las vistas de exportación simulada y los flujos de reporte/recolección son el insumo visual que Ingeniería Civil, Industrial, Ambiental y Arquitectura usan para sus propios entregables (Canvas, diseño 3D, costo, impacto ambiental). |
| Criterio "Innovación" (30 %) | Aporte tecnológico visual: ilustra cómo se estandarizaría la captura de datos de escombros y su trazabilidad digital, aunque sea solo en vistas. |
| Pitch de 1 minuto | Las capturas de pantalla de las vistas principales sirven como diapositiva o soporte visual del pitch. |

---

*Documento en fase de planeación. Rol: Ingeniería de Sistemas. Alcance: prototipado de vistas únicamente (sin backend, sin base de datos, sin lógica funcional). Una vez aprobado por el equipo interdisciplinario, se pasa al diseño de las interfaces y entrega de mockups.*

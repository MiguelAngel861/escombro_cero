# DESIGN.md — Sistema de diseño Escombro 0 (Móvil & Web)

> **Guía maestra y canónica de diseño UI/UX para el prototipo Escombro 0.**  
> Define los estándares visuales, tokens de estilo, catálogo de componentes BEM, patrones de interacción, reglas de copy y plantillas completas para mantener un **estilo 100% coherente e idéntico** entre la **aplicación móvil** (`movil/`), la **plataforma web de administración y operación** (`web/`) y cualquier futura página o módulo del sistema.  
> 
> **Barra de calidad:** Kit `design-taste-frontend` v2.5.0 (anti-slop, neutralidad 90-95%, escala tipográfica sobria, micro-interacciones suaves, cero librerías pesadas externas).  
> **Compatibilidad de datos:** Alineado punto a punto con `SPEC.md` (§6 Modelos y FSM) y `PRD.md`. En caso de conflicto de datos, gana `SPEC.md`; en presentación visual, diseño y experiencia de usuario, manda este documento.

---

## 1. Identidad del sistema (Decisiones cerradas)

Toda pantalla —móvil o web— debe adherirse estrictamente a estas decisiones fundamentales pactadas en los requerimientos y sesiones de grilling (ADR-11 a ADR-17):

| Parámetro | Valor acordado | Justificación técnica y kit |
|---|---|---|
| **Tipo de producto** | `software` | Declarado en `<html data-type="software">`, `<meta name="page-type" content="software">` y `<meta name="site-kind" content="software">`. |
| **Modo de color** | **Modo claro único** | Prohibido modo oscuro a medias. La interfaz de gestión cívica requiere legibilidad óptima en exteriores (sol) y sobriedad municipal en oficina. |
| **Paleta institucional** | Verde natural `#2e7d32` / `#1b5e20` | Color primario de acción y acento. Superficie general `#f6f8f6` (gris-salvia sutil) y tarjetas blancas puras `#ffffff`. |
| **Prohibición de color** | **Cero violeta o lavanda** | Regla 6 del kit `design-taste-frontend`. El estado FSM `programado` (que el borrador inicial ponía en violeta) se fija en **Teal `#00838f`** (ADR-14/15). |
| **Tipografía** | Deal `host` (Host Grotesk + JetBrains Mono) | Fuentes variables auto-hospedadas en WOFF2 local (`assets/*.woff2`, ~60 KB). Cero llamadas a Google Fonts o CDNs externas (NFR-S01). |
| **Escala de radios** | Deal `soft` (8px / 12px / 20px) | Tarjetas y botones a 12px, controles pequeños a 8px, modales y hero-cards a 20px, badges y píldoras a 999px. |
| **Imágenes e iconos** | SVG locales propios + placeholders temáticos | Sin imágenes genéricas de bancos no relacionadas. Iconos tipográficos limpios o SVG inline de 20-22 px. El logo `assets/logo.svg` es la única marca. |
| **Regla 9 (Privacidad y demo)** | Nombres de calle y distrito sin numeración real | Sin números de casa reales, sin códigos postales inventados, correos `@correo.com`, teléfonos demo `+51 999 000 111`. Sufijo `(demo)` en acciones simuladas. |

---

## 2. Tokens de diseño (Fuente única: `styles/tokens.css`)

Todas las pantallas (móvil y web) cargan `styles/base.css`, el cual importa de manera unificada `tokens.css` y `components.css`. **Nunca se debe escribir un valor hexadecimal o espaciado arbitrario en línea.**

### 2.1 Colores base y superficies

```css
:root {
  /* Marca e interacción principal */
  --color-primary:      #2e7d32;   /* Verde medio: foco, enlaces, bordes activos, pines mapa */
  --color-primary-dark: #1b5e20;   /* Verde oscuro: botón primario, textos de acento, toasts */

  /* Neutros y legibilidad (90-95% de la pantalla) */
  --color-bg:           #f6f8f6;   /* Fondo general de la aplicación y páginas */
  --color-surface:      #ffffff;   /* Tarjetas, modales, barras de navegación, inputs */
  --color-text:         #1c1b1a;   /* Texto principal (near-black cálido, contraste > 10:1) */
  --color-text-muted:   #6b6f6b;   /* Texto secundario, etiquetas, metadatos (contraste > 4.5:1) */

  /* Alertas genéricas */
  --color-danger:       #c62828;   /* Errores de validación, residuo peligroso */
  --color-warning:      #f9a825;   /* Advertencias, duplicados, fuera de zona */
}
```

### 2.2 Tokens para la FSM de estados (Alineación exacta con `SPEC.md` §6.5)

El pin del mapa, el badge de estado, las filas de tabla y los chips de filtro comparten la **misma tríada de tokens** (`sólido`, `fondo`, `tinta`). Garantizan contraste accesible WCAG AA:

| Estado (FSM) | Token sólido | Token fondo (`-bg`) | Token texto (`-ink`) | Uso en la UI |
|---|---|---|---|---|
| `pendiente` | `#546e7a` | `#e3eaed` | `#37474f` | Reporte recibido, sin revisión técnica |
| `en_revision` | `#1565c0` | `#dce9fa` | `#0d47a1` | Supervisor validando datos / cobertura |
| `programado` | `#00838f` *(teal)* | `#d8f0f2` | `#006064` | Operador asignado y fecha programada |
| `recolectado` | `#2e7d32` | `#ddedde` | `#1b5e20` | Escombro retirado y enviado a destino |
| `rechazado` | `#c62828` | `#fbe3e3` | `#b71c1c` | Fuera de zona, sin foto válida o duplicado |
| `expirado` | `#b26a00` | `#fbedd2` | `#7a4b00` | Plazo de 30 días sin atención municipal |
| `reabierto` | `#795548` | `#ece2de` | `#5d4037` | Recolección revocada por admin (solo Web) |

> **Regla de nomenclatura BEM:** En los datos de TypeScript/JSON se utiliza guión bajo (`en_revision`), pero en las clases CSS se usa siempre guión medio: `.badge--en-revision`. Conversión segura: `estado.replace("_", "-")`.

### 2.3 Tipografía (Deal `host`)

```css
:root {
  --font-sans: "Host Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Escala tipográfica */
  --fs-xs:   0.75rem;   /* 12px — Metadatos, etiquetas mono, status bar */
  --fs-sm:   0.875rem;  /* 14px — Texto secundario, campos de tabla, botones secundarios */
  --fs-md:   1rem;      /* 16px — Texto de lectura principal, inputs, botones principales */
  --fs-lg:   1.25rem;   /* 20px — Títulos de sección, encabezados de tarjeta, modales */
  --fs-xl:   1.5rem;    /* 24px — Títulos de página (h1 móvil), cifras de métricas */
  --fs-hero: clamp(2.25rem, 5vw, 4.5rem); /* Títulos de impacto en marketing/landing */

  --track-hero: -0.04em; /* Tracking cerrado para titulares grandes */
}
```

* **Regla de oro tipográfica:** La fuente mono (`--font-mono`) se usa **únicamente** para datos estructurados que el usuario escanea rápidamente: IDs de reporte (`R-001`), coordenadas (`GPS ✓`), timestamps (`05/11/2026 · 09:12`), volumen/peso (`2.5 m³`, `450 kg`) y valores numéricos en tablas. El resto siempre es sans-serif.

### 2.4 Espaciado, radios y sombras

```css
:root {
  /* Escala de espaciado modular */
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-6: 24px;  --sp-8: 32px;  --sp-10: 48px;

  /* Radios de curvatura — Deal soft */
  --radius-sm:  8px;   /* Chips, badges pequeños, inputs, controles */
  --radius-md:  12px;  /* Tarjetas, botones principales, contenedores */
  --radius-lg:  20px;  /* Modales, hero banners, esquinas de shell */
  --radius-pill: 999px; /* Badges y chips circulares */

  /* Sombras sutiles (sin elevaciones exageradas de IA) */
  --shadow-card:  0 1px 3px rgb(0 0 0 / 0.08);
  --shadow-hover: 0 4px 12px rgb(0 0 0 / 0.12);
  --shadow-modal: 0 20px 48px rgb(0 0 0 / 0.20);
}
```

### 2.5 Dimensiones del Shell Web y Móvil

```css
:root {
  --sidebar-w:           260px;   /* Ancho de sidebar web desplegado */
  --sidebar-w-collapsed: 64px;    /* Ancho de sidebar web colapsado (iconos) */
  --topbar-h:            64px;    /* Altura estándar de la topbar web */
  --bottom-nav-h:        64px;    /* Altura de la barra de navegación móvil */
  --web-wrap-max:        1200px;  /* Ancho máximo de páginas administrativas */
  --mobile-frame-w:      390px;   /* Ancho de viewport base para pruebas móviles */
  --mobile-frame-h:      844px;   /* Alto de viewport base para pruebas móviles */
}
```

---

## 3. Catálogo de componentes unificados (BEM)

Todos los componentes son agnósticos y funcionan de manera idéntica en la web y en la aplicación móvil. La hoja de estilos compartida es `components.css`.

### 3.1 Botones (`.btn`)

El botón representa una acción concreta. La regla de redacción exige: **Verbo en infinitivo + objeto directo** ("Enviar reporte", "Guardar cambios", "Asignar operador", "Iniciar sesión").

```html
<!-- Primario (Acción principal, máx 1 por bloque) -->
<button class="btn btn--primary">Enviar reporte</button>

<!-- Superficie / Secundario (Acción complementaria o cancelación) -->
<button class="btn btn--surface">Cancelar</button>

<!-- Peligro (Rechazo o eliminación con confirmación) -->
<button class="btn btn--danger">Rechazar reporte</button>

<!-- Ancho completo (Utilizado en móvil y formularios) -->
<button class="btn btn--primary btn--full">Guardar asignación</button>
```

* **Micro-interacción:**
  * `:hover` → `transform: translateY(-2px);` (eleva suavemente 2px).
  * `:active` → `transform: scale(0.97);` (retroalimentación física de pulsación).
  * `:focus-visible` → Contorno de 2px sólido color `--color-primary` con separación de 3px.

### 3.2 Badges de estado (`.badge`)

Los badges representan el estado de un reporte en listas, tablas y vistas de detalle. Siempre incluyen el punto indicador (`i.pin`) para accesibilidad visual cromática.

```html
<span class="badge badge--pendiente"><i class="pin"></i>Pendiente</span>
<span class="badge badge--en-revision"><i class="pin"></i>En revisión</span>
<span class="badge badge--programado"><i class="pin"></i>Programado</span>
<span class="badge badge--recolectado"><i class="pin"></i>Recolectado</span>
<span class="badge badge--rechazado"><i class="pin"></i>Rechazado</span>
<span class="badge badge--expirado"><i class="pin"></i>Expirado</span>
<span class="badge badge--reabierto"><i class="pin"></i>Reabierto</span>

<!-- Badges de alerta operativa (Web Tablero / Filtros especiales) -->
<span class="badge badge--alert-danger"><i class="pin"></i>Residuo peligroso</span>
<span class="badge badge--alert-warning"><i class="pin"></i>Posible duplicado</span>
```

### 3.3 Tarjetas de contenido (`.card` y `.card--tapp`)

Base blanca con radio de 12px y sombra sutil. La variante `.card--tapp` se utiliza cuando la tarjeta es un enlace o botón navegable.

```html
<!-- Tarjeta interactiva de reporte (Listados móvil y web) -->
<a class="card card--tapp" href="detalle-reporte.html?id=R-001">
  <div class="card-row">
    <span class="card-id">R-001</span>
    <span class="badge badge--pendiente"><i class="pin"></i>Pendiente</span>
  </div>
  <div class="card-title">Escombro de demolición</div>
  <div class="card-meta">
    <span>Volumen: 2.5 m³</span>
    <span>Distrito 1 · Calle demo</span>
    <span class="meta-date">05/11/2026 · 09:12</span>
  </div>
</a>
```

### 3.4 Tarjetas de métrica y KPI (`.metric-card`)

Utilizadas en el Menú Principal móvil (`APP-V04`) y en el Módulo de Métricas web (`WEB-V10`).

```html
<div class="metric-card">
  <div class="metric-val">128 m³</div>
  <div class="metric-label">Volumen total recolectado</div>
</div>
```

### 3.5 Chips de filtro (`.chips` y `.chip`)

Barra de desplazamiento horizontal sin barra visible (`scrollbar-width: none`).

```html
<div class="chips" role="tablist" aria-label="Filtrar por estado">
  <button class="chip chip--on" role="tab" aria-selected="true">Todos</button>
  <button class="chip" role="tab" aria-selected="false">Pendientes</button>
  <button class="chip" role="tab" aria-selected="false">Programados</button>
  <button class="chip" role="tab" aria-selected="false">Recolectados</button>
</div>
```

### 3.6 Campos de formulario (`.field`)

Campos con altura mínima de 48px para cumplimiento de objetivo táctil.

```html
<div class="field">
  <label for="tipo-escombro">Tipo de escombro</label>
  <select class="field-input" id="tipo-escombro" name="tipo">
    <option value="demolicion">Demolición (concreto, ladrillo)</option>
    <option value="restos_obra">Restos de obra (cerámica, yeso)</option>
    <option value="mezclado">Mezclado (tierra y cascote)</option>
  </select>
</div>

<!-- Campo en estado de error -->
<div class="field field--error">
  <label for="volumen">Volumen estimado (m³)</label>
  <input class="field-input" id="volumen" type="number" step="0.1" value="-2" aria-invalid="true" aria-describedby="err-vol">
  <span class="field-error" id="err-vol">El volumen debe ser un número positivo mayor a 0</span>
</div>
```

### 3.7 Contenedor de captura fotográfica y GPS (`.img-capture`)

Simulación de toma de fotografía con cámara y geolocalización fija:

```html
<!-- Estado vacío para captura -->
<button class="img-capture" type="button" aria-label="Tomar fotografía del escombro">
  <span class="img-icon" aria-hidden="true">📷</span>
  <span>Toca para tomar foto del escombro</span>
</button>

<!-- Estado lleno con imagen y telemetría GPS superpuesta -->
<div class="img-capture img-capture--filled">
  <img src="assets/fotos/tipo-demolicion.svg" alt="Fotografía del escombro reportado">
  <div class="meta-gps" aria-label="Telemetría GPS verificada">
    <span>GPS ✓</span>
    <span>12.1324, -86.2504</span>
    <span>09:12 ✓</span>
  </div>
</div>
```

### 3.8 Notificaciones Toast (`.toast`)

Notificaciones emergentes inferiores no bloqueantes. Desaparecen automáticamente tras 2.2 segundos.

```html
<div class="toast" id="toast" role="status" aria-live="polite">
  Reporte R-010 enviado exitosamente
</div>
<!-- Se activa añadiendo la clase `.toast--on` mediante JS -->
```

### 3.9 Línea de tiempo de auditoría (`.timeline`)

Visualización de la trazabilidad de un escombro (desde reporte ciudadano hasta su recolección o rechazo):

```html
<div class="timeline" aria-label="Historial de estados">
  <div class="timeline-item">
    <span class="timeline-dot" aria-hidden="true"></span>
    <span class="timeline-time">05/11/2026 · 09:12</span>
    <span class="timeline-desc">Reporte creado por Ciudadano</span>
  </div>
  <div class="timeline-item">
    <span class="timeline-dot" aria-hidden="true"></span>
    <span class="timeline-time">05/11/2026 · 14:30</span>
    <span class="timeline-desc">Validado por Supervisor (Admin)</span>
  </div>
</div>
```

---

## 4. Shell y estructura: Aplicación móvil

La aplicación móvil opera con un comportamiento adaptativo dual:
1. **En dispositivos móviles reales (viewport ≤ 430px):** La interfaz ocupa el 100% de la ventana (`100dvh`), sin bordes ni márgenes artificiales.
2. **En pantallas de escritorio / demostraciones (> 430px):** Se renderiza un **marco físico de dispositivo simulado** (390×844 px) con esquinas redondeadas (44px) y sombra proyectada.

### Anatomía de una pantalla móvil estándar:

```html
<!DOCTYPE html>
<html lang="es" data-type="software" data-radius="soft">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="page-type" content="software">
  <meta name="site-kind" content="software">
  <link rel="icon" href="assets/logo.svg" type="image/svg+xml">
  <title>Escombro 0 — APP-V04 Menú principal</title>
  <link rel="stylesheet" href="styles/base.css">
  <script type="module" src="scripts/menu.js"></script>
</head>
<body>
  <main class="screen">
    <!-- Contenido desplazable -->
    <section class="page" aria-label="Contenido principal">
      <!-- Encabezado de vista -->
      <div class="page-head">
        <h1>Mis reportes</h1>
        <p class="sub">Historial de escombros reportados en tu zona</p>
      </div>

      <!-- Bloque de contenido -->
      <div class="content">
        <!-- Tarjetas, formularios o listados -->
      </div>
    </section>

    <!-- Barra de navegación inferior (Máximo 5 ranuras, fija al fondo) -->
    <nav class="bottom-nav" aria-label="Navegación principal">
      <a href="menu.html" class="nav--on" aria-current="page">
        <span class="nav-ico">⌂</span>
        <span>Inicio</span>
      </a>
      <a href="nuevo-reporte.html">
        <span class="nav-ico">＋</span>
        <span>Nuevo</span>
      </a>
      <a href="mis-reportes.html">
        <span class="nav-ico">▤</span>
        <span>Reportes</span>
      </a>
      <a href="mapa.html">
        <span class="nav-ico">◎</span>
        <span>Mapa</span>
      </a>
      <a href="perfil.html">
        <span class="nav-ico">👤</span>
        <span>Perfil</span>
      </a>
    </nav>
  </main>
</body>
</html>
```

---

## 5. Shell y estructura: Plataforma Web

La plataforma web de administración y operación (`web/`) comparte todos los tokens y componentes con la app móvil, pero utiliza un **layout de escritorio productivo**:

* **Topbar superior fija (64px):** Logo, nombre del sistema, breadcrumbs de navegación, selector/indicador de rol (`Operador` o `Administrador`) y botón de cerrar sesión.
* **Sidebar lateral izquierdo (260px colapsable a 64px):** Navegación clasificada por roles:
  * Rol `operador`: Tablero (con filtro automático "mis asignados"), Registro de recolección (`WEB-V04`), Historial de rutas.
  * Rol `admin`: Tablero general, Asignación de brigadas, Catálogo de destinos, Exportación CSV, Métricas y Gestión de usuarios.
* **Área principal de trabajo:** Contenedor central fluido con ancho máximo de `1200px` para listados y formularios, o diseño 100% viewport dividido para el Tablero con mapa.

### 5.1 Anatomía de una pantalla web estándar:

```html
<!DOCTYPE html>
<html lang="es" data-type="software" data-radius="soft">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="page-type" content="software">
  <meta name="site-kind" content="software">
  <link rel="icon" href="../movil/src/assets/logo.svg" type="image/svg+xml">
  <title>Escombro 0 Web — Tablero de control</title>
  <link rel="stylesheet" href="../movil/src/styles/base.css">
  <script type="module" src="scripts/tablero.js"></script>
</head>
<body>
  <div class="web-shell">
    <!-- Sidebar lateral -->
    <aside class="sidebar" aria-label="Menú lateral">
      <div class="sidebar-top">
        <div class="topbar-brand" style="padding: var(--sp-4);">
          <span style="color: var(--color-primary); font-size: 24px;">●</span>
          <span>Escombro 0 <strong>Web</strong></span>
        </div>

        <nav class="sidebar-nav">
          <a href="tablero.html" class="sidebar-item is-active" aria-current="page">
            <span class="sidebar-ico">▤</span>
            <span>Tablero general</span>
          </a>
          <a href="destinos.html" class="sidebar-item" data-role="admin">
            <span class="sidebar-ico">🏢</span>
            <span>Puntos de acopio</span>
          </a>
          <a href="metricas.html" class="sidebar-item" data-role="admin">
            <span class="sidebar-ico">📊</span>
            <span>Métricas de impacto</span>
          </a>
          <a href="exportacion.html" class="sidebar-item" data-role="admin">
            <span class="sidebar-ico">⬇</span>
            <span>Exportar CSV (demo)</span>
          </a>
          <a href="usuarios.html" class="sidebar-item" data-role="admin">
            <span class="sidebar-ico">👥</span>
            <span>Usuarios y brigadas</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-bottom" style="padding: var(--sp-4);">
        <button class="btn btn--surface btn--full" id="btn-logout">Cerrar sesión</button>
      </div>
    </aside>

    <!-- Área de contenido con Topbar -->
    <div class="web-main">
      <header class="topbar">
        <div class="breadcrumb">
          <a href="tablero.html">Inicio</a>
          <span class="sep">›</span>
          <span>Tablero de operaciones</span>
        </div>

        <div class="topbar-user">
          <span class="badge badge--programado" id="user-role-badge">Supervisor (Admin)</span>
          <span id="user-name">Carlos Martínez</span>
        </div>
      </header>

      <main class="web-content" style="padding: var(--sp-6); max-width: var(--web-wrap-max); margin: 0 auto;">
        <!-- Contenido de la vista web -->
      </main>
    </div>
  </div>
</body>
</html>
```

### 5.2 Vista dividida 60/40 (Tablero Web `WEB-V02`)

Para la vista operativa principal, se utiliza un split-view que posiciona la lista de reportes y filtros a la izquierda (60%) y el mapa SVG interactivo a la derecha (40%):

```html
<div class="split-view">
  <!-- Panel de lista y filtros (60%) -->
  <section class="split-list" aria-label="Lista de reportes">
    <div class="chips" role="tablist">
      <button class="chip chip--on">Todos (9)</button>
      <button class="chip">Pendientes (3)</button>
      <button class="chip">Programados (2)</button>
    </div>

    <div class="report-cards-stack">
      <!-- Tarjetas de reporte -->
    </div>
  </section>

  <!-- Panel de mapa interactivo (40%) -->
  <section class="split-map" aria-label="Mapa de la zona piloto">
    <svg class="map-canvas" viewBox="0 0 600 800">
      <!-- Mapa SVG de la zona piloto con pines R-### -->
    </svg>
  </section>
</div>
```
* **Responsividad:** En pantallas de menos de `1280px`, el contenedor `.split-view` colapsa automáticamente a una sola columna vertical (primero la lista de reportes con scroll, y debajo el mapa).

### 5.3 Tablas de datos web (`.table` y `.table-wrap`)

Para vistas como `WEB-V08` (Exportación simulada), `WEB-V09` (Usuarios) y `WEB-V11` (Historial):

```html
<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th>Código</th>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Volumen</th>
        <th>Dirección</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="table-id">R-001</td>
        <td class="table-date">05/11/2026 · 09:12</td>
        <td>Demolición</td>
        <td>2.5 m³</td>
        <td>Distrito 1 · Calle demo</td>
        <td><span class="badge badge--pendiente"><i class="pin"></i>Pendiente</span></td>
        <td><a class="btn btn--surface" href="detalle-reporte.html?id=R-001">Ver detalle</a></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.4 Modales de acción supervisada (Web `WEB-V03`, `WEB-V05`, `WEB-V06`)

Las acciones críticas de cambio de estado se resuelven mediante modales accesibles con fondo oscurecido (`.modal-backdrop`):

```html
<div class="modal-backdrop" id="modal-asignar" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">Asignar brigada de recolección</h2>
      <button class="btn btn--surface" id="btn-close-modal" aria-label="Cerrar modal">✕</button>
    </div>

    <div class="modal-body">
      <p>Selecciona el operador responsable y la fecha estimada de retiro para el reporte <strong>R-002</strong>:</p>

      <div class="field">
        <label for="select-operador">Operador asignado</label>
        <select class="field-input" id="select-operador">
          <option value="OP-01">Juan Pérez — Brigada Liviana (Camión 3T)</option>
          <option value="OP-02">María López — Brigada Pesada (Volquete 8T)</option>
        </select>
      </div>

      <div class="field">
        <label for="fecha-estimada">Fecha estimada</label>
        <input class="field-input" id="fecha-estimada" type="date" value="2026-11-08">
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn--surface" id="modal-cancel">Cancelar</button>
      <button class="btn btn--primary" id="modal-confirm">Confirmar y programar</button>
    </div>
  </div>
</div>
```

---

## 6. Capa de movimiento y micro-interacciones (Regla 5 del kit)

Las animaciones deben ser funcionales, casi imperceptibles, sin entorpecer el trabajo operativo:

| Elemento interactivo | Evento | Transformación / Efecto | Tiempo y curva |
|---|---|---|---|
| Botón primario / secundario | Hover | `translateY(-2px)` + realce tonal de fondo | 150 ms ease |
| Botón primario / secundario | Click / Active | `transform: scale(0.97)` | 120 ms |
| Tarjeta interactiva (`.card--tapp`) | Hover | `translateY(-2px)` + sombra `0 4px 12px rgba(0,0,0,0.12)` | 150 ms ease |
| Chip de filtro | Hover | Borde primario + texto verde oscuro | 150 ms ease |
| Notificación Toast | Entrada | `opacity: 1; transform: translateY(0);` (desde +8px) | 200 ms ease |
| Diálogo Modal | Apertura | Fade de fondo + `scale(0.96) → scale(1.0)` | 150 ms ease-out |
| Loader de espera | Constante | `animation: loader-breathe 3s ease-in-out infinite` | 3.0 s (permitido 2.5–4 s) |

### Regla estricta de reducción de movimiento:
Todo archivo CSS contiene obligatoriamente la directiva de accesibilidad que apaga animaciones si el usuario lo configuró en su sistema operativo:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Reglas de datos y consistencia transversal

1. **Catálogos estrictos:** Las vistas nunca escriben opciones a mano; leen de los arrays tipados exportados por `data.ts`:
   * `TIPOS_ESCOMBRO`: `demolicion`, `restos_obra`, `mezclado`, `peligroso`.
   * `ESTADOS_REPORTE`: `pendiente`, `en_revision`, `programado`, `recolectado`, `rechazado`, `expirado`, `reabierto`.
   * `DESTINOS_ACOPIO`: `DE-01` (Escombrera Municipal), `DE-02` (Planta de Trituración), `DE-03` (Relleno Controlado).
2. **Formato uniforme de fechas y IDs:**
   * Fechas: `DD/MM/AAAA · HH:MM` (ej. `05/11/2026 · 09:12`), tipografía mono.
   * IDs de reporte: `R-###` (ej. `R-001`), tipografía mono.
   * IDs de operador: `OP-##` (ej. `OP-01`).
3. **Persistencia aislada en demo:**
   * Todas las claves de `localStorage` llevan el prefijo `cnsv1:` (ej. `cnsv1:reportes`, `cnsv1:sesion`).
   * La función `ensureSeed()` restaura de forma segura el dataset mock de 9 reportes (`R-001` a `R-009`) si no existen datos previos.
4. **Protección de rutas (Guard de sesión):**
   * Toda vista protegida ejecuta al inicio del script `store.laSesion()`. Si no hay sesión válida, redirige de inmediato a `login.html`.

---

## 8. Guía de verificación paso a paso con `playwright-cli`

Para verificar la fidelidad de diseño, ausencia de errores en consola y responsividad de cualquier página nueva (móvil o web), se utiliza la herramienta oficial `playwright-cli`:

### 8.1 Iniciar servidores de desarrollo locales

```bash
# Terminal de soporte (si no están activos):
python3 -m http.server 4173 --directory movil/dist --bind 127.0.0.1 &
python3 -m http.server 4174 --directory movil/src --bind 127.0.0.1 &
```

### 8.2 Iniciar sesión de demo en Playwright

```bash
# Inyectar sesión de Ciudadano para vistas móviles protegidas:
playwright-cli open http://127.0.0.1:4173/login.html
playwright-cli localstorage-set "cnsv1:sesion" '{"rol":"ciudadano","correo":"ana@correo.com"}'

# O inyectar sesión de Administrador para vistas web:
playwright-cli localstorage-set "cnsv1:sesion" '{"rol":"admin","correo":"supervisor@alcaldia.gob.ni"}'
```

### 8.3 Verificación responsiva y visual

```bash
# 1. Probar en tamaño móvil exacto (Deal 390x844):
playwright-cli resize 390 844
playwright-cli goto http://127.0.0.1:4173/menu.html
playwright-cli screenshot

# 2. Probar en tablet (768x1024):
playwright-cli resize 768 1024
playwright-cli screenshot

# 3. Probar en escritorio para la plataforma Web (1280x800 y 1440x900):
playwright-cli resize 1280 800
playwright-cli goto http://127.0.0.1:4173/paleta.html
playwright-cli screenshot
```

### 8.4 Comprobación de integridad de consola y accesibilidad

```bash
# Verificar que NO existan errores JS ni recursos 404:
playwright-cli console

# Inspeccionar árbol semántico y atributos accesibles:
playwright-cli snapshot

# Probar reducción de movimiento emulada:
playwright-cli set-reduced-motion reduce
```

---

## 9. Checklist de calidad: Cómo replicar o crear una nueva página

Antes de dar por completada una nueva pantalla del sistema, verifique los 8 puntos del checklist:

- [ ] **1. Head semántico:** Incluye `lang="es"`, `<meta name="page-type" content="software">`, `<meta name="site-kind" content="software">` y favicon `logo.svg`.
- [ ] **2. Estilos canónicos:** Solo enlaza a `styles/base.css` (el cual compila `tokens.css` y `components.css`). Sin hojas de estilo externas ni CDNs.
- [ ] **3. Guard de autenticación:** Verifica sesión al inicio mediante `store.laSesion()`.
- [ ] **4. Datos dinámicos:** Consume exclusivamente catálogos de `data.ts` y persistencia `cnsv1:*`. Cero estados escritos a mano en el HTML.
- [ ] **5. Copywriting verificado:** Sustantivos en títulos, botones "Verbo + Objeto", sufijo `(demo)` en simulaciones y sin direcciones reales inventadas.
- [ ] **6. Micro-movimientos BEM:** Utiliza las clases `.btn`, `.card--tapp`, `.badge--<estado>` con sus animaciones estándar.
- [ ] **7. Compilación limpia:** El comando `cd movil && pnpm run build` compila CSS con PostCSS, verifica tipos TypeScript sin errores y copia a `dist/`.
- [ ] **8. Evidencia con Playwright:** Navegación en `playwright-cli`, 0 errores en `playwright-cli console` y captura de pantalla registrada.

---

## 10. Referencias cruzadas y archivos del proyecto

| Elemento | Archivo físico en el repositorio |
|---|---|
| Definición de tokens CSS | [`movil/src/styles/tokens.css`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/styles/tokens.css) |
| Catálogo de componentes BEM | [`movil/src/styles/components.css`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/styles/components.css) |
| Shell móvil y marco de dispositivo | [`movil/src/styles/mobile/app-shell.css`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/styles/mobile/app-shell.css) |
| Catálogos de datos y tipos FSM | [`movil/src/scripts/data.ts`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/scripts/data.ts) |
| Persistencia e idempotencia demo | [`movil/src/scripts/store.ts`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/scripts/store.ts) |
| Catálogo visual interactivo | [`movil/src/views/paleta.html`](file:///home/damian/Projects/CreaNoseCivilTierra/movil/src/views/paleta.html) |
| Especificación técnica completa | [`SPEC.md`](file:///home/damian/Projects/CreaNoseCivilTierra/SPEC.md) |
| Requerimientos del producto | [`PRD.md`](file:///home/damian/Projects/CreaNoseCivilTierra/PRD.md) |
| Guía anti-slop del kit | [`.agents/skills/design-taste-frontend/SKILL.md`](file:///home/damian/Projects/CreaNoseCivilTierra/.agents/skills/design-taste-frontend/SKILL.md) |

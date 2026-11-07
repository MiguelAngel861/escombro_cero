import * as store from "./store.js";
import * as data from "./data.js";
import { initWebShell } from "./web-shell.js";

document.addEventListener("DOMContentLoaded", () => {
  const sesion = initWebShell("tablero", "Tablero de Operaciones");
  let estadoFiltro: string = "todos";
  let reportes = store.losReportes();

  const chipsContainer = document.getElementById("chips-estado");
  const listaContainer = document.getElementById("lista-reportes");
  const svgPines = document.getElementById("layer-pines");
  const countBadge = document.getElementById("count-badge");

  // Escuchar cambio de rol desde la topbar
  window.addEventListener("rol-changed", () => {
    render();
  });

  // Render inicial de chips de filtro
  function renderChips(): void {
    if (!chipsContainer) return;
    const estados = ["todos", ...data.ESTADOS_REPORTE];
    chipsContainer.innerHTML = estados
      .map((st) => {
        const label = st === "todos" ? "Todos" : data.ETIQUETAS_ESTADO[st as data.EstadoReporte];
        const count = st === "todos"
          ? reportes.length
          : reportes.filter((r) => r.estado === st).length;
        const active = estadoFiltro === st ? "chip--on" : "";
        return `<button type="button" class="chip ${active}" data-estado="${st}">
          ${label} (${count})
        </button>`;
      })
      .join("");

    chipsContainer.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        estadoFiltro = chip.dataset.estado || "todos";
        render();
      });
    });
  }

  function render(): void {
    reportes = store.losReportes();
    const rolActual = store.laSesionWeb()?.rol || "admin";

    // Si es operador, puede filtrar por sus asignados o por estado
    let filtrados = reportes;
    if (rolActual === "operador") {
      filtrados = reportes.filter((r) => r.idOperadorAsignado === "OP-01" || r.estado === "programado");
    }

    if (estadoFiltro !== "todos") {
      filtrados = filtrados.filter((r) => r.estado === estadoFiltro);
    }

    if (countBadge) {
      countBadge.textContent = `${filtrados.length} reportes`;
    }

    renderChips();
    renderLista(filtrados, rolActual);
    renderPines(filtrados);
  }

  function renderLista(items: data.Reporte[], rol: string): void {
    if (!listaContainer) return;
    if (items.length === 0) {
      listaContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: var(--sp-8); color: var(--color-text-muted);">
          <div style="font-size: 32px; margin-bottom: var(--sp-2);">📭</div>
          <strong>No hay reportes en esta categoría</strong>
          <p style="font-size: var(--fs-xs); margin: var(--sp-1) 0 0;">Selecciona otro filtro para visualizar registros de la zona piloto.</p>
        </div>`;
      return;
    }

    listaContainer.innerHTML = items
      .map((r) => {
        const stClase = r.estado.replace("_", "-");
        const stLabel = data.ETIQUETAS_ESTADO[r.estado];
        const tipoLabel = data.ETIQUETAS_TIPO[r.tipo];

        // Badges de alerta preventiva (RB-08, RB-11, RB-09)
        let alertBadge = "";
        if (r.tipo === "peligroso") {
          alertBadge = `<span class="badge badge--alert-danger" title="Requiere manipulación especializada"><i class="pin"></i>Residuo Peligroso (RB-11)</span>`;
        } else if (r.id === "R-007") {
          alertBadge = `<span class="badge badge--alert-warning" title="Posible duplicado de R-001"><i class="pin"></i>Posible Duplicado (RB-08)</span>`;
        } else if (r.estado === "expirado") {
          alertBadge = `<span class="badge badge--alert-warning"><i class="pin"></i>Plazo excedido (RB-09)</span>`;
        }

        // Acciones disponibles según estado y rol
        let acciones = `<a class="btn btn--surface" href="detalle-reporte.html?id=${r.id}" style="font-size: var(--fs-xs); min-height: 34px; padding-inline: var(--sp-3);">Ver detalle</a>`;

        if (rol === "admin" && (r.estado === "pendiente" || r.estado === "en_revision")) {
          acciones += `<button type="button" class="btn btn--primary btn-asignar" data-id="${r.id}" style="font-size: var(--fs-xs); min-height: 34px; padding-inline: var(--sp-3);">Asignar</button>`;
        } else if (rol === "operador" && r.estado === "programado") {
          acciones += `<a class="btn btn--primary" href="registro-recoleccion.html?id=${r.id}" style="font-size: var(--fs-xs); min-height: 34px; padding-inline: var(--sp-3);">Recolectar</a>`;
        }

        return `
          <div class="card card--tapp" id="card-${r.id}" data-id="${r.id}" style="border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);">
            <div class="card-row">
              <span class="card-id">${r.id}</span>
              <div style="display: flex; gap: var(--sp-2); align-items: center;">
                ${alertBadge}
                <span class="badge badge--${stClase}"><i class="pin"></i>${stLabel}</span>
              </div>
            </div>

            <div style="display: flex; gap: var(--sp-4); align-items: flex-start; margin-top: var(--sp-1);">
              <img src="../assets/fotos/tipo-${r.tipo === "obra" ? "obra" : r.tipo === "peligroso" ? "peligroso" : r.tipo === "mezclado" ? "mezclado" : "demolicion"}.svg" 
                   alt="Foto ${tipoLabel}" width="64" height="64" style="border-radius: var(--radius-sm); object-fit: cover; border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent); flex-shrink: 0;">
              
              <div style="flex: 1; min-width: 0;">
                <div class="card-title" style="margin-bottom: var(--sp-1);">${tipoLabel} · <strong>${r.volumenM3} m³</strong></div>
                <div style="font-size: var(--fs-xs); color: var(--color-text-muted); line-height: 1.4;">📍 ${r.ubicacion || "Ubicación en zona piloto (Managua)"}</div>
                <div class="card-meta" style="margin-top: var(--sp-2);">
                  <span>🕒 ${store.formateaFecha(r.fechaCreacion)}</span>
                  ${r.idOperadorAsignado ? `<span>👷 Asignado a: <strong>${r.idOperadorAsignado}</strong></span>` : ""}
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--sp-2); margin-top: var(--sp-3); border-top: 1px solid color-mix(in srgb, var(--color-text) 6%, transparent); padding-top: var(--sp-3);">
              ${acciones}
            </div>
          </div>
        `;
      })
      .join("");

    // Conectar eventos de asignación directa
    listaContainer.querySelectorAll<HTMLButtonElement>(".btn-asignar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (id) abrirModalAsignacion(id);
      });
    });
  }

  // Render pines interactivos en SVG
  function renderPines(items: data.Reporte[]): void {
    if (!svgPines) return;
    svgPines.innerHTML = items
      .map((r, i) => {
        // Coordenadas fijas simuladas dentro del polígono (viewBox 0 0 500 500)
        const coords = [
          { cx: 160, cy: 150 },
          { cx: 220, cy: 120 },
          { cx: 310, cy: 180 },
          { cx: 180, cy: 260 },
          { cx: 260, cy: 230 },
          { cx: 340, cy: 290 },
          { cx: 155, cy: 145 }, // R-007 (duplicado de R-001)
          { cx: 380, cy: 340 },
          { cx: 290, cy: 370 }
        ];
        const pt = coords[i % coords.length];
        const colorVar = `var(--state-${r.estado.replace("_", "-")})`;

        return `
          <g class="map-pin" data-id="${r.id}" style="cursor: pointer;">
            <circle cx="${pt.cx}" cy="${pt.cy}" r="14" fill="${colorVar}" opacity="0.2"/>
            <circle cx="${pt.cx}" cy="${pt.cy}" r="8" fill="${colorVar}" stroke="#ffffff" stroke-width="2"/>
            <text x="${pt.cx}" y="${pt.cy - 12}" font-size="10" font-weight="700" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)">${r.id}</text>
          </g>
        `;
      })
      .join("");

    // Interactividad: Pin click resalta tarjeta y hace scroll
    svgPines.querySelectorAll<SVGGElement>(".map-pin").forEach((pin) => {
      pin.addEventListener("click", () => {
        const id = pin.dataset.id;
        if (!id) return;
        const tarjeta = document.getElementById(`card-${id}`);
        if (tarjeta) {
          tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
          tarjeta.style.boxShadow = "0 0 0 3px var(--color-primary)";
          setTimeout(() => {
            tarjeta.style.boxShadow = "";
          }, 1800);
        }
      });
    });
  }

  // Modal de asignación de brigada (WEB-V03)
  function abrirModalAsignacion(idReporte: string): void {
    const backdrop = document.getElementById("modal-container");
    const title = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");
    const actionBtn = document.getElementById("modal-action-btn");

    if (!backdrop || !title || !body || !actionBtn) return;

    title.textContent = `Asignar Brigada a ${idReporte}`;
    body.innerHTML = `
      <p style="margin: 0; color: var(--color-text-muted);">Selecciona el operador y la fecha estimada de recolección para programar la brigada:</p>
      <div class="field">
        <label for="modal-op-select">Operador responsable</label>
        <select id="modal-op-select" class="field-input">
          <option value="OP-01">Juan Pérez — Brigada Liviana (Camión 3T, M-204)</option>
          <option value="OP-02">María López — Brigada Pesada (Volquete 8T, M-512)</option>
        </select>
      </div>
      <div class="field">
        <label for="modal-fecha">Fecha programada</label>
        <input type="date" id="modal-fecha" class="field-input" value="2026-11-08">
      </div>
    `;

    backdrop.classList.add("is-visible");

    // Limpiar event listeners previos clonando botón
    const nuevoBtn = actionBtn.cloneNode(true) as HTMLButtonElement;
    nuevoBtn.textContent = "Confirmar Asignación";
    actionBtn.parentNode?.replaceChild(nuevoBtn, actionBtn);

    nuevoBtn.addEventListener("click", () => {
      const opSelect = document.getElementById("modal-op-select") as HTMLSelectElement | null;
      const fechaInput = document.getElementById("modal-fecha") as HTMLInputElement | null;
      const opId = opSelect?.value || "OP-01";
      const fecha = fechaInput?.value || "2026-11-08";

      store.actualizarReporte(idReporte, (r) => ({
        ...r,
        estado: "programado",
        idOperadorAsignado: opId,
        historial: [
          ...r.historial,
          {
            estado: "programado",
            fecha: new Date().toISOString().replace(/\.\d+Z/, ""),
            actor: "AD-01",
            nota: `Asignado a ${opId} para retiro el ${fecha}`
          }
        ]
      }));

      backdrop.classList.remove("is-visible");
      render();
    });

    backdrop.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => backdrop.classList.remove("is-visible"));
    });
  }

  // Inicializar
  render();
});

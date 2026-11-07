import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_ESTADO, ETIQUETAS_TIPO, MOTIVOS_RECHAZO, MOTIVO_TEXTO } from "./data.js";
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const reporteId = params.get("id") || "R-001";
    const sesion = initWebShell("tablero", `Detalle de Reporte ${reporteId}`);
    let reporte = store.unReporte(reporteId);
    if (!reporte) {
        const todos = store.losReportes();
        reporte = todos[0];
    }
    if (!reporte) {
        const mainEl = document.getElementById("detalle-content");
        if (mainEl)
            mainEl.innerHTML = `<div class="card" style="padding: var(--sp-8); text-align: center;">Reporte no encontrado</div>`;
        return;
    }
    renderDetalle(reporte, sesion.rol);
    window.addEventListener("rol-changed", (e) => {
        var _a;
        const custom = e;
        const actualizado = (_a = store.unReporte(reporte.id)) !== null && _a !== void 0 ? _a : reporte;
        renderDetalle(actualizado, custom.detail.rol);
    });
});
function renderDetalle(r, rol) {
    var _a;
    const container = document.getElementById("detalle-content");
    if (!container)
        return;
    const pesoEstimado = Math.round(r.volumenM3 * 1350);
    const esRecolectado = r.estado === "recolectado";
    const esRechazado = r.estado === "rechazado";
    const esProgramado = r.estado === "programado";
    const esEnRevision = r.estado === "en_revision";
    const esPendiente = r.estado === "pendiente";
    // Badges adicionales
    let extraBadges = "";
    if (!r.dentroZona) {
        extraBadges += `<span class="badge" style="background: #fff3e0; color: #b76e00; border-color: #ffe0b2;">⚠ Fuera de polígono</span>`;
    }
    if (r.tipo === "peligroso") {
        extraBadges += `<span class="badge" style="background: #ffebee; color: #c62828; border-color: #ffcdd2;">☣ Residuo Peligroso</span>`;
    }
    container.innerHTML = `
    <div>
      <a href="tablero.html" class="btn btn--outline btn--sm" style="display: inline-flex; align-items: center; gap: 6px;">
        ← Volver al Tablero
      </a>
    </div>

    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: var(--sp-6); align-items: start; max-width: 1400px; width: 100%;">
      <!-- Columna Principal -->
      <div style="display: grid; gap: var(--sp-4);">
        <!-- Ficha de Encabezado -->
        <article class="card" style="padding: var(--sp-5);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--sp-4); flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: var(--sp-2); margin-bottom: var(--sp-1);">
                <span style="font-family: var(--font-mono); font-size: var(--fs-lg); font-weight: 700; color: var(--color-primary-dark);">${store.esc(r.id)}</span>
                <span class="badge badge--${r.estado}">${ETIQUETAS_ESTADO[r.estado]}</span>
                ${extraBadges}
              </div>
              <p style="font-size: var(--fs-xs); color: var(--color-text-muted); margin: 0;">
                Ingresado el ${store.formateaFecha(r.fechaCreacion)} · Reportado por Ciudadano (${store.esc(r.idCiudadano)})
              </p>
            </div>
            ${r.idOperadorAsignado ? `
              <div style="text-align: right; background: color-mix(in srgb, var(--color-primary) 6%, transparent); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Brigada Asignada</div>
                <strong style="font-size: var(--fs-sm); color: var(--color-primary-dark); font-family: var(--font-mono);">${store.esc(r.idOperadorAsignado)}</strong>
                ${r.fechaEstimada ? `<div style="font-size: 11px; color: var(--color-text-muted);">Prog: ${store.esc(r.fechaEstimada)}</div>` : ""}
              </div>
            ` : ""}
          </div>
        </article>

        <!-- Propiedades del Escombro -->
        <article class="card" style="padding: var(--sp-5);">
          <h2 style="font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 var(--sp-4);">
            Propiedades del Desecho
          </h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4);">
            <div style="background: var(--color-bg); padding: var(--sp-3); border-radius: var(--radius-sm);">
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block;">Tipo de Material</span>
              <strong style="font-size: var(--fs-md);">${ETIQUETAS_TIPO[r.tipo]}</strong>
            </div>
            <div style="background: var(--color-bg); padding: var(--sp-3); border-radius: var(--radius-sm);">
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block;">Volumen Estimado</span>
              <strong style="font-size: var(--fs-md); font-family: var(--font-mono);">${r.volumenM3.toFixed(1)} m³</strong>
            </div>
            <div style="background: var(--color-bg); padding: var(--sp-3); border-radius: var(--radius-sm);">
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block;">Peso Estimado (ref)</span>
              <strong style="font-size: var(--fs-md); font-family: var(--font-mono);">~${pesoEstimado.toLocaleString()} kg</strong>
            </div>
          </div>
          ${r.descripcion ? `
            <div style="margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);">
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block; margin-bottom: 4px;">Descripción / Referencia de campo</span>
              <p style="font-size: var(--fs-sm); margin: 0;">${store.esc(r.descripcion)}</p>
            </div>
          ` : ""}
          ${r.motivoRechazo ? `
            <div style="margin-top: var(--sp-4); padding: var(--sp-3); background: #ffebee; border-radius: var(--radius-sm); border: 1px solid #ffcdd2;">
              <strong style="font-size: var(--fs-xs); color: #c62828; display: block;">Motivo de rechazo:</strong>
              <span style="font-size: var(--fs-sm); color: #b71c1c;">${(_a = MOTIVO_TEXTO[r.motivoRechazo]) !== null && _a !== void 0 ? _a : r.motivoRechazo}</span>
            </div>
          ` : ""}
        </article>

        <!-- Georreferenciación y Mapa Mini -->
        <article class="card" style="padding: var(--sp-5);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3);">
            <h2 style="font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0;">
              Ubicación Georreferenciada
            </h2>
            <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--color-text-muted);">
              12.132° N, -86.250° O
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--sp-2); margin-bottom: var(--sp-4);">
            <span style="font-size: var(--fs-md);">📍</span>
            <span style="font-size: var(--fs-sm); font-weight: 500;">${store.esc(r.ubicacion)}</span>
          </div>

          <!-- Mini SVG Map Canvas -->
          <div style="border-radius: var(--radius-sm); overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent); height: 200px; background: color-mix(in srgb, var(--color-primary) 4%, var(--color-bg)); position: relative;">
            <svg viewBox="0 0 400 200" style="width: 100%; height: 100%; display: block;">
              <defs>
                <pattern id="mini-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="color-mix(in srgb, var(--color-text) 5%, transparent)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#mini-grid)" />
              <!-- Polígono de la zona -->
              <polygon points="80,20 320,30 350,160 220,190 70,150" fill="color-mix(in srgb, var(--color-primary) 10%, transparent)" stroke="var(--color-primary)" stroke-width="2" stroke-dasharray="4 3"/>
              <!-- Vía principal -->
              <path d="M 20 90 Q 200 80 380 110" fill="none" stroke="color-mix(in srgb, var(--color-text) 15%, transparent)" stroke-width="3"/>
              <!-- Pin destacado del reporte -->
              <circle cx="210" cy="95" r="14" fill="var(--color-surface)" stroke="var(--state-${r.estado})" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/>
              <circle cx="210" cy="95" r="6" fill="var(--state-${r.estado})"/>
              <text x="210" y="125" font-size="11" font-weight="700" text-anchor="middle" fill="var(--color-text)" font-family="var(--font-mono)">${store.esc(r.id)}</text>
            </svg>
          </div>
        </article>

        <!-- Evidencias Fotográficas -->
        <article class="card" style="padding: var(--sp-5);">
          <h2 style="font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 var(--sp-4);">
            Evidencia Fotográfica
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
            <div>
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block; margin-bottom: 6px;">Foto Reportada (Inicial)</span>
              <div style="aspect-ratio: 16/9; background: #e0e0e0; border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #bdbdbd; color: #616161;">
                <span style="font-size: 28px;">📷</span>
                <span style="font-size: var(--fs-xs); font-family: var(--font-mono); margin-top: 4px;">foto_inicial_${r.id}.jpg</span>
              </div>
            </div>
            <div>
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted); display: block; margin-bottom: 6px;">Foto Post-Recolección</span>
              <div style="aspect-ratio: 16/9; background: ${esRecolectado ? '#e8f5e9' : '#fafafa'}; border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed ${esRecolectado ? 'var(--color-primary)' : '#e0e0e0'}; color: ${esRecolectado ? 'var(--color-primary-dark)' : '#9e9e9e'};">
                <span style="font-size: 28px;">${esRecolectado ? '✓' : '⌛'}</span>
                <span style="font-size: var(--fs-xs); font-family: var(--font-mono); margin-top: 4px;">
                  ${esRecolectado ? `recoleccion_${r.id}.jpg` : 'Pendiente de captura'}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Columna Lateral: Acciones por Rol y Línea de Tiempo FSM -->
      <div style="display: grid; gap: var(--sp-4);">
        <!-- Caja de Acciones de Rol -->
        <article class="card" style="padding: var(--sp-5); border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3);">
            <strong style="font-size: var(--fs-sm);">Acciones Operativas</strong>
            <span class="badge" style="font-size: 10px; background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary-dark);">
              Rol: ${rol.toUpperCase()}
            </span>
          </div>

          <div style="display: grid; gap: var(--sp-2);">
            ${renderAccionesPorRol(r, rol)}
          </div>
        </article>

        <!-- Historial / Timeline FSM -->
        <article class="card" style="padding: var(--sp-5);">
          <h2 style="font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 var(--sp-4);">
            Trazabilidad del Reporte
          </h2>
          <div class="timeline" style="display: grid; gap: var(--sp-3); position: relative; padding-left: var(--sp-4); border-left: 2px solid color-mix(in srgb, var(--color-text) 12%, transparent); margin-left: var(--sp-2);">
            ${r.historial.map((h, i) => { var _a; return `
              <div style="position: relative;">
                <div style="position: absolute; left: calc(-1 * var(--sp-4) - 5px); top: 3px; width: 8px; height: 8px; border-radius: 50%; background: var(--state-${h.estado}); ring: 3px solid var(--color-surface);"></div>
                <div style="font-size: var(--fs-xs); font-weight: 600; color: var(--color-text);">${(_a = ETIQUETAS_ESTADO[h.estado]) !== null && _a !== void 0 ? _a : h.estado}</div>
                <div style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono);">${store.formateaFecha(h.fecha)}</div>
              </div>
            `; }).join("")}
          </div>
        </article>
      </div>
    </div>
  `;
    conectarEventosAcciones(r);
}
function renderAccionesPorRol(r, rol) {
    if (rol === "operador") {
        if (r.estado === "programado") {
            return `
        <a href="registro-recoleccion.html?id=${r.id}" class="btn btn--primary btn--full">
          ✍ Proceder con Recolección
        </a>
      `;
        }
        if (r.estado === "recolectado") {
            return `
        <div style="font-size: var(--fs-xs); color: var(--state-recolectado-ink); background: var(--state-recolectado-bg); padding: var(--sp-3); border-radius: var(--radius-sm); text-align: center;">
          ✓ Escombro recolectado y trasladado a destino.
        </div>
      `;
        }
        return `
      <div style="font-size: var(--fs-xs); color: var(--color-text-muted); text-align: center; padding: var(--sp-2);">
        No hay acciones pendientes para operador en este estado (${ETIQUETAS_ESTADO[r.estado]}).
      </div>
    `;
    }
    // Rol Administrador
    const botones = [];
    if (r.estado === "pendiente") {
        botones.push(`
      <button type="button" class="btn btn--primary btn--full" id="btn-validar">
        ✓ Validar Reporte (En Revisión)
      </button>
    `);
    }
    if (r.estado === "pendiente" || r.estado === "en_revision") {
        botones.push(`
      <button type="button" class="btn btn--outline btn--full" id="btn-asignar" style="color: var(--color-primary-dark); border-color: var(--color-primary);">
        👤 Asignar a Brigada (Programar)
      </button>
      <button type="button" class="btn btn--outline btn--full" id="btn-rechazar" style="color: var(--state-rechazado-ink); border-color: var(--state-rechazado);">
        ✕ Rechazar con Motivo
      </button>
    `);
    }
    if (r.estado === "programado") {
        botones.push(`
      <button type="button" class="btn btn--outline btn--full" id="btn-reasignar">
        ⇄ Reasignar Brigada
      </button>
      <a href="registro-recoleccion.html?id=${r.id}" class="btn btn--outline btn--full">
        ✍ Registrar Recolección (Manual)
      </a>
    `);
    }
    if (r.estado === "recolectado" || r.estado === "rechazado" || r.estado === "expirado") {
        botones.push(`
      <button type="button" class="btn btn--outline btn--full" id="btn-reabrir" style="color: var(--color-primary-dark);">
        ↺ Reabrir Reporte (Admin)
      </button>
    `);
    }
    return botones.join("");
}
function conectarEventosAcciones(r) {
    const ahora = new Date().toISOString().slice(0, 16);
    // Validar
    const btnValidar = document.getElementById("btn-validar");
    if (btnValidar) {
        btnValidar.addEventListener("click", () => {
            store.actualizarReporte(r.id, (prev) => (Object.assign(Object.assign({}, prev), { estado: "en_revision", historial: [...prev.historial, { estado: "en_revision", fecha: ahora }] })));
            window.location.reload();
        });
    }
    // Asignar / Reasignar (WEB-V03)
    const btnAsignar = document.getElementById("btn-asignar") || document.getElementById("btn-reasignar");
    if (btnAsignar) {
        btnAsignar.addEventListener("click", () => {
            abrirModalAsignar(r);
        });
    }
    // Rechazar (WEB-V05)
    const btnRechazar = document.getElementById("btn-rechazar");
    if (btnRechazar) {
        btnRechazar.addEventListener("click", () => {
            abrirModalRechazar(r);
        });
    }
    // Reabrir (WEB-V06)
    const btnReabrir = document.getElementById("btn-reabrir");
    if (btnReabrir) {
        btnReabrir.addEventListener("click", () => {
            abrirModalReabrir(r);
        });
    }
}
function abrirModalAsignar(r) {
    var _a, _b;
    var _c;
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle)
        return;
    const operadores = store.losUsuariosSistema().filter((u) => u.rol === "operador" && u.activo);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaDefault = manana.toISOString().slice(0, 10);
    modalTitle.textContent = `Asignar Brigada a ${r.id}`;
    modalBody.innerHTML = `
    <form id="form-modal-asignar" class="field" style="gap: var(--sp-4);">
      <div class="field">
        <label for="op-select">Operador Responsable</label>
        <select id="op-select" class="field-input" required>
          ${operadores.map((op) => { var _a; return `
            <option value="${op.id}" ${r.idOperadorAsignado === op.id ? 'selected' : ''}>
              ${op.nombre} (${op.id}) — ${(_a = op.vehiculo) !== null && _a !== void 0 ? _a : 'Sin vehículo asignado'}
            </option>
          `; }).join("")}
        </select>
      </div>

      <div class="field">
        <label for="fecha-estimada">Fecha Estimada de Recolección</label>
        <input type="date" id="fecha-estimada" class="field-input" value="${(_c = r.fechaEstimada) !== null && _c !== void 0 ? _c : fechaDefault}" required>
      </div>

      <div class="field">
        <label for="instrucciones">Instrucciones Especiales (opcional)</label>
        <textarea id="instrucciones" class="field-input" rows="2" placeholder="Ej. Acceso estrecho por el portón este..."></textarea>
      </div>
    </form>
  `;
    if (modalFooter) {
        modalFooter.innerHTML = `
      <button type="button" class="btn btn--outline" id="btn-cancel-modal">Cancelar</button>
      <button type="button" class="btn btn--primary" id="btn-confirm-asignar">Confirmar Asignación</button>
    `;
    }
    modalRoot.removeAttribute("hidden");
    (_a = document.getElementById("btn-cancel-modal")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        modalRoot.setAttribute("hidden", "true");
    });
    (_b = document.getElementById("btn-confirm-asignar")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        const opSelect = document.getElementById("op-select");
        const fechaInput = document.getElementById("fecha-estimada");
        if (!opSelect || !fechaInput)
            return;
        const opId = opSelect.value;
        const fecha = fechaInput.value;
        const ahora = new Date().toISOString().slice(0, 16);
        store.actualizarReporte(r.id, (prev) => (Object.assign(Object.assign({}, prev), { estado: "programado", idOperadorAsignado: opId, fechaEstimada: fecha, historial: [...prev.historial, { estado: "programado", fecha: ahora }] })));
        modalRoot.setAttribute("hidden", "true");
        window.location.reload();
    });
}
function abrirModalRechazar(r) {
    var _a, _b;
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle)
        return;
    modalTitle.textContent = `Rechazar Reporte ${r.id}`;
    modalBody.innerHTML = `
    <form id="form-modal-rechazar" class="field" style="gap: var(--sp-4);">
      <div class="field">
        <label for="motivo-select">Motivo de Descarte (Catálogo Oficial)</label>
        <select id="motivo-select" class="field-input" required>
          ${MOTIVOS_RECHAZO.map((m) => `
            <option value="${m}">${MOTIVO_TEXTO[m]}</option>
          `).join("")}
        </select>
      </div>

      <div class="field">
        <label for="comentario-rechazo">Explicación para el ciudadano / Trazabilidad</label>
        <textarea id="comentario-rechazo" class="field-input" rows="3" placeholder="Detalles de inspección que sustentan el descarte..." required></textarea>
      </div>
    </form>
  `;
    if (modalFooter) {
        modalFooter.innerHTML = `
      <button type="button" class="btn btn--outline" id="btn-cancel-modal">Cancelar</button>
      <button type="button" class="btn btn--primary" id="btn-confirm-rechazo" style="background: var(--state-rechazado);">Confirmar Rechazo</button>
    `;
    }
    modalRoot.removeAttribute("hidden");
    (_a = document.getElementById("btn-cancel-modal")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        modalRoot.setAttribute("hidden", "true");
    });
    (_b = document.getElementById("btn-confirm-rechazo")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        const sel = document.getElementById("motivo-select");
        if (!sel)
            return;
        const motivo = sel.value;
        const ahora = new Date().toISOString().slice(0, 16);
        store.actualizarReporte(r.id, (prev) => (Object.assign(Object.assign({}, prev), { estado: "rechazado", motivoRechazo: motivo, historial: [...prev.historial, { estado: "rechazado", fecha: ahora }] })));
        modalRoot.setAttribute("hidden", "true");
        window.location.reload();
    });
}
function abrirModalReabrir(r) {
    var _a;
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle)
        return;
    modalTitle.textContent = `Reapertura de Reporte ${r.id} (RB-14)`;
    modalBody.innerHTML = `
    <div style="background: #fff3e0; border: 1px solid #ffe0b2; padding: var(--sp-3); border-radius: var(--radius-sm); font-size: var(--fs-xs); color: #b76e00; margin-bottom: var(--sp-3);">
      ⚠ La reapertura devuelve el reporte al estado <strong>Pendiente</strong> y requiere una justificación técnica obligatoria de al menos 20 caracteres.
    </div>

    <form id="form-modal-reabrir" class="field" style="gap: var(--sp-4);">
      <div class="field">
        <label for="justificacion-reapertura">Justificación del Administrador (≥ 20 caracteres)</label>
        <textarea id="justificacion-reapertura" class="field-input" rows="3" placeholder="Explique la causa de la reapertura o reincidencia del escombro..." required minlength="20"></textarea>
        <span id="char-count" style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); text-align: right;">0 / 20 caracteres</span>
      </div>
    </form>
  `;
    if (modalFooter) {
        modalFooter.innerHTML = `
      <button type="button" class="btn btn--outline" id="btn-cancel-modal">Cancelar</button>
      <button type="button" class="btn btn--primary" id="btn-confirm-reabrir" disabled>Reabrir Caso</button>
    `;
    }
    modalRoot.removeAttribute("hidden");
    const txt = document.getElementById("justificacion-reapertura");
    const countEl = document.getElementById("char-count");
    const btnConfirm = document.getElementById("btn-confirm-reabrir");
    txt === null || txt === void 0 ? void 0 : txt.addEventListener("input", () => {
        const len = txt.value.trim().length;
        if (countEl)
            countEl.textContent = `${len} / 20 caracteres`;
        if (btnConfirm)
            btnConfirm.disabled = len < 20;
    });
    (_a = document.getElementById("btn-cancel-modal")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        modalRoot.setAttribute("hidden", "true");
    });
    btnConfirm === null || btnConfirm === void 0 ? void 0 : btnConfirm.addEventListener("click", () => {
        if (!txt || txt.value.trim().length < 20)
            return;
        const ahora = new Date().toISOString().slice(0, 16);
        store.actualizarReporte(r.id, (prev) => (Object.assign(Object.assign({}, prev), { estado: "pendiente", motivoRechazo: undefined, historial: [...prev.historial, { estado: "pendiente", fecha: ahora }] })));
        modalRoot.setAttribute("hidden", "true");
        window.location.reload();
    });
}

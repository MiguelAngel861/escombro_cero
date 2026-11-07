import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_DESTINO_TIPO, type Destino, type TipoDestino } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const sesion = initWebShell("destinos", "Catálogo de Destinos Autorizados");

  function renderDestinos(): void {
    const destinos = store.losDestinos();
    const container = document.getElementById("destinos-grid");
    if (!container) return;

    container.innerHTML = destinos.map((d: Destino) => {
      const pctOcupacion = Math.min(100, Math.round((d.ocupacionM3 / d.capacidadM3) * 100));
      const libreM3 = Math.max(0, d.capacidadM3 - d.ocupacionM3);
      const colorBarra = pctOcupacion > 85 ? "#c62828" : pctOcupacion > 65 ? "#ef6c00" : "var(--color-primary)";

      return `
        <article class="card" style="padding: var(--sp-5); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--sp-2); margin-bottom: var(--sp-2);">
              <span class="badge" style="background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); color: var(--color-primary-dark); font-size: 11px;">
                ${ETIQUETAS_DESTINO_TIPO[d.tipo]}
              </span>
              <span class="badge ${d.activo ? 'badge--recolectado' : 'badge--rechazado'}" style="font-size: 10px;">
                ${d.activo ? 'Operativo' : 'Inactivo'}
              </span>
            </div>

            <h2 style="font-size: var(--fs-md); font-weight: 600; margin: 0 0 4px; letter-spacing: -0.01em;">
              ${store.esc(d.nombre)}
            </h2>
            <div style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--color-text-muted); margin-bottom: var(--sp-3);">
              ID: ${d.id}
            </div>

            <p style="font-size: var(--fs-xs); color: var(--color-text-muted); margin: 0 0 var(--sp-4); display: flex; align-items: center; gap: var(--sp-1);">
              <span>📍</span> <span>${store.esc(d.direccion)}</span>
            </p>

            <!-- Barra de Capacidad -->
            <div style="background: var(--color-bg); padding: var(--sp-3); border-radius: var(--radius-sm); margin-bottom: var(--sp-4);">
              <div style="display: flex; justify-content: space-between; font-size: var(--fs-xs); margin-bottom: 6px;">
                <span>Ocupación: <strong>${pctOcupacion}%</strong></span>
                <span style="font-family: var(--font-mono);">${d.ocupacionM3.toLocaleString()} / ${d.capacidadM3.toLocaleString()} m³</span>
              </div>
              <div style="height: 8px; width: 100%; background: color-mix(in srgb, var(--color-text) 10%, transparent); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pctOcupacion}%; height: 100%; background: ${colorBarra}; border-radius: 4px; transition: width 0.3s ease;"></div>
              </div>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px; text-align: right;">
                Espacio disponible: <strong>${libreM3.toLocaleString()} m³</strong>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: var(--sp-2); border-top: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent); padding-top: var(--sp-3);">
            <button type="button" class="btn btn--outline btn--sm btn-toggle-estado" data-id="${d.id}" style="flex: 1;">
              ${d.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" class="btn btn--outline btn--sm btn-editar-destino" data-id="${d.id}">
              Editar
            </button>
          </div>
        </article>
      `;
    }).join("");

    // Conectar botones
    document.querySelectorAll(".btn-toggle-estado").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id;
        if (!id) return;
        const lista = store.losDestinos();
        const item = lista.find((x) => x.id === id);
        if (item) {
          item.activo = !item.activo;
          store.guardarDestinos(lista);
          renderDestinos();
        }
      });
    });

    document.querySelectorAll(".btn-editar-destino").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id;
        if (!id) return;
        abrirModalDestino(id);
      });
    });
  }

  // Modal nuevo / editar destino
  function abrirModalDestino(editId?: string): void {
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle) return;

    const lista = store.losDestinos();
    const item = editId ? lista.find((x) => x.id === editId) : null;

    modalTitle.textContent = item ? `Editar Destino ${item.id}` : "Nuevo Destino Autorizado";
    modalBody.innerHTML = `
      <form id="form-modal-destino" class="field" style="gap: var(--sp-4);">
        <div class="field">
          <label for="dest-nombre">Nombre de la Instalación</label>
          <input type="text" id="dest-nombre" class="field-input" value="${item ? store.esc(item.nombre) : ''}" placeholder="Ej. Planta de Valorización Sur" required>
        </div>

        <div class="field">
          <label for="dest-tipo">Categoría de Tratamiento</label>
          <select id="dest-tipo" class="field-input" required>
            <option value="relleno_sanitario" ${item?.tipo === 'relleno_sanitario' ? 'selected' : ''}>Relleno Sanitario Municipal</option>
            <option value="planta_transformacion" ${item?.tipo === 'planta_transformacion' ? 'selected' : ''}>Planta de Trituración / Reciclaje</option>
            <option value="acopio_temporal" ${item?.tipo === 'acopio_temporal' ? 'selected' : ''}>Centro de Acopio Temporal</option>
          </select>
        </div>

        <div class="field">
          <label for="dest-direccion">Dirección / Acceso Vial</label>
          <input type="text" id="dest-direccion" class="field-input" value="${item ? store.esc(item.direccion) : ''}" placeholder="Ej. Distrito 6 · Km 9 Pista Suburbana" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
          <div class="field">
            <label for="dest-capacidad">Capacidad Total (m³)</label>
            <input type="number" id="dest-capacidad" class="field-input" value="${item ? item.capacidadM3 : 2500}" min="100" required>
          </div>
          <div class="field">
            <label for="dest-ocupacion">Ocupación Inicial (m³)</label>
            <input type="number" id="dest-ocupacion" class="field-input" value="${item ? item.ocupacionM3 : 0}" min="0" required>
          </div>
        </div>
      </form>
    `;

    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn--outline" id="btn-cancel-dest">Cancelar</button>
        <button type="button" class="btn btn--primary" id="btn-save-dest">Guardar Destino</button>
      `;
    }

    modalRoot.classList.add("is-visible");

    document.getElementById("btn-cancel-dest")?.addEventListener("click", () => {
      modalRoot.classList.remove("is-visible");
    });

    document.getElementById("btn-save-dest")?.addEventListener("click", () => {
      const nom = (document.getElementById("dest-nombre") as HTMLInputElement)?.value.trim();
      const tipo = (document.getElementById("dest-tipo") as HTMLSelectElement)?.value as TipoDestino;
      const dir = (document.getElementById("dest-direccion") as HTMLInputElement)?.value.trim();
      const cap = parseFloat((document.getElementById("dest-capacidad") as HTMLInputElement)?.value ?? "0");
      const ocu = parseFloat((document.getElementById("dest-ocupacion") as HTMLInputElement)?.value ?? "0");

      if (!nom || !dir || isNaN(cap)) {
        alert("Completa todos los campos obligatorios.");
        return;
      }

      if (item) {
        item.nombre = nom;
        item.tipo = tipo;
        item.direccion = dir;
        item.capacidadM3 = cap;
        item.ocupacionM3 = ocu;
        store.guardarDestinos(lista);
      } else {
        const nuevoId = `DE-${String(lista.length + 1).padStart(2, "0")}`;
        lista.push({
          id: nuevoId,
          nombre: nom,
          tipo,
          direccion: dir,
          capacidadM3: cap,
          ocupacionM3: ocu,
          activo: true
        });
        store.guardarDestinos(lista);
      }

      modalRoot.classList.remove("is-visible");
      renderDestinos();
    });
  }

  // Cerrar modal al hacer clic fuera del contenido (backdrop) o en el botón X
  modalRoot.addEventListener("click", (ev) => {
    const target = ev.target as HTMLElement;
    if (target === modalRoot || target.closest("#modal-close")) {
      modalRoot.classList.remove("is-visible");
    }
  });

  document.getElementById("btn-nuevo-destino")?.addEventListener("click", () => {
    abrirModalDestino();
  });

  renderDestinos();
});

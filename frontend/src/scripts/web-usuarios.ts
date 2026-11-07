import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { type UsuarioSistema, type RolSistema } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  initWebShell("usuarios", "Gestión de Usuarios del Sistema");

  function renderUsuarios(): void {
    const usuarios = store.losUsuariosSistema();
    const tbody = document.getElementById("tabla-usuarios-body");
    if (!tbody) return;

    tbody.innerHTML = usuarios.map((u: UsuarioSistema) => {
      const rolBadge = u.rol === "admin" 
        ? `<span class="badge" style="background: #e8eaf6; color: #283593;">Administrador</span>`
        : u.rol === "operador"
        ? `<span class="badge badge--programado">Operador (Brigada)</span>`
        : `<span class="badge badge--en_revision">Ciudadano</span>`;

      return `
        <tr>
          <td><strong style="font-family: var(--font-mono); font-size: var(--fs-xs);">${u.id}</strong></td>
          <td style="font-weight: 500; font-size: var(--fs-sm);">${store.esc(u.nombre)}</td>
          <td style="font-size: var(--fs-xs); color: var(--color-text-muted); font-family: var(--font-mono);">${store.esc(u.correo)}</td>
          <td>${rolBadge}</td>
          <td style="font-size: var(--fs-xs);">
            ${u.vehiculo ? `<strong>${store.esc(u.vehiculo)}</strong> <span style="color: var(--color-text-muted); font-family: var(--font-mono);">(${u.placa ?? ''})</span>` : '<span style="color: var(--color-text-muted);">--</span>'}
          </td>
          <td>
            <span class="badge ${u.activo ? 'badge--recolectado' : 'badge--rechazado'}" style="font-size: 10px;">
              ${u.activo ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: var(--sp-2);">
              <button type="button" class="btn btn--outline btn--sm btn-toggle-usuario" data-id="${u.id}">
                ${u.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button type="button" class="btn btn--outline btn--sm btn-edit-usuario" data-id="${u.id}">
                Editar
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Conectar eventos
    document.querySelectorAll(".btn-toggle-usuario").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id;
        if (!id) return;
        const lista = store.losUsuariosSistema();
        const item = lista.find((x) => x.id === id);
        if (item) {
          item.activo = !item.activo;
          store.guardarUsuariosSistema(lista);
          renderUsuarios();
        }
      });
    });

    document.querySelectorAll(".btn-edit-usuario").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id;
        if (!id) return;
        abrirModalUsuario(id);
      });
    });
  }

  function abrirModalUsuario(editId?: string): void {
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle) return;

    const lista = store.losUsuariosSistema();
    const item = editId ? lista.find((x) => x.id === editId) : null;

    modalTitle.textContent = item ? `Editar Usuario ${item.id}` : "Nuevo Usuario Institucional";
    modalBody.innerHTML = `
      <form id="form-modal-user" class="field" style="gap: var(--sp-4);">
        <div class="field">
          <label for="user-nombre">Nombre y Apellidos</label>
          <input type="text" id="user-nombre" class="field-input" value="${item ? store.esc(item.nombre) : ''}" placeholder="Ej. Roberto Sánchez" required>
        </div>

        <div class="field">
          <label for="user-correo">Correo Electrónico</label>
          <input type="email" id="user-correo" class="field-input" value="${item ? store.esc(item.correo) : ''}" placeholder="ejemplo@alcaldia.gob.ni" required>
        </div>

        <div class="field">
          <label for="user-rol">Rol en el Sistema</label>
          <select id="user-rol" class="field-input" required>
            <option value="operador" ${item?.rol === 'operador' ? 'selected' : ''}>Operador de Brigada (Recolección)</option>
            <option value="admin" ${item?.rol === 'admin' ? 'selected' : ''}>Administrador / Supervisor Municipal</option>
            <option value="ciudadano" ${item?.rol === 'ciudadano' ? 'selected' : ''}>Ciudadano</option>
          </select>
        </div>

        <div id="wrapper-vehiculo" style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--sp-3);">
          <div class="field">
            <label for="user-vehiculo">Vehículo Asignado</label>
            <input type="text" id="user-vehiculo" class="field-input" value="${item?.vehiculo ? store.esc(item.vehiculo) : ''}" placeholder="Ej. Volquete Mediano 5T">
          </div>
          <div class="field">
            <label for="user-placa">Placa</label>
            <input type="text" id="user-placa" class="field-input" value="${item?.placa ? store.esc(item.placa) : ''}" placeholder="M-12345">
          </div>
        </div>
      </form>
    `;

    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn--outline" id="btn-cancel-user">Cancelar</button>
        <button type="button" class="btn btn--primary" id="btn-save-user">Guardar Usuario</button>
      `;
    }

    modalRoot.removeAttribute("hidden");

    const selRol = document.getElementById("user-rol") as HTMLSelectElement | null;
    const wrapVehiculo = document.getElementById("wrapper-vehiculo");
    
    function toggleVehiculoField(): void {
      if (wrapVehiculo) {
        wrapVehiculo.style.display = selRol?.value === "operador" ? "grid" : "none";
      }
    }
    selRol?.addEventListener("change", toggleVehiculoField);
    toggleVehiculoField();

    document.getElementById("btn-cancel-user")?.addEventListener("click", () => {
      modalRoot.setAttribute("hidden", "true");
    });

    document.getElementById("btn-save-user")?.addEventListener("click", () => {
      const nom = (document.getElementById("user-nombre") as HTMLInputElement)?.value.trim();
      const cor = (document.getElementById("user-correo") as HTMLInputElement)?.value.trim();
      const rol = (document.getElementById("user-rol") as HTMLSelectElement)?.value as RolSistema;
      const veh = (document.getElementById("user-vehiculo") as HTMLInputElement)?.value.trim();
      const pla = (document.getElementById("user-placa") as HTMLInputElement)?.value.trim();

      if (!nom || !cor) {
        alert("Por favor completa los campos requeridos.");
        return;
      }

      if (item) {
        item.nombre = nom;
        item.correo = cor;
        item.rol = rol;
        item.vehiculo = rol === "operador" ? veh : undefined;
        item.placa = rol === "operador" ? pla : undefined;
        store.guardarUsuariosSistema(lista);
      } else {
        const prefix = rol === "admin" ? "AD" : rol === "operador" ? "OP" : "US";
        const count = lista.filter((x) => x.rol === rol).length + 1;
        const nuevoId = `${prefix}-${String(count).padStart(2, "0")}`;
        lista.push({
          id: nuevoId,
          nombre: nom,
          correo: cor,
          rol,
          vehiculo: rol === "operador" ? veh : undefined,
          placa: rol === "operador" ? pla : undefined,
          activo: true
        });
        store.guardarUsuariosSistema(lista);
      }

      modalRoot.setAttribute("hidden", "true");
      renderUsuarios();
    });
  }

  document.getElementById("btn-nuevo-usuario")?.addEventListener("click", () => {
    abrirModalUsuario();
  });

  renderUsuarios();
});

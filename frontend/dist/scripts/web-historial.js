import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_TIPO } from "./data.js";
document.addEventListener("DOMContentLoaded", () => {
    initWebShell("historial", "Historial de Recolecciones");
    const recolecciones = store.lasRecolecciones();
    const reportes = store.losReportes();
    const destinos = store.losDestinos();
    const operadores = store.losUsuariosSistema().filter((u) => u.rol === "operador");
    // Referencias UI
    const selOp = document.getElementById("filtro-operador");
    const selDest = document.getElementById("filtro-destino");
    const inpSearch = document.getElementById("filtro-busqueda");
    const tbody = document.getElementById("tabla-historial-body");
    const statsEl = document.getElementById("historial-stats");
    // Poblar selectores de filtro
    if (selOp) {
        selOp.innerHTML = `<option value="">Todos los operadores</option>` + operadores.map((op) => `
      <option value="${op.id}">${op.nombre} (${op.id})</option>
    `).join("");
    }
    if (selDest) {
        selDest.innerHTML = `<option value="">Todos los destinos</option>` + destinos.map((d) => `
      <option value="${d.id}">${d.nombre} (${d.id})</option>
    `).join("");
    }
    function renderTabla() {
        var _a, _b, _c;
        const opVal = (_a = selOp === null || selOp === void 0 ? void 0 : selOp.value) !== null && _a !== void 0 ? _a : "";
        const destVal = (_b = selDest === null || selDest === void 0 ? void 0 : selDest.value) !== null && _b !== void 0 ? _b : "";
        const searchVal = (_c = inpSearch === null || inpSearch === void 0 ? void 0 : inpSearch.value.toLowerCase().trim()) !== null && _c !== void 0 ? _c : "";
        const filtradas = recolecciones.filter((r) => {
            if (opVal && r.idOperador !== opVal)
                return false;
            if (destVal && r.idDestino !== destVal)
                return false;
            if (searchVal) {
                const matchesId = r.id.toLowerCase().includes(searchVal);
                const matchesRep = r.idReporte.toLowerCase().includes(searchVal);
                const matchesVeh = r.vehiculo.toLowerCase().includes(searchVal);
                if (!matchesId && !matchesRep && !matchesVeh)
                    return false;
            }
            return true;
        });
        // Calcular estadísticas de resumen
        const totalM3 = filtradas.reduce((acc, cur) => acc + cur.volumenRecogidoM3, 0);
        const totalKg = filtradas.reduce((acc, cur) => acc + cur.pesoEstimadoKg, 0);
        if (statsEl) {
            statsEl.innerHTML = `
        <div class="card" style="padding: var(--sp-3) var(--sp-4); display: flex; gap: var(--sp-6); flex-wrap: wrap; align-items: center; background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));">
          <div><span style="font-size: var(--fs-xs); color: var(--color-text-muted);">Recolecciones:</span> <strong>${filtradas.length}</strong></div>
          <div><span style="font-size: var(--fs-xs); color: var(--color-text-muted);">Volumen Total:</span> <strong style="font-family: var(--font-mono);">${totalM3.toFixed(1)} m³</strong></div>
          <div><span style="font-size: var(--fs-xs); color: var(--color-text-muted);">Peso Total:</span> <strong style="font-family: var(--font-mono);">${totalKg.toLocaleString()} kg</strong></div>
        </div>
      `;
        }
        if (!tbody)
            return;
        if (filtradas.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--sp-8); color: var(--color-text-muted);">
            No se encontraron registros de recolección con los filtros seleccionados.
          </td>
        </tr>
      `;
            return;
        }
        tbody.innerHTML = filtradas.map((r) => {
            const rep = reportes.find((item) => item.id === r.idReporte);
            const dest = destinos.find((d) => d.id === r.idDestino);
            const tipo = rep ? ETIQUETAS_TIPO[rep.tipo] : "Desconocido";
            return `
        <tr>
          <td>
            <strong style="font-family: var(--font-mono); color: var(--color-primary-dark); font-size: var(--fs-xs);">${store.esc(r.id)}</strong>
          </td>
          <td style="font-size: var(--fs-xs); font-family: var(--font-mono); color: var(--color-text-muted);">
            ${store.formateaFecha(r.fecha)}
          </td>
          <td>
            <a href="detalle-reporte.html?id=${r.idReporte}" style="font-family: var(--font-mono); font-weight: 600; text-decoration: none; color: var(--color-primary);">
              ${r.idReporte} ↗
            </a>
          </td>
          <td style="font-size: var(--fs-xs);">${tipo}</td>
          <td style="font-family: var(--font-mono); font-size: var(--fs-xs); font-weight: 600;">
            ${r.volumenRecogidoM3.toFixed(1)} m³
          </td>
          <td style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--color-text-muted);">
            ${r.pesoEstimadoKg.toLocaleString()} kg
          </td>
          <td style="font-size: var(--fs-xs);">
            <strong>${r.idOperador}</strong>
            <div style="font-size: 11px; color: var(--color-text-muted);">${store.esc(r.vehiculo)}</div>
          </td>
          <td style="font-size: var(--fs-xs);">
            <span class="badge" style="background: #e8f5e9; color: #2e7d32; font-size: 11px;">
              ${dest ? dest.nombre : r.idDestino}
            </span>
          </td>
        </tr>
      `;
        }).join("");
    }
    selOp === null || selOp === void 0 ? void 0 : selOp.addEventListener("change", renderTabla);
    selDest === null || selDest === void 0 ? void 0 : selDest.addEventListener("change", renderTabla);
    inpSearch === null || inpSearch === void 0 ? void 0 : inpSearch.addEventListener("input", renderTabla);
    renderTabla();
});

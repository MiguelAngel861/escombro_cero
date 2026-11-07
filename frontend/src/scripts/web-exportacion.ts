import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_TIPO, ETIQUETAS_ESTADO, type Reporte } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  initWebShell("exportacion", "Exportación de Datos Institucionales");

  const reportes = store.losReportes();
  const recolecciones = store.lasRecolecciones();
  const tbody = document.getElementById("tabla-exportacion-body");
  const btnExportar = document.getElementById("btn-exportar-csv");
  const selFormato = document.getElementById("select-formato") as HTMLSelectElement | null;

  // Llenar tabla de 10 columnas
  if (tbody) {
    tbody.innerHTML = reportes.map((r: Reporte) => {
      const rec = recolecciones.find((c) => c.idReporte === r.id);
      const fechaRec = rec ? store.formateaFecha(rec.fecha) : "--";
      const destinoFinal = rec?.idDestino ?? r.idDestino ?? "--";
      const operadorAsignado = r.idOperadorAsignado ?? rec?.idOperador ?? "--";

      return `
        <tr>
          <td><strong style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--color-primary-dark);">${r.id}</strong></td>
          <td style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted);">${store.formateaFecha(r.fechaCreacion)}</td>
          <td style="font-family: var(--font-mono); font-size: 11px;">12.132, -86.250</td>
          <td style="font-size: var(--fs-xs); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${store.esc(r.ubicacion)}">${store.esc(r.ubicacion)}</td>
          <td style="font-size: var(--fs-xs);">${ETIQUETAS_TIPO[r.tipo]}</td>
          <td style="font-family: var(--font-mono); font-size: var(--fs-xs); font-weight: 600;">${r.volumenM3.toFixed(1)}</td>
          <td><span class="badge badge--${r.estado}" style="font-size: 10px;">${ETIQUETAS_ESTADO[r.estado]}</span></td>
          <td style="font-family: var(--font-mono); font-size: var(--fs-xs);">${operadorAsignado}</td>
          <td style="font-family: var(--font-mono); font-size: var(--fs-xs);">${destinoFinal}</td>
          <td style="font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted);">${fechaRec}</td>
        </tr>
      `;
    }).join("");
  }

  // Generar CSV simulado para el modal
  function generarTextoCSV(): string {
    const cabeceras = [
      "ID_Reporte",
      "Fecha_Hora_Creacion",
      "Latitud",
      "Longitud",
      "Direccion_Referencia",
      "Tipo_Escombro",
      "Volumen_M3",
      "Estado_Actual",
      "Operador_Asignado",
      "Destino_Final",
      "Fecha_Recoleccion"
    ].join(",");

    const filas = reportes.map((r) => {
      const rec = recolecciones.find((c) => c.idReporte === r.id);
      return [
        r.id,
        `"${r.fechaCreacion}"`,
        "12.1320",
        "-86.2500",
        `"${r.ubicacion}"`,
        `"${ETIQUETAS_TIPO[r.tipo]}"`,
        r.volumenM3,
        r.estado,
        `"${r.idOperadorAsignado ?? rec?.idOperador ?? ''}"`,
        `"${rec?.idDestino ?? r.idDestino ?? ''}"`,
        `"${rec?.fecha ?? ''}"`
      ].join(",");
    });

    return [cabeceras, ...filas].join("\n");
  }

  // Manejar clic en "Descargar CSV (Simulado)"
  btnExportar?.addEventListener("click", () => {
    const formato = selFormato?.value ?? "CSV";
    const modalRoot = document.getElementById("modal-root");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");
    if (!modalRoot || !modalBody || !modalTitle) return;

    const csvContent = generarTextoCSV();

    modalTitle.textContent = `Generación de Archivo (${formato}) — Simulación`;
    modalBody.innerHTML = `
      <div style="background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent); padding: var(--sp-3); border-radius: var(--radius-sm); font-size: var(--fs-xs); color: var(--color-primary-dark); margin-bottom: var(--sp-3);">
        ℹ Archivo generado en memoria para fines de demostración institucional (SPEC-W08). Contiene ${reportes.length} registros y las 10 columnas reglamentarias del PRD §6.2.
      </div>

      <div class="field">
        <label for="csv-preview">Vista Previa de la Exportación</label>
        <textarea id="csv-preview" class="field-input" rows="8" readonly style="font-family: var(--font-mono); font-size: 11px; white-space: pre; background: var(--color-bg);">${csvContent}</textarea>
      </div>
    `;

    if (modalFooter) {
      modalFooter.innerHTML = `
        <button type="button" class="btn btn--outline" id="btn-cerrar-exp">Cerrar</button>
        <button type="button" class="btn btn--primary" id="btn-copiar-csv">Copiar al portapapeles</button>
      `;
    }

    modalRoot.removeAttribute("hidden");

    document.getElementById("btn-cerrar-exp")?.addEventListener("click", () => {
      modalRoot.setAttribute("hidden", "true");
    });

    document.getElementById("btn-copiar-csv")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(csvContent);
      const btn = document.getElementById("btn-copiar-csv");
      if (btn) btn.textContent = "✓ ¡Copiado con éxito!";
      setTimeout(() => {
        if (btn) btn.textContent = "Copiar al portapapeles";
      }, 2000);
    });
  });
});

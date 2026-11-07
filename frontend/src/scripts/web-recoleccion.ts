import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_TIPO, type Reporte, type Destino, type Recoleccion } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const preId = params.get("id");

  const sesion = initWebShell("recoleccion", "Registro Oficial de Recolección");
  
  const reportes = store.losReportes();
  const destinos = store.losDestinos();

  // Reportes elegibles para recolección (priorizar programados y en_revision)
  const reportesElegibles = reportes.filter((r) => r.estado === "programado" || r.estado === "en_revision" || r.id === preId);

  const selReporte = document.getElementById("select-reporte") as HTMLSelectElement | null;
  const selDestino = document.getElementById("select-destino") as HTMLSelectElement | null;
  const inpVolumen = document.getElementById("volumen-recogido") as HTMLInputElement | null;
  const inpPeso = document.getElementById("peso-estimado") as HTMLInputElement | null;
  const inpFecha = document.getElementById("fecha-recoleccion") as HTMLInputElement | null;
  const inpOperador = document.getElementById("operador-nombre") as HTMLInputElement | null;
  const inpVehiculo = document.getElementById("vehiculo-placa") as HTMLInputElement | null;
  const form = document.getElementById("form-recoleccion") as HTMLFormElement | null;

  // Llenar select de destinos
  if (selDestino) {
    selDestino.innerHTML = destinos.map((d: Destino) => `
      <option value="${d.id}">
        ${d.nombre} (${d.id}) — Capacidad libre: ${(d.capacidadM3 - d.ocupacionM3).toLocaleString()} m³
      </option>
    `).join("");
  }

  // Llenar select de reportes
  if (selReporte) {
    if (reportesElegibles.length === 0) {
      selReporte.innerHTML = `<option value="">No hay reportes programados pendientes de recolección</option>`;
    } else {
      selReporte.innerHTML = reportesElegibles.map((r: Reporte) => `
        <option value="${r.id}" ${r.id === preId ? 'selected' : ''}>
          ${r.id} · ${ETIQUETAS_TIPO[r.tipo]} · ${r.volumenM3} m³ · ${r.ubicacion} (${r.estado})
        </option>
      `).join("");
    }
  }

  // Establecer fecha por defecto (ahora mismo)
  if (inpFecha) {
    const ahora = new Date();
    const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    inpFecha.value = isoLocal;
  }

  // Establecer datos de sesión del operador
  if (inpOperador) {
    inpOperador.value = `${sesion.nombre} (${sesion.idUsuario})`;
  }
  if (inpVehiculo) {
    inpVehiculo.value = sesion.vehiculo ?? "Camión Liviano (3T) - M-14280";
  }

  // Manejar cambio de reporte seleccionado para pre-cargar datos
  function actualizarFichaReporte(): void {
    const repId = selReporte?.value;
    const r = reportes.find((item) => item.id === repId);
    const cardInfo = document.getElementById("info-reporte-seleccionado");
    
    if (r) {
      if (inpVolumen && !inpVolumen.value) {
        inpVolumen.value = r.volumenM3.toString();
        if (inpPeso) inpPeso.value = Math.round(r.volumenM3 * 1350).toString();
      }
      if (cardInfo) {
        cardInfo.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--sp-3); font-size: var(--fs-xs);">
            <div><strong>ID Reporte:</strong> <span style="font-family: var(--font-mono);">${r.id}</span></div>
            <div><strong>Tipo declarado:</strong> ${ETIQUETAS_TIPO[r.tipo]}</div>
            <div><strong>Volumen declarado:</strong> <span style="font-family: var(--font-mono);">${r.volumenM3} m³</span></div>
            <div><strong>Dirección:</strong> ${store.esc(r.ubicacion)}</div>
          </div>
        `;
        cardInfo.style.display = "block";
      }
    } else if (cardInfo) {
      cardInfo.style.display = "none";
    }
  }

  selReporte?.addEventListener("change", () => {
    if (inpVolumen) inpVolumen.value = "";
    actualizarFichaReporte();
  });

  actualizarFichaReporte();

  // Calcular peso estimado automáticamente al cambiar volumen
  inpVolumen?.addEventListener("input", () => {
    const vol = parseFloat(inpVolumen.value);
    if (!isNaN(vol) && inpPeso) {
      inpPeso.value = Math.round(vol * 1350).toString();
    }
  });

  // Manejar envío del formulario
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const repId = selReporte?.value;
    if (!repId) {
      alert("Por favor selecciona un reporte para registrar su recolección.");
      return;
    }

    const r = store.unReporte(repId);
    if (!r) return;

    const volRecogido = parseFloat(inpVolumen?.value ?? "0");
    const pesoKg = parseFloat(inpPeso?.value ?? "0");
    const destinoId = selDestino?.value ?? "DE-01";
    const fechaHora = inpFecha?.value ?? new Date().toISOString().slice(0, 16);
    const vehiculo = inpVehiculo?.value ?? "Camión Liviano (3T)";

    // REGLA RB-06: Si el volumen recogido > reportado, exige justificación (mín 20 caracteres)
    if (volRecogido > r.volumenM3) {
      solicitarJustificacionDiscrepancia(r, volRecogido, (justificacion) => {
        completarRecoleccion({
          reporte: r,
          volRecogido,
          pesoKg,
          destinoId,
          fechaHora,
          vehiculo,
          idOperador: sesion.idUsuario,
          justificacion
        });
      });
      return;
    }

    completarRecoleccion({
      reporte: r,
      volRecogido,
      pesoKg,
      destinoId,
      fechaHora,
      vehiculo,
      idOperador: sesion.idUsuario
    });
  });
});

interface DatosRecoleccion {
  reporte: Reporte;
  volRecogido: number;
  pesoKg: number;
  destinoId: string;
  fechaHora: string;
  vehiculo: string;
  idOperador: string;
  justificacion?: string;
}

function completarRecoleccion(datos: DatosRecoleccion): void {
  const recs = store.lasRecolecciones();
  const nuevoId = `REC-${String(recs.length + 1).padStart(3, "0")}`;

  const nuevaRec: Recoleccion = {
    id: nuevoId,
    idReporte: datos.reporte.id,
    fecha: datos.fechaHora,
    idOperador: datos.idOperador,
    volumenRecogidoM3: datos.volRecogido,
    pesoEstimadoKg: datos.pesoKg,
    idDestino: datos.destinoId,
    vehiculo: datos.vehiculo,
    justificacion: datos.justificacion
  };

  // Guardar en recolecciones
  store.agregarRecoleccion(nuevaRec);

  // Actualizar reporte a recolectado
  store.actualizarReporte(datos.reporte.id, (prev) => ({
    ...prev,
    estado: "recolectado",
    idDestino: datos.destinoId,
    volumenM3: datos.volRecogido, // actualiza al volumen real verificado en campo
    historial: [...prev.historial, { estado: "recolectado", fecha: datos.fechaHora }]
  }));

  // Actualizar ocupación en destino seleccionado
  const destinos = store.losDestinos();
  const dIndex = destinos.findIndex((d) => d.id === datos.destinoId);
  if (dIndex !== -1) {
    destinos[dIndex].ocupacionM3 = Math.min(
      destinos[dIndex].capacidadM3,
      destinos[dIndex].ocupacionM3 + datos.volRecogido
    );
    store.guardarDestinos(destinos);
  }

  // Notificación de éxito
  const modalRoot = document.getElementById("modal-root");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalFooter = document.getElementById("modal-footer");
  if (!modalRoot || !modalBody || !modalTitle) return;

  modalTitle.textContent = "Recolección Registrada con Éxito";
  modalBody.innerHTML = `
    <div style="text-align: center; padding: var(--sp-4);">
      <div style="font-size: 48px; color: var(--color-primary); line-height: 1;">✓</div>
      <h3 style="margin: var(--sp-2) 0; font-size: var(--fs-lg);">Código de Registro: ${nuevoId}</h3>
      <p style="font-size: var(--fs-sm); color: var(--color-text-muted); margin-bottom: var(--sp-4);">
        El reporte <strong>${datos.reporte.id}</strong> ha sido marcado como <strong>Recolectado</strong> y transferido al destino autorizado con trazabilidad completa.
      </p>
      <div style="background: var(--color-bg); padding: var(--sp-3); border-radius: var(--radius-sm); font-size: var(--fs-xs); display: grid; gap: var(--sp-1); text-align: left;">
        <div><strong>Volumen cargado:</strong> ${datos.volRecogido} m³ (${datos.pesoKg.toLocaleString()} kg)</div>
        <div><strong>Destino:</strong> ${datos.destinoId}</div>
        <div><strong>Operador:</strong> ${datos.idOperador} · ${datos.vehiculo}</div>
        ${datos.justificacion ? `<div><strong>Discrepancia:</strong> ${store.esc(datos.justificacion)}</div>` : ""}
      </div>
    </div>
  `;

  if (modalFooter) {
    modalFooter.innerHTML = `
      <a href="tablero.html" class="btn btn--outline">Ir al Tablero</a>
      <a href="historial.html" class="btn btn--primary">Ver en Historial</a>
    `;
  }

  modalRoot.removeAttribute("hidden");
}

function solicitarJustificacionDiscrepancia(
  r: Reporte,
  volReal: number,
  onConfirm: (justificacion: string) => void
): void {
  const modalRoot = document.getElementById("modal-root");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalFooter = document.getElementById("modal-footer");
  if (!modalRoot || !modalBody || !modalTitle) return;

  modalTitle.textContent = "Validación RB-06: Discrepancia de Volumen";
  modalBody.innerHTML = `
    <div style="background: #fff3e0; border: 1px solid #ffe0b2; padding: var(--sp-3); border-radius: var(--radius-sm); font-size: var(--fs-xs); color: #b76e00; margin-bottom: var(--sp-3);">
      ⚠ El volumen recogido (<strong>${volReal} m³</strong>) excede el volumen declarado originalmente por el ciudadano (<strong>${r.volumenM3} m³</strong>). La regla institucional RB-06 exige justificación técnica escrita de mínimo 20 caracteres.
    </div>

    <div class="field">
      <label for="justificacion-discrepancia">Causa del exceso de volumen en campo (≥ 20 caracteres)</label>
      <textarea id="justificacion-discrepancia" class="field-input" rows="3" placeholder="Ej. Se encontraron escombros subterráneos no visibles en la foto inicial..." required minlength="20"></textarea>
      <span id="disc-count" style="font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); text-align: right;">0 / 20 caracteres</span>
    </div>
  `;

  if (modalFooter) {
    modalFooter.innerHTML = `
      <button type="button" class="btn btn--outline" id="btn-cancel-disc">Cancelar</button>
      <button type="button" class="btn btn--primary" id="btn-confirm-disc" disabled>Confirmar Justificación</button>
    `;
  }

  modalRoot.removeAttribute("hidden");

  const txt = document.getElementById("justificacion-discrepancia") as HTMLTextAreaElement | null;
  const count = document.getElementById("disc-count");
  const btn = document.getElementById("btn-confirm-disc") as HTMLButtonElement | null;

  txt?.addEventListener("input", () => {
    const len = txt.value.trim().length;
    if (count) count.textContent = `${len} / 20 caracteres`;
    if (btn) btn.disabled = len < 20;
  });

  document.getElementById("btn-cancel-disc")?.addEventListener("click", () => {
    modalRoot.setAttribute("hidden", "true");
  });

  btn?.addEventListener("click", () => {
    const val = txt?.value.trim() ?? "";
    if (val.length >= 20) {
      modalRoot.setAttribute("hidden", "true");
      onConfirm(val);
    }
  });
}

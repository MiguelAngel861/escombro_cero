/**
 * detalle-reporte.ts — APP-V08 (SPEC-A05).
 * Foto, mini-mapa, todos los campos, timeline de estados, banner de novedad,
 * motivo + botón "Corregir y reenviar" (modo edición APP-V05) si rechazado.
 */
import { ESTADOS_REPORTE, ETIQUETAS_ESTADO, ETIQUETAS_TIPO, MOTIVO_TEXTO, type EstadoReporte } from "./data.js";
import { unReporte, laSesion, formateaFecha, guardarReportes, esc } from "./store.js";

if (!laSesion()) location.href = "login.html";

const canvas = document.querySelector<HTMLElement>("#canvas")!;
const id = new URLSearchParams(location.search).get("id") ?? "R-001";
const r = unReporte(id);

if (!r) {
  canvas.innerHTML = `<div class="card"><p>El reporte no existe en la demo (id=${esc(id)}).</p>
  <a class="btn btn--full" href="mis-reportes.html">Volver</a></div>`;
} else {
  const idxActual = ESTADOS_REPORTE.indexOf(r.estado);
  const timeline = ESTADOS_REPORTE.slice(0, idxActual + 1).map((est, i) => {
    const cm = [...r.historial].reverse().find((h) => h.estado === est);
    return `<div class="tstep done"><span class="dot"></span><span class="lbl">${ETIQUETAS_ESTADO[est]}${i === idxActual ? " (ahora)" : ""}</span><time>${cm ? formateaFecha(cm.fecha) : "—"}</time></div>`;
  }).join("");
  const futuros = ESTADOS_REPORTE.slice(idxActual + 1).map((est) =>
    `<div class="tstep"><span class="dot"></span><span class="lbl" style="color:var(--color-text-muted)">${ETIQUETAS_ESTADO[est]}</span><time>—</time></div>`
  ).join("");

  const banner = detectaNoticia(r.estado)
    ? `<div class="banner-cambios"><span aria-hidden="true">●</span>Tu reporte cambió de estado: revisa la línea de tiempo (CU-04, demo).</div>`
    : "";

  const rechazo = r.estado === "rechazado"
    ? `<div class="motivo-box"><b>Motivo del rechazo</b><span>${MOTIVO_TEXTO[r.motivoRechazo ?? "otro"]} (demo CU-05).</span></div>
       <a class="btn btn--primary btn--full" href="nuevo-reporte.html?id=${r.id}&mode=edit">Corregir y reenviar</a>`
    : "";

  canvas.innerHTML = `
    <div class="header">
      <span class="card-id">${r.id} · ${formateaFecha(r.fechaCreacion)}</span>
      <h1>${ETIQUETAS_TIPO[r.tipo]}</h1>
      <span class="badge badge--${r.estado.replace("_", "-")}"><i class="pin"></i>${ETIQUETAS_ESTADO[r.estado]}</span>
    </div>
    ${banner}
    <img class="mini-map" style="aspect-ratio:2/1;object-fit:cover;" src="assets/fotos/tipo-${r.tipo}.svg" alt="Foto del escombro ${r.id} (placeholder demo)">
    <svg class="mini-map" viewBox="0 0 340 120" aria-label="Mini-mapa del reporte">
      <rect width="340" height="120" fill="var(--color-bg)"/>
      <polygon points="40,20 320,15 330,90 200,110 60,95" fill="var(--state-recolectado-bg)" stroke="var(--color-primary)" stroke-width="2"/>
      <circle cx="150" cy="60" r="9" fill="var(--state-${r.estado.replace("_", "-")})" stroke="#fff" stroke-width="3"/>
      <text x="150" y="40" font-size="10" text-anchor="middle" font-family="var(--font-mono)" fill="var(--color-text-muted)">${esc(r.ubicacion)}</text>
    </svg>
    <div class="facts">
      <div class="fact"><small>Volumen</small><b>${r.volumenM3.toFixed(1)} m³</b></div>
      <div class="fact"><small>Tipo</small><b>${ETIQUETAS_TIPO[r.tipo]}</b></div>
      <div class="fact"><small>Ubicación</small><b>${esc(r.ubicacion)}</b></div>
      <div class="fact"><small>Zona</small><b>${r.dentroZona ? "Dentro de zona ✓" : "Fuera de zona ✗"}</b></div>
    </div>
    ${r.descripcion ? `<p style="margin:0;font-size:var(--fs-sm);color:var(--color-text-muted);">${esc(r.descripcion)}</p>` : ""}
    <div>
      <label class="fieldset-label" style="display:block;font-weight:500;font-size:var(--fs-sm);margin-bottom:var(--sp-2);">Línea de tiempo</label>
      <div class="timeline">${timeline}${futuros}</div>
    </div>
    ${rechazo}`;
}

/** CU-04 demo: cambia si el último estado difiere del último visto en la vista. */
function detectaNoticia(estado: EstadoReporte): boolean {
  try {
    const visto = JSON.parse(localStorage.getItem("cnsv1:visto-detalle") ?? '""') as string;
    localStorage.setItem("cnsv1:visto-detalle", JSON.stringify(estado));
    return visto !== estado && visto !== "";
  } catch {
    return false;
  }
}

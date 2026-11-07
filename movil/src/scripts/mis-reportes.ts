/**
 * mis-reportes.ts — APP-V07 (SPEC-A04 · TAC-APP-07).
 * Tarjetas con ID, fecha, tipo, volumen m³, ubicación corta y status-badge;
 * chips de filtro por estado; los 6 estados cubiertos por el dataset demo.
 */
import { ESTADOS_REPORTE, ETIQUETAS_ESTADO, ETIQUETAS_TIPO, MOTIVO_TEXTO, type EstadoReporte } from "./data.js";
import { losReportes, laSesion, formateaFecha, K, guardar } from "./store.js";

if (!laSesion()) location.href = "login.html";

const chipsWrap = document.querySelector<HTMLDivElement>("#chips-estado")!;
const list = document.querySelector<HTMLDivElement>("#lista-reportes")!;
const sub = document.querySelector<HTMLElement>("#count-sub")!;

let filtro: EstadoReporte | "todos" = "todos";

const chipHtml = (k: string, label: string, on: boolean) =>
  `<button class="chip${on ? " chip--on" : ""}" data-estado="${k}" role="tab" aria-selected="${on}">${label}</button>`;

chipsWrap.innerHTML =
  chipHtml("todos", "Todos", true) +
  ESTADOS_REPORTE.map((e) => chipHtml(e, ETIQUETAS_ESTADO[e], false)).join("");

function tarjeta(r: (typeof REPORTES)[number]): string {
  const alert = r.id === "R-007" ? ` <span class="badge badge--alert-warning"><i class="pin"></i>duplicado</span>` : "";
  const motivo = r.estado === "rechazado" && r.motivoRechazo ? ` · motivo: ${MOTIVO_TEXTO[r.motivoRechazo]}` : "";
  return `
  <a class="card card--tapp" href="detalle-reporte.html?id=${r.id}">
    <div class="card-row">
      <span class="card-id">${r.id}</span>
      <div style="display:inline-flex;gap:var(--sp-2);align-items:center;">
        <span class="badge badge--${r.estado.replace("_", "-")}">
          <i class="pin"></i>${ETIQUETAS_ESTADO[r.estado]}
        </span>
        ${alert}
      </div>
    </div>
    <div class="card-row">
      <strong class="card-title">${ETIQUETAS_TIPO[r.tipo]}</strong>
      <span class="card-id">${r.volumenM3.toFixed(1)} m³</span>
    </div>
    <div class="card-meta"><span>${r.ubicacion}</span><span>${formateaFecha(r.fechaCreacion)}</span>${motivo ? `<span class="badge badge--rechazado"><i class="pin"></i>${MOTIVO_TEXTO[r.motivoRechazo ?? "otro"]}</span>` : ""}</div>
  </a>`;
}

const REPORTES = losReportes().filter((r) => r.idCiudadano === "US-01");

function render(): void {
  const visibles = filtro === "todos" ? REPORTES : REPORTES.filter((r) => r.estado === filtro);
  list.innerHTML = visibles.map(tarjeta).join("");
  sub.textContent =
    visibles.length === 0
      ? "Sin reportes con este filtro (demo)."
      : `${visibles.length} reporte${visibles.length === 1 ? "" : "s"} — toca una tarjeta para ver el detalle.`;
}

chipsWrap.addEventListener("click", (e) => {
  const chip = (e.target as HTMLElement).closest(".chip");
  if (!chip) return;
  filtro = chip.getAttribute("data-estado") as EstadoReporte | "todos";
  chipsWrap.querySelectorAll(".chip").forEach((c) =>
    c.classList.toggle("chip--on", c === chip)
  );
  render();
});

// CU-04 demo: notificación no leída cuando el estado cambió desde la última visita del chip nav
function leeTicket(): string | null {
  const v = localStorage.getItem("cnsv1:visto-reportes");
  return v ? (JSON.parse(v) as { ultimoEstado: string }).ultimoEstado : null;
}
const visto = leeTicket();
const hayNoticia = REPORTES.some((r) => {
  const tip = r.historial[r.historial.length - 1]?.estado;
  return tip && tip !== visto;
});
if (hayNoticia) {
  const nav = document.querySelector('.bottom-nav a[href="mis-reportes.html"]');
  const dot = document.createElement("i");
  dot.style.cssText =
    "position:relative;top:-3px;margin-left:4px;width:8px;height:8px;border-radius:50%;display:inline-block;background:var(--state-en-revision);";
  dot.setAttribute("aria-label", "novedad sin leer");
  nav?.appendChild(dot);
  const t = document.querySelector("#toast")!;
  t.textContent = "Actualización en tus reportes";
  t.classList.add("toast--on");
  setTimeout(() => t.classList.remove("toast--on"), 2400);
  guardar("cnsv1:visto-reportes", { ultimoEstado: REPORTES[REPORTES.length - 1].historial.slice(-1)[0]?.estado ?? "" });
}

render();

/**
 * mapa.ts — APP-V10 (SPEC-A06): SVG estático con pines por reporte propio
 * y leyenda de colores por estado. El pin activo (hover/tap) agranda y
 * resalta su tarjeta; misma lógica data-id que la答应了.
 */
import { ESTADOS_REPORTE, ETIQUETAS_ESTADO, ETIQUETAS_TIPO, type EstadoReporte } from "./data.js";
import { losReportes, laSesion, formateaFecha, esc } from "./store.js";

if (!laSesion()) location.href = "login.html";

const layer = document.querySelector<SVGGElement>("#layer-pines")!;
const leyenda = document.querySelector<HTMLElement>("#leyenda")!;
const lista = document.querySelector<HTMLElement>("#lista-pines")!;
const sub = document.querySelector("#map-sub")!;

const REPORTES = losReportes().filter((r) => r.idCiudadano === "US-01");

// posición demo del pin dentro del polígono (hash estable por id)
function posDe(id: string): { x: number; y: number } {
  let h = 0;
  for (const c of id) h = (h * 131 + c.charCodeAt(0)) % 2009;
  return { x: 84 + ((h * 37) % 190), y: 48 + ((h * 71) % 112) };
}

const colorDe = (e: EstadoReporte): string => `var(--state-${e.replace("_", "-")})`;

// pines (data-id para interacción con tarjetas)
layer.innerHTML = REPORTES.map((r) => {
  const { x, y } = posDe(r.id);
  return `<g class="pin-map" data-id="${r.id}" style="cursor:pointer;">
    <circle cx="${x}" cy="${y}" r="7" fill="${colorDe(r.estado)}" stroke="var(--color-surface)" stroke-width="2.5">
      <title>${r.id} · ${ETIQUETAS_TIPO[r.tipo]} · ${r.volumenM3} m³</title>
    </circle>
    <circle cx="${x}" cy="${y}" r="2.2" fill="var(--color-surface)"/>
  </g>`;
}).join("");

// leyenda de colores por estado
leyenda.innerHTML = ESTADOS_REPORTE.filter((e) => REPORTES.some((r) => r.estado === e))
  .map((e) => `<span><i style="background:${colorDe(e)}"></i>${ETIQUETAS_ESTADO[e]}</span>`)
  .join("");

// tarjetas de reporte conectadas a los pines (hover resalta pin)
lista.innerHTML = REPORTES.map((r) => {
  const { x, y } = posDe(r.id);
  return `
  <a class="card card--tapp" href="detalle-reporte.html?id=${r.id}" data-id="${r.id}">
    <div class="card-row">
      <span class="card-id">${r.id}</span>
      <span class="badge badge--${r.estado.replace("_", "-")}"><i class="pin"></i>${ETIQUETAS_ESTADO[r.estado]}</span>
    </div>
    <div class="card-meta"><span>${ETIQUETAS_TIPO[r.tipo]} · ${r.volumenM3} m³</span><span>${esc(r.ubicacion)} · ${formateaFecha(r.fechaCreacion)}</span></div>
  </a>`;
}).join("");

// interacción de crema sincronizado pin ↔ tarjeta (hover/tap)
function setPin(id: string, on: boolean): void {
  const g = layer.querySelector<SVGGElement>(`.pin-map[data-id="${id}"]`);
  g?.setAttribute("transform", on ? `translate(${posDe(id).x},${posDe(id).y}) scale(1.25) translate(${-posDe(id).x},${-posDe(id).y})` : "");
  g?.setAttribute("opacity", on ? "1" : ".95");
}
lista.querySelectorAll("[data-id]").forEach((el) => {
  const id = el.getAttribute("data-id")!;
  el.addEventListener("pointerenter", () => setPin(id, true));
  el.addEventListener("pointerleave", () => setPin(id, false));
  el.addEventListener("focus", () => setPin(id, true));
  el.addEventListener("blur", () => setPin(id, false));
});
layer.querySelectorAll("g.pin-map").forEach((g) => {
  const id = g.getAttribute("data-id")!;
  g.addEventListener("pointerenter", () => setPin(id, true));
  g.addEventListener("pointerleave", () => setPin(id, false));
  g.addEventListener("click", () => (location.href = `detalle-reporte.html?id=${id}`));
});

sub.textContent = `${REPORTES.length} reportes propios — toca un pin o su tarjeta.`;

/**
 * validacion-zona.ts — APP-V06 pantalla demo dedicada (SPEC-A03).
 * Alterna escenario dentro/fuera: mueve el punto GPS dentro/fuera del polígono
 * y muestra el banner verde/rojo con el mensaje correspondiente.
 */
const tabDentro = document.querySelector<HTMLButtonElement>("#tab-dentro")!;
const tabFuera = document.querySelector<HTMLButtonElement>("#tab-fuera")!;
const dot = document.querySelector<SVGCircleElement>("#gps-dot")!;
const outer = document.querySelector<SVGCircleElement>("#gps-outer")!;
const poly = document.querySelector<SVGPolygonElement>("#poligono")!;
const result = document.querySelector<HTMLDivElement>("#zona-result")!;

function escenario(ok: boolean): void {
  const x = ok ? 165 : 320;
  dot.setAttribute("cx", String(x));
  outer.setAttribute("cx", String(x));
  dot.setAttribute("fill", ok ? "var(--color-primary)" : "var(--state-rechazado)");
  outer.setAttribute("fill", ok ? "var(--color-primary)" : "var(--state-rechazado)");
  poly.setAttribute("fill", ok ? "var(--state-recolectado-bg)" : "var(--state-rechazado-bg)");
  poly.setAttribute("stroke", ok ? "var(--color-primary)" : "var(--state-rechazado)");

  tabDentro.classList.toggle("chip--on", ok);
  tabFuera.classList.toggle("chip--on", !ok);
  tabDentro.setAttribute("aria-selected", String(ok));
  tabFuera.setAttribute("aria-selected", String(!ok));

  result.classList.toggle("result--ok", ok);
  result.classList.toggle("result--bad", !ok);
  result.innerHTML = ok
    ? `<b>Dentro de zona ✓</b><p>El reporte se enviará a la fila <em>pendiente</em> del tablero del operador. GPS y timestamp adjuntos a la foto.</p>`
    : `<b>Fuera de zona ✗</b><p>El reporte se rechazaría con motivo <em>fuera de zona</em> (RB-01, demo). Podrías corregirlo y reenviarlo desde el punto correcto.</p>`;
}

tabDentro.addEventListener("click", () => escenario(true));
tabFuera.addEventListener("click", () => escenario(false));
escenario(true);

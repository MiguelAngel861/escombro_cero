/**
 * catalogo-adoquines.ts — APP-V11: catálogo de adoquines reciclados.
 * Solo producto: Adoquín Trebol (ADO-01). Renderiza una tarjeta que abre detalle-adoquin.html.
 * SPEC-V01, TAC-VENTA-01.
 */
import { ensureSeed, losAdoquines } from "./store.js";
import { ETIQUETADOS_ADOQUIN } from "./data.js";
ensureSeed();
const grid = document.querySelector("#grid-adoquines");
const adoquines = losAdoquines();
if (grid && adoquines.length) {
    grid.innerHTML = adoquines.map((a) => {
        const etiqueta = ETIQUETADOS_ADOQUIN[a.tipo];
        const stockBajo = a.stockSimulado <= 50 ? " stock--bajo" : "";
        return `
      <a class="card card-ado card--tapp" href="detalle-adoquin.html?id=${a.id}">
        <div class="img-wrap">
          <img src="${a.imagenUrl}" alt="${etiqueta}" width="200" height="200" loading="lazy">
        </div>
        <span class="badge-tipo">${etiqueta}</span>
        <h2 class="nombre">${a.nombre}</h2>
        <p class="desc">${a.descripcion}</p>
        <div class="precio">${a.precioUnitario.toFixed(2)}<span>C$ c/u (simulado)</span></div>
        <span class="stock${stockBajo}">Stock simulado: ${a.stockSimulado} disponibles</span>
        <div class="acciones">
          <button class="btn btn--primary btn--full" type="button">Ver detalle</button>
        </div>
      </a>
    `;
    }).join("");
}

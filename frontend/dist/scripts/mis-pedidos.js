/**
 * mis-pedidos.ts — APP-V15: lista de pedidos del usuario (demo, solo Adoquín Trebol).
 * Lee cnsv1:pedidos de localStorage y renderiza tarjetas con número, fecha, estado y subtotal.
 * SPEC-V05, TAC-VENTA-05.
 */
import { ensureSeed, losPedidosDe, formateaFecha, esc } from "./store.js";
ensureSeed();
const lista = document.querySelector("#lista-pedidos");
const vacioEl = document.querySelector("#vacío");
const pedidos = losPedidosDe("US-01");
if (pedidos.length === 0) {
    if (vacioEl)
        vacioEl.classList.add("empty--on");
    if (lista)
        lista.innerHTML = "";
}
else {
    if (vacioEl)
        vacioEl.classList.remove("empty--on");
    if (lista) {
        lista.innerHTML = pedidos.map((p) => {
            const claseEstado = `badge--${p.estado.replace("_", "-")}`;
            const etiquetaEstado = p.estado.charAt(0).toUpperCase() + p.estado.slice(1).replace("_", " ");
            const itemsResumen = p.items.map((it) => `${it.idAdoquin} ×${it.cantidad}`).join(", ");
            return `
        <div class="card-pedido">
          <div class="head">
            <span class="id">${esc(p.id)}</span>
            <span class="fecha">${formateaFecha(p.fechaCreacion)}</span>
          </div>
          <p class="items">${esc(itemsResumen)}</p>
          <p class="subtotal">${p.subtotal.toFixed(2)}</p>
          <div class="actions">
            <span class="badge ${claseEstado}"><i class="pin"></i>${etiquetaEstado}</span>
            <a class="btn btn--surface btn--full" href="pedido-simulado.html?id=${esc(p.id)}" style="justify-content:center;">Ver detalle</a>
          </div>
        </div>
      `;
        }).join("");
    }
}

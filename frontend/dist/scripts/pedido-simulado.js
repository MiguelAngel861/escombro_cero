/**
 * pedido-simulado.ts — APP-V14: confirmación de pedido simulado (solo Adoquín Trebol).
 * Lee ?id= de la URL, busca el pedido en cnsv1:pedidos y muestra resumen, número PED-### y mensaje de sin transacción real.
 * SPEC-V04, TAC-VENTA-04.
 */
import { ensureSeed, unPedido, esc } from "./store.js";
ensureSeed();
const params = new URLSearchParams(location.search);
const id = params.get("id");
const pedido = id ? unPedido(id) : null;
const numeroEl = document.querySelector("#numero-pedido");
const estadoEl = document.querySelector("#estado-pedido");
const listaEl = document.querySelector("#lista-items");
const totalEl = document.querySelector("#total-pedido");
if (!pedido) {
    if (numeroEl)
        numeroEl.textContent = "Pedido no encontrado";
    if (estadoEl)
        estadoEl.textContent = "—";
}
else {
    if (numeroEl) {
        numeroEl.innerHTML = `${pedido.id}<span>Número de pedido</span>`;
    }
    if (estadoEl) {
        const clase = `badge--${pedido.estado.replace("_", "-")}`;
        estadoEl.innerHTML = `<i class="pin"></i>${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}`;
        estadoEl.className = `estado-pedido ${clase}`;
    }
    if (listaEl && pedido.items.length) {
        listaEl.innerHTML = pedido.items.map((it) => `
      <div class="resumen-item">
        <span class="nombre">${esc(it.idAdoquin)} ×${it.cantidad}</span>
        <span class="cant">${it.cantidad}</span>
        <span class="sub">${it.subtotal.toFixed(2)}</span>
      </div>
    `).join("");
    }
    if (totalEl) {
        totalEl.innerHTML = `${pedido.subtotal.toFixed(2)}<span>`;
    }
}

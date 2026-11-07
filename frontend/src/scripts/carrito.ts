/**
 * carrito.ts — APP-V13: carrito de compras simulado (solo Adoquín Trebol).
 * Lee cnsv1:carrito de localStorage y renderiza ítems. Botón Pagar (simulado) sin cobro real.
 * SPEC-V03, TAC-VENTA-03.
 */
import { ensureSeed, esc } from "./store.js";

ensureSeed();

const lista = document.querySelector("#lista-items");
const vacioEl = document.querySelector("#vacio");
const subtotalEl = document.querySelector("#subtotal-total");
const totalEl = document.querySelector("#total-total");
const btnPagar = document.querySelector("#btn-pagar") as HTMLButtonElement;

let carrito = JSON.parse(localStorage.getItem("cnsv1:carrito") || "[]");

function calcularSubtotal(): number {
  return carrito.reduce((acc, it) => acc + it.subtotal, 0);
}

function render() {
  if (!lista) return;
  const subtotalTotal = calcularSubtotal();

  if (carrito.length === 0) {
    if (vacioEl) vacioEl.classList.add("empty--on");
    btnPagar.disabled = true;
    lista.innerHTML = "";
  } else {
    if (vacioEl) vacioEl.classList.remove("empty--on");
    lista.innerHTML = carrito.map((item, idx) => `
      <div class="item-card">
        <div class="img-wrap">
          <img src="/assets/adoquines/adoquin_trebol.jpeg" alt="${esc(item.nombre)}" width="56" height="56" loading="lazy">
        </div>
        <div class="info">
          <p class="nombre">${esc(item.nombre)}</p>
          <p class="precio">${item.precioUnitario.toFixed(2)}<span> c/u</span></p>
        </div>
        <div class="ctrl">
          <button type="button" data-idx="${idx}" data-accion="menos" aria-label="Disminuir ${esc(item.nombre)}">−</button>
          <span class="valor">${item.cantidad}</span>
          <button type="button" data-idx="${idx}" data-accion="mas" aria-label="Aumentar ${esc(item.nombre)}">+</button>
        </div>
        <p class="subtotal">${item.subtotal.toFixed(2)}</p>
      </div>
    `).join("");
    btnPagar.disabled = false;
  }

  if (subtotalEl) subtotalEl.innerHTML = `${subtotalTotal.toFixed(2)}<span>`;
  if (totalEl) totalEl.innerHTML = `${subtotalTotal.toFixed(2)}<span>`;
}

render();

lista?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest("button");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const accion = btn.dataset.accion;
  if (accion === "menos" && carrito[idx].cantidad > 1) {
    carrito[idx].cantidad--;
    carrito[idx].subtotal = carrito[idx].cantidad * carrito[idx].precioUnitario;
  } else if (accion === "mas") {
    carrito[idx].cantidad++;
    carrito[idx].subtotal = carrito[idx].cantidad * carrito[idx].precioUnitario;
  }
  localStorage.setItem("cnsv1:carrito", JSON.stringify(carrito));
  render();
});

if (btnPagar) {
  btnPagar.addEventListener("click", () => {
    const fecha = new Date().toISOString();
    const id = "PED-" + String(1000 + Math.floor(Math.random() * 9000));
    const pedido = {
      id,
      idCliente: "US-01",
      fechaCreacion: fecha,
      items: carrito.map((it) => ({
        idAdoquin: it.idAdoquin || "ADO-01",
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
      })),
      subtotal: calcularSubtotal(),
      estado: "pagado",
      direccionEntrega: "Distrito 1 · Calle demo (demo)",
      metodoPago: "simulado",
      nota: "Pedido simulado — sin cobro real",
    };
    const pedidos = JSON.parse(localStorage.getItem("cnsv1:pedidos") || "[]");
    pedidos.unshift(pedido);
    localStorage.setItem("cnsv1:pedidos", JSON.stringify(pedidos));
    localStorage.setItem("cnsv1:carrito", "[]");

    const toast = document.querySelector("#toast");
    if (toast) {
      toast.textContent = `Pedido ${id} creado (simulado)`;
      toast.classList.add("toast--on");
      setTimeout(() => toast.classList.remove("toast--on"), 2200);
    }
    location.href = `pedido-simulado.html?id=${id}`;
  });
}

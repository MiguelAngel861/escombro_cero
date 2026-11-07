/**
 * detalle-adoquin.ts — APP-V12: detalle del Adoquín Trebol.
 * Lee ?id= de la URL (siempre ADO-01) y renderiza imagen, descripción, precio, cantidad y botón Agregar al carrito.
 * SPEC-V02, TAC-VENTA-02.
 */
import { ensureSeed, unAdoquin, esc } from "./store.js";

ensureSeed();

const params = new URLSearchParams(location.search);
const id = params.get("id");
const adoquin = id ? unAdoquin(id) : null;

const nombreEl = document.querySelector("#nombre-adoquin");
const tipoEl = document.querySelector("#tipo-badge");
const precioEl = document.querySelector("#precio-adoquin");
const stockEl = document.querySelector("#stock-adoquin");
const descEl = document.querySelector("#desc-adoquin");
const imgEl = document.querySelector("#img-adoquin") as HTMLImageElement;
const btnAgregar = document.querySelector("#btn-agregar") as HTMLButtonElement;
const btnMenos = document.querySelector("#btn-menos") as HTMLButtonElement;
const btnMas = document.querySelector("#btn-mas") as HTMLButtonElement;
const valorEl = document.querySelector("#valor-cantidad");
const subtotalEl = document.querySelector("#subtotal-adoquin");

let cantidad = 1;

if (!adoquin) {
  if (nombreEl) nombreEl.textContent = "Adoquín no encontrado";
  btnAgregar.disabled = true;
} else {
  if (nombreEl) nombreEl.textContent = adoquin.nombre;
  if (tipoEl) tipoEl.textContent = `Tipo: ${adoquin.tipo.charAt(0).toUpperCase() + adoquin.tipo.slice(1)}`;
  if (precioEl) precioEl.innerHTML = `${adoquin.precioUnitario.toFixed(2)}<span>C$ c/u (simulado)</span>`;
  if (stockEl) {
    const bajo = adoquin.stockSimulado <= 50 ? " stock--bajo" : "";
    stockEl.innerHTML = `Stock simulado: <span class="${bajo}">${adoquin.stockSimulado} disponibles</span>`;
  }
  if (descEl) descEl.textContent = adoquin.descripcion;
  if (imgEl) imgEl.src = adoquin.imagenUrl;
  if (imgEl) imgEl.alt = adoquin.nombre;
}

function actualizarSubtotal() {
  if (!adoquin) return;
  const sub = (adoquin.precioUnitario * cantidad).toFixed(2);
  if (valorEl) valorEl.textContent = String(cantidad);
  if (subtotalEl) subtotalEl.innerHTML = `Subtotal: ${sub}<span>`;
}

if (btnMenos) {
  btnMenos.addEventListener("click", () => {
    if (cantidad > 1) { cantidad--; actualizarSubtotal(); }
  });
}
if (btnMas) {
  btnMas.addEventListener("click", () => {
    cantidad++;
    actualizarSubtotal();
  });
}
if (btnAgregar && adoquin) {
  btnAgregar.addEventListener("click", () => {
    const carrito = JSON.parse(localStorage.getItem("cnsv1:carrito") || "[]");
    carrito.push({
      idAdoquin: adoquin.id,
      nombre: adoquin.nombre,
      cantidad,
      precioUnitario: adoquin.precioUnitario,
      subtotal: adoquin.precioUnitario * cantidad,
    });
    localStorage.setItem("cnsv1:carrito", JSON.stringify(carrito));

    const toast = document.querySelector("#toast");
    if (toast) {
      toast.textContent = `${cantidad}× ${adoquin.nombre} agregado al carrito (demo)`;
      toast.classList.add("toast--on");
      setTimeout(() => toast.classList.remove("toast--on"), 2200);
    }
    location.href = "carrito.html";
  });
}
actualizarSubtotal();

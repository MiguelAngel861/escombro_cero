/**
 * perfil.ts — APP-V09 (SPEC-A09): editar nombre/contacto con persistencia,
 * toggle offline demo, reiniciar demo y cerrar sesión (limpia la session).
 */
import {
  laSesion, cerrarSesion, reiniciarDemo, safeUser,
  guardarUsuario, leer, guardar, K, esc,
} from "./store.js";
import { USUARIO_DEMO, type PerfilUsuario } from "./data.js";

if (!laSesion()) location.href = "login.html";

const form = document.querySelector<HTMLFormElement>("#form-perfil")!;
const btnGuardar = form.querySelector<HTMLButtonElement>("#btn-guardar")!;
const note = form.querySelector<HTMLElement>("#saved-note")!;
const toastEl = document.querySelector("#toast")!;

const RX_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RX_TELEFONO = /^\d{9}$/;

const u = safeUser();
const nombre = form.querySelector<HTMLInputElement>("#p-nombre")!;
const correo = form.querySelector<HTMLInputElement>("#p-correo")!;
const tel = form.querySelector<HTMLInputElement>("#p-telefono")!;

nombre.value = u.nombre;
correo.value = u.correo;
tel.value = u.telefono.replace("+51 ", "");

const avatar = document.querySelector("#avatar")!;
const nombreOut = document.querySelector("#perfil-nombre")!;
const correoOut = document.querySelector("#perfil-correo")!;
function pintaPerfil(v: PerfilUsuario): void {
  avatar.textContent = (v.nombre[0] ?? "?").toUpperCase();
  nombreOut.textContent = v.nombre;
  correoOut.textContent = v.correo;
  document.title = `Escombro 0 — ${v.nombre.split(" ")[0]} · Perfil`;
}
pintaPerfil(u);

function validar(): void {
  const okN = nombre.value.trim().length >= 3;
  const okC = RX_CORREO.test(correo.value);
  const okT = RX_TELEFONO.test(tel.value.replace(/\s/g, ""));
  nombre.closest(".field")?.classList.toggle("field--error", nombre.value.length > 0 && !okN);
  correo.closest(".field")?.classList.toggle("field--error", correo.value.length > 0 && !okC);
  tel.closest(".field")?.classList.toggle("field--error", tel.value.length > 0 && !okT);
  btnGuardar.disabled = !(okN && okC && okT);
}
form.addEventListener("input", validar);
validar();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (btnGuardar.disabled) return;
  const v: PerfilUsuario = {
    nombre: nombre.value.trim(),
    correo: correo.value.trim(),
    telefono: "+51 " + tel.value.replace(/\s/g, ""),
  };
  guardarUsuario(v);
  pintaPerfil(v);
  note.classList.add("saved-note--on");
  setTimeout(() => note.classList.remove("saved-note--on"), 2000);
});

// toggle offline (ADR-04 preferencia demo) — muestra banner en próximas vistas
const btnOffline = document.querySelector<HTMLButtonElement>("#btn-offline")!;
const pintaOffline = (): void => {
  const off = leer<boolean>(K.offline, false);
  btnOffline.setAttribute("aria-pressed", String(off));
  btnOffline.textContent = off ? "Modo offline: ACTIVO (toca para desactivar)" : "Modo offline (demo toggle)";
};
btnOffline.addEventListener("click", () => {
  guardar(K.offline, !leer<boolean>(K.offline, false));
  pintaOffline();
});
pintaOffline();

document.querySelector("#btn-reiniciar")?.addEventListener("click", () => {
  reiniciarDemo();
  toastEl.textContent = "Demo reiniciada — dataset sembrado";
  toastEl.classList.add("toast--on");
  setTimeout(() => location.reload(), 1200);
});

document.querySelector("#btn-salir")?.addEventListener("click", () => {
  cerrarSesion();
  location.href = "login.html";
});

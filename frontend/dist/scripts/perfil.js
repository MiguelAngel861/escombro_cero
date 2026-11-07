var _a, _b;
/**
 * perfil.ts — APP-V09 (SPEC-A09): editar nombre/contacto con persistencia,
 * toggle offline demo, reiniciar demo y cerrar sesión (limpia la session).
 */
import { laSesion, cerrarSesion, reiniciarDemo, safeUser, guardarUsuario, leer, guardar, K, } from "./store.js";
if (!laSesion())
    location.href = "login.html";
const form = document.querySelector("#form-perfil");
const btnGuardar = form.querySelector("#btn-guardar");
const note = form.querySelector("#saved-note");
const toastEl = document.querySelector("#toast");
const RX_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RX_TELEFONO = /^\d{9}$/;
const u = safeUser();
const nombre = form.querySelector("#p-nombre");
const correo = form.querySelector("#p-correo");
const tel = form.querySelector("#p-telefono");
nombre.value = u.nombre;
correo.value = u.correo;
tel.value = u.telefono.replace("+51 ", "");
const avatar = document.querySelector("#avatar");
const nombreOut = document.querySelector("#perfil-nombre");
const correoOut = document.querySelector("#perfil-correo");
function pintaPerfil(v) {
    var _a;
    avatar.textContent = ((_a = v.nombre[0]) !== null && _a !== void 0 ? _a : "?").toUpperCase();
    nombreOut.textContent = v.nombre;
    correoOut.textContent = v.correo;
    document.title = `Escombro 0 — ${v.nombre.split(" ")[0]} · Perfil`;
}
pintaPerfil(u);
function validar() {
    var _a, _b, _c;
    const okN = nombre.value.trim().length >= 3;
    const okC = RX_CORREO.test(correo.value);
    const okT = RX_TELEFONO.test(tel.value.replace(/\s/g, ""));
    (_a = nombre.closest(".field")) === null || _a === void 0 ? void 0 : _a.classList.toggle("field--error", nombre.value.length > 0 && !okN);
    (_b = correo.closest(".field")) === null || _b === void 0 ? void 0 : _b.classList.toggle("field--error", correo.value.length > 0 && !okC);
    (_c = tel.closest(".field")) === null || _c === void 0 ? void 0 : _c.classList.toggle("field--error", tel.value.length > 0 && !okT);
    btnGuardar.disabled = !(okN && okC && okT);
}
form.addEventListener("input", validar);
validar();
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (btnGuardar.disabled)
        return;
    const v = {
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
const btnOffline = document.querySelector("#btn-offline");
const pintaOffline = () => {
    const off = leer(K.offline, false);
    btnOffline.setAttribute("aria-pressed", String(off));
    btnOffline.textContent = off ? "Modo offline: ACTIVO (toca para desactivar)" : "Modo offline (demo toggle)";
};
btnOffline.addEventListener("click", () => {
    guardar(K.offline, !leer(K.offline, false));
    pintaOffline();
});
pintaOffline();
(_a = document.querySelector("#btn-reiniciar")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    reiniciarDemo();
    toastEl.textContent = "Demo reiniciada — dataset sembrado";
    toastEl.classList.add("toast--on");
    setTimeout(() => location.reload(), 1200);
});
(_b = document.querySelector("#btn-salir")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    cerrarSesion();
    location.href = "login.html";
});

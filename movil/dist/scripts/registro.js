"use strict";
/**
 * registro.ts — APP-V03 (SPEC-A08 · TAC-APP-03).
 * Campos requeridos con validación visual demo (nombre/correo/teléfono/contraseña)
 * y toggle de visibilidad de contraseña. Sin credenciales reales.
 */
const RX_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RX_TELEFONO = /^\d{9}$/;
const form = document.querySelector("#form-registro");
const btn = form === null || form === void 0 ? void 0 : form.querySelector("#btn-registro");
const pwd = form === null || form === void 0 ? void 0 : form.querySelector("#f-pwd");
const toggle = form === null || form === void 0 ? void 0 : form.querySelector("#pwd-toggle");
if (!form || !btn)
    throw new Error("#form-registro no encontrado");
const validar = () => {
    const nombre = form.querySelector("#f-nombre");
    const correo = form.querySelector("#f-correo");
    const tel = form.querySelector("#f-telefono");
    if (!nombre || !correo || !tel)
        return;
    const checar = (input, test, errorSelector) => {
        var _a;
        const ok = test(input.value);
        (_a = input
            .closest(".field")) === null || _a === void 0 ? void 0 : _a.classList.toggle("field--error", input.value.length > 0 && !ok);
        input.setAttribute("aria-invalid", input.value.length > 0 && !ok ? "true" : "false");
        return ok;
    };
    const okNombre = checar(nombre, (v) => v.trim().length >= 3, "#err-nombre");
    const okCorreo = checar(correo, (v) => RX_CORREO.test(v), "#err-correo");
    const okTel = checar(tel, (v) => RX_TELEFONO.test(v.replace(/\s/g, "")), "#err-telefono");
    const okPwd = checar(pwd, (v) => v.length >= 6, "#err-pwd");
    btn.disabled = !(okNombre && okCorreo && okTel && okPwd);
};
form.addEventListener("input", validar);
validar();
toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener("click", () => {
    if (!pwd || !toggle)
        return;
    const mostrar = pwd.type === "password";
    pwd.type = mostrar ? "text" : "password";
    toggle.setAttribute("aria-pressed", String(mostrar));
    toggle.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    toggle.textContent = mostrar ? "Ocultar" : "Mostrar";
});
form.addEventListener("submit", (e) => {
    var _a, _b, _c;
    var _d, _e, _f;
    e.preventDefault();
    if (btn.disabled)
        return;
    const nombre = ((_d = (_a = form.querySelector("#f-nombre")) === null || _a === void 0 ? void 0 : _a.value) !== null && _d !== void 0 ? _d : "").trim();
    const correo = ((_e = (_b = form.querySelector("#f-correo")) === null || _b === void 0 ? void 0 : _b.value) !== null && _e !== void 0 ? _e : "").trim();
    const tel = ((_f = (_c = form.querySelector("#f-telefono")) === null || _c === void 0 ? void 0 : _c.value) !== null && _f !== void 0 ? _f : "").trim();
    localStorage.setItem("cnsv1:sesion", JSON.stringify({ rol: "ciudadano", correo }));
    localStorage.setItem("cnsv1:usuario", JSON.stringify({ nombre: nombre || "Ana Torres", correo, telefono: "+51 " + tel }));
    location.href = "menu.html";
});

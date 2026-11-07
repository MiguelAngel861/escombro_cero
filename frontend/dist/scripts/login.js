/**
 * login.ts — APP-V02 (SPEC-A08 · TAC-APP-02).
 * Validación demo: regex de correo (sin auth real). Cualquier correo con
 * formato válido avanza; siembra la sesión simulada `cnsv1:sesion`.
 */
const RX_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const K_SESION = "cnsv1:sesion";
const form = document.querySelector("#form-login");
if (!form)
    throw new Error("#form-login no encontrado en login.html");
const correo = form.querySelector("#field-correo");
const submit_ = form.querySelector("#btn-login");
const validar = () => {
    if (!correo || !submit_)
        return;
    const ok = RX_CORREO.test(correo.value);
    form.classList.toggle("field--error", correo.value.length > 0 && !ok);
    correo.setAttribute("aria-invalid", String(!ok));
    submit_.disabled = !ok;
};
correo === null || correo === void 0 ? void 0 : correo.addEventListener("input", validar);
validar(); // estado inicial: submit deshabilitado
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (submit_ === null || submit_ === void 0 ? void 0 : submit_.disabled)
        return;
    localStorage.setItem(K_SESION, JSON.stringify({ rol: "ciudadano", correo: correo === null || correo === void 0 ? void 0 : correo.value }));
    location.href = "menu.html";
});
export {};

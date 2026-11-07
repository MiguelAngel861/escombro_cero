/**
 * registro.ts — APP-V03 (SPEC-A08 · TAC-APP-03).
 * Campos requeridos con validación visual demo (nombre/correo/teléfono/contraseña)
 * y toggle de visibilidad de contraseña. Sin credenciales reales.
 */
const RX_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RX_TELEFONO = /^\d{9}$/;

const form = document.querySelector<HTMLFormElement>("#form-registro");
const btn = form?.querySelector<HTMLButtonElement>("#btn-registro");
const pwd = form?.querySelector<HTMLInputElement>("#f-pwd");
const toggle = form?.querySelector<HTMLButtonElement>("#pwd-toggle");

if (!form || !btn) throw new Error("#form-registro no encontrado");

const validar = (): void => {
  const nombre = form.querySelector<HTMLInputElement>("#f-nombre");
  const correo = form.querySelector<HTMLInputElement>("#f-correo");
  const tel = form.querySelector<HTMLInputElement>("#f-telefono");
  if (!nombre || !correo || !tel) return;

  const checar = (
    input: HTMLInputElement,
    test: (v: string) => boolean,
    errorSelector: string,
  ): boolean => {
    const ok = test(input.value);
    input
      .closest(".field")
      ?.classList.toggle("field--error", input.value.length > 0 && !ok);
    input.setAttribute("aria-invalid", input.value.length > 0 && !ok ? "true" : "false");
    return ok;
  };

  const okNombre = checar(nombre, (v) => v.trim().length >= 3, "#err-nombre");
  const okCorreo = checar(correo, (v) => RX_CORREO.test(v), "#err-correo");
  const okTel = checar(tel, (v) => RX_TELEFONO.test(v.replace(/\s/g, "")), "#err-telefono");
  const okPwd = checar(pwd!, (v) => v.length >= 6, "#err-pwd");

  btn.disabled = !(okNombre && okCorreo && okTel && okPwd);
};

form.addEventListener("input", validar);
validar();

toggle?.addEventListener("click", () => {
  if (!pwd || !toggle) return;
  const mostrar = pwd.type === "password";
  pwd.type = mostrar ? "text" : "password";
  toggle.setAttribute("aria-pressed", String(mostrar));
  toggle.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
  toggle.textContent = mostrar ? "Ocultar" : "Mostrar";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (btn.disabled) return;
  const nombre = (form.querySelector<HTMLInputElement>("#f-nombre")?.value ?? "").trim();
  const correo = (form.querySelector<HTMLInputElement>("#f-correo")?.value ?? "").trim();
  const tel = (form.querySelector<HTMLInputElement>("#f-telefono")?.value ?? "").trim();
  localStorage.setItem(
    "cnsv1:sesion",
    JSON.stringify({ rol: "ciudadano", correo })
  );
  localStorage.setItem(
    "cnsv1:usuario",
    JSON.stringify({ nombre: nombre || "Ana Torres", correo, telefono: "+51 " + tel })
  );
  location.href = "menu.html";
});

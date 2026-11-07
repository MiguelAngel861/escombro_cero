import * as store from "./store.js";
document.addEventListener("DOMContentLoaded", () => {
    store.ensureSeed();
    const form = document.getElementById("form-login");
    const rolSelect = document.getElementById("rol-select");
    const correoInput = document.getElementById("correo");
    const passInput = document.getElementById("pass");
    // Actualizar credenciales sugeridas según rol
    if (rolSelect && correoInput && passInput) {
        rolSelect.addEventListener("change", () => {
            if (rolSelect.value === "operador") {
                correoInput.value = "juan.perez@alcaldia.gob.ni";
                passInput.value = "brigada2026";
            }
            else {
                correoInput.value = "carlos.admin@alcaldia.gob.ni";
                passInput.value = "admin2026";
            }
        });
    }
    if (form && rolSelect && correoInput) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const rol = rolSelect.value;
            const sesion = {
                rol,
                correo: correoInput.value || (rol === "operador" ? "juan.perez@alcaldia.gob.ni" : "carlos.admin@alcaldia.gob.ni"),
                nombre: rol === "operador" ? "Juan Pérez (OP-01)" : "Carlos Martínez (AD-01)",
                idUsuario: rol === "operador" ? "OP-01" : "AD-01",
                vehiculo: rol === "operador" ? "Camión 3T (Placa M-204)" : undefined
            };
            store.guardarSesionWeb(sesion);
            window.location.href = "tablero.html";
        });
    }
});

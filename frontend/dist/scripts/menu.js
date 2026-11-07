/**
 * menu.ts — APP-V04: resumen del usuario + accesos rápidos (SPEC ui).
 * Lee sesión (guard: sin sesión → login) y muéstrale contadores del dataset.
 */
import { laSesion, losReportesDe, safeUser, ensureSeed } from "./store.js";
import { ETIQUETAS_ESTADO } from "./data.js";
ensureSeed();
const sesion = laSesion();
if (!sesion) {
    location.href = "login.html";
}
const { nombre } = safeUser();
const h1 = document.querySelector("#greet-name");
if (h1)
    h1.textContent = `Hola, ${nombre.split(" ")[0]}`;
const mios = sesion ? losReportesDe("US-01") : [];
const activos = mios.filter((r) => !["recolectado", "expirado"].includes(r.estado));
const recolectados = mios.filter((r) => r.estado === "recolectado");
const sA = document.querySelector("#sum-activos");
const sR = document.querySelector("#sum-recolectados");
const sub = document.querySelector("#q-sub-reportes");
if (sA)
    sA.textContent = String(activos.length);
if (sR)
    sR.textContent = String(recolectados.length);
if (sub) {
    const ultimo = mios[0];
    sub.textContent = ultimo
        ? `Último: ${ultimo.id} · ${ETIQUETAS_ESTADO[ultimo.estado]}`
        : "Aún no reportas escombros";
}

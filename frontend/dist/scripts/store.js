/**
 * store.ts — acceso namespaced a localStorage (ADR-04: prefijo `cnsv1:`).
 * Siembra idempotente del dataset demo y helpers de sesión/usuario.
 */
import { REPORTES_DEMO, USUARIO_DEMO, DESTINOS_DEMO, USUARIOS_SISTEMA_DEMO, RECOLECCIONES_DEMO, ADOQUINES_DEMO, PEDIDOS_DEMO, ESTADOS_REPORTE, TIPOS_ESCOMBRO, } from "./data.js";
export const K = {
    sesion: "cnsv1:sesion",
    sesionWeb: "cnsv1:sesion_web",
    reportes: "cnsv1:reportes",
    usuario: "cnsv1:usuario",
    offline: "cnsv1:offline",
    destinos: "cnsv1:destinos",
    usuariosSistema: "cnsv1:usuarios_sistema",
    recolecciones: "cnsv1:recolecciones",
    adoquines: "cnsv1:adoquines",
    pedidos: "cnsv1:pedidos",
};
export function leer(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    }
    catch (_a) {
        return fallback;
    }
}
export function guardar(key, valor) {
    localStorage.setItem(key, JSON.stringify(valor));
}
export function eliminar(key) {
    localStorage.removeItem(key);
}
/** Siembra idempotente: primera visita carga el dataset demo en localStorage. */
export function ensureSeed() {
    if (leer(K.reportes, null) === null) {
        guardar(K.reportes, REPORTES_DEMO);
    }
    if (learUsuario() === null) {
        guardar(K.usuario, USUARIO_DEMO);
    }
    if (leer(K.destinos, null) === null) {
        guardar(K.destinos, DESTINOS_DEMO);
    }
    if (leer(K.usuariosSistema, null) === null) {
        guardar(K.usuariosSistema, USUARIOS_SISTEMA_DEMO);
    }
    if (leer(K.recolecciones, null) === null) {
        guardar(K.recolecciones, RECOLECCIONES_DEMO);
    }
    if (leer(K.adoquines, null) === null) {
        guardar(K.adoquines, ADOQUINES_DEMO);
    }
    if (leer(K.pedidos, null) === null) {
        guardar(K.pedidos, PEDIDOS_DEMO);
    }
}
/** Valida un reporte leído del storage (localStorage de demo puede tener filas
 *  corruptas — p. ej. volumenM3 null de una corrida anterior — rompiendo las vistas). */
function sanea(r) {
    var _a, _b;
    const esEstado = (e) => ESTADOS_REPORTE.includes(e);
    const esTipo = (t) => TIPOS_ESCOMBRO.includes(t);
    const ahora = new Date().toISOString().slice(0, 16);
    const estado = esEstado(r === null || r === void 0 ? void 0 : r.estado) ? r.estado : "pendiente";
    const historial = Array.isArray(r === null || r === void 0 ? void 0 : r.historial) && r.historial.length > 0 ? r.historial : [{ estado, fecha: ahora }];
    const corregido = Object.assign(Object.assign({}, r), { id: (_a = r === null || r === void 0 ? void 0 : r.id) !== null && _a !== void 0 ? _a : "R-???", idCiudadano: (_b = r === null || r === void 0 ? void 0 : r.idCiudadano) !== null && _b !== void 0 ? _b : "US-01", fechaCreacion: typeof (r === null || r === void 0 ? void 0 : r.fechaCreacion) === "string" ? r.fechaCreacion : ahora, tipo: esTipo(r === null || r === void 0 ? void 0 : r.tipo) ? r.tipo : "otros", 
        // números de catálogo: cualquier valor no numérico → 0 (render seguro, no crash)
        volumenM3: typeof (r === null || r === void 0 ? void 0 : r.volumenM3) === "number" && isFinite(r.volumenM3) ? r.volumenM3 : 0, ubicacion: typeof (r === null || r === void 0 ? void 0 : r.ubicacion) === "string" ? r.ubicacion : "Ubicación (GPS)", dentroZona: (r === null || r === void 0 ? void 0 : r.dentroZona) !== false, estado,
        historial });
    return corregido;
}
export function losReportes() {
    var _a;
    const crudos = (_a = leer(K.reportes, null)) !== null && _a !== void 0 ? _a : REPORTES_DEMO;
    const limpios = crudos.map(sanea);
    // persiste el saneado para que el mismo dato corrompido no resane en cada lectura
    if (JSON.stringify(crudos) !== JSON.stringify(limpios)) {
        guardar(K.reportes, limpios);
    }
    ensureSeed();
    return limpios;
}
export function guardarReportes(prev) {
    guardar(K.reportes, prev);
}
export function losReportesDe(id) {
    return losReportes().filter((r) => r.idCiudadano === id);
}
export function unReporte(id) {
    return losReportes().find((r) => r.id === id);
}
export function learUsuario() {
    const u = leer(K.usuario, null);
    return u !== null && u !== void 0 ? u : null;
}
export function guardarUsuario(u) {
    guardar(K.usuario, u);
}
export function laSesion() {
    return leer(K.sesion, null);
}
export function cerrarSesion() {
    eliminar(K.sesion);
}
export function reiniciarDemo() {
    Object.values(K).forEach(eliminar);
    ensureSeed();
}
export function safeUser() {
    var _a;
    return (_a = learUsuario()) !== null && _a !== void 0 ? _a : USUARIO_DEMO;
}
export function losDestinos() {
    ensureSeed();
    return leer(K.destinos, DESTINOS_DEMO);
}
export function guardarDestinos(d) {
    guardar(K.destinos, d);
}
export function unDestino(id) {
    return losDestinos().find((d) => d.id === id);
}
export function losUsuariosSistema() {
    ensureSeed();
    return leer(K.usuariosSistema, USUARIOS_SISTEMA_DEMO);
}
export function guardarUsuariosSistema(u) {
    guardar(K.usuariosSistema, u);
}
export function unUsuarioSistema(id) {
    return losUsuariosSistema().find((u) => u.id === id);
}
export function lasRecolecciones() {
    ensureSeed();
    return leer(K.recolecciones, RECOLECCIONES_DEMO);
}
export function guardarRecolecciones(r) {
    guardar(K.recolecciones, r);
}
export function agregarRecoleccion(r) {
    const todas = lasRecolecciones();
    todas.unshift(r);
    guardarRecolecciones(todas);
}
export function actualizarReporte(id, updater) {
    const todos = losReportes();
    const idx = todos.findIndex((r) => r.id === id);
    if (idx === -1)
        return null;
    const modificado = updater(todos[idx]);
    todos[idx] = modificado;
    guardarReportes(todos);
    return modificado;
}
export function laSesionWeb() {
    return leer(K.sesionWeb, null);
}
export function guardarSesionWeb(s) {
    guardar(K.sesionWeb, s);
}
export function cerrarSesionWeb() {
    eliminar(K.sesionWeb);
}
export function formateaFecha(iso) {
    const [date, time] = iso.split("T");
    return `${date.split("-").reverse().join("/")} · ${time !== null && time !== void 0 ? time : ""}`;
}
export function esc(s) {
    return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
/* ── Adoquines (catálogo) ── */
export function losAdoquines() {
    ensureSeed();
    return leer(K.adoquines, ADOQUINES_DEMO);
}
export function unAdoquin(id) {
    return losAdoquines().find((a) => a.id === id);
}
/* ── Pedidos simulados ── */
export function losPedidos() {
    ensureSeed();
    return leer(K.pedidos, PEDIDOS_DEMO);
}
export function unPedido(id) {
    return losPedidos().find((p) => p.id === id);
}
export function losPedidosDe(idCliente) {
    return losPedidos().filter((p) => p.idCliente === idCliente);
}
export function agregarPedido(p) {
    const todas = losPedidos();
    todas.unshift(p);
    guardar(K.pedidos, todas);
}

/**
 * store.ts — acceso namespaced a localStorage (ADR-04: prefijo `cnsv1:`).
 * Siembra idempotente del dataset demo y helpers de sesión/usuario.
 */
import {
  REPORTES_DEMO, USUARIO_DEMO, DESTINOS_DEMO, USUARIOS_SISTEMA_DEMO, RECOLECCIONES_DEMO,
  ADOQUINES_DEMO, PEDIDOS_DEMO,
  ESTADOS_REPORTE, TIPOS_ESCOMBRO,
  type Reporte, type PerfilUsuario, type Destino, type UsuarioSistema, type Recoleccion,
  type EstadoReporte, type TipoEscombro,
  type Adoquin, type Pedido,
} from "./data.js";

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

type Json = unknown;

export function leer<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function guardar(key: string, valor: Json): void {
  localStorage.setItem(key, JSON.stringify(valor));
}

export function eliminar(key: string): void {
  localStorage.removeItem(key);
}

/** Siembra idempotente: primera visita carga el dataset demo en localStorage. */
export function ensureSeed(): void {
  if (leer<Reporte[] | null>(K.reportes, null) === null) {
    guardar(K.reportes, REPORTES_DEMO);
  }
  if (learUsuario() === null) {
    guardar(K.usuario, USUARIO_DEMO);
  }
  if (leer<Destino[] | null>(K.destinos, null) === null) {
    guardar(K.destinos, DESTINOS_DEMO);
  }
  if (leer<UsuarioSistema[] | null>(K.usuariosSistema, null) === null) {
    guardar(K.usuariosSistema, USUARIOS_SISTEMA_DEMO);
  }
  if (leer<Recoleccion[] | null>(K.recolecciones, null) === null) {
    guardar(K.recolecciones, RECOLECCIONES_DEMO);
  }
  if (leer<Adoquin[] | null>(K.adoquines, null) === null) {
    guardar(K.adoquines, ADOQUINES_DEMO);
  }
  if (leer<Pedido[] | null>(K.pedidos, null) === null) {
    guardar(K.pedidos, PEDIDOS_DEMO);
  }
}

/** Valida un reporte leído del storage (localStorage de demo puede tener filas
 *  corruptas — p. ej. volumenM3 null de una corrida anterior — rompiendo las vistas). */
function sanea(r: Reporte): Reporte {
  const esEstado = (e: unknown): e is EstadoReporte => ESTADOS_REPORTE.includes(e as EstadoReporte);
  const esTipo = (t: unknown): t is TipoEscombro => TIPOS_ESCOMBRO.includes(t as TipoEscombro);
  const ahora = new Date().toISOString().slice(0, 16);
  const estado = esEstado(r?.estado) ? r.estado : "pendiente";
  const historial = Array.isArray(r?.historial) && r.historial.length > 0 ? r.historial : [{ estado, fecha: ahora }];
  const corregido: Reporte = {
    ...r,
    id: r?.id ?? "R-???",
    idCiudadano: r?.idCiudadano ?? "US-01",
    fechaCreacion: typeof r?.fechaCreacion === "string" ? r.fechaCreacion : ahora,
    tipo: esTipo(r?.tipo) ? r!.tipo : "otros",
    // números de catálogo: cualquier valor no numérico → 0 (render seguro, no crash)
    volumenM3: typeof r?.volumenM3 === "number" && isFinite(r.volumenM3) ? r.volumenM3 : 0,
    ubicacion: typeof r?.ubicacion === "string" ? r.ubicacion : "Ubicación (GPS)",
    dentroZona: r?.dentroZona !== false,
    estado,
    historial,
  };
  return corregido;
}

export function losReportes(): Reporte[] {
  const crudos = leer<Reporte[] | null>(K.reportes, null) ?? REPORTES_DEMO;
  const limpios = crudos.map(sanea);
  // persiste el saneado para que el mismo dato corrompido no resane en cada lectura
  if (JSON.stringify(crudos) !== JSON.stringify(limpios)) {
    guardar(K.reportes, limpios);
  }
  ensureSeed();
  return limpios;
}

export function guardarReportes(prev: Reporte[]): void {
  guardar(K.reportes, prev);
}

export function losReportesDe(id: string): Reporte[] {
  return losReportes().filter((r) => r.idCiudadano === id);
}

export function unReporte(id: string): Reporte | undefined {
  return losReportes().find((r) => r.id === id);
}

export function learUsuario(): PerfilUsuario | null {
  const u = leer<PerfilUsuario | null>(K.usuario, null);
  return u ?? null;
}

export function guardarUsuario(u: PerfilUsuario): void {
  guardar(K.usuario, u);
}

export function laSesion(): { rol: string; correo: string } | null {
  return leer<{ rol: string; correo: string } | null>(K.sesion, null);
}

export function cerrarSesion(): void {
  eliminar(K.sesion);
}

export function reiniciarDemo(): void {
  Object.values(K).forEach(eliminar);
  ensureSeed();
}

export function safeUser(): PerfilUsuario {
  return learUsuario() ?? USUARIO_DEMO;
}

export function losDestinos(): Destino[] {
  ensureSeed();
  return leer<Destino[]>(K.destinos, DESTINOS_DEMO);
}

export function guardarDestinos(d: Destino[]): void {
  guardar(K.destinos, d);
}

export function unDestino(id: string): Destino | undefined {
  return losDestinos().find((d) => d.id === id);
}

export function losUsuariosSistema(): UsuarioSistema[] {
  ensureSeed();
  return leer<UsuarioSistema[]>(K.usuariosSistema, USUARIOS_SISTEMA_DEMO);
}

export function guardarUsuariosSistema(u: UsuarioSistema[]): void {
  guardar(K.usuariosSistema, u);
}

export function unUsuarioSistema(id: string): UsuarioSistema | undefined {
  return losUsuariosSistema().find((u) => u.id === id);
}

export function lasRecolecciones(): Recoleccion[] {
  ensureSeed();
  return leer<Recoleccion[]>(K.recolecciones, RECOLECCIONES_DEMO);
}

export function guardarRecolecciones(r: Recoleccion[]): void {
  guardar(K.recolecciones, r);
}

export function agregarRecoleccion(r: Recoleccion): void {
  const todas = lasRecolecciones();
  todas.unshift(r);
  guardarRecolecciones(todas);
}

export function actualizarReporte(id: string, updater: (r: Reporte) => Reporte): Reporte | null {
  const todos = losReportes();
  const idx = todos.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const modificado = updater(todos[idx]);
  todos[idx] = modificado;
  guardarReportes(todos);
  return modificado;
}

export interface SesionWeb {
  rol: "operador" | "admin" | "ciudadano";
  correo: string;
  nombre: string;
  idUsuario: string;
  vehiculo?: string;
}

export function laSesionWeb(): SesionWeb | null {
  return leer<SesionWeb | null>(K.sesionWeb, null);
}

export function guardarSesionWeb(s: SesionWeb): void {
  guardar(K.sesionWeb, s);
}

export function cerrarSesionWeb(): void {
  eliminar(K.sesionWeb);
}

export function formateaFecha(iso: string): string {
  const [date, time] = iso.split("T");
  return `${date.split("-").reverse().join("/")} · ${time ?? ""}`;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/* ── Adoquines (catálogo) ── */

export function losAdoquines(): Adoquin[] {
  ensureSeed();
  return leer<Adoquin[]>(K.adoquines, ADOQUINES_DEMO);
}

export function unAdoquin(id: string): Adoquin | undefined {
  return losAdoquines().find((a) => a.id === id);
}

/* ── Pedidos simulados ── */

export function losPedidos(): Pedido[] {
  ensureSeed();
  return leer<Pedido[]>(K.pedidos, PEDIDOS_DEMO);
}

export function unPedido(id: string): Pedido | undefined {
  return losPedidos().find((p) => p.id === id);
}

export function losPedidosDe(idCliente: string): Pedido[] {
  return losPedidos().filter((p) => p.idCliente === idCliente);
}

export function agregarPedido(p: Pedido): void {
  const todas = losPedidos();
  todas.unshift(p);
  guardar(K.pedidos, todas);
}

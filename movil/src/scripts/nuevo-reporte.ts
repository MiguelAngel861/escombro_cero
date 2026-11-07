/**
 * nuevo-reporte.ts — APP-V05 (SPEC-A01: foto+cámara simulada, tipo, volumen,
 * descripción, Enviar) y APP-V06 banner de zona (SPEC-A03).
 * Sin validación real de backend: todo simulado sobre store/data (SPEC-A08).
 */
import { ETIQUETAS_TIPO, TIPOS_ESCOMBRO, type TipoEscombro } from "./data.js";
import { losReportes, guardarReportes, laSesion, unReporte, formateaFecha } from "./store.js";

if (!laSesion()) location.href = "login.html";

/** Modo edición (SPEC-A05): ?id=R-008&mode=edit → precarga y reenviar restaura `pendiente`. */
const params = new URLSearchParams(location.search);
const editId = params.get("id");
const editBase = params.get("mode") === "edit" && editId ? unReporte(editId) : undefined;
const modoEdit = Boolean(editBase);

type VolumenOpt = { key: string; label: string; m3: number };
const VOL: Array<VolumenOpt> = [
  { key: "v1", label: "< 1 m³", m3: 0.8 },
  { key: "v2", label: "1–3 m³", m3: 2.5 },
  { key: "v3", label: "3–6 m³", m3: 6 },
  { key: "v4", label: "6–10 m³", m3: 6.5 },
  { key: "v5", label: "> 10 m³", m3: 10 },
];

// catálogo tipado → radios (SPEC-C04, nunca hard-code)
const tiposWrap = document.querySelector<HTMLDivElement>("#cat-tipos")!;
tiposWrap.innerHTML = TIPOS_ESCOMBRO.map((t: TipoEscombro) => `
  <label class="opt"><input type="radio" name="tipo" value="${t}"> ${
    ETIQUETAS_TIPO[t]
  } <small>manual…</small></label>`).join("");

const volWrap = document.querySelector<HTMLDivElement>("#cat-volumen")!;
volWrap.innerHTML = VOL.map((v) => `
  <label class="chip" data-v="${v.key}"><input type="radio" name="volumen" value="${v.key}" style="display:none">${v.label}</label>`).join("");

const btnFoto = document.querySelector<HTMLButtonElement>("#btn-foto")!;
const btnEnviar = document.querySelector<HTMLButtonElement>("#btn-enviar")!;
const form = document.querySelector<HTMLFormElement>("#form-reporte")!;

// estado del draft (fuera de la sesión, no persiste entre visitas)
const draft = { foto: false, fotoOk: false, tipo: null as TipoEscombro | null, volumen: null as number | null, fueraDeZona: false, tipoTocado: false, volTocado: false };

// APP-V06 (SPEC-A03): el banner solo informa; el escenario alterna en la vista dedicada
// (validacion-zona.html). El toggle por click/doble-click aquí causaba rechazos accidentales.
const banner = document.querySelector("#banner-zona")!;
const cotext = document.querySelector("#banner-zona-text")!;
const setZona = (ok: boolean) => {
  draft.fueraDeZona = !ok;
  banner.classList.toggle("gps-banner--ok", ok);
  banner.classList.toggle("gps-banner--bad", !ok);
  cotext.textContent = ok ? "GPS ✓ · Estás dentro de la zona piloto" : "GPS ✗ · Estás FUERA de la zona piloto (demo)";
};

// foto placeholder (ADR-09)
const pintaFoto = (tipo: TipoEscombro): void => {
  draft.foto = true;
  draft.fotoOk = true;
  btnFoto.classList.add("img-capture--filled");
  btnFoto.innerHTML = `<img src="assets/fotos/tipo-${tipo}.svg" alt="Foto de escombro: ${ETIQUETAS_TIPO[tipo]} (placeholder demo)">
    <span class="meta-gps">GPS ✓ · 14:32 ✓</span>`;
};
btnFoto.addEventListener("click", () => pintaFoto(draft.tipo ?? "otros"));

function validar(): void {
  const vField = document.querySelector("#field-volumen")!;
  const okVol = draft.volumen !== null;
  vField.classList.toggle("field--error", !okVol);
  const okTipo = draft.tipo !== null;
  btnEnviar.disabled = !(draft.foto && okTipo && okVol);
}

tiposWrap.addEventListener("change", (e) => {
  const t = (e.target as HTMLInputElement).value as TipoEscombro;
  draft.tipo = t;
  draft.tipoTocado = true;
  // la foto siempre muestra el placeholder del tipo (más claro en demo)
  pintaFoto(t);
  validar();
});

volWrap.addEventListener("change", (e) => {
  draft.volumen = VOL.find((v) => v.key === (e.target as HTMLInputElement).value)?.m3 ?? null;
  draft.volTocado = true;
  // selección única: solo el chip elegido lleva el estado activo
  const elegido = (e.target as HTMLElement).closest(".chip");
  volWrap.querySelectorAll(".chip").forEach((c) => c.classList.toggle("chip--on", c === elegido));
  validar();
});

function toast(texto: string): void {
  const t = document.querySelector("#toast")!;
  t.textContent = texto;
  t.classList.add("toast--on");
  setTimeout(() => t.classList.remove("toast--on"), 2200);
}

// precarga del modo edición (SPEC-A05: campos precargados; título y botón lo reflejan)
if (editBase) {
  const r = editBase;
  document.querySelector<HTMLHeadingElement>(".page-title")!.textContent = "Corregir reporte";
  document.querySelector<HTMLElement>(".page-sub")!.innerHTML =
    `Editas <strong>${r.id}</strong> (rechazado: ${(r.motivoRechazo ?? "otro").replace("_", " ")}) — al reenviar vuelve a <em>pendiente</em>.`;
  const tipoInput = tiposWrap.querySelector<HTMLInputElement>(`input[value="${r.tipo}"]`);
  if (tipoInput) tipoInput.checked = true;
  draft.tipo = r.tipo;
  const vol = VOL.reduce((a, b) => (Math.abs(b.m3 - r.volumenM3) < Math.abs(a.m3 - r.volumenM3) ? b : a));
  draft.volumen = vol.m3;
  const volInput = volWrap.querySelector<HTMLInputElement>(`input[value="${vol.key}"]`);
  if (volInput) {
    volInput.checked = true;
    volInput.closest(".chip")?.classList.add("chip--on");
  }
  const dirInput = form.querySelector<HTMLInputElement>("#f-dir");
  const descInput = form.querySelector<HTMLTextAreaElement>("#f-desc");
  if (dirInput) dirInput.value = r.ubicacion;
  if (descInput) descInput.value = r.descripcion ?? "";
  btnEnviar.textContent = "Reenviar reporte";
  pintaFoto(r.tipo);
  validar();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (btnEnviar.disabled) return;
  if (draft.fueraDeZona) {
    // RB-01 demo: reporte fuera de zona → rechazado automático (escenario simulado)
    toast("Fuera de zona (demo): reporte rechazado");
    return;
  }
  const ahora = new Date().toISOString().slice(0, 16);
  const desc = (form.querySelector<HTMLInputElement>("#f-desc")?.value ?? "").trim();
  const dir = (form.querySelector<HTMLInputElement>("#f-dir")?.value ?? "").trim();
  const ubicacion = dir || "Calle demo 1 (GPS)";

  if (modoEdit && editBase) {
    // reenvío: restaura estado `pendiente` sobre el MISMO reporte (SPEC-A05, CU-05)
    const reenviado = {
      ...editBase,
      // solo pisa los campos que el usuario modificó; el volumen/tipo original se conserva
      tipo: draft.tipoTocado ? draft.tipo! : editBase.tipo,
      volumenM3: draft.volTocado ? draft.volumen! : editBase.volumenM3,
      ubicacion,
      descripcion: desc || undefined,
      estado: "pendiente" as const,
      historial: [...editBase.historial, { estado: "pendiente" as const, fecha: ahora }],
    };
    guardarReportes(losReportes().map((r) => (r.id === editBase.id ? reenviado : r)));
    toast(`Reporte ${editBase.id} reenviado — pendiente de revisión`);
    setTimeout(() => (location.href = `detalle-reporte.html?id=${editBase.id}`), 1400);
    return;
  }

  const nuevo = {
    id: `R-${String(losReportes().length + 1).padStart(3, "0")}`,
    idCiudadano: "US-01",
    fechaCreacion: ahora,
    tipo: draft.tipo!,
    volumenM3: draft.volumen!,
    ubicacion,
    dentroZona: true,
    descripcion: desc || undefined,
    estado: "pendiente" as const,
    historial: [{ estado: "pendiente" as const, fecha: ahora }],
  };
  guardarReportes([...losReportes(), nuevo]);
  toast("Reporte enviado");
  setTimeout(() => (location.href = "mis-reportes.html"), 1400);
});

/**
 * data.ts — catálogos tipados y dataset DEMO (SPEC §6.3/§6.4, SPEC-C04).
 * Única fuente de datos del prototipo móvil; las vistas nunca hard-codean.
 */
export const TIPOS_ESCOMBRO = ["demolicion", "obra", "mezclado", "peligroso", "otros"];
export const ESTADOS_REPORTE = ["pendiente", "en_revision", "programado", "recolectado", "rechazado", "expirado"];
export const MOTIVOS_RECHAZO = ["fuera_zona", "sin_foto", "duplicado", "sin_metadatos", "otro"];
export const ETIQUETAS_TIPO = {
    demolicion: "Demolición",
    obra: "Restos de obra",
    mezclado: "Mezclado",
    peligroso: "Residuo peligroso",
    otros: "Otros",
};
export const ETIQUETAS_ESTADO = {
    pendiente: "Pendiente",
    en_revision: "En revisión",
    programado: "Programado",
    recolectado: "Recolectado",
    rechazado: "Rechazado",
    expirado: "Expirado",
};
export const MOTIVO_TEXTO = {
    fuera_zona: "fuera de la zona piloto",
    sin_foto: "sin foto verificable",
    duplicado: "duplicado de otro reporte activo",
    sin_metadatos: "sin metadatos GPS/timestamp",
    otro: "otro motivo",
};
/** Dataset fixed de demo (SPEC §6.4). R-009 añadido: TAC-APP-07 exige los 6 estados dentro de US-01. */
export const REPORTES_DEMO = [
    { id: "R-001", idCiudadano: "US-01", fechaCreacion: "2026-11-05T09:12", tipo: "demolicion", volumenM3: 2.5, ubicacion: "Calle demo 1", dentroZona: true, descripcion: "Restos de muro en esquina.", estado: "pendiente", historial: [{ estado: "pendiente", fecha: "2026-11-05T09:12" }] },
    { id: "R-002", idCiudadano: "US-01", fechaCreacion: "2026-11-04T15:40", tipo: "obra", volumenM3: 1.2, ubicacion: "Av. demo 45", dentroZona: true, estado: "en_revision", historial: [{ estado: "pendiente", fecha: "2026-11-04T15:40" }, { estado: "en_revision", fecha: "2026-11-04T17:05" }] },
    { id: "R-003", idCiudadano: "US-01", fechaCreacion: "2026-11-03T10:02", tipo: "mezclado", volumenM3: 6, ubicacion: "Calle demo 12", dentroZona: true, estado: "programado", idOperadorAsignado: "OP-01", fechaEstimada: "2026-11-08", historial: [{ estado: "pendiente", fecha: "2026-11-03T10:02" }, { estado: "en_revision", fecha: "2026-11-03T12:30" }, { estado: "programado", fecha: "2026-11-03T16:00" }] },
    { id: "R-004", idCiudadano: "US-01", fechaCreacion: "2026-10-29T08:20", tipo: "obra", volumenM3: 0.8, ubicacion: "Calle demo 3", dentroZona: true, estado: "expirado", historial: [{ estado: "pendiente", fecha: "2026-10-29T08:20" }, { estado: "expirado", fecha: "2026-11-05T08:20" }] },
    { id: "R-005", idCiudadano: "US-01", fechaCreacion: "2026-10-28T11:00", tipo: "demolicion", volumenM3: 3, ubicacion: "Calle demo 7", dentroZona: true, estado: "recolectado", idOperadorAsignado: "OP-01", idDestino: "DE-02", historial: [{ estado: "pendiente", fecha: "2026-10-28T11:00" }, { estado: "en_revision", fecha: "2026-10-28T14:00" }, { estado: "programado", fecha: "2026-10-28T17:00" }, { estado: "recolectado", fecha: "2026-10-30T09:30" }] },
    { id: "R-006", idCiudadano: "US-01", fechaCreacion: "2026-11-06T07:45", tipo: "peligroso", volumenM3: 0.4, ubicacion: "Calle demo 9", dentroZona: true, descripcion: "Láminas con restos de pintura.", estado: "pendiente", historial: [{ estado: "pendiente", fecha: "2026-11-06T07:45" }] },
    { id: "R-007", idCiudadano: "US-01", fechaCreacion: "2026-11-05T09:35", tipo: "obra", volumenM3: 2, ubicacion: "Calle demo 1", dentroZona: true, estado: "pendiente", historial: [{ estado: "pendiente", fecha: "2026-11-05T09:35" }] },
    { id: "R-008", idCiudadano: "US-01", fechaCreacion: "2026-11-02T13:15", tipo: "demolicion", volumenM3: 1.5, ubicacion: "Av. demo 20", dentroZona: true, estado: "rechazado", motivoRechazo: "sin_foto", historial: [{ estado: "pendiente", fecha: "2026-11-02T13:15" }, { estado: "rechazado", fecha: "2026-11-02T18:00" }] },
    { id: "R-009", idCiudadano: "US-01", fechaCreacion: "2026-10-28T09:10", tipo: "mezclado", volumenM3: 1.5, ubicacion: "Calle demo 15", dentroZona: true, estado: "expirado", historial: [{ estado: "pendiente", fecha: "2026-10-28T09:10" }, { estado: "expirado", fecha: "2026-11-04T09:10" }] },
];
export const USUARIO_DEMO = {
    nombre: "Ana Torres",
    correo: "ana@correo.com",
    telefono: "+51 999 000 111",
};
export const DESTINOS_DEMO = [
    { id: "DE-01", nombre: "Escombrera Municipal", tipo: "relleno_sanitario", direccion: "Distrito 1 · Km 12 Carretera Norte", capacidadM3: 5000, ocupacionM3: 3400, activo: true },
    { id: "DE-02", nombre: "Planta de Trituración y Reciclaje", tipo: "planta_transformacion", direccion: "Parque Industrial · Módulo 4", capacidadM3: 3000, ocupacionM3: 1200, activo: true },
    { id: "DE-03", nombre: "Centro de Acopio Temporal D-1", tipo: "acopio_temporal", direccion: "Barrio San Cristóbal · Calle 3", capacidadM3: 1500, ocupacionM3: 600, activo: true },
];
export const ETIQUETAS_DESTINO_TIPO = {
    relleno_sanitario: "Relleno sanitario",
    planta_transformacion: "Planta de valorización",
    acopio_temporal: "Centro de acopio temporal",
};
export const USUARIOS_SISTEMA_DEMO = [
    { id: "AD-01", nombre: "Carlos Martínez", correo: "supervisor@alcaldia.gob.ni", rol: "admin", activo: true },
    { id: "OP-01", nombre: "Juan Pérez", correo: "juan.perez@brigadas.alcaldia.gob.ni", rol: "operador", vehiculo: "Camión Liviano (3T)", placa: "M-14280", activo: true },
    { id: "OP-02", nombre: "María López", correo: "maria.lopez@brigadas.alcaldia.gob.ni", rol: "operador", vehiculo: "Volquete Pesado (8T)", placa: "M-28910", activo: true },
    { id: "US-01", nombre: "Ana Torres", correo: "ana@correo.com", rol: "ciudadano", activo: true },
];
export const RECOLECCIONES_DEMO = [
    {
        id: "REC-001",
        idReporte: "R-005",
        fecha: "2026-10-30T09:30",
        idOperador: "OP-01",
        volumenRecogidoM3: 3.0,
        pesoEstimadoKg: 4500,
        idDestino: "DE-02",
        vehiculo: "Camión Liviano (3T)"
    }
];
export const TIPOS_ADOQUIN = ["trebol"];
export const ETIQUETADOS_ADOQUIN = {
    trebol: "Adoquín Trebol",
};
export const ADOQUINES_DEMO = [
    {
        id: "ADO-01",
        nombre: "Adoquín Trebol",
        tipo: "trebol",
        precioUnitario: 12.00,
        stockSimulado: 500,
        descripcion: "Adoquín reciclado de forma de trébol, ideal para áreas peatonales y jardines. Fabricado a partir de escombros de demolición procesados en la planta de valorización.",
        imagenUrl: "../assets/adoquines/ado-trebol.svg",
    },
];
export const ESTADOS_PEDIDO = ["pagado", "en_preparacion", "listo_para_retiro", "entregado", "cancelado"];
export const ETIQUETADOS_PEDIDO = {
    pagado: "Pagado",
    en_preparacion: "En preparación",
    listo_para_retiro: "Listo para retiro",
    entregado: "Entregado",
    cancelado: "Cancelado",
};
export const PEDIDOS_DEMO = [
    {
        id: "PED-001",
        idCliente: "US-01",
        fechaCreacion: "2026-11-06T10:00",
        items: [{ idAdoquin: "ADO-01", cantidad: 2, precioUnitario: 12.00, subtotal: 24.00 }],
        subtotal: 24.00,
        estado: "pagado",
        direccionEntrega: "Distrito 1 · Calle demo 1",
        metodoPago: "simulado",
        nota: "Pedido de demostración — sin cobro real",
    },
];

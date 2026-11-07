import * as store from "./store.js";
import { initWebShell } from "./web-shell.js";
import { ETIQUETAS_TIPO, ETIQUETAS_ESTADO, TIPOS_ESCOMBRO, ESTADOS_REPORTE } from "./data.js";
document.addEventListener("DOMContentLoaded", () => {
    initWebShell("metricas", "Métricas y Análisis de Impacto");
    function renderMetricas() {
        const reportes = store.losReportes();
        const recolecciones = store.lasRecolecciones();
        const totalReportes = reportes.length;
        const recolectados = reportes.filter((r) => r.estado === "recolectado").length;
        const pendientes = reportes.filter((r) => r.estado === "pendiente" || r.estado === "en_revision").length;
        const programados = reportes.filter((r) => r.estado === "programado").length;
        const rechazados = reportes.filter((r) => r.estado === "rechazado").length;
        // Volumen total recogido de las actas de recolección
        const volumenTotalM3 = recolecciones.reduce((acc, c) => acc + c.volumenRecogidoM3, 0);
        const pesoTotalKg = recolecciones.reduce((acc, c) => acc + c.pesoEstimadoKg, 0);
        // Tasa de resolución (% recolectados respecto a reportes válidos)
        const tasaResolucion = totalReportes > 0 ? Math.round((recolectados / totalReportes) * 100) : 0;
        // Cobertura estimada del polígono piloto
        const coberturaPct = 94.2;
        // Actualizar KPIs principales
        const kpiTotal = document.getElementById("kpi-total");
        const kpiRecolectados = document.getElementById("kpi-recolectados");
        const kpiVolumen = document.getElementById("kpi-volumen");
        const kpiCobertura = document.getElementById("kpi-cobertura");
        if (kpiTotal)
            kpiTotal.textContent = totalReportes.toString();
        if (kpiRecolectados)
            kpiRecolectados.textContent = `${recolectados} (${tasaResolucion}%)`;
        if (kpiVolumen)
            kpiVolumen.textContent = `${volumenTotalM3.toFixed(1)} m³`;
        if (kpiCobertura)
            kpiCobertura.textContent = `${coberturaPct}%`;
        const subVol = document.getElementById("kpi-volumen-sub");
        if (subVol)
            subVol.textContent = `~${(pesoTotalKg / 1000).toFixed(1)} Toneladas métricas`;
        // Desglose por tipo de material
        const matBreakdownEl = document.getElementById("material-breakdown");
        if (matBreakdownEl) {
            const volPorTipo = {
                demolicion: 0,
                obra: 0,
                mezclado: 0,
                peligroso: 0,
                otros: 0
            };
            reportes.forEach((r) => {
                if (volPorTipo[r.tipo] !== undefined) {
                    volPorTipo[r.tipo] += r.volumenM3;
                }
            });
            const volumenGeneral = Object.values(volPorTipo).reduce((a, b) => a + b, 0) || 1;
            matBreakdownEl.innerHTML = TIPOS_ESCOMBRO.map((t) => {
                const v = volPorTipo[t] || 0;
                const pct = Math.round((v / volumenGeneral) * 100);
                return `
          <div style="margin-bottom: var(--sp-4);">
            <div style="display: flex; justify-content: space-between; font-size: var(--fs-xs); margin-bottom: var(--sp-1);">
              <span><strong>${ETIQUETAS_TIPO[t]}</strong></span>
              <span style="font-family: var(--font-mono); color: var(--color-text-muted);">${v.toFixed(1)} m³ (${pct}%)</span>
            </div>
            <div style="height: 10px; width: 100%; background: color-mix(in srgb, var(--color-text) 8%, transparent); border-radius: 5px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--color-primary); border-radius: 5px;"></div>
            </div>
          </div>
        `;
            }).join("");
        }
        // Desglose por Estado FSM
        const statusBreakdownEl = document.getElementById("status-breakdown");
        if (statusBreakdownEl) {
            const counts = {
                pendiente: 0,
                en_revision: 0,
                programado: 0,
                recolectado: 0,
                rechazado: 0,
                expirado: 0
            };
            reportes.forEach((r) => {
                if (counts[r.estado] !== undefined)
                    counts[r.estado]++;
            });
            statusBreakdownEl.innerHTML = ESTADOS_REPORTE.map((st) => {
                const count = counts[st] || 0;
                const pct = totalReportes > 0 ? Math.round((count / totalReportes) * 100) : 0;
                return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--sp-2) 0; border-bottom: 1px solid color-mix(in srgb, var(--color-text) 6%, transparent);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge--${st}" style="font-size: 11px;">${ETIQUETAS_ESTADO[st]}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: var(--fs-xs); color: var(--color-text-muted);">${pct}%</span>
              <strong style="font-family: var(--font-mono); font-size: var(--fs-sm);">${count}</strong>
            </div>
          </div>
        `;
            }).join("");
        }
        // Desglose por Destino
        const destBreakdownEl = document.getElementById("destinos-breakdown");
        if (destBreakdownEl) {
            const destinos = store.losDestinos();
            destBreakdownEl.innerHTML = destinos.map((d) => {
                const pct = Math.min(100, Math.round((d.ocupacionM3 / d.capacidadM3) * 100));
                return `
          <div style="margin-bottom: var(--sp-3);">
            <div style="display: flex; justify-content: space-between; font-size: var(--fs-xs); margin-bottom: 2px;">
              <span>${store.esc(d.nombre)}</span>
              <strong style="font-family: var(--font-mono);">${d.ocupacionM3.toLocaleString()} / ${d.capacidadM3.toLocaleString()} m³ (${pct}%)</strong>
            </div>
            <div style="height: 6px; width: 100%; background: color-mix(in srgb, var(--color-text) 8%, transparent); border-radius: 3px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: ${pct > 80 ? '#c62828' : 'var(--color-primary-dark)'}; border-radius: 3px;"></div>
            </div>
          </div>
        `;
            }).join("");
        }
    }
    // Selector de período
    const selPeriodo = document.getElementById("selector-periodo");
    selPeriodo === null || selPeriodo === void 0 ? void 0 : selPeriodo.addEventListener("change", () => {
        renderMetricas();
    });
    renderMetricas();
});

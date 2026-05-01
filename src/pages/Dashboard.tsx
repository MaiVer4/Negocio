import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import Charts from "../components/Charts"
import { formatCurrency } from "../services/helpers"
import { calcularDashboard } from "../services/dashboardService"
import { obtenerDatosGraficas } from "../services/chartService"
 
export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [charts,  setCharts]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)
        const [resMetrics, resCharts] = await Promise.all([
          calcularDashboard(),
          obtenerDatosGraficas()
        ])
        setMetrics(resMetrics)
        setCharts(resCharts)
      } catch (err) {
        console.error("Error al cargar el dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])
 
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          <p className="text-gray-500 animate-pulse text-xs font-mono tracking-widest uppercase">
            Sincronizando métricas...
          </p>
        </div>
      </Layout>
    )
  }
 
  const vendedoresOrdenados = metrics
    ? Object.entries(metrics.vendedores).sort((a: any, b: any) => b[1] - a[1])
    : []
 
  const lotesOrdenados = metrics?.lotes
    ? (Object.entries(metrics.lotes) as [string, { vendidas: number; ganancia: number; ingreso: number }][])
        .sort((a, b) => b[1].vendidas - a[1].vendidas)
    : []
 
  const maxVendidasLote = lotesOrdenados.length > 0
    ? Math.max(...lotesOrdenados.map(([, d]) => d.vendidas))
    : 1
 
  return (
    <Layout>
 
      {/* ── HEADER ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1
            className="text-xl md:text-2xl font-extrabold text-white leading-none"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}
          >
            Panel de Control
          </h1>
          <p className="text-[10px] text-gray-600 mt-1 font-mono uppercase tracking-widest">
            Resumen operativo y financiero
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse block" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-[1.5px] text-emerald-400">
            Sistema Activo
          </span>
        </div>
      </div>
 
      {/* ── ALERTAS ── */}
      <div className="flex flex-col gap-2 mb-6">
        {metrics?.stock < 20 && (
          <div className="flex items-center gap-3 bg-orange-500/8 border border-orange-500/20 rounded-xl px-4 py-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-orange-500/15 text-sm">⚠️</span>
            <p className="text-sm font-semibold text-orange-400">
              Stock Crítico — Solo quedan <span className="font-black">{metrics.stock}</span> unidades en bodega.
            </p>
          </div>
        )}
        {metrics?.fiados > 0 && (
          <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-500/15 text-sm">💳</span>
            <p className="text-sm font-semibold text-red-400">
              Cuentas por Cobrar — Hay <span className="font-black">{formatCurrency(metrics.fiados)}</span> en fiados pendientes.
            </p>
          </div>
        )}
        {metrics?.diferenciaInventario > 5 && (
          <div className="flex items-center gap-3 bg-purple-500/8 border border-purple-500/20 rounded-xl px-4 py-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-purple-500/15 text-sm">📦</span>
            <p className="text-sm font-semibold text-purple-400">
              Fuga Detectada — <span className="font-black">{metrics.diferenciaInventario}</span> unidades entregadas sin reporte.
            </p>
          </div>
        )}
      </div>
 
      {/* ── KPIs PRINCIPALES — 2 col mobile / 4 col desktop ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
 
        <div className={`relative overflow-hidden rounded-2xl border p-4 md:p-5
          ${metrics?.ganancia < 0 ? "bg-red-500/5 border-red-500/15" : "bg-[#0d1f17] border-emerald-500/20"}`}>
          <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl
            ${metrics?.ganancia < 0
              ? "bg-gradient-to-r from-red-500 to-transparent"
              : "bg-gradient-to-r from-emerald-400 to-transparent"}`} />
          <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">Utilidad Neta</p>
          <p className={`text-lg md:text-2xl font-black tracking-tight leading-none
            ${metrics?.ganancia < 0 ? "text-red-400" : "text-emerald-400"}`}
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {formatCurrency(metrics?.ganancia || 0)}
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">ganancia real</p>
        </div>
 
        <div className="relative overflow-hidden rounded-2xl border bg-[#0d1525] border-blue-500/15 p-4 md:p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-400 to-transparent" />
          <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">Ingresos Brutos</p>
          <p className="text-lg md:text-2xl font-black tracking-tight leading-none text-blue-400"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {formatCurrency(metrics?.ingresos || 0)}
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">período actual</p>
        </div>
 
        <div className="relative overflow-hidden rounded-2xl border bg-[#111318] border-gray-700/50 p-4 md:p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-gray-400 to-transparent" />
          <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">ROI</p>
          <p className="text-lg md:text-2xl font-black tracking-tight leading-none text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {metrics?.ROI.toFixed(1)}%
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">retorno total</p>
        </div>
 
        <div className="relative overflow-hidden rounded-2xl border bg-[#160f2a] border-purple-500/15 p-4 md:p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-purple-400 to-transparent" />
          <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">Punto Equilibrio</p>
          <p className="text-lg md:text-2xl font-black tracking-tight leading-none text-purple-400"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {metrics?.puntoEquilibrio.toFixed(0)}{" "}
            <span className="text-sm font-medium">uds</span>
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-1">umbral mínimo</p>
        </div>
      </div>
 
      {/* ── MÉTRICAS SECUNDARIAS — 3 cols siempre, texto más chico en mobile ── */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
        <div className="rounded-xl border border-gray-800 bg-[#111318] p-3 md:p-4 text-center">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[1px] text-gray-600 font-mono mb-1">Ingresos</p>
          <p className="text-sm md:text-lg font-bold text-blue-400 truncate">{formatCurrency(metrics?.ingresos || 0)}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-[#111318] p-3 md:p-4 text-center">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[1px] text-gray-600 font-mono mb-1">Costos</p>
          <p className="text-sm md:text-lg font-bold text-red-400 truncate">{formatCurrency(metrics?.costos || 0)}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-[#111318] p-3 md:p-4 text-center">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[1px] text-gray-600 font-mono mb-1">Comisiones</p>
          <p className="text-sm md:text-lg font-bold text-orange-400 truncate">{formatCurrency(metrics?.comisiones || 0)}</p>
        </div>
      </div>
 
      {/* ── GRÁFICAS ── */}
      {charts && (
        <div className="mb-6">
          <Charts dataDia={charts.dataDia} dataVendedor={charts.dataVendedor} />
        </div>
      )}
 
      {/* ── RANKING + LOGÍSTICA — 1 col mobile / 2 col desktop ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 
        <section className="rounded-2xl border border-gray-800 bg-[#111318] p-5">
          <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-600 font-mono mb-4">
            🏆 Top Desempeño
          </p>
          <div className="flex flex-col gap-2">
            {vendedoresOrdenados.map(([nombre, total]: any, index) => (
              <div key={index}
                className="flex justify-between items-center bg-[#0d0f14] border border-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center rounded-md text-[10px] font-bold font-mono
                    ${index === 0
                      ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                      : "bg-gray-800 text-gray-500 border border-gray-700"}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-300 truncate">{nombre}</span>
                </div>
                <span className="text-sm font-bold text-blue-400 font-mono flex-shrink-0 ml-2">
                  {total} <span className="text-[10px] font-normal text-gray-600">uds</span>
                </span>
              </div>
            ))}
          </div>
        </section>
 
        <section className="rounded-2xl border border-gray-800 bg-[#111318] p-5">
          <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-600 font-mono mb-4">
            📦 Logística
          </p>
          <div className="flex flex-col">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-sm text-gray-500">Total Producido</span>
              <span className="text-sm font-bold text-white font-mono">{metrics?.unidadesProducidas} uds</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-sm text-gray-500">Total Vendido</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{metrics?.unidadesVendidas} uds</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center bg-[#0d0f14] border border-gray-800 rounded-xl px-4 py-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-gray-600 font-mono mb-1">Stock en Bodega</p>
              <p className="text-xs text-gray-600">{metrics?.stock < 20 ? "⚠️ Stock crítico" : "Estado normal"}</p>
            </div>
            <span className={`text-4xl font-black tracking-tighter leading-none
              ${metrics?.stock < 20 ? "text-orange-400" : "text-white"}`}
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {metrics?.stock}
            </span>
          </div>
        </section>
      </div>
 
      {/* ── RENDIMIENTO POR LOTE ── */}
      {lotesOrdenados.length > 0 && (
        <section className="rounded-2xl border border-gray-800 bg-[#111318] p-4 md:p-5 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-600 font-mono">
              🏷️ Rendimiento por Lote
            </p>
            <span className="text-[9px] font-mono text-gray-700 border border-gray-800 px-2 py-1 rounded-lg">
              {lotesOrdenados.length} lotes activos
            </span>
          </div>
 
          {/* DESKTOP — tabla con grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_80px_110px_110px_90px] gap-3 px-4 mb-2">
              {["Lote","Vendidas","Ingreso","Ganancia","Margen"].map((h, i) => (
                <p key={h} className={`text-[8px] font-black uppercase tracking-widest text-gray-700 font-mono
                  ${i === 0 ? "" : i === 1 ? "text-center" : "text-right"}`}>{h}</p>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {lotesOrdenados.map(([nombre, data], index) => {
                const margenLote = data.ingreso > 0 ? (data.ganancia / data.ingreso) * 100 : 0
                const pct        = maxVendidasLote > 0 ? (data.vendidas / maxVendidasLote) * 100 : 0
                const esTop      = index === 0
                const enNegativo = data.ganancia < 0
                return (
                  <div key={nombre}
                    className={`relative overflow-hidden rounded-xl border px-4 py-3
                      ${esTop ? "border-emerald-500/30 bg-emerald-500/5"
                      : enNegativo ? "border-red-500/20 bg-red-500/5"
                      : "border-gray-800 bg-[#0d0f14]"}`}>
                    <div
                      className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-700
                        ${esTop ? "bg-emerald-400" : enNegativo ? "bg-red-400" : "bg-blue-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative grid grid-cols-[1fr_80px_110px_110px_90px] gap-3 items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        {esTop && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">TOP</span>}
                        {enNegativo && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">⚠</span>}
                        <span className="text-sm font-bold text-white truncate font-mono">{nombre}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-black text-white font-mono">{data.vendidas}</span>
                        <span className="text-[9px] text-gray-600 ml-1">uds</span>
                      </div>
                      <p className="text-sm font-bold text-blue-400 font-mono text-right">{formatCurrency(data.ingreso)}</p>
                      <p className={`text-sm font-black font-mono text-right ${enNegativo ? "text-red-400" : "text-emerald-400"}`}>
                        {formatCurrency(data.ganancia)}
                      </p>
                      <div className="text-right">
                        <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-lg
                          ${margenLote >= 50 ? "bg-emerald-500/15 text-emerald-400"
                          : margenLote >= 25 ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-red-500/15 text-red-400"}`}>
                          {margenLote.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-[1fr_80px_110px_110px_90px] gap-3 px-4 pt-3 border-t border-gray-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 font-mono">TOTAL</p>
              <p className="text-[9px] font-black text-white font-mono text-center">{lotesOrdenados.reduce((s,[,d])=>s+d.vendidas,0)} uds</p>
              <p className="text-[9px] font-black text-blue-400 font-mono text-right">{formatCurrency(lotesOrdenados.reduce((s,[,d])=>s+d.ingreso,0))}</p>
              <p className="text-[9px] font-black text-emerald-400 font-mono text-right">{formatCurrency(lotesOrdenados.reduce((s,[,d])=>s+d.ganancia,0))}</p>
              <p className="text-[9px] font-black text-gray-500 font-mono text-right">—</p>
            </div>
          </div>
 
          {/* MOBILE — cards apiladas */}
          <div className="flex flex-col gap-2 md:hidden">
            {lotesOrdenados.map(([nombre, data], index) => {
              const margenLote = data.ingreso > 0 ? (data.ganancia / data.ingreso) * 100 : 0
              const esTop      = index === 0
              const enNegativo = data.ganancia < 0
              return (
                <div key={nombre}
                  className={`rounded-xl border p-4
                    ${esTop ? "border-emerald-500/30 bg-emerald-500/5"
                    : enNegativo ? "border-red-500/20 bg-red-500/5"
                    : "border-gray-800 bg-[#0d0f14]"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {esTop && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase">TOP</span>}
                      {enNegativo && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-black uppercase">⚠</span>}
                      <span className="text-sm font-black text-white font-mono">{nombre}</span>
                    </div>
                    <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-lg
                      ${margenLote >= 50 ? "bg-emerald-500/15 text-emerald-400"
                      : margenLote >= 25 ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-red-500/15 text-red-400"}`}>
                      {margenLote.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#111318] rounded-lg p-2 text-center">
                      <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Vendidas</p>
                      <p className="text-sm font-black text-white font-mono">{data.vendidas}<span className="text-[9px] text-gray-600 ml-0.5">uds</span></p>
                    </div>
                    <div className="bg-[#111318] rounded-lg p-2 text-center">
                      <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Ingreso</p>
                      <p className="text-sm font-black text-blue-400 font-mono">{formatCurrency(data.ingreso)}</p>
                    </div>
                    <div className="bg-[#111318] rounded-lg p-2 text-center">
                      <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Ganancia</p>
                      <p className={`text-sm font-black font-mono ${enNegativo ? "text-red-400" : "text-emerald-400"}`}>
                        {formatCurrency(data.ganancia)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Totales mobile */}
            <div className="rounded-xl border border-gray-700 bg-[#0d0f14] p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 font-mono mb-3">TOTAL</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Vendidas</p>
                  <p className="text-sm font-black text-white font-mono">{lotesOrdenados.reduce((s,[,d])=>s+d.vendidas,0)} uds</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Ingreso</p>
                  <p className="text-sm font-black text-blue-400 font-mono">{formatCurrency(lotesOrdenados.reduce((s,[,d])=>s+d.ingreso,0))}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-600 font-mono uppercase mb-1">Ganancia</p>
                  <p className="text-sm font-black text-emerald-400 font-mono">{formatCurrency(lotesOrdenados.reduce((s,[,d])=>s+d.ganancia,0))}</p>
                </div>
              </div>
            </div>
          </div>
 
        </section>
      )}
 
    </Layout>
  )
}

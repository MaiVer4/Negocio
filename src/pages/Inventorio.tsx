import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { calcularInventario } from "../services/inventoryService"
 
export default function Inventario() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
 
    useEffect(() => {
        calcularInventario().then((res) => {
            setData(res)
            setLoading(false)
        })
    }, [])
 
    if (loading) return (
        <Layout>
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
                <p className="text-[11px] text-gray-600 animate-pulse font-mono uppercase tracking-widest">
                    Analizando almacén...
                </p>
            </div>
        </Layout>
    )
 
    const alerta = data.restante < 0
    const sobreStock = data.eficiencia < 70 && data.totalProducido > 0
    const inventarioSano = !alerta && !sobreStock && data.totalProducido > 0
 
    // Barra de progreso: qué % del producido ya fue vendido (máx 100)
    const barWidth = Math.min(data.eficiencia, 100)
    const barColor =
        alerta ? "#f87171" :
        sobreStock ? "#fbbf24" :
        "#34d399"
 
    return (
        <Layout>
 
            {/* ── HEADER ── */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1
                        className="text-2xl font-extrabold text-white tracking-tight leading-none"
                        style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}
                    >
                        Estado del Inventario
                    </h1>
                    <p className="text-[11px] text-gray-600 mt-1 font-mono uppercase tracking-widest">
                        Flujo de producción y stock
                    </p>
                </div>
                {/* Badge de estado */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-mono font-bold uppercase tracking-[1.5px]
                    ${alerta
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : sobreStock
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}
                >
                    <span className={`w-[6px] h-[6px] rounded-full animate-pulse
                        ${alerta ? "bg-red-400" : sobreStock ? "bg-yellow-400" : "bg-emerald-400"}`}
                    />
                    {alerta ? "Déficit" : sobreStock ? "Sobre-stock" : "Sano"}
                </div>
            </div>
 
            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
 
                {/* Total Producido */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-[#0d1525] p-5">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-400 to-transparent" />
                    <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">
                        Total Producido
                    </p>
                    <p className="text-2xl font-black tracking-tight leading-none text-blue-400"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {data.totalProducido}
                        <span className="text-sm font-medium text-gray-600 ml-1">uds</span>
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1">fabricado total</p>
                </div>
 
                {/* Total Vendido */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/15 bg-[#160f2a] p-5">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-purple-400 to-transparent" />
                    <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">
                        Total Vendido
                    </p>
                    <p className="text-2xl font-black tracking-tight leading-none text-purple-400"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {data.totalVendido}
                        <span className="text-sm font-medium text-gray-600 ml-1">uds</span>
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1">salida registrada</p>
                </div>
 
                {/* Stock Real */}
                <div className={`relative overflow-hidden rounded-2xl border p-5
                    ${alerta
                        ? "border-red-500/20 bg-[#1f0d0d]"
                        : "border-emerald-500/20 bg-[#0d1f17]"}`}
                >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl
                        ${alerta
                            ? "bg-gradient-to-r from-red-400 to-transparent"
                            : "bg-gradient-to-r from-emerald-400 to-transparent"}`}
                    />
                    <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">
                        Stock Real
                    </p>
                    <p className={`text-2xl font-black tracking-tight leading-none
                        ${alerta ? "text-red-400" : "text-emerald-400"}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {data.restante}
                        <span className="text-sm font-medium text-gray-600 ml-1">uds</span>
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1">en bodega</p>
                </div>
 
                {/* Eficiencia */}
                <div className="relative overflow-hidden rounded-2xl border border-orange-500/15 bg-[#1a1205] p-5">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-orange-400 to-transparent" />
                    <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-600 font-mono mb-2">
                        Eficiencia
                    </p>
                    <p className="text-2xl font-black tracking-tight leading-none text-orange-400"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {data.eficiencia.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1">ventas / producción</p>
                </div>
 
            </div>
 
            {/* ── BARRA DE EFICIENCIA ── */}
            <div className="rounded-2xl border border-gray-800 bg-[#111318] p-5 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-600 font-mono">
                        Tasa de Conversión — Producido vs Vendido
                    </p>
                    <span className="text-[10px] font-bold font-mono"
                        style={{ color: barColor }}>
                        {data.eficiencia.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%`, background: barColor }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-700">
                    <span>0%</span>
                    <span className="text-gray-600">meta: 100%</span>
                    <span>100%</span>
                </div>
            </div>
 
            {/* ── DESGLOSE ── */}
            <div className="rounded-2xl border border-gray-800 bg-[#111318] p-5 mb-7">
                <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-600 font-mono mb-4">
                    Desglose de Flujo
                </p>
                <div className="flex flex-col gap-0">
                    <div className="flex justify-between items-center py-3 border-b border-gray-800">
                        <span className="text-sm text-gray-500">Unidades fabricadas</span>
                        <span className="text-sm font-bold text-blue-400 font-mono">+{data.totalProducido} uds</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-800">
                        <span className="text-sm text-gray-500">Unidades vendidas</span>
                        <span className="text-sm font-bold text-purple-400 font-mono">−{data.totalVendido} uds</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-semibold text-gray-300">Balance neto en bodega</span>
                        <span className={`text-lg font-black font-mono tracking-tight
                            ${alerta ? "text-red-400" : "text-emerald-400"}`}
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            {data.restante > 0 ? "+" : ""}{data.restante} uds
                        </span>
                    </div>
                </div>
            </div>
 
            {/* ── ALERTAS ── */}
            <div className="flex flex-col gap-2">
                {alerta && (
                    <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-4">
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-500/15 text-sm mt-0.5">⚠️</span>
                        <div>
                            <p className="text-sm font-black text-red-400 mb-0.5">Déficit Detectado</p>
                            <p className="text-xs text-red-400/70 leading-relaxed">
                                Estás registrando ventas de productos que no has fabricado en el sistema. Revisa si hay producciones sin registrar.
                            </p>
                        </div>
                    </div>
                )}
                {sobreStock && (
                    <div className="flex items-start gap-3 bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-4 py-4">
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-yellow-500/15 text-sm mt-0.5">📦</span>
                        <div>
                            <p className="text-sm font-black text-yellow-400 mb-0.5">Sobre-stock Acumulado</p>
                            <p className="text-xs text-yellow-400/70 leading-relaxed">
                                Tienes mucho producto acumulado sin mover. Considera pausar la producción o impulsar las ventas.
                            </p>
                        </div>
                    </div>
                )}
                {inventarioSano && (
                    <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-4">
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/15 text-sm mt-0.5">✅</span>
                        <div>
                            <p className="text-sm font-black text-emerald-400 mb-0.5">Inventario Sano</p>
                            <p className="text-xs text-emerald-400/70 leading-relaxed">
                                El flujo entre producción y ventas está equilibrado. Buen trabajo.
                            </p>
                        </div>
                    </div>
                )}
            </div>
 
        </Layout>
    )
}

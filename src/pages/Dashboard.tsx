import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import Charts from "../components/Charts"
import Card from "../components/ui/Card"
import { formatCurrency } from "../services/helpers"
import { calcularDashboard } from "../services/dashboardService"
import { obtenerDatosGraficas } from "../services/chartService"

export default function Dashboard() {
    const [metrics, setMetrics] = useState<any>(null)
    const [charts, setCharts] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function cargarDatos() {
            try {
                setLoading(true)
                // Carga en paralelo de métricas financieras y datos de gráficas
                const [resMetrics, resCharts] = await Promise.all([
                    calcularDashboard(),
                    obtenerDatosGraficas()
                ])

                setMetrics(resMetrics)
                setCharts(resCharts)
            } catch (error) {
                console.error("Error al cargar el dashboard:", error)
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <p className="text-gray-400 animate-pulse text-sm">Sincronizando métricas con Firebase...</p>
                </div>
            </Layout>
        )
    }

    // Ordenar vendedores por volumen de ventas
    const vendedoresOrdenados = metrics ? Object.entries(metrics.vendedores)
        .sort((a: any, b: any) => b[1] - a[1]) : []

    return (
        <Layout>
            {/* HEADER EJECUTIVO */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
                    <p className="text-xs text-gray-500">Resumen operativo y financiero</p>
                </div>
                <span className="bg-emerald-500/10 text-[10px] px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-400 font-mono uppercase tracking-widest">
                    Sistema Activo
                </span>
            </div>

            {/* SECCIÓN DE ALERTAS INTELIGENTES */}
            <div className="grid gap-3 mb-8">
                {metrics?.stock < 20 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="text-sm font-bold text-orange-400">
                            Stock Crítico: Solo quedan {metrics.stock} unidades en bodega.
                        </p>
                    </div>
                )}
                {metrics?.fiados > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-xl">💳</span>
                        <p className="text-sm font-bold text-red-400">
                            Cuentas por Cobrar: Hay ${metrics.fiados.toLocaleString()} en fiados pendientes.
                        </p>
                    </div>
                )}
                {metrics?.diferenciaInventario > 5 && (
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-xl">📦</span>
                        <p className="text-sm font-bold text-purple-400">
                            Fuga Detectada: {metrics.diferenciaInventario} unidades entregadas sin reporte de venta.
                        </p>
                    </div>
                )}
            </div>

            {/* KPIs DE ALTO NIVEL */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className={`${metrics?.ganancia < 0 ? 'bg-red-500/5' : 'bg-emerald-500/5'} border-emerald-500/20`}>
                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Utilidad Neta</p>
                    <h2 className={`text-2xl font-black ${metrics?.ganancia < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                        {formatCurrency(metrics?.ganancia || 0)}
                    </h2>
                </Card>

                <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Ingresos Brutos</p>
                    <p className="text-lg font-bold text-blue-400">{formatCurrency(metrics?.ingresos || 0)}</p>
                </div>

                <Card className="bg-gray-800/40">
                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">ROI</p>
                    <h2 className="text-2xl font-black text-white">{metrics?.ROI.toFixed(1)}%</h2>
                </Card>

                <Card className="bg-purple-500/5 border-purple-500/20">
                    <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Punto Equilibrio</p>
                    <h2 className="text-2xl font-black text-purple-400">
                        {metrics?.puntoEquilibrio.toFixed(0)} <span className="text-xs">uds</span>
                    </h2>
                </Card>
            </div>

            {/* MÉTRICAS SECUNDARIAS */}
            <div className="grid gap-4 md:grid-cols-3 mb-8 text-center">

                {/* INGRESOS */}
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Ingresos Brutos</p>
                    <p className="text-lg font-bold text-blue-400">
                        {formatCurrency(metrics?.ingresos || 0)}
                    </p>
                </div>

                {/* INVERSIÓN COSTOS - ¡CORREGIDO AQUÍ! */}
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Inversión Costos</p>
                    <p className="text-lg font-bold text-rose-400">
                        {formatCurrency(metrics?.costos || 0)}
                    </p>
                </div>

                {/* COMISIONES */}
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Comisiones</p>
                    <p className="text-lg font-bold text-orange-400">
                        {formatCurrency(metrics?.comisiones || 0)}
                    </p>
                </div>

            </div>

            {/* SECCIÓN DE GRÁFICAS (Chart.js) */}
            {charts && (
                <div className="mb-8">
                    <Charts
                        dataDia={charts.dataDia}
                        dataVendedor={charts.dataVendedor}
                    />
                </div>
            )}

            {/* RANKING Y STOCK */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* RANKING DE VENDEDORES */}
                <section className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                        <span>🏆</span> Top Desempeño
                    </h2>

                    <div className="space-y-3">
                        {vendedoresOrdenados.map(([nombre, total]: any, index) => (
                            <div key={index} className="bg-gray-950 p-4 rounded-xl flex justify-between items-center border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-sm text-gray-200">{nombre}</span>
                                </div>
                                <span className="text-blue-400 font-bold text-sm">
                                    {total} <span className="text-[10px] font-normal text-gray-500 uppercase">uds</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ESTADO DE INVENTARIO */}
                <section className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                        <span>📊</span> Logística
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Total Producido</span>
                            <span className="text-white font-mono">{metrics?.unidadesProducidas} uds</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Total Vendido</span>
                            <span className="text-emerald-400 font-mono">{metrics?.unidadesVendidas} uds</span>
                        </div>
                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-300">Stock en Bodega</span>
                            <span className={`text-2xl font-black ${metrics?.stock < 20 ? 'text-orange-500' : 'text-white'}`}>
                                {metrics?.stock}
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    )
}
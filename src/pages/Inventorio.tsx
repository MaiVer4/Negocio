import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { calcularInventario } from "../services/inventoryService"
import Card from "../components/ui/Card"

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
      <p className="text-center mt-10 animate-pulse text-gray-500">Analizando almacén...</p>
    </Layout>
  )

  const alerta = data.restante < 0
  const sobreStock = data.eficiencia < 70 && data.totalProducido > 0

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-white">Estado del Inventario</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Total Producido</p>
          <h2 className="text-2xl font-black text-blue-400">{data.totalProducido} <span className="text-sm font-normal">uds</span></h2>
        </Card>

        <Card>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Total Vendido</p>
          <h2 className="text-2xl font-black text-purple-400">{data.totalVendido} <span className="text-sm font-normal">uds</span></h2>
        </Card>

        <Card className={alerta ? "border-red-500/50 bg-red-500/5" : "border-emerald-500/50 bg-emerald-500/5"}>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Stock Real</p>
          <h2 className={`text-2xl font-black ${alerta ? "text-danger" : "text-primary"}`}>
            {data.restante} <span className="text-sm font-normal">uds</span>
          </h2>
        </Card>

        <Card>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Eficiencia</p>
          <h2 className="text-2xl font-black text-orange-400">{data.eficiencia.toFixed(1)}%</h2>
        </Card>
      </div>

      {/* ALERTAS INTELIGENTES */}
      <div className="mt-8 space-y-4">
        {alerta && (
          <div className="bg-red-600/20 border border-red-600 p-4 rounded-2xl flex items-center gap-3 text-red-200">
            <span className="text-2xl">⚠️</span>
            <p><strong>Déficit detectado:</strong> Estás registrando ventas de productos que no has fabricado en el sistema.</p>
          </div>
        )}

        {sobreStock && (
          <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-2xl flex items-center gap-3 text-yellow-200">
            <span className="text-2xl">📦</span>
            <p><strong>Sobre-stock:</strong> Tienes mucho producto acumulado. Considera pausar la producción o aumentar las ventas.</p>
          </div>
        )}

        {!alerta && !sobreStock && data.totalProducido > 0 && (
          <div className="bg-emerald-600/20 border border-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-emerald-200">
            <span className="text-2xl">✅</span>
            <p><strong>Inventario sano:</strong> El flujo entre producción y ventas está equilibrado.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
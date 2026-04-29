import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import { calcularVendedores } from "../services/sellerService"
import Card from "../components/ui/Card"

export default function Vendedores() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calcularVendedores().then(res => {
      setData(res)
      setLoading(false)
    })
  }, [])

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Vendedores</h1>
        <div className="bg-gray-800 px-3 py-1 rounded-lg border border-gray-700 text-xs text-gray-400">
          {data.length} Vendedores activos
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse py-10">Analizando desempeño...</p>
      ) : (
        <div className="space-y-4">
          {data.map((v, index) => (
            <Card key={index} className={`relative overflow-hidden ${v.fiados > 0 ? 'border-r-2 border-r-red-500' : ''}`}>
              {/* Indicador de Ranking para el #1 */}
              {index === 0 && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {index === 0 ? "🥇" : index + 1}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {v.nombre}
                      {index === 0 && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded uppercase font-bold">
                          Top Performer
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {v.vendidas} vendidas / {v.entregadas} entregadas
                    </p>
                    
                    {/* Alertas de desempeño */}
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.efectividad >= 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        Efectividad: {v.efectividad.toFixed(1)}%
                      </span>
                      {v.fiados > 0 && (
                        <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          Deuda: ${v.fiados.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-emerald-400 leading-tight">
                    ${v.ingresos.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Comisión: <span className="text-orange-400">${v.comisiones.toLocaleString()}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    Utilidad Negocio: ${v.gananciaNegocio.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          
          {data.length === 0 && (
            <div className="text-center py-10 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700">
              <p className="text-gray-500 italic">No hay datos de ventas registrados aún.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
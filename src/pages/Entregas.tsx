import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { formatCurrency } from "../services/helpers"
import { 
  obtenerEntregasDB, 
  guardarEntregaDB, 
  actualizarEntregaDB, 
  eliminarEntregaDB 
} from "../services/entregaService"

export default function EntregasPage() {
  const [vendedor, setVendedor] = useState("")
  const [cantidad, setCantidad] = useState(0)
  const [editId, setEditId] = useState<string | null>(null)
  const [lista, setLista] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarEntregas()
  }, [])

  async function cargarEntregas() {
    const res = await obtenerEntregasDB()
    setLista(res)
  }

  async function handleSave() {
    if (!vendedor || cantidad <= 0) return alert("Por favor, completa los datos correctamente.")
    setLoading(true)

    const data = { 
      vendedor, 
      cantidad, 
      fecha: editId ? lista.find(i => i.id === editId)?.fecha : new Date().toISOString() 
    }

    try {
      if (editId) {
        await actualizarEntregaDB(editId, data)
        alert("Registro actualizado correctamente")
      } else {
        await guardarEntregaDB(data as any)
        alert("Entrega registrada con éxito")
      }
      limpiarFormulario()
      cargarEntregas()
    } catch (e) {
      alert("Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  function prepararEdicion(item: any) {
    setEditId(item.id)
    setVendedor(item.vendedor)
    setCantidad(item.cantidad)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmarEliminacion(id: string) {
    if (window.confirm("¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.")) {
      try {
        await eliminarEntregaDB(id)
        cargarEntregas()
      } catch (e) {
        alert("Error al eliminar")
      }
    }
  }

  function limpiarFormulario() {
    setEditId(null)
    setVendedor("")
    setCantidad(0)
  }

  // Filtrado de búsqueda en tiempo real
  const listaFiltrada = lista.filter(item => 
    item.vendedor.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Logística de Entregas</h1>
        <p className="text-gray-500 text-sm">Control de mercancía despachada a vendedores</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (1 de 3 partes) */}
        <div className="lg:col-span-1">
          <Card className={`${editId ? "border-orange-500/50 bg-orange-500/5" : "border-gray-800 bg-gray-900/50"} sticky top-6`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">{editId ? "✏️" : "📦"}</span>
              <h3 className="text-xs uppercase font-black tracking-widest text-gray-400">
                {editId ? "Editando Despacho" : "Nuevo Despacho"}
              </h3>
            </div>

            <div className="space-y-5">
              <Input 
                label="Nombre del Vendedor" 
                placeholder="Ej: Camilo"
                value={vendedor} 
                onChange={e => setVendedor(e.target.value)} 
              />
              
              <Input 
                type="number" 
                label="Cantidad a Entregar (uds)" 
                placeholder="0"
                value={cantidad} 
                onChange={e => setCantidad(Number(e.target.value))} 
              />

              <div className="pt-2 space-y-3">
                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${editId ? 'bg-orange-600 hover:bg-orange-500' : ''}`}
                >
                  {loading ? "Sincronizando..." : editId ? "Guardar Cambios" : "Confirmar Salida"}
                </Button>
                
                {editId && (
                  <button 
                    onClick={limpiarFormulario}
                    className="w-full text-[10px] text-gray-500 uppercase font-bold hover:text-white transition-colors"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL (2 de 3 partes) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h3 className="text-xs uppercase font-black tracking-widest text-gray-500 px-2">
              Historial de Movimientos
            </h3>
            {/* Buscador Integrado */}
            <input 
              type="text"
              placeholder="🔍 Buscar vendedor..."
              className="bg-gray-800 border border-gray-700 text-xs px-4 py-2 rounded-full text-white outline-none focus:border-blue-500 w-full md:w-64"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            {listaFiltrada.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                <p className="text-gray-600 italic">No se encontraron registros de entrega.</p>
              </div>
            ) : (
              listaFiltrada.map((item) => (
                <Card key={item.id} className="hover:border-blue-500/30 transition-all group relative overflow-hidden bg-gray-900/40">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-50 group-hover:opacity-100"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Info Vendedor */}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {item.vendedor}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          📅 {new Date(item.fecha).toLocaleDateString('es-CO')}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Datos de Inventario */}
                    <div className="flex items-center gap-8 md:px-8 md:border-l md:border-gray-800/50">
                      <div className="text-center md:text-left">
                        <p className="text-[9px] uppercase text-gray-500 font-black mb-1">Carga</p>
                        <p className="text-xl font-black text-white">
                          {item.cantidad} <span className="text-[10px] font-normal text-gray-500">uds</span>
                        </p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-[9px] uppercase text-gray-500 font-black mb-1">Valoración</p>
                        <p className="text-xl font-black text-emerald-400">
                          {/* Calculado a base de 2000 COP como referencia rápida */}
                          {formatCurrency(item.cantidad * 2000)}
                        </p>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-2 border-t border-gray-800 pt-4 md:pt-0 md:border-t-0">
                      <button 
                        onClick={() => prepararEdicion(item)}
                        className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                        title="Editar Registro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => confirmarEliminacion(item.id)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        title="Eliminar Registro"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
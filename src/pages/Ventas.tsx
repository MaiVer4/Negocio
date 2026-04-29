import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { 
  obtenerVentasDB, 
  guardarVentaDB, 
  actualizarVentaDB, 
  eliminarVentaDB, 
  calcularVentaExcel 
} from "../services/ventaService"
import { obtenerProduccionesDB } from "../services/produccionService"
import { formatCurrency } from "../services/helpers"

export default function VentasPage() {
  const [vendedor, setVendedor] = useState("")
  // Estado para la fecha (inicializado con la fecha de hoy en formato YYYY-MM-DD)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [entregadas, setEntregadas] = useState(0)
  const [vendidas, setVendidas] = useState(0)
  const [precio, setPrecio] = useState(2000)
  const [comision, setComision] = useState(300)
  const [metodo, setMetodo] = useState<"Contado" | "Fiado">("Contado")
  const [estatus, setEstatus] = useState<"Pagado" | "Pendiente">("Pagado")

  const [editId, setEditId] = useState<string | null>(null)
  const [ventaDetalle, setVentaDetalle] = useState<any | null>(null)
  const [lista, setLista] = useState<any[]>([])
  const [producciones, setProducciones] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const [v, p] = await Promise.all([obtenerVentasDB(), obtenerProduccionesDB()])
    setLista(v)
    setProducciones(p)
  }

  // Cálculo en tiempo real para el formulario
  const calc = calcularVentaExcel({ vendidas, entregadas, precio, comision }, producciones)

  const totales = {
    vendidas: lista.reduce((acc, v) => acc + (v.vendidas || 0), 0),
    ingreso: lista.reduce((acc, v) => acc + (v.ingreso || 0), 0),
    ganancia: lista.reduce((acc, v) => acc + (v.ganancia || 0), 0),
    diferencia: lista.reduce((acc, v) => acc + (v.diferencia || 0), 0)
  }

  async function handleSave() {
    if (vendidas > entregadas) return alert("Error: No puedes vender más de lo entregado")
    if (vendidas <= 0 || !vendedor) return alert("Completa los datos correctamente")
    
    setLoading(true)

    // Convertimos la fecha del input (YYYY-MM-DD) a ISOString
    // Añadimos T12:00:00 para evitar desfases de zona horaria
    const fechaFinal = new Date(fecha + "T12:00:00").toISOString()

    const data = {
      vendedor, 
      entregadas, 
      vendidas, 
      precio, 
      comision, 
      metodo, 
      estatus,
      ...calc,
      fecha: fechaFinal
    }

    try {
      if (editId) {
        await actualizarVentaDB(editId, data)
        alert("Venta actualizada")
      } else {
        await guardarVentaDB(data as any)
        alert("Venta registrada")
      }
      limpiarFormulario()
      cargarDatos()
    } catch (e) {
      alert("Error al procesar la venta")
    } finally {
      setLoading(false)
    }
  }

  function prepararEdicion(v: any) {
    setEditId(v.id)
    setVendedor(v.vendedor)
    setEntregadas(v.entregadas)
    setVendidas(v.vendidas)
    setPrecio(v.precio)
    setComision(v.comision)
    setMetodo(v.metodo)
    setEstatus(v.estatus)
    // Convertimos la fecha ISO de la DB de vuelta a YYYY-MM-DD para el input
    if (v.fecha) {
      setFecha(new Date(v.fecha).toISOString().split('T')[0])
    }
    setVentaDetalle(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limpiarFormulario() {
    setEditId(null)
    setVendedor("")
    setEntregadas(0)
    setVendidas(0)
    setPrecio(2000)
    setComision(300)
    setMetodo("Contado")
    setEstatus("Pagado")
    setFecha(new Date().toISOString().split('T')[0]) 
  }

  return (
    <Layout>
      <header className="mb-6">
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Operaciones</h1>
      </header>

      {/* DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <p className="text-[10px] uppercase font-bold text-gray-500">Volumen</p>
          <p className="text-xl font-black">{totales.vendidas} uds</p>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[10px] uppercase font-bold text-gray-500">Caja</p>
          <p className="text-xl font-black text-emerald-400">{formatCurrency(totales.ingreso)}</p>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <p className="text-[10px] uppercase font-bold text-gray-500">Utilidad</p>
          <p className="text-xl font-black text-purple-400">{formatCurrency(totales.ganancia)}</p>
        </Card>
        <Card className={totales.diferencia > 0 ? 'bg-orange-500/10 border-orange-500/40' : 'bg-gray-800'}>
          <p className="text-[10px] uppercase font-bold text-gray-500">Pendiente</p>
          <p className="text-xl font-black text-orange-400">{totales.diferencia} uds</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <Card className={editId ? "border-orange-500/50 shadow-lg shadow-orange-500/5" : "border-gray-800"}>
          <h3 className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-widest">
            {editId ? "⚡ Modificar Registro" : "➕ Nueva Venta"}
          </h3>
          <div className="space-y-4">
            {/* CAMPO DE FECHA */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Fecha de Operación</label>
              <input 
                type="date" 
                value={fecha} 
                onChange={e => setFecha(e.target.value)}
                className="bg-gray-950 text-white p-3 rounded-xl border border-gray-800 text-xs font-bold outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <Input label="Responsable / Vendedor" value={vendedor} onChange={e => setVendedor(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" label="Entregadas" value={entregadas} onChange={e => setEntregadas(Number(e.target.value))} />
              <Input type="number" label="Vendidas" value={vendidas} onChange={e => setVendidas(Number(e.target.value))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input type="number" label="Precio U." value={precio} onChange={e => setPrecio(Number(e.target.value))} />
              <Input type="number" label="Comisión U." value={comision} onChange={e => setComision(Number(e.target.value))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select className="bg-gray-950 text-white p-3 rounded-xl border border-gray-800 text-xs font-bold outline-none" value={metodo} onChange={e => setMetodo(e.target.value as any)}>
                <option value="Contado">CONTADO</option>
                <option value="Fiado">FIADO</option>
              </select>
              <select className="bg-gray-950 text-white p-3 rounded-xl border border-gray-800 text-xs font-bold outline-none" value={estatus} onChange={e => setEstatus(e.target.value as any)}>
                <option value="Pagado">PAGADO</option>
                <option value="Pendiente">PENDIENTE</option>
              </select>
            </div>

            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 flex justify-between items-center">
               <span className="text-[10px] text-gray-500 font-bold uppercase">Utilidad Estimada</span>
               <span className="text-lg font-black text-emerald-400">{formatCurrency(calc.ganancia)}</span>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full py-4 uppercase font-black">
              {loading ? "Procesando..." : editId ? "Actualizar Registro" : "Registrar Venta"}
            </Button>
            
            {editId && (
              <button onClick={limpiarFormulario} className="w-full text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                CANCELAR EDICIÓN
              </button>
            )}
          </div>
        </Card>

        {/* LISTADO */}
        <div className="space-y-4">
           {ventaDetalle && (
             <Card className="border-blue-500 bg-blue-500/5 animate-in slide-in-from-top duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h2 className="text-lg font-black text-white italic uppercase">{ventaDetalle.vendedor}</h2>
                   <p className="text-[9px] text-gray-500 font-bold uppercase">
                     {new Date(ventaDetalle.fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                   </p>
                 </div>
                 <button onClick={() => setVentaDetalle(null)} className="text-gray-500 hover:text-white">✕</button>
               </div>
               <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-gray-800 pt-4">
                  <p className="text-gray-500 uppercase font-bold">Inversión: <span className="text-white ml-1">{formatCurrency(ventaDetalle.costo || 0)}</span></p>
                  <p className="text-gray-500 uppercase font-bold">Comisión: <span className="text-white ml-1">{formatCurrency(ventaDetalle.comisionTotal || 0)}</span></p>
                  <p className="text-gray-500 uppercase font-bold">Diferencia: <span className="text-orange-400 ml-1 font-black">{ventaDetalle.diferencia} uds</span></p>
                  <p className="text-gray-500 uppercase font-bold">Neta: <span className="text-emerald-400 ml-1 font-black">{formatCurrency(ventaDetalle.ganancia || 0)}</span></p>
               </div>
               <div className="flex gap-2 mt-6">
                  <button className="flex-1 bg-white text-black font-black text-[10px] py-2 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => prepararEdicion(ventaDetalle)}>EDITAR</button>
                  <button className="flex-1 bg-red-600/10 text-red-500 border border-red-500/20 font-black text-[10px] py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all" 
                    onClick={async () => {
                      if(window.confirm("¿Eliminar este registro permanentemente?")) {
                        await eliminarVentaDB(ventaDetalle.id)
                        cargarDatos()
                        setVentaDetalle(null)
                      }
                    }}>ELIMINAR</button>
               </div>
             </Card>
           )}

           <div className="space-y-2 overflow-y-auto max-h-[550px] pr-2 custom-scrollbar">
             {lista.map((v) => (
               <Card key={v.id} 
                className={`!p-4 cursor-pointer border-gray-800 hover:border-gray-600 transition-all ${ventaDetalle?.id === v.id ? 'border-blue-500 bg-blue-500/5' : ''}`}
                onClick={() => setVentaDetalle(v)}
               >
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="font-bold text-white text-sm uppercase italic">{v.vendedor}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       {new Date(v.fecha).toLocaleDateString()} • {v.metodo}
                     </p>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-emerald-400 text-sm">{formatCurrency(v.ingreso)}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">SALDO: {v.diferencia} UDS</p>
                   </div>
                 </div>
               </Card>
             ))}
           </div>
        </div>
      </div>
    </Layout>
  )
}
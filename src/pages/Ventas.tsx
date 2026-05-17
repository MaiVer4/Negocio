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
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [entregadas, setEntregadas] = useState(0)
  const [vendidas, setVendidas] = useState(0)
  const [precio, setPrecio] = useState(2000)
  const [comision, setComision] = useState(0)
  const [metodo, setMetodo] = useState<"Contado" | "Fiado">("Contado")
  const [estatus, setEstatus] = useState<"Pagado" | "Pendiente">("Pagado")
  const [loteId, setLoteId] = useState("")
  const [loteNombre, setLoteNombre] = useState("")
  const [costoUnitarioLote, setCostoUnitarioLote] = useState<number | undefined>(undefined)
  const [editId, setEditId] = useState<string | null>(null)
  const [ventaDetalle, setVentaDetalle] = useState<any | null>(null)
  const [lista, setLista] = useState<any[]>([])
  const [producciones, setProducciones] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const [v, p] = await Promise.all([obtenerVentasDB(), obtenerProduccionesDB()])
    setLista(v)
    setProducciones(p)
  }

  const handleLoteChange = (id: string) => {
    setLoteId(id)
    const lote = producciones.find((p) => p.id === id)
    if (lote) {
      setCostoUnitarioLote(lote.costoUnidad)
      setLoteNombre(lote.lote)
    } else {
      setCostoUnitarioLote(undefined)
      setLoteNombre("")
    }
  }

  const calc = calcularVentaExcel({ vendidas, entregadas, precio, comision, costoUnitarioLote }, producciones)

  const totales = {
    vendidas: lista.reduce((acc, v) => acc + (v.vendidas || 0), 0),
    ingreso: lista.reduce((acc, v) => acc + (v.ingreso || 0), 0),
    ganancia: lista.reduce((acc, v) => acc + (v.ganancia || 0), 0),
    diferencia: lista.reduce((acc, v) => acc + (v.diferencia || 0), 0),
  }

  async function handleSave() {
    // ✅ VALIDACIÓN 1: vendidas <= entregadas
    if (vendidas > entregadas) return alert("Error: No puedes vender más de lo entregado")
    
    // ✅ VALIDACIÓN 2: campos obligatorios
    if (vendidas <= 0 || !vendedor || !loteId) return alert("Completa los datos y selecciona un lote")
    
    // ✅ VALIDACIÓN 3: entregadas <= stockActual del lote
    const loteSel = producciones.find(p => p.id === loteId);
    if (loteSel && entregadas > loteSel.stockActual) {
      return alert(`Error: No hay suficiente stock.\n\nDisponible: ${loteSel.stockActual} unidades\nSolicitadas: ${entregadas} unidades`);
    }
    
    setLoading(true)
    const fechaFinal = new Date(fecha + "T12:00:00").toISOString()
    const data = { vendedor, entregadas, vendidas, precio, comision, metodo, estatus, loteId, loteNombre, ...calc, fecha: fechaFinal }
    try {
      if (editId) { await actualizarVentaDB(editId, data); alert("Venta actualizada") }
      else { await guardarVentaDB(data as any); alert("Venta registrada") }
      limpiarFormulario()
      cargarDatos()
    } catch (e) { alert(`Error: ${e instanceof Error ? e.message : "No se pudo guardar"}`) }
    finally { setLoading(false) }
  }

  function prepararEdicion(v: any) {
    setEditId(v.id); setVendedor(v.vendedor); setEntregadas(v.entregadas)
    setVendidas(v.vendidas); setPrecio(v.precio); setComision(v.comision)
    setMetodo(v.metodo); setEstatus(v.estatus)
    setLoteId(v.loteId || ""); setLoteNombre(v.loteNombre || "")
    if (v.fecha) setFecha(new Date(v.fecha).toISOString().split("T")[0])
    setVentaDetalle(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function limpiarFormulario() {
    setEditId(null); setVendedor(""); setEntregadas(0); setVendidas(0)
    setPrecio(2000); setComision(0); setMetodo("Contado"); setEstatus("Pagado")
    setLoteId(""); setLoteNombre(""); setCostoUnitarioLote(undefined)
    setFecha(new Date().toISOString().split("T")[0])
  }

  const fieldClass = "w-full bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-gray-600"
  const labelClass = "block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1.5"

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">SmartLedger</p>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ventas</h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">En vivo</span>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Volumen */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase font-black tracking-widest text-gray-500">Volumen</p>
            <span className="text-lg">📦</span>
          </div>
          <p className="text-2xl font-black text-white">{totales.vendidas}</p>
          <p className="text-[10px] text-gray-600 font-bold mt-1">unidades totales</p>
        </div>

        {/* Caja Bruta */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase font-black tracking-widest text-gray-500">Caja Bruta</p>
            <span className="text-lg">💵</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(totales.ingreso)}</p>
          <p className="text-[10px] text-gray-600 font-bold mt-1">ingresos totales</p>
        </div>

        {/* Utilidad */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase font-black tracking-widest text-gray-500">Utilidad</p>
            <span className="text-lg">📈</span>
          </div>
          <p className="text-2xl font-black text-purple-400">{formatCurrency(totales.ganancia)}</p>
          <p className="text-[10px] text-gray-600 font-bold mt-1">ganancia neta</p>
        </div>

        {/* Pendientes */}
        <div className={`bg-gray-900 border rounded-2xl p-5 transition-colors ${totales.diferencia > 0 ? "border-orange-500/50 bg-orange-500/5" : "border-gray-800"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase font-black tracking-widest text-gray-500">Faltantes</p>
            <span className="text-lg">{totales.diferencia > 0 ? "⚠️" : "✅"}</span>
          </div>
          <p className={`text-2xl font-black ${totales.diferencia > 0 ? "text-orange-400" : "text-gray-400"}`}>{totales.diferencia}</p>
          <p className="text-[10px] text-gray-600 font-bold mt-1">uds sin rendir</p>
        </div>
      </div>

      {/* ── BODY: 2 COLUMNAS ── */}
      <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── FORMULARIO ── */}
        <div className={`bg-gray-900 rounded-2xl border p-6 transition-colors ${editId ? "border-orange-500/50" : "border-gray-800"}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-gray-400">
              {editId ? "⚡ Modificar Venta" : "➕ Nueva Venta"}
            </h3>
            {editId && (
              <button onClick={limpiarFormulario} className="text-[9px] uppercase font-black text-gray-500 hover:text-white border border-gray-700 px-2 py-1 rounded-lg transition-colors">
                Cancelar
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Fecha */}
            <div>
              <label className={labelClass}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={fieldClass} />
            </div>

            {/* Lote */}
            <div>
              <label className={labelClass}>Lote de Producción</label>
              <select value={loteId} onChange={(e) => handleLoteChange(e.target.value)} className={fieldClass}>
                <option value="">Seleccionar lote...</option>
                {producciones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.lote} — {p.stockActual?.toFixed(0)} uds disponibles
                  </option>
                ))}
              </select>
            </div>

            {/* Vendedor */}
            <div>
              <label className={labelClass}>Vendedor</label>
              <input value={vendedor} onChange={(e) => setVendedor(e.target.value)} placeholder="Nombre del vendedor..." className={fieldClass} />
            </div>

            {/* Entregadas / Vendidas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Entregadas</label>
                <input type="number" value={entregadas} onChange={(e) => setEntregadas(Number(e.target.value))} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Vendidas</label>
                <input type="number" value={vendidas} onChange={(e) => setVendidas(Number(e.target.value))} className={fieldClass} />
              </div>
            </div>

            {/* Precio / Comisión */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Precio Unit.</label>
                <input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Comisión Unit.</label>
                <input type="number" value={comision} onChange={(e) => setComision(Number(e.target.value))} className={fieldClass} />
              </div>
            </div>

            {/* Método / Estatus */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Método Pago</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-700">
                  {(["Contado", "Fiado"] as const).map((m) => (
                    <button key={m} onClick={() => setMetodo(m)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase transition-all ${metodo === m ? "bg-emerald-500 text-black" : "bg-gray-900 text-gray-500 hover:text-white"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Estatus</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-700">
                  {(["Pagado", "Pendiente"] as const).map((s) => (
                    <button key={s} onClick={() => setEstatus(s)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase transition-all ${estatus === s ? (s === "Pagado" ? "bg-emerald-500 text-black" : "bg-orange-500 text-black") : "bg-gray-900 text-gray-500 hover:text-white"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview utilidad */}
            <div className="bg-gray-950 rounded-xl border border-gray-800 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-gray-600">Utilidad estimada</p>
                  <p className="text-[9px] text-gray-700 mt-0.5">
                    {vendidas} uds × ${precio.toLocaleString()} — costos — comisiones
                  </p>
                </div>
                <p className={`text-xl font-black ${calc.ganancia >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(calc.ganancia)}
                </p>
              </div>
            </div>

            {/* Botón */}
            <button onClick={handleSave} disabled={loading}
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                editId
                  ? "bg-orange-500 hover:bg-orange-400 text-black"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black"
              } disabled:opacity-40 disabled:cursor-not-allowed`}>
              {loading ? "Guardando..." : editId ? "Actualizar Venta" : "Registrar Venta"}
            </button>
          </div>
        </div>

        {/* ── LISTADO ── */}
        <div className="space-y-3">
          {/* Detalle expandido */}
          {ventaDetalle && (
            <div className="bg-blue-500/5 border border-blue-500/30 rounded-2xl p-5 mb-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-blue-400 mb-1">Detalle</p>
                  <h2 className="text-lg font-black text-white uppercase italic">{ventaDetalle.vendedor}</h2>
                  <p className="text-[10px] text-gray-500 font-bold">
                    {new Date(ventaDetalle.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    {ventaDetalle.loteNombre ? ` · ${ventaDetalle.loteNombre}` : ""}
                  </p>
                </div>
                <button onClick={() => setVentaDetalle(null)} className="text-gray-600 hover:text-white text-lg transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Ingreso", value: formatCurrency(ventaDetalle.ingreso), color: "text-emerald-400" },
                  { label: "Ganancia", value: formatCurrency(ventaDetalle.ganancia), color: "text-purple-400" },
                  { label: "Comisión", value: formatCurrency(ventaDetalle.comision * ventaDetalle.vendidas), color: "text-yellow-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-900 rounded-xl p-3 text-center">
                    <p className="text-[9px] uppercase font-black text-gray-600">{label}</p>
                    <p className={`text-sm font-black ${color} mt-1`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => prepararEdicion(ventaDetalle)}
                  className="flex-1 bg-white text-black font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                  ✏️ Editar
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("¿Eliminar esta venta?")) {
                      await eliminarVentaDB(ventaDetalle.id)
                      cargarDatos(); setVentaDetalle(null)
                    }
                  }}
                  className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl hover:bg-red-500/20 transition-colors">
                  🗑 Borrar
                </button>
              </div>
            </div>
          )}

          {/* Header lista */}
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">
              {lista.length} registros
            </p>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">
              Toca para ver detalle
            </p>
          </div>

          {/* Lista scrollable */}
          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {lista.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm font-bold">Sin ventas registradas</p>
              </div>
            )}
            {lista.map((v) => {
              const isSelected = ventaDetalle?.id === v.id
              const esFiado = v.metodo === "Fiado"
              const esPendiente = v.estatus === "Pendiente"
              return (
                <div key={v.id} onClick={() => setVentaDetalle(isSelected ? null : v)}
                  className={`group relative bg-gray-900 rounded-xl border px-5 py-4 cursor-pointer transition-all hover:border-gray-600 ${
                    isSelected ? "border-blue-500/60 bg-blue-500/5" : "border-gray-800"
                  }`}>
                  <div className="flex items-center justify-between">
                    {/* Izquierda */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                        esFiado ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {v.vendedor?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm uppercase italic leading-tight">{v.vendedor}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[9px] text-gray-600 font-bold">
                            {new Date(v.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </p>
                          <span className="text-gray-700">·</span>
                          <p className="text-[9px] text-gray-600 font-bold">{v.vendidas} uds</p>
                          {v.loteNombre && (
                            <>
                              <span className="text-gray-700">·</span>
                              <p className="text-[9px] text-gray-600 font-bold italic">{v.loteNombre}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Derecha */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-black text-emerald-400 text-sm">{formatCurrency(v.ingreso)}</p>
                        <p className="text-[9px] text-gray-600 font-bold text-right">
                          util. {formatCurrency(v.ganancia)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          esFiado ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {v.metodo}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          esPendiente ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-400"
                        }`}>
                          {v.estatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { 
  calcularProduccion, 
  calcularCostoGlobal, 
  guardarProduccionDB, 
  obtenerProduccionesDB,
  actualizarProduccionDB,
  eliminarProduccionDB 
} from "../services/produccionService";
import { formatCurrency } from "../services/helpers";
import type { Produccion } from "../types/produccion";

export default function ProduccionPage() {
  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [gramos, setGramos] = useState(0);
  const [costo, setCosto] = useState(0);
  const [gramajeUnidad, setGramajeUnidad] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [lista, setLista] = useState<Produccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState<Produccion | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const data = await obtenerProduccionesDB();
    setLista(data);
  }

  const resumenGlobal = calcularCostoGlobal(lista);
  const { unidades, costoUnidad } = calcularProduccion(gramos, costo, gramajeUnidad);

  async function handleSubmit() {
    if (!lote || gramos <= 0 || costo <= 0) return alert("Completa los campos correctamente");
    setLoading(true);
    
    // Convertimos la fecha del input a ISOString para la DB
    const fechaISO = new Date(fecha + "T12:00:00").toISOString();

    try {
      if (editId) {
        const original = lista.find(i => i.id === editId);
        await actualizarProduccionDB(editId, {
          lote, gramos, costo, gramajeUnidad, unidades, costoUnidad,
          fecha: fechaISO,
          stockActual: unidades - (original?.vendidas || 0)
        });
        alert("Lote actualizado");
      } else {
        await guardarProduccionDB({
          lote, 
          fecha: fechaISO, 
          gramos, 
          costo, 
          gramajeUnidad, 
          unidades, 
          costoUnidad
        } as any);
        alert("Lote guardado");
      }
      limpiarFormulario();
      cargarDatos();
    } catch (e) {
      alert("Error en la operación");
    } finally {
      setLoading(false);
    }
  }

  function prepararEdicion(p: Produccion) {
    setEditId(p.id || null);
    setLote(p.lote); 
    setGramos(p.gramos); 
    setCosto(p.costo); 
    setGramajeUnidad(p.gramajeUnidad);
    // Cargar la fecha del lote en el input
    if (p.fecha) {
      setFecha(new Date(p.fecha).toISOString().split('T')[0]);
    }
    setLoteSeleccionado(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpiarFormulario() {
    setEditId(null);
    setLote(""); 
    setGramos(0); 
    setCosto(0); 
    setGramajeUnidad(1);
    setFecha(new Date().toISOString().split('T')[0]);
  }

  const precioSugerido = loteSeleccionado ? loteSeleccionado.costoUnidad * 3 : 0;
  const gananciaEst = loteSeleccionado ? (loteSeleccionado.unidades * precioSugerido) - loteSeleccionado.costo : 0;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <header className="mb-2">
             <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Producción</h1>
          </header>

          {/* DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Unidades Totales</p>
              <h3 className="text-xl font-black text-blue-400">{resumenGlobal.totalUnidades.toFixed(2)}</h3>
            </Card>
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Costo Promedio</p>
              <h3 className="text-xl font-black text-emerald-400">${resumenGlobal.costoGlobal.toFixed(2)}</h3>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Inversión Total</p>
              <h3 className="text-xl font-black text-orange-400">{formatCurrency(resumenGlobal.totalCosto)}</h3>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* FORMULARIO */}
            <Card className={editId ? 'border-orange-500/40 shadow-lg shadow-orange-500/5' : 'border-gray-800'}>
              <h3 className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-widest">
                {editId ? "⚡ Editar Lote" : "➕ Nuevo Lote"}
              </h3>
              <div className="space-y-4">
                {/* CAMPO FECHA */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black text-gray-500 ml-1">Fecha de Producción</label>
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={e => setFecha(e.target.value)}
                    className="bg-gray-950 text-white p-3 rounded-xl border border-gray-800 text-xs font-bold outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <Input label="Nombre del Lote" value={lote} onChange={e => setLote(e.target.value)} />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" label="Gramos Totales" value={gramos} onChange={e => setGramos(Number(e.target.value))} />
                  <Input type="number" label="Costo Material ($)" value={costo} onChange={e => setCosto(Number(e.target.value))} />
                </div>
                
                <Input type="number" label="Gramos x Unidad" value={gramajeUnidad} onChange={e => setGramajeUnidad(Number(e.target.value))} />
                
                <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Costo Unitario</p>
                    <p className="text-2xl font-black text-emerald-400">${costoUnidad.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Uds. Resultantes</p>
                    <p className="text-lg font-bold text-white">{unidades.toFixed(2)}</p>
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={loading} className="w-full uppercase font-black">
                  {loading ? "Procesando..." : editId ? "Actualizar Lote" : "Guardar Lote"}
                </Button>
                {editId && <button onClick={limpiarFormulario} className="w-full text-[10px] font-bold text-gray-500 py-2">CANCELAR</button>}
              </div>
            </Card>

            {/* LISTA */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-[10px] uppercase font-black text-gray-500 mb-2 tracking-widest">Lotes Recientes</h3>
              {lista.map(p => (
                <Card 
                  key={p.id} 
                  onClick={() => setLoteSeleccionado(p)}
                  className={`!p-4 cursor-pointer transition-all ${loteSeleccionado?.id === p.id ? 'border-blue-500 bg-blue-500/5' : 'border-gray-800 hover:border-gray-600'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-sm uppercase italic">{p.lote}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">
                        {new Date(p.fecha).toLocaleDateString()} • ${p.costoUnidad.toFixed(2)}/ud
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-400">{p.stockActual?.toFixed(1)} uds</p>
                      <p className="text-[8px] text-gray-600 uppercase font-bold">Disponible</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL LATERAL */}
        {loteSeleccionado && (
          <aside className="lg:w-80 w-full animate-in slide-in-from-right duration-300">
            <Card className="sticky top-6 border-blue-500/30 bg-gray-900/60 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-white uppercase italic text-lg tracking-tighter">Detalles del Lote</h3>
                <button onClick={() => setLoteSeleccionado(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-widest">Costo Unitario Real</p>
                  <p className="text-2xl font-black text-white italic">${loteSeleccionado.costoUnidad.toFixed(2)}</p>
                </div>
                <div className="space-y-2 px-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold text-[9px] uppercase">Sugerido (3x):</span>
                    <span className="text-white font-bold">{formatCurrency(precioSugerido)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-gray-800">
                    <span className="text-gray-500 font-bold text-[9px] uppercase">Ganancia Potencial:</span>
                    <span className="text-emerald-400 font-black">{formatCurrency(gananciaEst)}</span>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Button className="w-full text-[10px] py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black uppercase" onClick={() => prepararEdicion(loteSeleccionado)}>Editar Lote</Button>
                  <button 
                    onClick={() => {
                      if(window.confirm("¿Estás seguro de eliminar este lote? Esto afectará los cálculos históricos.")) {
                        eliminarProduccionDB(loteSeleccionado.id!).then(() => {
                          cargarDatos();
                          setLoteSeleccionado(null);
                        });
                      }
                    }}
                    className="w-full text-[10px] text-red-900 hover:text-red-500 font-black uppercase py-2 transition-colors"
                  >
                    Eliminar Lote
                  </button>
                </div>
              </div>
            </Card>
          </aside>
        )}
      </div>
    </Layout>
  );
}
import { obtenerVentasDB } from "./ventaService"
import { obtenerProduccionesDB, calcularCostoGlobal } from "./produccionService"

export async function calcularDashboard() {
  // 1. Obtener datos de Firebase
  const [ventas, producciones] = await Promise.all([
    obtenerVentasDB(),
    obtenerProduccionesDB()
  ])

  // 2. Obtener costos base del negocio
  const { costoGlobal, totalUnidades: unidadesProducidas } = calcularCostoGlobal(producciones)

  // 3. Inicializar acumuladores
  let ingresos = 0, costos = 0, comisiones = 0, ganancia = 0, unidadesVendidas = 0, fiados = 0, entregadas = 0

  const vendedores: Record<string, number> = {}

  // 4. Procesar ventas
  ventas.forEach((v) => {
    ingresos += v.ingreso
    costos += v.costo
    comisiones += v.comisionTotal
    ganancia += v.ganancia
    unidadesVendidas += v.vendidas
    entregadas += v.entregadas

    // Calcular fiados pendientes
    if (v.metodo === "Fiado" && v.estatus === "Pendiente") {
      fiados += v.ingreso
    }

    if (!vendedores[v.vendedor]) vendedores[v.vendedor] = 0
    vendedores[v.vendedor] += v.vendidas
  })

  // 5. Cálculos de Inteligencia de Negocio (KPIs)
  const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0
  const ROI = costos > 0 ? (ganancia / costos) * 100 : 0
  
  const precioPromedio = unidadesVendidas > 0 ? ingresos / unidadesVendidas : 0
  const puntoEquilibrio = (precioPromedio - costoGlobal) > 0 
    ? (costos + comisiones) / (precioPromedio - costoGlobal) 
    : 0

  const stock = unidadesProducidas - unidadesVendidas
  const diferenciaInventario = entregadas - unidadesVendidas

  return {
    ingresos,
    costos,
    comisiones,
    ganancia,
    unidadesVendidas,
    unidadesProducidas,
    vendedores,
    margen,
    ROI,
    puntoEquilibrio,
    fiados,
    stock,
    diferenciaInventario
  }
}
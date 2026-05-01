import { obtenerVentasDB } from "./ventaService"
import { obtenerProduccionesDB, calcularCostoGlobal } from "./produccionService"

export async function calcularDashboard() {
  const [ventas, producciones] = await Promise.all([
    obtenerVentasDB(),
    obtenerProduccionesDB()
  ])

  const { costoGlobal, totalUnidades: unidadesProducidas } = calcularCostoGlobal(producciones)

  let ingresos = 0, costos = 0, comisiones = 0, ganancia = 0,
      unidadesVendidas = 0, fiados = 0, entregadas = 0

  const vendedores: Record<string, number> = {}

  // Acumulador por lote: { [loteNombre]: { vendidas, ganancia, ingreso } }
  const lotes: Record<string, { vendidas: number; ganancia: number; ingreso: number }> = {}

  ventas.forEach((v) => {
    ingresos    += v.ingreso
    costos      += v.costo
    comisiones  += v.comisionTotal
    ganancia    += v.ganancia
    unidadesVendidas += v.vendidas
    entregadas  += v.entregadas

    if (v.metodo === "Fiado" && v.estatus === "Pendiente") fiados += v.ingreso

    if (!vendedores[v.vendedor]) vendedores[v.vendedor] = 0
    vendedores[v.vendedor] += v.vendidas

    // Agrupar por lote
    const key = v.loteNombre || "Sin lote"
    if (!lotes[key]) lotes[key] = { vendidas: 0, ganancia: 0, ingreso: 0 }
    lotes[key].vendidas += v.vendidas
    lotes[key].ganancia += v.ganancia
    lotes[key].ingreso  += v.ingreso
  })

  const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0
  const ROI    = costos   > 0 ? (ganancia / costos)   * 100 : 0

  const precioPromedio  = unidadesVendidas > 0 ? ingresos / unidadesVendidas : 0
  const puntoEquilibrio = (precioPromedio - costoGlobal) > 0
    ? (costos + comisiones) / (precioPromedio - costoGlobal)
    : 0

  const stock               = unidadesProducidas - unidadesVendidas
  const diferenciaInventario = entregadas - unidadesVendidas

  return {
    ingresos, costos, comisiones, ganancia,
    unidadesVendidas, unidadesProducidas,
    vendedores, lotes,
    margen, ROI, puntoEquilibrio,
    fiados, stock, diferenciaInventario
  }
}
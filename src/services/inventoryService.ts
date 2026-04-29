import { obtenerProduccionesDB } from "./produccionService"
import { obtenerVentasDB } from "./ventaService"

export async function calcularInventario() {
  const [produccion, ventas] = await Promise.all([
    obtenerProduccionesDB(),
    obtenerVentasDB()
  ])

  const totalProducido = produccion.reduce((acc, p) => acc + p.unidades, 0)
  const totalVendido = ventas.reduce((acc, v) => acc + v.vendidas, 0)

  const restante = totalProducido - totalVendido
  
  // Métrica PRO: Porcentaje de ventas sobre lo fabricado
  const eficiencia = totalProducido > 0 
    ? (totalVendido / totalProducido) * 100 
    : 0

  return {
    totalProducido,
    totalVendido,
    restante,
    eficiencia
  }
}
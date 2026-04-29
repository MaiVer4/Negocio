import { obtenerVentasDB } from "./ventaService"

export async function obtenerDatosGraficas() {
  const ventas = await obtenerVentasDB()

  const porDia: Record<string, any> = {}
  const porVendedor: Record<string, number> = {}

  ventas.forEach((v) => {
    // Extraemos la fecha (YYYY-MM-DD)
    const fecha = v.fecha.includes("T") ? v.fecha.split("T")[0] : v.fecha

    if (!porDia[fecha]) {
      porDia[fecha] = {
        fecha,
        ventas: 0,
        ganancia: 0
      }
    }

    porDia[fecha].ventas += v.vendidas
    porDia[fecha].ganancia += v.ganancia

    if (!porVendedor[v.vendedor]) {
      porVendedor[v.vendedor] = 0
    }
    porVendedor[v.vendedor] += v.vendidas
  })

  // Ordenamos por fecha para que la línea no salte de un lado a otro
  const dataDia = Object.values(porDia).sort((a: any, b: any) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  const dataVendedor = Object.entries(porVendedor).map(([nombre, total]) => ({
    nombre,
    ventas: total
  }))

  return { dataDia, dataVendedor }
}
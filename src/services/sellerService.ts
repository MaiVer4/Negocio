import { obtenerVentasDB } from "./ventaService";

export async function calcularVendedores() {
  const ventas = await obtenerVentasDB();
  const data: Record<string, any> = {};

  ventas.forEach(v => {
    if (!data[v.vendedor]) {
      data[v.vendedor] = {
        vendidas: 0,
        entregadas: 0,
        ingresos: 0,
        comisiones: 0,
        fiados: 0,
        gananciaNegocio: 0 // Rentabilidad para ti
      };
    }

    // Usamos los nombres de campos de la Fase 18
    data[v.vendedor].vendidas += v.vendidas;
    data[v.vendedor].entregadas += v.entregadas;
    data[v.vendedor].ingresos += v.ingreso;
    data[v.vendedor].comisiones += v.comisionTotal;
    data[v.vendedor].gananciaNegocio += v.ganancia;

    // FIADOS: Solo sumamos si está Pendiente
    if (v.metodo === "Fiado" && v.estatus === "Pendiente") {
      data[v.vendedor].fiados += v.ingreso;
    }
  });

  const resultado = Object.entries(data).map(([nombre, v]: any) => {
    const efectividad = v.entregadas > 0 ? (v.vendidas / v.entregadas) * 100 : 0;

    return {
      nombre,
      ...v,
      efectividad
    };
  });

  // Ranking: El que más ha vendido va primero
  return resultado.sort((a, b) => b.vendidas - a.vendidas);
}
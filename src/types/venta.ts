export type Venta = {
  id?: string
  fecha: string
  cliente: string
  loteNombre: string
  vendedor: string
  entregadas: number
  vendidas: number
  precio: number
  comision: number
  metodo: "Contado" | "Fiado"
  estatus: "Pagado" | "Pendiente"
  
  // Datos calculados
  ingreso: number
  costo: number
  comisionTotal: number
  ganancia: number
  diferencia: number
  costoGlobalSnapshot: number // Guardamos el costo de ese momento por auditoría
}
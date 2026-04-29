import type { Venta } from "../types/venta"

const KEY = "ventas_data"

export function obtenerVentas(): Venta[] {
  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function guardarVenta(nueva: Venta) {
  const actual = obtenerVentas()
  localStorage.setItem(KEY, JSON.stringify([...actual, nueva]))
}
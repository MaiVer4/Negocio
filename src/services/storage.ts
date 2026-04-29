import type { Produccion } from "../types/produccion"

const KEY = "produccion_data"

export function obtenerProducciones(): Produccion[] {
  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function guardarProduccion(nueva: Produccion) {
  const actual = obtenerProducciones()
  localStorage.setItem(KEY, JSON.stringify([...actual, nueva]))
}
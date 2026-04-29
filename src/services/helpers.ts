import { obtenerProducciones } from "./storage"

export function obtenerCostoActual(): number {
  const data = obtenerProducciones()
  if (data.length === 0) return 0

  // Tomamos el costo del último lote producido
  return data[data.length - 1].costoUnidad
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
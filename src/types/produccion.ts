export interface Produccion {
  id?: string;
  lote: string;
  fecha: string;
  gramos: number;
  costo: number;
  gramajeUnidad: number;
  unidades: number;       // Total producido
  stockActual: number;    // Lo que queda disponible
  costoUnidad: number;
  vendidas: number;       // Unidades ya vendidas de este lote
}
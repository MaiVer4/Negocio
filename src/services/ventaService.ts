import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import type { Venta } from "../types/venta";
import { calcularCostoGlobal } from "./produccionService";

/**
 * 1. Lógica Matemática (Estilo Excel con protección contra NaN)
 */
export function calcularVentaExcel(
  data: {
    vendidas: number;
    entregadas: number;
    precio: number;
    comision: number
  },
  producciones: any[]
) {
  const { costoGlobal } = calcularCostoGlobal(producciones);

  // Forzamos valores numéricos para evitar NaN durante el tipeo
  const v = Number(data.vendidas) || 0;
  const e = Number(data.entregadas) || 0;
  const p = Number(data.precio) || 0;
  const c = Number(data.comision) || 0;
  const cg = Number(costoGlobal) || 0;

  const ingreso = v * p;
  const costoCalculado = v * cg;
  const comisionTotal = v * c;
  const ganancia = ingreso - costoCalculado - comisionTotal;
  const diferencia = e - v;

  return {
    ingreso,
    costo: costoCalculado,
    comisionTotal,
    ganancia,
    diferencia,
    costoGlobalSnapshot: cg
  };
}

/**
 * 2. Lógica de Inventario (FIFO)
 */
async function descontarStockFIFO(unidadesAVender: number) {
  const batch = writeBatch(db);

  const q = query(
    collection(db, "producciones"),
    where("stockActual", ">", 0),
    orderBy("stockActual", "asc")
  );

  const snapshot = await getDocs(q);

  // Orden manual por fecha para asegurar que salga lo más viejo primero
  const docsOrdenados = snapshot.docs.sort((a, b) => {
    return new Date(a.data().fecha).getTime() - new Date(b.data().fecha).getTime();
  });

  let pendiente = unidadesAVender;

  for (const loteDoc of docsOrdenados) {
    if (pendiente <= 0) break;

    const loteData = loteDoc.data();
    const stockDisponible = loteData.stockActual || 0;
    const loteRef = doc(db, "producciones", loteDoc.id);

    if (stockDisponible >= pendiente) {
      batch.update(loteRef, {
        stockActual: increment(-pendiente),
        vendidas: increment(pendiente)
      });
      pendiente = 0;
    } else {
      batch.update(loteRef, {
        stockActual: 0,
        vendidas: increment(stockDisponible)
      });
      pendiente -= stockDisponible;
    }
  }

  await batch.commit();
}

/**
 * 3. Operaciones CRUD
 */
export async function guardarVentaDB(data: Venta) {
  try {
    await descontarStockFIFO(data.vendidas);

    const { id, ...rest } = data;
    const ventaData = {
      ...rest,
      // Si data.fecha existe (del input), se usa esa; si no, la actual.
      fecha: data.fecha || new Date().toISOString(),
      vendidas: Number(data.vendidas) || 0,
      entregadas: Number(data.entregadas) || 0,
      precio: Number(data.precio) || 0,
      comision: Number(data.comision) || 0,
      ingreso: Number(data.ingreso) || 0,
      costo: Number(data.costo) || 0,
      comisionTotal: Number(data.comisionTotal) || 0,
      ganancia: Number(data.ganancia) || 0,
      diferencia: Number(data.diferencia) || 0,
      costoGlobalSnapshot: Number(data.costoGlobalSnapshot) || 0
    };

    await addDoc(collection(db, "ventas"), ventaData);
  } catch (e) {
    console.error("Error en guardarVentaDB:", e);
    throw e;
  }
}

export async function obtenerVentasDB(): Promise<Venta[]> {
  const q = query(collection(db, "ventas"), orderBy("fecha", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
}

export async function actualizarVentaDB(id: string, data: Partial<Venta>) {
  const docRef = doc(db, "ventas", id);
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => v !== undefined && k !== 'id')
  );
  await updateDoc(docRef, cleanData);
}

export async function eliminarVentaDB(id: string) {
  await deleteDoc(doc(db, "ventas", id));
}
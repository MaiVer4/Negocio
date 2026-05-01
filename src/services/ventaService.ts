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
  increment,
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import type { Venta } from "../types/venta";
import { calcularCostoGlobal } from "./produccionService";

/**
 * 1. Lógica Matemática - CON VALIDACIÓN DE ZERO COST
 */
export function calcularVentaExcel(
  data: {
    vendidas: number;
    entregadas: number;
    precio: number;
    comision: number;
    costoUnitarioLote?: number;
  },
  producciones: any[]
) {
  const { costoGlobal } = calcularCostoGlobal(producciones);
  
  // ✅ VALIDACIÓN: Si no hay costo unitario específico Y costoGlobal es 0, fallback a 0
  // pero advertencia en console
  let cg = data.costoUnitarioLote !== undefined ? data.costoUnitarioLote : costoGlobal;
  
  if (cg === 0 && !data.costoUnitarioLote && producciones.length === 0) {
    console.warn("⚠️ Advertencia: Costo unitario = 0. No hay lotes registrados o costo no especificado.");
  }

  const v = Number(data.vendidas) || 0;
  const e = Number(data.entregadas) || 0;
  const p = Number(data.precio) || 0;
  const c = Number(data.comision) || 0;

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
 * 2. Lógica de Inventario - CON VALIDACIONES
 */
export async function obtenerStockActualDeLote(loteId: string): Promise<number> {
  const loteRef = doc(db, "producciones", loteId);
  const loteSnap = await getDoc(loteRef);
  if (!loteSnap.exists()) throw new Error("El lote no existe");
  return loteSnap.data().stockActual || 0;
}

async function descontarStockDeLote(loteId: string, unidadesAVender: number) {
  const loteRef = doc(db, "producciones", loteId);
  const loteSnap = await getDoc(loteRef);

  if (!loteSnap.exists()) throw new Error("El lote no existe");
  
  const stockActual = loteSnap.data().stockActual || 0;
  
  // ✅ VALIDACIÓN CRÍTICA: Prevenir stock negativo
  if (unidadesAVender > stockActual) {
    throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${unidadesAVender}`);
  }

  await updateDoc(loteRef, {
    stockActual: increment(-unidadesAVender),
    vendidas: increment(unidadesAVender)
  });
}

/**
 * 3. Lógica de Recálculo Dinámico (CON MEJOR MANEJO DE ERRORES)
 * Busca todas las ventas vinculadas a un lote y actualiza sus costos y ganancias.
 */
export async function actualizarVentasPorCambioDeLote(loteId: string, nuevoCostoUnitario: number) {
  try {
    const q = query(collection(db, "ventas"), where("loteId", "==", loteId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);

    snapshot.docs.forEach((vDoc) => {
      const vData = vDoc.data();
      const vendidas = vData.vendidas || 0;
      const ingreso = vData.ingreso || 0;
      const comisionTotal = vData.comisionTotal || 0;

      // Recalcular valores de la venta con el nuevo costo del lote
      const nuevoCostoVenta = vendidas * nuevoCostoUnitario;
      const nuevaGanancia = ingreso - nuevoCostoVenta - comisionTotal;

      batch.update(vDoc.ref, {
        costo: nuevoCostoVenta,
        ganancia: nuevaGanancia,
        costoGlobalSnapshot: nuevoCostoUnitario
      });
    });

    await batch.commit();
    console.log(`Sincronización exitosa: ${snapshot.size} ventas actualizadas.`);
  } catch (e) {
    console.error("Error al sincronizar ventas con el nuevo costo:", e);
    // ✅ RE-LANZAR EXCEPCIÓN para que código llamador sepa que falló
    throw new Error(`Falló sincronización de ventas: ${e instanceof Error ? e.message : 'Error desconocido'}`);
  }
}

/**
 * 4. Operaciones CRUD - CON TRANSACCIONES ATÓMICAS
 */
export async function guardarVentaDB(data: Venta & { loteId?: string; loteNombre?: string }) {
  try {
    const { id, ...rest } = data;
    const ventaData = {
      ...rest,
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
      costoGlobalSnapshot: Number(data.costoGlobalSnapshot) || 0,
      loteId: data.loteId || "Sin ID",
      loteNombre: data.loteNombre || "Sin nombre"
    };

    // ✅ TRANSACCIÓN ATÓMICA: Validar stock ANTES de cualquier operación
    if (data.loteId && data.loteId !== "Sin ID") {
      const stockActual = await obtenerStockActualDeLote(data.loteId);
      if (data.vendidas > stockActual) {
        throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${data.vendidas}`);
      }
    }

    // ✅ OPERACIONES ATÓMICAS con writeBatch
    const batch = writeBatch(db);
    
    // 1. Decrementar stock del lote
    if (data.loteId && data.loteId !== "Sin ID") {
      const loteRef = doc(db, "producciones", data.loteId);
      batch.update(loteRef, {
        stockActual: increment(-data.vendidas),
        vendidas: increment(data.vendidas)
      });
    }
    
    // 2. Crear la venta
    const ventasRef = collection(db, "ventas");
    batch.set(doc(ventasRef), ventaData);
    
    // 3. Ejecutar TODO de una vez (atómico)
    await batch.commit();
    console.log("Venta registrada exitosamente");
    
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Error desconocido";
    console.error("Error en guardarVentaDB:", errorMsg);
    throw new Error(`No se pudo guardar la venta: ${errorMsg}`);
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
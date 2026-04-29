import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";import { db } from "./firebase"
import type { Entrega } from "../types/entrega"

export function calcularEntrega(
  unidadesEntregadas: number,
  unidadesVendidas: number,
  precio: number,
  comision: number
) {
  const pendientes = unidadesEntregadas - unidadesVendidas
  const ingreso = unidadesVendidas * precio
  const comisionTotal = unidadesVendidas * comision
  const dineroAEntregar = ingreso - comisionTotal

  return {
    pendientes,
    ingreso,
    comisionTotal,
    dineroAEntregar
  }
}

export async function guardarEntregaDB(data: Omit<Entrega, 'id'>) {
  await addDoc(collection(db, "entregas"), data)
}

export async function obtenerEntregasDB(): Promise<Entrega[]> {
  const q = query(collection(db, "entregas"), orderBy("fecha", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Entrega[]
}

export async function actualizarEntregaDB(id: string, data: any) {
  const docRef = doc(db, "entregadas", id);
  await updateDoc(docRef, data);
}

export async function eliminarEntregaDB(id: string) {
  try {
    // IMPORTANTE: Verifica que el nombre de la colección coincida ("entregas" o "entregadas")
    const docRef = doc(db, "entregas", id); 
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error al eliminar documento:", e);
    throw e;
  }
}
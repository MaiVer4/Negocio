import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "./firebase";
import type { Produccion } from "../types/produccion";

/**
 * LÓGICA DE CÁLCULO DE COSTO UNITARIO
 */
export function calcularProduccion(gramos: number, costo: number, gramajeUnidad: number) {
  const unidades = gramajeUnidad > 0 ? gramos / gramajeUnidad : 0;
  const costoUnidad = unidades > 0 ? costo / unidades : 0;

  return { 
    unidades, 
    costoUnidad 
  };
}

export function calcularCostoGlobal(producciones: Produccion[]) {
  if (!producciones || producciones.length === 0) {
    return { totalUnidades: 0, totalCosto: 0, costoGlobal: 0 };
  }

  const totalUnidades = producciones.reduce((acc, p) => acc + (p.unidades || 0), 0);
  const totalCosto = producciones.reduce((acc, p) => acc + (p.costo || 0), 0);
  
  const costoGlobal = totalUnidades > 0 ? totalCosto / totalUnidades : 0;

  return { totalUnidades, totalCosto, costoGlobal };
}

/**
 * PERSISTENCIA EN FIREBASE
 */
export async function guardarProduccionDB(data: Produccion) {
  try {
    const { id, ...dataToSave } = data;
    const finalData = {
      ...dataToSave,
      stockActual: Number(dataToSave.unidades) || 0,
      vendidas: 0,
      // Se asegura de guardar la fecha proporcionada o la actual en formato ISO
      fecha: dataToSave.fecha || new Date().toISOString()
    };
    await addDoc(collection(db, "producciones"), finalData);
  } catch (e) {
    console.error("Error al guardar lote:", e);
    throw e;
  }
}

export async function obtenerProduccionesDB(): Promise<Produccion[]> {
  try {
    // Ordenamos por fecha descendente para la vista, 
    // pero el FIFO usará el orden cronológico.
    const q = query(collection(db, "producciones"), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Produccion));
  } catch (e) {
    console.error("Error al obtener lotes:", e);
    return [];
  }
}

export async function actualizarProduccionDB(id: string, data: Partial<Produccion>) {
  try {
    const docRef = doc(db, "producciones", id);
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => value !== undefined && key !== 'id')
    );
    await updateDoc(docRef, cleanData);
  } catch (e) {
    console.error("Error en actualizarProduccionDB:", e);
    throw e;
  }
}

export async function eliminarProduccionDB(id: string) {
  try {
    await deleteDoc(doc(db, "producciones", id));
  } catch (e) {
    console.error("Error al eliminar el lote:", e);
    throw e;
  }
}
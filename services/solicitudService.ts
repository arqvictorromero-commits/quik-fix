// services/solicitudService.ts
import { addDoc, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export interface SolicitudPayload {
  tasks: any[];
  total: number;
  location: { latitude: number; longitude: number };
  address: string;
  dates: string[];
  hour: string;
  clientId: string;
  clientEmail: string;
}

export const crearSolicitud = async (payload: SolicitudPayload) => {
  try {
    const solicitudData = {
      ...payload,
      status: "Pendiente",
      createdAt: serverTimestamp(),
    };

    // 🔹 Guardar en colección global
    const solicitudRef = await addDoc(collection(db, "solicitudes"), solicitudData);

    // 🔹 Guardar en historial del cliente
    const userHistorialRef = doc(db, "users", payload.clientId, "historial", solicitudRef.id);
    await setDoc(userHistorialRef, {
      ...solicitudData,
      id: solicitudRef.id, // ← importante para futuras actualizaciones
    });

    return solicitudRef.id;
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    throw error;
  }
};
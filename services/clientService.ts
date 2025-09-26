// services/clientService.ts
import { addDoc, collection, doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const crearSolicitudCliente = async ({
  tasks,
  total,
  location,
  address,
  dates,
  hour,
  clientId,
  clientEmail,
}: {
  tasks: any[];
  total: number;
  location: { latitude: number; longitude: number };
  address: string;
  dates: string[];
  hour: string;
  clientId: string;
  clientEmail: string;
}) => {
  const solicitudData = {
    tasks,
    total,
    location,
    address,
    dates,
    hour,
    status: "Pendiente",
    createdAt: serverTimestamp(),
    clientId,
    clientEmail,
  };

  const solicitudRef = await addDoc(collection(db, "solicitudes"), solicitudData);

  const historialRef = doc(db, "users", clientId, "historial", solicitudRef.id);
  await setDoc(historialRef, {
    ...solicitudData,
    id: solicitudRef.id,
  });

  return solicitudRef.id;
};

export const cancelarSolicitudCliente = async (clientId: string, solicitudId: string) => {
  await deleteDoc(doc(db, "solicitudes", solicitudId));
  await deleteDoc(doc(db, "users", clientId, "historial", solicitudId));
};
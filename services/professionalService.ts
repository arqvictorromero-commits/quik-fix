// services/professionalService.ts
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const aceptarSolicitud = async ({
  solicitudId,
  professionalId,
  professionalEmail,
}: {
  solicitudId: string;
  professionalId: string;
  professionalEmail: string;
}) => {
  const solicitudRef = doc(db, "solicitudes", solicitudId);
  const solicitudSnap = await getDoc(solicitudRef);

  if (!solicitudSnap.exists()) throw new Error("Solicitud no encontrada");

  const solicitudData = solicitudSnap.data();
  const clientId = solicitudData.clientId;

  // 🔹 Actualizar solicitud global
  await updateDoc(solicitudRef, {
    status: "Aceptada",
    professionalId,
    professionalEmail,
    acceptedAt: new Date(),
  });

  // 🔹 Actualizar historial del cliente
  const clientHistorialRef = doc(db, "users", clientId, "historial", solicitudId);
  await updateDoc(clientHistorialRef, {
    status: "Aceptada",
    professionalId,
    professionalEmail,
    acceptedAt: new Date(),
  });
};
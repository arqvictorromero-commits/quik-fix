// services/notificationService.ts
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { startLocationTracking } from './locationService';

export const setupServiceReminders = (professionalId: string) => {
  // Escuchar solicitudes aceptadas por este profesional
  const q = query(
    collection(db, 'solicitudes'),
    where('professionalId', '==', professionalId),
    where('status', '==', 'Aceptada')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.forEach((docSnap) => {
      const solicitud = { id: docSnap.id, ...docSnap.data() };
      checkServiceTime(solicitud);
    });
  });

  // ✅ Ahora sí retorna la función unsubscribe correctamente
  return unsubscribe;
};

const checkServiceTime = async (solicitud: any) => {
  const { dates, hour, id: solicitudId } = solicitud;
  const now = new Date();
  
  // Verificar cada fecha programada
  for (const dateStr of dates) {
    const serviceDateTime = parseServiceDateTime(dateStr, hour);
    if (!serviceDateTime) continue;
    
    const diffMs = serviceDateTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    console.log(`🔔 Servicio "${solicitud.address}" en ${diffMinutes} minutos`);
    
    // Si faltan 30 minutos o menos, activar seguimiento
    if (diffMinutes <= 30 && diffMinutes > 0) {
      await activateLocationTracking(solicitudId, solicitud.professionalId);
      sendNotification(solicitud, diffMinutes);
    }
    
    // Si el servicio ya pasó, marcarlo como completado
    if (diffMinutes < -60 && solicitud.status === 'Aceptada') { // 1 hora después
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        status: 'Completada',
        completedAt: new Date()
      });
    }
  }
};

// Función auxiliar para parsear fecha y hora
const parseServiceDateTime = (dateStr: string, hourStr: string): Date | null => {
  try {
    const [year, month, day] = dateStr.split('-');
    const [time, modifier] = hourStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    // Convertir a formato 24 horas
    if (modifier === 'p.m.' && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (modifier === 'a.m.' && hours === '12') {
      hours = '00';
    }
    
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes)
    );
  } catch (error) {
    console.error('Error parseando fecha/hora:', error);
    return null;
  }
};

const activateLocationTracking = async (solicitudId: string, professionalId: string) => {
  try {
    await startLocationTracking(solicitudId, professionalId);
    console.log('📍 Seguimiento activado para servicio:', solicitudId);
    
    // Actualizar estado en Firestore
    await updateDoc(doc(db, 'solicitudes', solicitudId), {
      locationTrackingActive: true,
      trackingStartedAt: new Date()
    });
  } catch (error) {
    console.error('Error activando seguimiento:', error);
  }
};

const sendNotification = (solicitud: any, minutesLeft: number) => {
  // Aquí puedes integrar notificaciones push más adelante
  const messages = {
    30: `⏰ Recordatorio: Servicio en 30 minutos - ${solicitud.address}`,
    15: `⏰ Servicio en 15 minutos - ${solicitud.address}`,
    10: `⏰ Servicio en 10 minutos - ${solicitud.address}`,
    5: `⏰ Servicio en 5 minutos - ${solicitud.address}`,
    1: `⏰ Servicio en 1 minuto - ${solicitud.address}`
  };
  
  if (messages[minutesLeft as keyof typeof messages]) {
    console.log(messages[minutesLeft as keyof typeof messages]);
  }
};
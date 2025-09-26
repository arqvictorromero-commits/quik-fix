// services/locationService.ts 22sep25
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as Location from 'expo-location';

let locationSubscription: Location.LocationSubscription | null = null;

export const startLocationTracking = async (solicitudId: string, professionalId: string) => {
  try {
    // Detener seguimiento anterior si existe
    if (locationSubscription) {
        locationSubscription.remove();
    }

    // Solicitar permisos de ubicación
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permiso de ubicación denegado');
    }

    // Iniciar seguimiento de ubicación en tiempo real
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 50, // Actualizar cada 50 metros
        timeInterval: 30000, // Actualizar cada 30 segundos
      },
      async (location) => {
        const professionalLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(),
          speed: location.coords.speed || 0,
          heading: location.coords.heading || 0,
        };

        // Actualizar ubicación en la solicitud
        await updateDoc(doc(db, 'solicitudes', solicitudId), {
          professionalLocation,
          locationUpdatedAt: serverTimestamp(),
        });
      }
    );

    return true;
  } catch (error) {
    console.error('Error en seguimiento de ubicación:', error);
    throw error;
  }
};

export const stopLocationTracking = async (solicitudId: string) => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  // Esta función se llamaría cuando se complete la solicitud
  await updateDoc(doc(db, 'solicitudes', solicitudId), {
    professionalLocation: null,
    locationTracking: false,
  });
};

export const isTrackingActive = () => {
  return locationSubscription !== null;
};
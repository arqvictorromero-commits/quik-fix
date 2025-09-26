// screens/ProfessionalLocationScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import * as Location from 'expo-location';

interface ProfessionalLocationScreenProps {
  route: {
    params: {
      solicitudId: string;
      clientLocation: {
        latitude: number;
        longitude: number;
      };
      address: string;
    };
  };
}

export default function ProfessionalLocationScreen({ route }: ProfessionalLocationScreenProps) {
  const { solicitudId, clientLocation, address } = route.params;
  const [professionalLocation, setProfessionalLocation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener ubicación actual del usuario
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    };

    getUserLocation();

    // Escuchar cambios en la ubicación del profesional
    const unsubscribe = onSnapshot(
      doc(db, 'solicitudes', solicitudId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfessionalLocation(data.professionalLocation);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [solicitudId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text>Cargando ubicación...</Text>
      </View>
    );
  }

  const initialRegion = professionalLocation || clientLocation || userLocation;

  if (!initialRegion) {
    return (
      <View style={styles.center}>
        <Text>No se pudo cargar la ubicación</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Ubicación del Servicio</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.status}>
          {professionalLocation ? '🚗 Profesional en camino' : '⏳ Esperando ubicación'}
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          ...initialRegion,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Marcador del cliente */}
        <Marker
          coordinate={clientLocation}
          title="Ubicación del servicio"
          description={address}
          pinColor="#1E3A8A"
        />

        {/* Marcador del profesional */}
        {professionalLocation && (
          <Marker
            coordinate={professionalLocation}
            title="Profesional"
            description="En camino"
            pinColor="#10B981"
          />
        )}

        {/* Línea entre profesional y cliente */}
        {professionalLocation && clientLocation && (
          <Polyline
            coordinates={[professionalLocation, clientLocation]}
            strokeColor="#F59E0B"
            strokeWidth={3}
          />
        )}

        {/* Marcador del usuario actual */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            pinColor="#6366F1"
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: '#1E3A8A' }]} />
            <Text>Ubicación del servicio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
            <Text>Profesional</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: '#6366F1' }]} />
            <Text>Tu ubicación</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  address: { fontSize: 14, color: '#666', marginTop: 5 },
  status: { fontSize: 14, color: '#F59E0B', marginTop: 5, fontWeight: 'bold' },
  map: { flex: 1 },
  infoContainer: { padding: 15, backgroundColor: '#fff' },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
});
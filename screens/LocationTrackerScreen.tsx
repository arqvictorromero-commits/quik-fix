// screens/LocationTrackerScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import * as Location from 'expo-location';
import MapView, { Marker } from "react-native-maps";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export default function LocationTrackerScreen({ route }: any) {
  const { solicitudId } = route.params;
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        return;
      }

      // Obtener ubicación inicial
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Actualizar cada 2 minutos
      const interval = setInterval(async () => {
        let newLocation = await Location.getCurrentPositionAsync({});
        setLocation(newLocation);
        
        // Actualizar en Firebase
        const solicitudRef = doc(db, "solicitudes", solicitudId);
        await updateDoc(solicitudRef, {
          professionalLocation: {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            timestamp: new Date()
          }
        });
      }, 120000); // 2 minutos

      return () => clearInterval(interval);
    })();
  }, [solicitudId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Compartiendo Ubicación</Text>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Tu ubicación"
            />
          </MapView>
          <Text style={styles.coordinates}>
            Lat: {location.coords.latitude.toFixed(6)}
            {"\n"}
            Long: {location.coords.longitude.toFixed(6)}
          </Text>
        </>
      ) : (
        <Text>Obteniendo ubicación...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  map: { height: 300, width: '100%', marginBottom: 20 },
  coordinates: { textAlign: 'center', color: '#666' }
});
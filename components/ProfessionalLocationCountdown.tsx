// components/ProfessionalLocationCountdown.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as Location from 'expo-location';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

type ProfessionalLocationCountdownProps = {
  hora: string;
  solicitudId: string;
  professionalId?: string;
};

export default function ProfessionalLocationCountdown({ 
  hora, 
  solicitudId, 
  professionalId 
}: ProfessionalLocationCountdownProps) {
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);
  const [professionalLocation, setProfessionalLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && professionalId === user.uid) {
      setIsProfessional(true);
    }
  }, [professionalId]);

  useEffect(() => {
    const calcularTiempo = () => {
      const ahora = new Date();
      const [hh, mm] = hora.split(":");
      const objetivo = new Date();
      objetivo.setHours(parseInt(hh));
      objetivo.setMinutes(parseInt(mm));
      objetivo.setSeconds(0);

      const diferencia = objetivo.getTime() - ahora.getTime();
      const minutos = Math.floor(diferencia / 60000);
      setMinutosRestantes(minutos);

      // Si faltan 30 minutos o menos y es el profesional, actualizar ubicación
      if (minutos <= 30 && isProfessional) {
        actualizarUbicacionProfesional();
      }
    };

    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalo);
  }, [hora, isProfessional]);

  const actualizarUbicacionProfesional = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const nuevaUbicacion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date()
      };

      setProfessionalLocation(nuevaUbicacion);

      // Actualizar en Firebase
      const solicitudRef = doc(db, "solicitudes", solicitudId);
      await updateDoc(solicitudRef, {
        professionalLocation: nuevaUbicacion
      });

    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
    }
  };

  // Solo mostrar si faltan 30 minutos o menos
  if (minutosRestantes === null || minutosRestantes > 30) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, minutosRestantes <= 10 && styles.textRed]}>
        ⏱️ Faltan {minutosRestantes} minutos para iniciar
      </Text>
      
      {professionalLocation && (
        <Text style={styles.locationText}>
          📍 Ubicación del profesional: 
          {professionalLocation.latitude.toFixed(4)}, 
          {professionalLocation.longitude.toFixed(4)}
        </Text>
      )}

      {isProfessional && minutosRestantes <= 30 && (
        <Text style={styles.infoText}>
          🔄 Tu ubicación se está compartiendo automáticamente
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B'
  },
  textRed: {
    color: '#EF4444'
  },
  locationText: {
    fontSize: 12,
    marginTop: 5,
    color: '#374151'
  },
  infoText: {
    fontSize: 11,
    marginTop: 5,
    fontStyle: 'italic',
    color: '#6B7280'
  }
});
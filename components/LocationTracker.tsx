// components/LocationTracker.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { startLocationTracking, stopLocationTracking } from '../services/locationService';

export default function LocationTracker({ solicitudId, isActive }: { solicitudId: string; isActive: boolean }) {
  const [tracking, setTracking] = useState(false);

  const startTracking = async () => {
    try {
      await startLocationTracking(solicitudId);
      setTracking(true);
    } catch (error) {
      console.error('Error iniciando seguimiento:', error);
    }
  };

  const stopTracking = async () => {
    await stopLocationTracking(solicitudId);
    setTracking(false);
  };

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Seguimiento de Ubicación</Text>
      <Text style={styles.status}>
        {tracking ? 'Activo' : 'Inactivo'}
      </Text>
      
      <TouchableOpacity
        style={[styles.button, tracking ? styles.stopButton : styles.startButton]}
        onPress={tracking ? stopTracking : startTracking}
      >
        <Text style={styles.buttonText}>
          {tracking ? '🛑 Detener Seguimiento' : '🚗 Iniciar Seguimiento'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#F3F4F6', borderRadius: 8, margin: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  status: { fontSize: 14, color: '#666', marginBottom: 10 },
  button: { padding: 10, borderRadius: 5, alignItems: 'center' },
  startButton: { backgroundColor: '#10B981' },
  stopButton: { backgroundColor: '#EF4444' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
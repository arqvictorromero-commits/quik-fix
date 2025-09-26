// 7. screens/DashboardScreen.tsx (Versión Final)
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useHistorial } from "../hooks/useHistorial";
import { auth } from "../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const user = auth.currentUser;
  const [rol, setRol] = useState<"cliente" | "profesional">("cliente");
  const { historial, loading, error } = useHistorial(user?.uid || "", rol);

  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aceptadas: 0,
    canceladas: 0,
    completadas: 0,
  });

  useEffect(() => {
    const loadRol = async () => {
      const storedRol = await AsyncStorage.getItem("rolActivo");
      if (storedRol) {
        setRol(storedRol as "cliente" | "profesional");
      }
    };
    loadRol();
  }, []);

  useEffect(() => {
    if (historial.length > 0) {
      const grouped = historial.reduce(
        (acc, item) => {
          acc.total += 1;
          if (item.status === "Pendiente") acc.pendientes += 1;
          if (item.status === "Aceptada") acc.aceptadas += 1;
          if (item.status === "Cancelada") acc.canceladas += 1;
          if (item.status === "Completada") acc.completadas += 1;
          return acc;
        },
        { total: 0, pendientes: 0, aceptadas: 0, canceladas: 0, completadas: 0 }
      );
      setStats(grouped);
    }
  }, [historial]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ marginTop: 10 }}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Dashboard - {rol === "cliente" ? "Cliente" : "Profesional"}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
          <Text style={[styles.statNumber, { color: "#D97706" }]}>{stats.pendientes}</Text>
          <Text style={[styles.statLabel, { color: "#D97706" }]}>Pendientes</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: "#D1FAE5" }]}>
          <Text style={[styles.statNumber, { color: "#059669" }]}>{stats.aceptadas}</Text>
          <Text style={[styles.statLabel, { color: "#059669" }]}>Aceptadas</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#FEE2E2" }]}>
          <Text style={[styles.statNumber, { color: "#DC2626" }]}>{stats.canceladas}</Text>
          <Text style={[styles.statLabel, { color: "#DC2626" }]}>Canceladas</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: "#E0E7FF" }]}>
          <Text style={[styles.statNumber, { color: "#3730A3" }]}>{stats.completadas}</Text>
          <Text style={[styles.statLabel, { color: "#3730A3" }]}>Completadas</Text>
        </View>
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.subtitle}>📋 Últimas solicitudes</Text>
        {historial.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.recentItem}>
            <Text style={styles.recentText}>
              {item.address?.substring(0, 30)}...
            </Text>
            <Text style={[styles.recentStatus, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        ))}
        {historial.length === 0 && (
          <Text style={styles.emptyText}>No hay solicitudes registradas</Text>
        )}
      </View>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pendiente": return "#F59E0B";
    case "Aceptada": return "#10B981";
    case "Cancelada": return "#EF4444";
    case "Completada": return "#6366F1";
    default: return "#6B7280";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1E3A8A", textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#374151" },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 15,
    gap: 10
  },
  statCard: { 
    flex: 1, 
    backgroundColor: "#EFF6FF", 
    padding: 15, 
    borderRadius: 12, 
    alignItems: "center",
    minHeight: 100
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#1E3A8A", marginBottom: 5 },
  statLabel: { fontSize: 12, color: "#1E3A8A", textAlign: "center" },
  recentContainer: { marginTop: 20 },
  recentItem: { 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: "#E5E7EB" 
  },
  recentText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  recentStatus: { fontSize: 12, fontWeight: "bold" },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 10 }
});
// screens/HistorialScreen.tsx 18sep25
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { db, auth } from "../config/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

type Solicitud = {
  id: string;
  tasks: any[];
  total: number;
  address: string;
  status: string;
  dates: string[];
  hour: string;
};

export default function HistorialScreen() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtro, setFiltro] = useState<"Pendiente" | "Aceptada" | "Cancelada" | "Completada">("Pendiente");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "solicitudes"),
      where("clientId", "==", user.uid),
      where("status", "==", filtro),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Solicitud[] = [];
      snapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as Solicitud);
      });
      setSolicitudes(docs);
    });

    return () => unsubscribe();
  }, [filtro]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de solicitudes</Text>

      <View style={styles.filters}>
        {["Pendiente", "Aceptada", "Cancelada", "Completada"].map((estado) => (
          <TouchableOpacity
            key={estado}
            onPress={() => setFiltro(estado as any)}
            style={[styles.filterBtn, filtro === estado && styles.filterActive]}
          >
            <Text style={{ color: filtro === estado ? "#fff" : "#1E3A8A" }}>{estado}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.address}>{item.address}</Text>
            <Text>Total: ${item.total}</Text>
            <Text>Estado: {item.status}</Text>
            <Text>Días: {item.dates.join(", ")}</Text>
            <Text>Hora: {item.hour}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay solicitudes en este estado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#1E3A8A" },
  filters: { flexDirection: "row", marginBottom: 15, justifyContent: "space-around" },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#1E3A8A" },
  filterActive: { backgroundColor: "#1E3A8A" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  address: { fontWeight: "bold", marginBottom: 5 },
});

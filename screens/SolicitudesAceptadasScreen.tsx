// screens/ SolicitudesAceptadasScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../config/firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function SolicitudesAceptadasScreen() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  useEffect(() => {
    const solicitudesRef = ref(db, "requests");
    onValue(solicitudesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data)
          .map(([id, value]: any) => ({ id, ...value }))
          .filter((s) => s.status === "Aceptada");
        setSolicitudes(lista);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes Aceptadas</Text>
      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>📍 Dirección:</Text>
            <Text>{item.location?.address}</Text>
            <Text style={styles.label}>🕒 Hora programada:</Text>
            <Text>{item.hour}</Text>
            <Contador hora={item.hour} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: { marginBottom: 20, padding: 15, backgroundColor: "#F3F4F6", borderRadius: 8 },
  label: { fontWeight: "bold", marginTop: 10 },
});
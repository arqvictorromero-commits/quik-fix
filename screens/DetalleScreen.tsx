// screens/DetalleScreen.tsx
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";
import { RootStackParamList } from "../App";

type DetalleScreenRouteProp = RouteProp<RootStackParamList, "Detalle">;

type Props = {
  route: DetalleScreenRouteProp;
};

export default function DetalleScreen({ route }: Props) {
  const { request } = route.params;
  const { requests, addRequest } = useContext(AppContext);
  const navigation = useNavigation();

  const updateStatus = (newStatus: "Aceptada" | "Finalizada") => {
    const updatedRequest = { ...request, status: newStatus };
    const updatedRequests = requests.map((r) =>
      r.id === request.id ? updatedRequest : r
    );
    addRequest(updatedRequest); // Reemplaza el anterior
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📝 Detalle de Solicitud</Text>
      {request.status === "Pendiente" && (
  <Button
    title="✅ Confirmar solicitud"
    onPress={() => updateStatus("Aceptada")}
    color="#10B981"
  />
)}

      {request.status === "Aceptada" && (
  <Button
    title="🏁 Finalizar solicitud"
    onPress={() => updateStatus("Finalizada")}
    color="#6366F1"
  />
)}
      <Text style={styles.label}>Estado actual: {request.status}</Text>
      <Text style={styles.label}>Fecha(s): {request.dates.join(", ")}</Text>
      <Text style={styles.label}>Hora: {request.hour}</Text>
      <Text style={styles.label}>Presupuesto: ${request.budget.toFixed(2)}</Text>
      <Text style={styles.label}>Total: ${request.total.toFixed(2)}</Text>

      <Text style={styles.subTitle}>🔧 Tareas:</Text>
      {request.tasks.map((t, i) => (
        <Text key={i} style={styles.task}>
          • {t.name} x{t.qty} → ${t.price * t.qty}
        </Text>
      ))}

      {request.status === "Pendiente" && (
        <Button title="✅ Aceptar solicitud" onPress={() => updateStatus("Aceptada")} />
      )}
      {request.status === "Aceptada" && (
        <Button title="🏁 Finalizar solicitud" onPress={() => updateStatus("Finalizada")} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  label: { fontSize: 16, marginVertical: 4 },
  task: { fontSize: 16, marginLeft: 10, marginVertical: 2 },
});
// screens/TaskScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { AppContext } from "../context/AppContext";

type TasksScreenRouteProp = RouteProp<RootStackParamList, "Tasks">;

type Props = {
  route: TasksScreenRouteProp;
};

type Task = {
  id: string;
  name: string;
  price: number;
};

const TASKS: Record<string, Task[]> = {
  Electricidad: [
    { id: "1", name: "Cambiar contacto", price: 150 },
    { id: "2", name: "Instalar apagador", price: 200 },
    { id: "3", name: "Revisión de corto circuito", price: 300 },
  ],
  Plomería: [
    { id: "4", name: "Reparar fuga", price: 250 },
    { id: "5", name: "Instalar sanitario", price: 800 },
    { id: "6", name: "Cambiar llave de lavabo", price: 180 },
  ],
  Cerrajería: [
    { id: "7", name: "Abrir puerta", price: 400 },
    { id: "8", name: "Cambiar chapa", price: 350 },
    { id: "9", name: "Duplicar llave", price: 80 },
  ],
};

export default function TasksScreen({ route }: Props) {
  const { service } = route.params || { service: "General" };
  const { tasks, addTask, updateTaskQty } = useContext(AppContext);

  const selectedTasks = TASKS[service] || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas de {service}</Text>

      <FlatList
        data={selectedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const existingTask = tasks.find((t) => t.id === item.id);

          return (
            <View style={styles.taskCard}>
              <View>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.taskPrice}>${item.price}</Text>
              </View>

              {!existingTask ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addTask({ ...item, qty: 1 })}
                >
                  <Text style={styles.addBtnText}>Agregar</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() =>
                      updateTaskQty(existingTask.id, existingTask.qty - 1)
                    }
                  >
                    <Text style={styles.counterText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{existingTask.qty}</Text>

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() =>
                      updateTaskQty(existingTask.id, existingTask.qty + 1)
                    }
                  >
                    <Text style={styles.counterText}>＋</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1E3A8A",
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  taskName: { fontSize: 16, color: "#374151" },
  taskPrice: { fontSize: 16, fontWeight: "bold", color: "#F97316" },
  addBtn: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterBtn: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  counterText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  qtyText: { marginHorizontal: 10, fontSize: 16, fontWeight: "bold" },
});

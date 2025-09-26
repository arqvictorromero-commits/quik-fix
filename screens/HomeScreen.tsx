// 3. screens/HomeScreen.tsx (Actualizado)
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppContext } from "../context/AppContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const { budget, tasks } = useContext(AppContext);
  const totalTasks = tasks.reduce((sum, t) => sum + t.qty, 0);
  const totalCost = tasks.reduce((sum, t) => sum + t.qty * t.price, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Quik-Fix</Text>
      
      <Text style={styles.summary}>
        🛠️ Tareas acumuladas: {totalTasks}
      </Text>
      
      <Text style={styles.summary}>
        💰 Total: ${totalCost} / Presupuesto: ${budget}
      </Text>
      
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Tasks", { service: "Electricidad" })}
      >
        <Text style={styles.btnText}>Seleccionar Electricidad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Tasks", { service: "Plomería" })}
      >
        <Text style={styles.btnText}>Seleccionar Plomería</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Tasks", { service: "Cerrajería" })}
      >
        <Text style={styles.btnText}>Seleccionar Cerrajería</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#F97316" }]}
        onPress={() => navigation.navigate("Report")}
      >
        <Text style={styles.btnText}>📊 Generar Solicitud</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#10B981" }]}
        onPress={() => navigation.navigate("Historial")}
      >
        <Text style={styles.btnText}>📜 Ver Historial</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#6366F1" }]}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.btnText}>📊 Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
    backgroundColor: "#F9FAFB"
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#1E3A8A",
    textAlign: "center"
  },
  summary: { 
    fontSize: 16, 
    marginBottom: 10, 
    color: "#374151",
    textAlign: "center"
  },
  btn: {
    backgroundColor: "#1E3A8A",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});
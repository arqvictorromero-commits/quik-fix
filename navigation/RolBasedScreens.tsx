// navigation/RolBasedScreens.tsx
import React from "react";
import { StackNavigationOptions } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "../screens/HomeScreen";
import BudgetScreen from "../screens/BudgetScreen";
import ReportScreen from "../screens/ReportScreen";
import TasksScreen from "../screens/TasksScreen";
import HistorialScreen from "../screens/HistorialScreen";
import DetalleScreen from "../screens/DetalleScreen";
import SolicitudesScreen from "../screens/SolicitudesScreen";

const Stack = createStackNavigator();

const screenOptions: StackNavigationOptions = {
  headerStyle: { backgroundColor: "#1E3A8A" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" },
};

export default function RolBasedScreens() {
  const [rolActivo, setRolActivo] = useState<"cliente" | "profesional" | null>(null);

  useEffect(() => {
    const cargarRol = async () => {
      const rol = await AsyncStorage.getItem("rolActivo");
      setRolActivo(rol as any);
    };
    cargarRol();
  }, []);

  if (!rolActivo) return null; // o un loader si prefieres

  return (
    <>
      {rolActivo === "cliente" && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen name="Historial" component={HistorialScreen} />
          <Stack.Screen name="Detalle" component={DetalleScreen} />
        </>
      )}
      {rolActivo === "profesional" && (
        <Stack.Screen name="Solicitudes" component={SolicitudesScreen} />
        <Stack.Screen name="Aceptadas" component={SolicitudesAceptadasScreen} />
      )}
    </>
  );
}
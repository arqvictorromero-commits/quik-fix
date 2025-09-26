// 1. App.tsx (Actualizado)
import 'react-native-gesture-handler';
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppProvider } from "./context/AppContext";
import { auth } from "./config/firebaseConfig";
import { registerForPushNotificationsAsync } from "./utils/registerPushToken";
import HomeScreen from "./screens/HomeScreen";
import BudgetScreen from "./screens/BudgetScreen";
import ReportScreen from "./screens/ReportScreen";
import TasksScreen from "./screens/TasksScreen";
import HistorialScreen from "./screens/HistorialScreen";
import DetalleScreen from "./screens/DetalleScreen";
import LoginScreen from "./screens/LoginScreen";
import RolSelector from "./screens/RolSelector";
import SolicitudesScreen from "./screens/SolicitudesScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProfessionalLocationScreen from './screens/ProfessionalLocationScreen';

export type RootStackParamList = {
  Login: undefined;
  RolSelector: undefined;
  Home: undefined;
  Budget: { service: string } | undefined;
  Report: undefined;
  Tasks: { service: string };
  Historial: undefined;
  Detalle: { request: any };
  Solicitudes: undefined;
  Register: undefined;
  Dashboard: undefined;
  ProfessionalLocation: {
    solicitudId: string;
    clientLocation: { latitude: number; longitude: number };
    address: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const setupPush = async () => {
      const user = auth.currentUser;
      if (user) {
        await registerForPushNotificationsAsync(user.uid);
      }
    };
    setupPush();
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: "#1E3A8A" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Iniciar sesión" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />
          <Stack.Screen name="RolSelector" component={RolSelector} options={{ title: "Selecciona tu rol" }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Quik-Fix" }} />
          <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: "Presupuesto" }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ title: "Reporte" }} />
          <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: "Tareas" }} />
          <Stack.Screen name="Historial" component={HistorialScreen} options={{ title: "Historial" }} />
          <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: "Detalle de Solicitud" }} />
          <Stack.Screen name="Solicitudes" component={SolicitudesScreen} options={{ title: "Solicitudes" }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
          <Stack.Screen name="ProfessionalLocation" component={ProfessionalLocationScreen} options={{ title: "Ubicación del Servicio" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
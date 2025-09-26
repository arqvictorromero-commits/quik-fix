//screens/RolSelector.tsx
import React from "react";
import { View, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function RolSelector() {
  const navigation = useNavigation();

  const seleccionarRol = async (rol: "cliente" | "profesional") => {
    await AsyncStorage.setItem("rolActivo", rol);
    navigation.navigate(rol === "cliente" ? "Home" : "Solicitudes");
  };

  return (
    <View style={styles.container}>
      <Button title="👤 Modo Cliente" onPress={() => seleccionarRol("cliente")} />
      <Button title="🛠️ Modo Profesional" onPress={() => seleccionarRol("profesional")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
});
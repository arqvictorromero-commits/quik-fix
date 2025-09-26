// screens/BudgetScreen.tsx
import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AppContext } from "../context/AppContext";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";

type BudgetScreenRouteProp = RouteProp<RootStackParamList, "Budget">;

type Props = {
  route: BudgetScreenRouteProp;
};

export default function BudgetScreen({ route }: Props) {
  const { budget, setBudget } = useContext(AppContext);
  const [input, setInput] = useState(budget.toString());
  const { service } = route.params || { service: "General" };

  const handleSave = () => {
    const value = parseFloat(input);
    if (!isNaN(value)) setBudget(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presupuesto para {service} 💰</Text>

      <TextInput
        style={styles.input}
        value={input}
        keyboardType="numeric"
        onChangeText={setInput}
        placeholder="Ingresa tu presupuesto"
      />

      <Button title="Guardar" onPress={handleSave} />

      <Text style={styles.current}>Presupuesto actual: ${budget}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#1E3A8A" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "80%",
    marginBottom: 15,
    textAlign: "center",
  },
  current: { marginTop: 15, fontSize: 16, color: "#374151" },
});

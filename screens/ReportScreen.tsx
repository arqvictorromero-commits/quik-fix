// 4. screens/ReportScreen.tsx (Versión Final 22sep25-pre)
import React, { useContext, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Button, 
  Alert, 
  StyleSheet, 
  Platform, 
  ScrollView 
} from "react-native";
import { AppContext } from "../context/AppContext";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

export default function ReportScreen() {
  const { tasks, getTotal } = useContext(AppContext);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<{ [date: string]: any }>({});
  const [selectedHours, setSelectedHours] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const total = getTotal();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      
      setMarker(coords);
      const geo = await Location.reverseGeocodeAsync(coords);
      if (geo.length > 0) {
        const addr = `${geo[0].street || ""} ${geo[0].name || ""}, ${geo[0].city || ""}`;
        setAddress(addr);
      }
    })();
  }, []);

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    setIsAddressConfirmed(false);
    
    try {
      const geo = await Location.reverseGeocodeAsync(coords);
      if (geo.length > 0) {
        const addr = `${geo[0].street || ""} ${geo[0].name || ""}, ${geo[0].city || ""}`;
        setAddress(addr);
      }
    } catch (error) {
      console.error("Error al obtener dirección:", error);
    }
  };

  const confirmAddress = () => {
    if (!marker) {
      Alert.alert("Error", "Primero selecciona una ubicación en el mapa");
      return;
    }
    setIsAddressConfirmed(true);
    Alert.alert("Dirección confirmada", `Se usará: ${address}`);
  };

  const handleDayPress = (day: { dateString: string }) => {
    const newDates = { ...selectedDates };
    if (newDates[day.dateString]) {
      delete newDates[day.dateString];
    } else {
      newDates[day.dateString] = { selected: true, marked: true, selectedColor: "#1E3A8A" };
    }
    setSelectedDates(newDates);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setSelectedHours(selectedDate);
  };

  const handleGenerateRequest = async () => {
    if (!marker || !isAddressConfirmed) {
      Alert.alert("Falta ubicación", "Debes seleccionar y confirmar una dirección en el mapa.");
      return;
    }

    if (Object.keys(selectedDates).length === 0) {
      Alert.alert("Faltan fechas", "Debes seleccionar al menos un día en el calendario.");
      return;
    }

    if (!selectedHours) {
      Alert.alert("Falta horario", "Debes seleccionar una hora disponible.");
      return;
    }

    const formattedDates = Object.keys(selectedDates);
    const formattedHour = selectedHours.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión.");
        return;
      }

      const solicitudData = {
        tasks,
        total,
        location: marker,
        address,
        dates: formattedDates,
        hour: formattedHour,
        status: "Pendiente",
        createdAt: serverTimestamp(),
        clientId: user.uid,
        clientEmail: user.email,
      };

      const solicitudRef = await addDoc(collection(db, "solicitudes"), solicitudData);
      
      const userHistorialRef = doc(db, "users", user.uid, "historial", solicitudRef.id);
      await setDoc(userHistorialRef, solicitudData);

      Alert.alert(
        "Solicitud creada", 
        "Tu solicitud fue registrada con éxito y está disponible para todos los profesionales."
      );
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      Alert.alert("Error", "No se pudo registrar la solicitud.");
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={{ padding: 20 }}>
        <Text style={styles.title}>Resumen de tu solicitud</Text>
        
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.task}>
              {item.name} x{item.qty} → ${item.price * item.qty}
            </Text>
          )}
        />
        
        <Text style={styles.total}>Total: ${total}</Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Selecciona tu ubicación:</Text>
        <Text style={{ marginBottom: 10, color: "#666" }}>
          Toca en el mapa para seleccionar tu ubicación exacta
        </Text>
      </View>

      {marker && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: marker.latitude,
            longitude: marker.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={marker}
            draggable
            onDragEnd={handleMapPress}
          />
        </MapView>
      )}

      <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
        <Button
          title={isAddressConfirmed ? "✓ Dirección confirmada" : "Confirmar esta dirección"}
          onPress={confirmAddress}
          color={isAddressConfirmed ? "#10B981" : "#1E3A8A"}
          disabled={!marker}
        />
      </View>

      <View style={{ padding: 20 }}>
        <Text style={styles.address}>📍 Dirección: {address || "Selecciona una ubicación"}</Text>

        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Selecciona días disponibles:</Text>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={selectedDates}
          theme={{
            selectedDayBackgroundColor: "#1E3A8A",
            todayTextColor: "#F97316",
          }}
        />

        <Text style={{ fontWeight: "bold", marginTop: 20 }}>Horario disponible:</Text>
        <Button title="Seleccionar hora" onPress={() => setShowPicker(true)} />
        
        {showPicker && (
          <DateTimePicker
            value={selectedHours || new Date()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}

        {selectedHours && (
          <Text style={{ marginTop: 10 }}>
            Hora seleccionada:{" "}
            {selectedHours.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Generar solicitud" onPress={handleGenerateRequest} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#1E3A8A" },
  task: { fontSize: 16, marginBottom: 4 },
  total: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  address: { marginBottom: 10, fontSize: 14, color: "#374151" },
  map: {
    height: 300,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
  },
});

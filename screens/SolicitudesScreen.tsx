// 5. screens/SolicitudesScreen.tsx (Versión Final-mod 23sep25-2)
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../config/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { setupServiceReminders } from '../services/notificationService';

type Task = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Solicitud = {
  id: string;
  tasks: Task[];
  total: number;
  address: string;
  status: string;
  dates: string[];
  hour: string;
  location?: any;
  professionalId?: string;
  professionalEmail?: string;
  clientId?: string;
  clientEmail?: string;
  createdAt?: any;
};

export default function SolicitudesScreen() {
  const navigation = useNavigation();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtro, setFiltro] = useState<"Pendiente" | "Aceptada" | "Cancelada" | "Completada">("Pendiente");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ✅ Función para ver ubicación
  const viewLocation = (solicitud: Solicitud) => {
    if (!solicitud.location) {
      Alert.alert('Error', 'No hay ubicación disponible para esta solicitud');
      return;
    }

    navigation.navigate('ProfessionalLocation' as never, {
      solicitudId: solicitud.id,
      clientLocation: solicitud.location,
      address: solicitud.address,
    } as never);
  };

  // ✅ useEffect CORREGIDO
  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    
    if (!currentUser) {
      Alert.alert("Error", "Debes iniciar sesión.");
      setLoading(false);
      return;
    }

    let q;
    
    if (filtro === "Pendiente") {
      q = query(
        collection(db, "solicitudes"),
        where("status", "==", "Pendiente"),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "solicitudes"),
        where("status", "==", filtro),
        where("professionalId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribeSolicitudes = onSnapshot(
      q,
      (snapshot) => {
        const docs: Solicitud[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          docs.push({
            id: docSnap.id,
            ...data
          } as Solicitud);
        });
        
        setSolicitudes(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error en la consulta:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes: " + error.message);
        setLoading(false);
      }
    );

    // ✅ SISTEMA DE RECORDATORIOS - Solo para profesionales (fuera de Pendiente)
    let unsubscribeReminders: (() => void) | null = null;
    
    if (currentUser && filtro !== "Pendiente") {
      try {
        unsubscribeReminders = setupServiceReminders(currentUser.uid);
      } catch (error) {
        console.error("Error configurando recordatorios:", error);
      }
    }

    // ✅ CLEANUP FUNCTION CORREGIDA
    return () => {
      unsubscribeSolicitudes();
      if (unsubscribeReminders) {
        unsubscribeReminders();
      }
    };
  }, [filtro]); // ✅ Solo filtro como dependencia

  const canAcceptSolicitud = (solicitud: Solicitud): { canAccept: boolean; message: string } => {
    if (!user) return { canAccept: false, message: "Usuario no autenticado" };
    
    if (solicitud.clientId === user.uid) {
      return { canAccept: false, message: "No puedes aceptar tu propia solicitud" };
    }
    
    if (solicitud.status !== "Pendiente") {
      return { canAccept: false, message: "Esta solicitud ya no está disponible" };
    }
    
    if (solicitud.professionalId && solicitud.professionalId !== user.uid) {
      return { canAccept: false, message: "Esta solicitud ya fue aceptada por otro profesional" };
    }
    
    return { canAccept: true, message: "" };
  };

  const handleAccept = async (solicitudId: string) => {
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) return;
    
    const { canAccept, message } = canAcceptSolicitud(solicitud);
    if (!canAccept) {
      Alert.alert("No disponible", message);
      return;
    }

    try {
      const solicitudRef = doc(db, "solicitudes", solicitudId);
      
      await updateDoc(solicitudRef, {
        status: "Aceptada",
        professionalId: user.uid,
        professionalEmail: user.email,
        acceptedAt: new Date(),
      });

      if (solicitud.clientId) {
        const clientHistorialRef = doc(db, "users", solicitud.clientId, "historial", solicitudId);
        await updateDoc(clientHistorialRef, {
          status: "Aceptada",
          professionalId: user.uid,
          professionalEmail: user.email,
          acceptedAt: new Date(),
        });
      }

      Alert.alert("✅ Éxito", "Has aceptado esta solicitud.");
    } catch (error: any) {
      console.error("Error al aceptar solicitud:", error);
      Alert.alert("❌ Error", "No se pudo aceptar la solicitud: " + error.message);
    }
  };

  const handleReject = async (solicitudId: string) => {
    try {
      const solicitudRef = doc(db, "solicitudes", solicitudId);
      await updateDoc(solicitudRef, {
        status: "Cancelada",
        canceledAt: new Date(),
      });
      Alert.alert("Solicitud cancelada", "Has rechazado esta solicitud.");
    } catch (error: any) {
      console.error("Error al rechazar solicitud:", error);
      Alert.alert("Error", "No se pudo rechazar la solicitud: " + error.message);
    }
  };

  const renderTasks = (tasks: Task[]) => {
    return (
      <View style={styles.tasksContainer}>
        <Text style={styles.tasksTitle}>🛠️ Tareas:</Text>
        {tasks.map((task, index) => (
          <View key={index} style={styles.taskItem}>
            <Text style={styles.taskText}>
              • {task.name} x{task.qty} - ${task.price * task.qty}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ marginTop: 10 }}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Solicitudes {filtro === "Pendiente" ? "Disponibles" : "Propias"}</Text>
      
      <View style={styles.filters}>
        {["Pendiente", "Aceptada", "Cancelada", "Completada"].map((estado) => (
          <TouchableOpacity
            key={estado}
            onPress={() => setFiltro(estado as any)}
            style={[styles.filterBtn, filtro === estado && styles.filterActive]}
          >
            <Text style={[styles.filterText, filtro === estado && styles.filterTextActive]}>
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const { canAccept, message } = canAcceptSolicitud(item);
          const isOwnSolicitud = item.clientId === user?.uid;
          
          return (
            <View style={styles.card}>
              <Text style={styles.address}>📍 {item.address}</Text>
              <Text style={styles.info}>💰 Total: ${item.total}</Text>
              <Text style={styles.info}>📅 Días: {item.dates?.join(", ") || "No especificado"}</Text>
              <Text style={styles.info}>⏰ Hora: {item.hour}</Text>
              
              {item.clientEmail && (
                <Text style={styles.info}>👤 Cliente: {item.clientEmail}</Text>
              )}
              
              {item.professionalEmail && (
                <Text style={styles.info}>👷 Profesional: {item.professionalEmail}</Text>
              )}
              
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                Estado: {item.status}
              </Text>
              
              {item.tasks && item.tasks.length > 0 && renderTasks(item.tasks)}
              
              {item.status === "Pendiente" && (
                <View style={styles.actions}>
                  {canAccept ? (
                    <>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(item.id)}
                      >
                        <Text style={styles.btnText}>✅ Aceptar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(item.id)}
                      >
                        <Text style={styles.btnText}>❌ Rechazar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.notAvailableText}>
                      {isOwnSolicitud
                        ? "🛑 Tu propia solicitud"
                        : `⏳ ${message}`}
                    </Text>
                  )}
                </View>
              )}
              
              {item.status === "Aceptada" && item.location && (
                <TouchableOpacity
                  style={styles.locationBtn}
                  onPress={() => viewLocation(item)}
                >
                  <Text style={styles.btnText}>🗺️ Ver Ubicación</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {filtro === "Pendiente"
                ? "No hay solicitudes disponibles"
                : `No tienes solicitudes ${filtro.toLowerCase()}`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pendiente": return "#F59E0B";
    case "Aceptada": return "#10B981";
    case "Cancelada": return "#EF4444";
    case "Completada": return "#6366F1";
    default: return "#6B7280";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },
  center: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5, color: "#1E3A8A" },
  filters: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-around",
    flexWrap: "wrap"
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    margin: 4
  },
  filterActive: { backgroundColor: "#1E3A8A" },
  filterText: { color: "#1E3A8A", fontSize: 12 },
  filterTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  address: { fontWeight: "bold", marginBottom: 8, fontSize: 16, color: "#1E3A8A" },
  info: { fontSize: 14, marginBottom: 4, color: "#374151" },
  status: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  tasksContainer: { marginTop: 10, padding: 10, backgroundColor: "#F3F4F6", borderRadius: 8 },
  tasksTitle: { fontWeight: "bold", marginBottom: 5, color: "#1E3A8A" },
  taskItem: { marginLeft: 10 },
  taskText: { fontSize: 13, color: "#374151" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  acceptBtn: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center"
  },
  rejectBtn: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center"
  },
  locationBtn: {
    backgroundColor: "#6366F1",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center"
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  notAvailableText: {
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10
  },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 16 }
});
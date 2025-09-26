// utils/registerPushToken.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("No se concedió permiso para notificaciones.");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("📲 Token generado:", token);

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Guardar token en Firestore
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { expoPushToken: token }, { merge: true });
  } else {
    alert("Debes usar un dispositivo físico para recibir notificaciones.");
  }

  return token;
}

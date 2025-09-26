// 8. config/firebaseConfig.ts (Actualizado)
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD5xAZUCaMMe5RDlzjBeh_kcvTX0QUzcS4",
  authDomain: "quik-fix-efe15.firebaseapp.com",
  projectId: "quik-fix-efe15",
  storageBucket: "quik-fix-efe15.firebasestorage.app",
  messagingSenderId: "641565503978",
  appId: "1:641565503978:web:1148ed4a5b2a655975c293",
  measurementId: "G-LZ73216BSG"
};

const app = initializeApp(firebaseConfig);

// Configuración de Auth con persistencia
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const database = getDatabase(app);
export default app;
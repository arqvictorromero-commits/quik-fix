// 2. context/AppContext.tsx (Actualizado)
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { db } from "../config/firebaseConfig";
import { ref, push } from "firebase/database";

type Task = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Request = {
  id: string;
  tasks: Task[];
  total: number;
  budget: number;
  dates: string[];
  hour: string;
  status: "Pendiente" | "Aceptada" | "Finalizada" | "Cancelada";
};

type AppContextType = {
  tasks: Task[];
  budget: number;
  setBudget: (budget: number) => void;
  addTask: (task: Task) => void;
  updateTaskQty: (id: string, qty: number) => void;
  getTotal: () => number;
  requests: Request[];
  addRequest: (r: Request) => void;
};

export const AppContext = createContext<AppContextType>({
  tasks: [],
  budget: 0,
  setBudget: () => {},
  addTask: () => {},
  updateTaskQty: () => {},
  getTotal: () => 0,
  requests: [],
  addRequest: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [requests, setRequests] = useState<Request[]>([]);

  const addRequest = (r: Request) => {
    setRequests((prev) => [...prev, r]);
    try {
      push(ref(db, "requests"), r);
      console.log("Solicitud enviada a Firebase:", r);
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const stored = await AsyncStorage.getItem("requests");
        if (stored) setRequests(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading requests:", error);
      }
    };
    loadRequests();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("requests", JSON.stringify(requests)).catch((error) =>
      console.error("Error saving requests:", error)
    );
  }, [requests]);

  const addTask = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) =>
          t.id === task.id ? { ...t, qty: t.qty + 1 } : t
        );
      }
      return [...prev, task];
    });
  };

  const updateTaskQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, qty } : t))
      );
    }
  };

  const getTotal = () =>
    tasks.reduce((sum, t) => sum + t.price * t.qty, 0);

  return (
    <AppContext.Provider
      value={{ 
        tasks, 
        budget, 
        setBudget, 
        addTask, 
        updateTaskQty, 
        getTotal, 
        requests, 
        addRequest 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
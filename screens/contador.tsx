// screens/contador.tsx
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

export default function Contador({ hora }: { hora: string }) {
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);

  useEffect(() => {
    const calcular = () => {
      const ahora = new Date();
      const [hh, mm] = hora.split(":");
      const objetivo = new Date();
      objetivo.setHours(parseInt(hh));
      objetivo.setMinutes(parseInt(mm));
      objetivo.setSeconds(0);

      const diferencia = objetivo.getTime() - ahora.getTime();
      const minutos = Math.floor(diferencia / 60000);
      setMinutosRestantes(minutos);
    };

    calcular();
    const intervalo = setInterval(calcular, 60000); // actualiza cada minuto
    return () => clearInterval(intervalo);
  }, [hora]);

  if (minutosRestantes === null || minutosRestantes > 40) return null;

  return (
    <Text style={{ marginTop: 10, color: minutosRestantes <= 10 ? "red" : "orange" }}>
      ⏱️ Faltan {minutosRestantes} minutos para iniciar
    </Text>
  );
}

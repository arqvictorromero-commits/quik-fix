// hooks/useSolicitud.ts
import { useState } from "react";
import { crearSolicitudCliente, cancelarSolicitudCliente } from "../services/clientService";
import { aceptarSolicitud } from "../services/professionalService";

export const useSolicitud = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearSolicitud = async (payload: Parameters<typeof crearSolicitudCliente>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const solicitudId = await crearSolicitudCliente(payload);
      return solicitudId;
    } catch (err: any) {
      setError(err.message || "Error al crear solicitud");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const aceptar = async (params: Parameters<typeof aceptarSolicitud>[0]) => {
    setLoading(true);
    setError(null);
    try {
      await aceptarSolicitud(params);
    } catch (err: any) {
      setError(err.message || "Error al aceptar solicitud");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (clientId: string, solicitudId: string) => {
    setLoading(true);
    setError(null);
    try {
      await cancelarSolicitudCliente(clientId, solicitudId);
    } catch (err: any) {
      setError(err.message || "Error al cancelar solicitud");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    crearSolicitud,
    aceptar,
    cancelar,
    loading,
    error,
  };
};
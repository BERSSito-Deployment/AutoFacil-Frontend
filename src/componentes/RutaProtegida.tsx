// Envuelve rutas privadas: redirige al login si no hay sesion activa.
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";
import { Cargando } from "./Cargando";

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { autenticado, cargando } = useAutenticacion();

  if (cargando) {
    return <Cargando mensaje="Verificando sesion..." />;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

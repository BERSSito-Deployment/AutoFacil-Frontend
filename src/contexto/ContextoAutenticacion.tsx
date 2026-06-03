// Contexto de autenticacion: gestiona el token, el perfil y el ciclo de sesion.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CLAVE_TOKEN } from "../api/cliente";
import { iniciarSesion, obtenerPerfil, registrarUsuario } from "../api/servicios";
import type { DatosRegistro } from "../api/servicios";
import type { Usuario } from "../tipos";

interface ValorContextoAutenticacion {
  usuario: Usuario | null;
  cargando: boolean;
  autenticado: boolean;
  entrar: (usuario: string, password: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  refrescar: () => Promise<void>;
  salir: () => void;
}

const ContextoAutenticacion = createContext<ValorContextoAutenticacion | undefined>(undefined);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar la aplicacion, si hay token se recupera el perfil del usuario.
  useEffect(() => {
    const token = localStorage.getItem(CLAVE_TOKEN);
    if (!token) {
      setCargando(false);
      return;
    }
    obtenerPerfil()
      .then((perfil) => setUsuario(perfil))
      .catch(() => {
        localStorage.removeItem(CLAVE_TOKEN);
      })
      .finally(() => setCargando(false));
  }, []);

  const entrar = useCallback(async (nombreUsuario: string, password: string) => {
    const token = await iniciarSesion(nombreUsuario, password);
    localStorage.setItem(CLAVE_TOKEN, token);
    const perfil = await obtenerPerfil();
    setUsuario(perfil);
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    const token = await registrarUsuario(datos);
    localStorage.setItem(CLAVE_TOKEN, token);
    const perfil = await obtenerPerfil();
    setUsuario(perfil);
  }, []);

  const refrescar = useCallback(async () => {
    const perfil = await obtenerPerfil();
    setUsuario(perfil);
  }, []);

  const salir = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    setUsuario(null);
  }, []);

  const valor = useMemo<ValorContextoAutenticacion>(
    () => ({
      usuario,
      cargando,
      autenticado: usuario !== null,
      entrar,
      registrar,
      refrescar,
      salir,
    }),
    [usuario, cargando, entrar, registrar, refrescar, salir]
  );

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}

// Hook de acceso al contexto de autenticacion.
export function useAutenticacion(): ValorContextoAutenticacion {
  const contexto = useContext(ContextoAutenticacion);
  if (contexto === undefined) {
    throw new Error("useAutenticacion debe usarse dentro de ProveedorAutenticacion.");
  }
  return contexto;
}

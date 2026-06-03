// Instancia central de Axios con la URL base del backend y manejo del token.
import axios from "axios";

const URL_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const CLAVE_TOKEN = "autofacil_token";

export const clienteHttp = axios.create({
  baseURL: URL_BASE,
});

// Interceptor de solicitud: adjunta el token JWT almacenado, si existe.
clienteHttp.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }
  return configuracion;
});

// Interceptor de respuesta: ante un 401 limpia el token y redirige al login.
clienteHttp.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(CLAVE_TOKEN);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Extrae un mensaje de error legible desde la respuesta del backend.
export function mensajeError(error: unknown, porDefecto = "Ocurrio un error inesperado."): string {
  if (axios.isAxiosError(error)) {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string") {
      return detalle;
    }
    if (Array.isArray(detalle) && detalle.length > 0) {
      return detalle.map((item) => item.msg ?? "").join(" ");
    }
  }
  return porDefecto;
}

import { clienteHttp } from "./cliente";
import type {
  ResultadoCalculo,
  Simulacion,
  SimulacionGuardar,
  SimulacionListado,
  ParametrosSimulacion,
  TipoCambio,
  Usuario,
  Vehiculo,
} from "../tipos";

export async function iniciarSesion(correo: string, password: string): Promise<string> {
  const respuesta = await clienteHttp.post<{ access_token: string }>("/auth/login-json", {
    correo,
    password,
  });
  return respuesta.data.access_token;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}

export async function registrarUsuario(datos: DatosRegistro): Promise<string> {
  const respuesta = await clienteHttp.post<{ access_token: string }>("/auth/registro", datos);
  return respuesta.data.access_token;
}

export async function obtenerPerfil(): Promise<Usuario> {
  const respuesta = await clienteHttp.get<Usuario>("/auth/me");
  return respuesta.data;
}

interface DatosPerfil {
  nombre?: string;
  apellido?: string;
  correo?: string;
  password_actual?: string;
  password_nueva?: string;
}

export async function actualizarPerfil(datos: DatosPerfil): Promise<Usuario> {
  const respuesta = await clienteHttp.put<Usuario>("/perfil", datos);
  return respuesta.data;
}

export async function listarVehiculos(busqueda?: string): Promise<Vehiculo[]> {
  const respuesta = await clienteHttp.get<Vehiculo[]>("/vehiculos", {
    params: {
      busqueda: busqueda || undefined,
    },
  });
  return respuesta.data;
}

export async function obtenerVehiculo(id: number): Promise<Vehiculo> {
  const respuesta = await clienteHttp.get<Vehiculo>(`/vehiculos/${id}`);
  return respuesta.data;
}

export async function crearVehiculo(datos: Partial<Vehiculo>): Promise<Vehiculo> {
  const respuesta = await clienteHttp.post<Vehiculo>("/vehiculos", datos);
  return respuesta.data;
}

export async function actualizarVehiculo(id: number, datos: Partial<Vehiculo>): Promise<Vehiculo> {
  const respuesta = await clienteHttp.put<Vehiculo>(`/vehiculos/${id}`, datos);
  return respuesta.data;
}

export async function quitarVehiculo(id: number): Promise<Vehiculo> {
  const respuesta = await clienteHttp.delete<Vehiculo>(`/vehiculos/${id}`);
  return respuesta.data;
}

// --- Simulaciones ---
export async function calcularSimulacion(datos: ParametrosSimulacion): Promise<ResultadoCalculo> {
  const respuesta = await clienteHttp.post<ResultadoCalculo>("/simulaciones/calcular", datos);
  return respuesta.data;
}

export async function guardarSimulacion(datos: SimulacionGuardar): Promise<Simulacion> {
  const respuesta = await clienteHttp.post<Simulacion>("/simulaciones", datos);
  return respuesta.data;
}

export async function listarSimulaciones(filtros?: {
  vehiculo_id?: number;
  busqueda?: string;
}): Promise<SimulacionListado[]> {
  const respuesta = await clienteHttp.get<SimulacionListado[]>("/simulaciones", {
    params: filtros,
  });
  return respuesta.data;
}

export async function obtenerSimulacion(id: number): Promise<Simulacion> {
  const respuesta = await clienteHttp.get<Simulacion>(`/simulaciones/${id}`);
  return respuesta.data;
}

export async function actualizarSimulacion(
  id: number,
  datos: SimulacionGuardar
): Promise<Simulacion> {
  const respuesta = await clienteHttp.put<Simulacion>(`/simulaciones/${id}`, datos);
  return respuesta.data;
}

export async function recalcularSimulacion(id: number): Promise<Simulacion> {
  const respuesta = await clienteHttp.post<Simulacion>(`/simulaciones/${id}/recalcular`);
  return respuesta.data;
}

export async function eliminarSimulacion(id: number): Promise<Simulacion> {
  const respuesta = await clienteHttp.delete<Simulacion>(`/simulaciones/${id}`);
  return respuesta.data;
}

export async function obtenerTipoCambio(
  base = "USD",
  destino = "PEN"
): Promise<TipoCambio> {
  const respuesta = await clienteHttp.get<TipoCambio>("/tipo-cambio", {
    params: { base, destino },
  });
  return respuesta.data;
}

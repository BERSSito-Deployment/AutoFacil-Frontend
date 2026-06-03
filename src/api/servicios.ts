// Funciones de acceso a los endpoints del backend agrupadas por dominio.
import { clienteHttp } from "./cliente";
import type {
  Cliente,
  ResultadoCalculo,
  ResumenDashboard,
  Simulacion,
  SimulacionClienteVista,
  SimulacionGuardar,
  SimulacionListado,
  ParametrosSimulacion,
  TipoCambio,
  Usuario,
  Vehiculo,
  EstadoSimulacion,
} from "../tipos";

// --- Autenticacion ---
export async function iniciarSesion(usuario: string, password: string): Promise<string> {
  const respuesta = await clienteHttp.post<{ access_token: string }>("/auth/login-json", {
    usuario,
    password,
  });
  return respuesta.data.access_token;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
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

export interface DatosPerfil {
  nombre?: string;
  apellido?: string;
  correo?: string;
  usuario?: string;
  password_actual?: string;
  password_nueva?: string;
}

export async function actualizarPerfil(datos: DatosPerfil): Promise<Usuario> {
  const respuesta = await clienteHttp.put<Usuario>("/perfil", datos);
  return respuesta.data;
}

// --- Clientes ---
export async function listarClientes(busqueda?: string): Promise<Cliente[]> {
  const respuesta = await clienteHttp.get<Cliente[]>("/clientes", {
    params: { busqueda: busqueda || undefined },
  });
  return respuesta.data;
}

export async function obtenerCliente(id: number): Promise<Cliente> {
  const respuesta = await clienteHttp.get<Cliente>(`/clientes/${id}`);
  return respuesta.data;
}

export async function crearCliente(datos: Partial<Cliente>): Promise<Cliente> {
  const respuesta = await clienteHttp.post<Cliente>("/clientes", datos);
  return respuesta.data;
}

export async function actualizarCliente(id: number, datos: Partial<Cliente>): Promise<Cliente> {
  const respuesta = await clienteHttp.put<Cliente>(`/clientes/${id}`, datos);
  return respuesta.data;
}

export async function desactivarCliente(id: number): Promise<Cliente> {
  const respuesta = await clienteHttp.delete<Cliente>(`/clientes/${id}`);
  return respuesta.data;
}

// --- Vehiculos ---
export async function listarVehiculos(
  busqueda?: string,
  incluirInactivos = false
): Promise<Vehiculo[]> {
  const respuesta = await clienteHttp.get<Vehiculo[]>("/vehiculos", {
    params: {
      busqueda: busqueda || undefined,
      incluir_inactivos: incluirInactivos || undefined,
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

export async function desactivarVehiculo(id: number): Promise<Vehiculo> {
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
  cliente_id?: number;
  vehiculo_id?: number;
  estado?: EstadoSimulacion;
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

export async function cambiarEstadoSimulacion(
  id: number,
  estado: EstadoSimulacion
): Promise<Simulacion> {
  const respuesta = await clienteHttp.post<Simulacion>(`/simulaciones/${id}/estado`, { estado });
  return respuesta.data;
}

// Archivado logico: conserva el registro y su historial, pero la marca como
// ARCHIVADA y deja de ser compartible. No hay borrado definitivo.
export async function archivarSimulacion(id: number): Promise<Simulacion> {
  const respuesta = await clienteHttp.delete<Simulacion>(`/simulaciones/${id}`);
  return respuesta.data;
}

// --- Indicadores ---
export async function obtenerResumen(): Promise<ResumenDashboard> {
  const respuesta = await clienteHttp.get<ResumenDashboard>("/indicadores/resumen");
  return respuesta.data;
}

// --- Tipo de cambio en tiempo real ---
export async function obtenerTipoCambio(
  base = "USD",
  destino = "PEN"
): Promise<TipoCambio> {
  const respuesta = await clienteHttp.get<TipoCambio>("/tipo-cambio", {
    params: { base, destino },
  });
  return respuesta.data;
}

// --- Vista publica del cliente (no requiere autenticacion) ---
export async function obtenerSimulacionCompartida(
  token: string
): Promise<SimulacionClienteVista> {
  const respuesta = await clienteHttp.get<SimulacionClienteVista>(
    `/publico/simulaciones/${token}`
  );
  return respuesta.data;
}

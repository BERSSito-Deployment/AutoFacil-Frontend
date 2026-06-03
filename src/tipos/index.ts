// Tipos compartidos que reflejan los esquemas y enumeraciones del backend.
// Las tasas y porcentajes viajan en formato decimal (0.18 = 18%).

export type Moneda = "PEN" | "USD";
export type TipoTasa = "EFECTIVA" | "NOMINAL";
export type Capitalizacion =
  | "DIARIA"
  | "MENSUAL"
  | "BIMESTRAL"
  | "TRIMESTRAL"
  | "CUATRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL";
export type TipoGracia = "NINGUNA" | "TOTAL" | "PARCIAL";
export type EstadoSimulacion = "CALCULADA" | "ARCHIVADA";
export type TipoPeriodo =
  | "GRACIA_TOTAL"
  | "GRACIA_PARCIAL"
  | "CUOTA_ORDINARIA"
  | "CUOTA_FINAL";

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Cliente {
  id: number;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  ingreso_mensual: number;
  gastos_mensuales: number;
  otras_deudas: number;
  moneda_ingresos: Moneda;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  version?: string | null;
  anio: number;
  tipo?: string | null;
  precio: number;
  moneda: Moneda;
  descripcion?: string | null;
  url_imagen?: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface TipoCambio {
  base: string;
  destino: string;
  tasa: number;
  fuente: string;
  en_linea: boolean;
}

export interface FilaCronograma {
  numero_periodo: number;
  fecha_pago: string;
  tipo_periodo: TipoPeriodo;
  saldo_inicial: number;
  interes: number;
  amortizacion: number;
  seguro_desgravamen: number;
  seguro_vehicular: number;
  gps_mantenimiento: number;
  cuota_ordinaria: number;
  cuota_final_extraordinaria: number;
  cuota_total: number;
  saldo_final: number;
}

export interface Indicadores {
  moneda: Moneda;
  precio_vehiculo: number;
  cuota_inicial: number;
  porcentaje_cuota_inicial: number;
  cuota_final: number;
  monto_financiado: number;
  plazo_meses: number;
  tipo_tasa: TipoTasa;
  tasa_ingresada: number;
  capitalizacion?: Capitalizacion | null;
  tea_equivalente: number;
  tem: number;
  tipo_gracia: TipoGracia;
  meses_gracia: number;
  cuota_mensual: number;
  cuota_total_promedio: number;
  total_intereses: number;
  total_amortizado: number;
  total_seguros: number;
  total_gastos_iniciales: number;
  total_cargos_desembolso: number;
  total_gps_mantenimiento: number;
  costo_total_credito: number;
  monto_total_pagado: number;
  cok_anual: number;
  cok_mensual: number;
  tasa_descuento_van: number;
  van: number;
  tir_mensual: number | null;
  tir_anual: number | null;
  tcea: number | null;
}

export interface ResultadoCalculo extends Indicadores {
  cronograma: FilaCronograma[];
}

export interface ParametrosSimulacion {
  cliente_id: number;
  vehiculo_id: number;
  nombre?: string | null;
  moneda: Moneda;
  tipo_cambio_referencial?: number | null;
  tipo_tasa: TipoTasa;
  valor_tasa: number;
  capitalizacion?: Capitalizacion | null;
  plazo_meses: number;
  porcentaje_cuota_inicial: number;
  porcentaje_cuota_final: number;
  tipo_gracia: TipoGracia;
  meses_gracia: number;
  seguro_desgravamen_anual: number;
  desgravamen_consentido: boolean;
  seguro_vehicular_mensual: number;
  gps_instalacion: number;
  gps_mantenimiento_mensual: number;
  gps_reposicion: number;
  gastos_notariales: number;
  gastos_registrales: number;
  tasacion: number;
  cok_anual: number;
  tasa_descuento_van?: number | null;
  tasa_moratoria_anual: number;
  aseguradora?: string | null;
  numero_poliza?: string | null;
  coberturas?: string | null;
  fecha_inicio?: string | null;
}

export interface SimulacionGuardar extends ParametrosSimulacion {
  estado?: EstadoSimulacion;
  // Al editar: actualizar al precio actual del vehiculo (por defecto conserva el original).
  actualizar_precio?: boolean;
}

export interface Simulacion extends Indicadores {
  id: number;
  codigo: string;
  nombre?: string | null;
  cliente_id: number;
  vehiculo_id: number;
  usuario_id: number;
  estado: EstadoSimulacion;
  tipo_cambio_referencial?: number | null;
  fecha_inicio: string;
  porcentaje_cuota_final: number;
  seguro_desgravamen_anual: number;
  desgravamen_consentido: boolean;
  seguro_vehicular_mensual: number;
  gps_instalacion: number;
  gps_mantenimiento_mensual: number;
  gps_reposicion: number;
  gastos_notariales: number;
  gastos_registrales: number;
  tasacion: number;
  gastos_iniciales: number;
  tasa_moratoria_anual: number;
  aseguradora?: string | null;
  numero_poliza?: string | null;
  coberturas?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  cliente_nombre?: string | null;
  vehiculo_descripcion?: string | null;
  usuario_nombre?: string | null;
  token_compartir?: string | null;
  cronograma: FilaCronograma[];
}

export interface SimulacionClienteVista {
  codigo: string;
  nombre?: string | null;
  estado: EstadoSimulacion;
  moneda: Moneda;
  cliente_nombre?: string | null;
  vehiculo_descripcion?: string | null;
  fecha_inicio: string;
  precio_vehiculo: number;
  cuota_inicial: number;
  cuota_final: number;
  monto_financiado: number;
  plazo_meses: number;
  tea_equivalente: number;
  tem: number;
  cuota_mensual: number;
  cuota_total_promedio: number;
  tcea: number | null;
  tasa_moratoria_anual: number;
  costo_total_credito: number;
  total_intereses: number;
  total_seguros: number;
  total_gastos_iniciales: number;
  total_cargos_desembolso: number;
  total_gps_mantenimiento: number;
  monto_total_pagado: number;
  seguro_desgravamen_anual: number;
  desgravamen_consentido: boolean;
  seguro_vehicular_mensual: number;
  gps_instalacion: number;
  gps_mantenimiento_mensual: number;
  gps_reposicion: number;
  gastos_notariales: number;
  gastos_registrales: number;
  tasacion: number;
  aseguradora?: string | null;
  numero_poliza?: string | null;
  coberturas?: string | null;
  cronograma: FilaCronograma[];
}

export interface SimulacionListado {
  id: number;
  codigo: string;
  nombre?: string | null;
  estado: EstadoSimulacion;
  moneda: Moneda;
  cliente_id: number;
  vehiculo_id: number;
  cliente_nombre?: string | null;
  vehiculo_descripcion?: string | null;
  monto_financiado: number;
  plazo_meses: number;
  cuota_mensual: number;
  tcea: number | null;
  fecha_creacion: string;
}

export interface TotalPorMoneda {
  moneda: Moneda;
  monto_total_financiado: number;
  cantidad: number;
}

export interface ResumenDashboard {
  total_clientes: number;
  total_vehiculos: number;
  total_simulaciones: number;
  promedio_tcea: number | null;
  montos_por_moneda: TotalPorMoneda[];
  simulaciones_recientes: SimulacionListado[];
}

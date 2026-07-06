export type Moneda = "PEN" | "USD";
export type TipoTasa = "EFECTIVA" | "NOMINAL";
export type Capitalizacion =
  | "DIARIA"
  | "QUINCENAL"
  | "MENSUAL"
  | "BIMESTRAL"
  | "TRIMESTRAL"
  | "CUATRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL";
export type Plan = "PLAN_24" | "PLAN_36" | "PERSONALIZADO";
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
  // cuota final
  saldo_inicial_cuota_final: number;
  interes_cuota_final: number;
  amortizacion_cuota_final: number;
  desgravamen_cuota_final: number;
  saldo_final_cuota_final: number;
  // cuota regular
  saldo_inicial: number;
  interes: number;
  cuota: number;
  amortizacion: number;
  seguro_desgravamen: number;
  seguro_riesgo: number;
  gps: number;
  portes: number;
  gastos_adm: number;
  saldo_final: number;
  flujo: number;
}

export interface Indicadores {
  moneda: Moneda;
  precio_vehiculo: number;
  plan: Plan;
  numero_cuotas: number;
  dias_anio: number;
  porcentaje_cuota_inicial: number;
  cuota_inicial: number;
  porcentaje_cuota_final: number;
  cuota_final: number;
  monto_prestamo: number;
  saldo_financiado: number;
  tipo_tasa: TipoTasa;
  tasa_ingresada: number;
  capitalizacion?: Capitalizacion | null;
  tea_equivalente: number;
  tem: number;
  meses_gracia_total: number;
  meses_gracia_parcial: number;
  seguro_desgravamen_mensual: number;
  seguro_riesgo_anual: number;
  seguro_riesgo_periodico: number;
  gps_periodico: number;
  portes_periodico: number;
  gastos_adm_periodico: number;
  total_costos_financiados: number;
  total_costos_efectivo: number;
  cuota_mensual: number;
  cok_anual: number;
  cok_mensual: number;
  van: number;
  tir_mensual: number | null;
  tcea: number | null;
  total_intereses: number;
  total_amortizado: number;
  total_seguro_desgravamen: number;
  total_seguro_riesgo: number;
  total_gps: number;
  total_portes: number;
  total_gastos_adm: number;
  monto_total_pagado: number;
}

export interface ResultadoCalculo extends Indicadores {
  cronograma: FilaCronograma[];
}

export interface ParametrosSimulacion {
  vehiculo_id: number;
  nombre?: string | null;
  moneda: Moneda;
  tipo_cambio_referencial?: number | null;
  plan: Plan;
  // meses del credito cuando el plan es personalizado
  numero_cuotas?: number | null;
  dias_anio: number;
  porcentaje_cuota_inicial: number;
  porcentaje_cuota_final: number;
  tipo_tasa: TipoTasa;
  valor_tasa: number;
  capitalizacion?: Capitalizacion | null;
  meses_gracia_total: number;
  meses_gracia_parcial: number;
  costo_notarial: number;
  costo_notarial_financiado: boolean;
  costo_registral: number;
  costo_registral_financiado: boolean;
  costo_tasacion: number;
  costo_tasacion_financiado: boolean;
  comision_estudio: number;
  comision_estudio_financiado: boolean;
  comision_activacion: number;
  comision_activacion_financiado: boolean;
  gps_periodico: number;
  portes_periodico: number;
  gastos_adm_periodico: number;
  seguro_desgravamen_mensual: number;
  seguro_riesgo_anual: number;
  cok_anual: number;
  fecha_inicio?: string | null;
}

export interface SimulacionGuardar extends ParametrosSimulacion {
  // al editar se puede actualizar al precio actual del vehiculo si es que se ha cambiado
  actualizar_precio?: boolean;
}

export interface Simulacion extends Indicadores {
  id: number;
  codigo: string;
  nombre?: string | null;
  vehiculo_id: number;
  usuario_id: number;
  tipo_cambio_referencial?: number | null;
  fecha_inicio: string;
  // costos extra
  costo_notarial: number;
  costo_notarial_financiado: boolean;
  costo_registral: number;
  costo_registral_financiado: boolean;
  costo_tasacion: number;
  costo_tasacion_financiado: boolean;
  comision_estudio: number;
  comision_estudio_financiado: boolean;
  comision_activacion: number;
  comision_activacion_financiado: boolean;
  vehiculo_descripcion?: string | null;
  usuario_nombre?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  cronograma: FilaCronograma[];
}

export interface SimulacionListado {
  id: number;
  codigo: string;
  nombre?: string | null;
  moneda: Moneda;
  plan: Plan;
  vehiculo_id: number;
  vehiculo_descripcion?: string | null;
  monto_prestamo: number;
  numero_cuotas: number;
  cuota_mensual: number;
  // cuota + seguros y cargos del mes
  pago_mensual: number;
  tcea: number | null;
  fecha_creacion: string;
}

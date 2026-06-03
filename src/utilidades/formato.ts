// Funciones de formato de presentacion: moneda, porcentaje y fechas.
import type { Moneda } from "../tipos";

const SIMBOLO_MONEDA: Record<Moneda, string> = {
  PEN: "S/",
  USD: "US$",
};

// Formatea un importe monetario con dos decimales y el simbolo correspondiente.
export function formatoMoneda(valor: number | null | undefined, moneda: Moneda = "PEN"): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    return "-";
  }
  const numero = valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${SIMBOLO_MONEDA[moneda]} ${numero}`;
}

// Convierte una tasa en formato decimal a porcentaje con los decimales indicados.
export function formatoPorcentaje(
  valorDecimal: number | null | undefined,
  decimales = 4
): string {
  if (valorDecimal === null || valorDecimal === undefined || Number.isNaN(valorDecimal)) {
    return "-";
  }
  const porcentaje = valorDecimal * 100;
  return `${porcentaje.toLocaleString("es-PE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })} %`;
}

// Formatea una fecha ISO (AAAA-MM-DD) al formato dia/mes/anio.
export function formatoFecha(iso: string | null | undefined): string {
  if (!iso) {
    return "-";
  }
  const soloFecha = iso.split("T")[0];
  const partes = soloFecha.split("-");
  if (partes.length !== 3) {
    return iso;
  }
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

// Convierte un porcentaje ingresado por el usuario (18.5) a formato decimal (0.185).
export function porcentajeADecimal(porcentaje: number): number {
  return porcentaje / 100;
}

// Convierte un valor decimal del backend (0.185) a porcentaje para mostrar/editar (18.5).
export function decimalAPorcentaje(valorDecimal: number): number {
  // Se redondea a 6 decimales para evitar ruido de punto flotante en el formulario.
  return Math.round(valorDecimal * 100 * 1e6) / 1e6;
}

export const ETIQUETA_MONEDA: Record<Moneda, string> = {
  PEN: "Soles (PEN)",
  USD: "Dólares (USD)",
};

// Etiqueta amigable de una simulacion ("Simulación 1") a partir de su id o codigo.
export function etiquetaSimulacion(idOCodigo: number | string): string {
  if (typeof idOCodigo === "number") {
    return `Simulación ${idOCodigo}`;
  }
  const numero = idOCodigo.replace(/\D/g, "").replace(/^0+/, "");
  return `Simulación ${numero || idOCodigo}`;
}

// Fuente de imagen del vehiculo: la URL propia si la tiene; si no, una foto
// estable por marca (servicio publico LoremFlickr). El "lock" fija la misma
// imagen para un mismo vehiculo (no cambia entre recargas).
export function imagenVehiculo(vehiculo: {
  url_imagen?: string | null;
  marca: string;
  id?: number;
}): string {
  const propia = vehiculo.url_imagen?.trim();
  if (propia) {
    return propia;
  }
  const marca = vehiculo.marca.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const lock = vehiculo.id && vehiculo.id > 0 ? vehiculo.id : 1;
  return `https://loremflickr.com/640/400/${marca || "auto"},car/all?lock=${lock}`;
}

export const ETIQUETA_ESTADO: Record<string, string> = {
  CALCULADA: "Calculada",
  ARCHIVADA: "Archivada",
};

export const CLASE_ESTADO: Record<string, string> = {
  CALCULADA: "bg-marca-100 text-marca-800",
  ARCHIVADA: "bg-slate-100 text-slate-600",
};

export const ETIQUETA_TIPO_PERIODO: Record<string, string> = {
  GRACIA_TOTAL: "Gracia total",
  GRACIA_PARCIAL: "Gracia parcial",
  CUOTA_ORDINARIA: "Cuota ordinaria",
  CUOTA_FINAL: "Cuota con balón",
};

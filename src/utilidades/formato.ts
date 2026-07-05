import type { Moneda } from "../tipos";

const SIMBOLO_MONEDA: Record<Moneda, string> = {
  PEN: "S/",
  USD: "US$",
};

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

export function porcentajeADecimal(porcentaje: number): number {
  return porcentaje / 100;
}

export function decimalAPorcentaje(valorDecimal: number): number {
  return Math.round(valorDecimal * 100 * 1e6) / 1e6;
}

export const ETIQUETA_MONEDA: Record<Moneda, string> = {
  PEN: "Soles (PEN)",
  USD: "Dólares (USD)",
};

export const ETIQUETA_CAPITALIZACION: Record<string, string> = {
  DIARIA: "Diaria",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
  BIMESTRAL: "Bimestral",
  TRIMESTRAL: "Trimestral",
  CUATRIMESTRAL: "Cuatrimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

export function etiquetaSimulacion(idOCodigo: number | string): string {
  if (typeof idOCodigo === "number") {
    return `Simulación ${idOCodigo}`;
  }
  const numero = idOCodigo.replace(/\D/g, "").replace(/^0+/, "");
  return `Simulación ${numero || idOCodigo}`;
}

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


// Exportacion del cronograma de pagos a un archivo CSV descargable.
import type { FilaCronograma } from "../tipos";
import { ETIQUETA_TIPO_PERIODO, formatoFecha } from "./formato";

// Genera y descarga un CSV del cronograma. Usa ";" como separador (compatible
// con Excel en configuracion regional de Peru) y "." como separador decimal.
export function descargarCronogramaCsv(
  cronograma: FilaCronograma[],
  codigo: string
): void {
  const encabezados = [
    "N",
    "Fecha",
    "Tipo",
    "Saldo inicial",
    "Interes",
    "Amortizacion",
    "Seguro desgravamen",
    "Seguro vehicular",
    "GPS mantenimiento",
    "Cuota ordinaria",
    "Cuota balon",
    "Cuota total",
    "Saldo final",
  ];

  const num = (valor: number) => valor.toFixed(2);

  const filas = cronograma.map((fila) =>
    [
      fila.numero_periodo,
      formatoFecha(fila.fecha_pago),
      ETIQUETA_TIPO_PERIODO[fila.tipo_periodo],
      num(fila.saldo_inicial),
      num(fila.interes),
      num(fila.amortizacion),
      num(fila.seguro_desgravamen),
      num(fila.seguro_vehicular),
      num(fila.gps_mantenimiento),
      num(fila.cuota_ordinaria),
      num(fila.cuota_final_extraordinaria),
      num(fila.cuota_total),
      num(fila.saldo_final),
    ].join(";")
  );

  const contenido = [encabezados.join(";"), ...filas].join("\r\n");
  // BOM para que Excel reconozca los acentos en UTF-8.
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `cronograma-${codigo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

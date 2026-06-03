// Muestra los indicadores financieros, el resumen de costos y el cronograma.
import type { FilaCronograma, Indicadores, Moneda } from "../tipos";
import {
  ETIQUETA_TIPO_PERIODO,
  formatoFecha,
  formatoMoneda,
  formatoPorcentaje,
} from "../utilidades/formato";
import { descargarCronogramaCsv } from "../utilidades/exportar";
import { AyudaTooltip } from "./AyudaTooltip";

interface PropiedadesResultados {
  indicadores: Indicadores;
  cronograma: FilaCronograma[];
  codigo?: string;
  // Tipo de cambio referencial para mostrar el equivalente en Soles (creditos en USD).
  tipoCambio?: number;
}

const ESTILO_PERIODO: Record<string, string> = {
  GRACIA_TOTAL: "bg-amber-100 text-amber-700",
  GRACIA_PARCIAL: "bg-amber-100 text-amber-700",
  CUOTA_ORDINARIA: "bg-slate-100 text-slate-600",
  CUOTA_FINAL: "bg-marca-100 text-marca-700",
};

function Indicador({
  titulo,
  valor,
  ayuda,
}: {
  titulo: string;
  valor: string;
  ayuda?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {titulo}
        {ayuda && <AyudaTooltip termino={ayuda} />}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{valor}</p>
    </div>
  );
}

export function ResultadosSimulacion({
  indicadores,
  cronograma,
  codigo,
  tipoCambio,
}: PropiedadesResultados) {
  const moneda: Moneda = indicadores.moneda;

  const equivalente = (valorUsd: number): string | null =>
    moneda === "USD" && tipoCambio
      ? `≈ ${formatoMoneda(valorUsd * tipoCambio, "PEN")}`
      : null;

  // Costo financiero adicional = todo lo que paga por encima del valor del
  // vehiculo: intereses, seguros, mantenimiento de GPS (en la cuota), los gastos
  // financiados y la instalacion de GPS cobrada al desembolso. Todo entra en la TCEA.
  const costoFinanciero =
    indicadores.total_intereses +
    indicadores.total_seguros +
    indicadores.total_gps_mantenimiento +
    indicadores.total_cargos_desembolso +
    indicadores.total_gastos_iniciales;

  const totales = cronograma.reduce(
    (acumulado, fila) => ({
      interes: acumulado.interes + fila.interes,
      amortizacion: acumulado.amortizacion + fila.amortizacion,
      seguros:
        acumulado.seguros + fila.seguro_desgravamen + fila.seguro_vehicular,
      cargos: acumulado.cargos + fila.gps_mantenimiento,
      cuota: acumulado.cuota + fila.cuota_total,
    }),
    { interes: 0, amortizacion: 0, seguros: 0, cargos: 0, cuota: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Hero: los indicadores mas importantes para el cliente. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border-l-4 border-marca-600 bg-marca-50/50 p-5 shadow-suave">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Cuota mensual <AyudaTooltip termino="Sistema frances" />
          </p>
          <p className="mt-1 text-3xl font-bold text-marca-700">
            {formatoMoneda(indicadores.cuota_mensual, moneda)}
          </p>
          {equivalente(indicadores.cuota_mensual) && (
            <p className="text-xs text-slate-400">{equivalente(indicadores.cuota_mensual)}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Cuota mensual con seguros y cargos:{" "}
            {formatoMoneda(indicadores.cuota_total_promedio, moneda)}
            {indicadores.cuota_final > 0 && " (la cuota balón se paga al final)"}
          </p>
        </div>
        <div className="rounded-lg border-l-4 border-slate-400 bg-white p-5 shadow-suave">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Total pagado por el crédito <AyudaTooltip termino="Costo total del credito" />
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {formatoMoneda(indicadores.costo_total_credito, moneda)}
          </p>
          {equivalente(indicadores.costo_total_credito) && (
            <p className="text-xs text-slate-400">{equivalente(indicadores.costo_total_credito)}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Capital + intereses + seguros + cargos</p>
        </div>
        <div className="rounded-lg border-l-4 border-acento-600 bg-white p-5 shadow-suave">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            TCEA <AyudaTooltip termino="TCEA" />
          </p>
          <p className="mt-1 text-3xl font-bold text-acento-700">
            {formatoPorcentaje(indicadores.tcea)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Costo anual total. TEA: {formatoPorcentaje(indicadores.tea_equivalente)}
          </p>
        </div>
      </div>

      {/* Resumen de costos. */}
      <div className="tarjeta p-5">
        <h3 className="text-sm font-bold text-slate-800">Resumen de costos</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Desglose con etiquetas claras de lo que financia y paga el cliente.
        </p>
        <dl className="mt-4 divide-y divide-slate-100">
            <FilaCosto etiqueta="Precio del vehículo" valor={formatoMoneda(indicadores.precio_vehiculo, moneda)} />
            <FilaCosto etiqueta="Cuota inicial" valor={formatoMoneda(indicadores.cuota_inicial, moneda)} ayuda="Cuota inicial" />
            {indicadores.cuota_final > 0 && (
              <FilaCosto etiqueta="Cuota balón (pago final)" valor={formatoMoneda(indicadores.cuota_final, moneda)} ayuda="Cuota balon" />
            )}
            <FilaCosto etiqueta="Gastos iniciales financiados" valor={formatoMoneda(indicadores.total_gastos_iniciales, moneda)} />
            <FilaCosto etiqueta="Monto financiado (incluye gastos iniciales)" valor={formatoMoneda(indicadores.monto_financiado, moneda)} ayuda="Monto financiado" resaltar />
            <FilaCosto etiqueta="Intereses totales" valor={formatoMoneda(indicadores.total_intereses, moneda)} />
            <FilaCosto etiqueta="Seguros totales" valor={formatoMoneda(indicadores.total_seguros, moneda)} />
            <FilaCosto etiqueta="GPS instalación (al desembolso)" valor={formatoMoneda(indicadores.total_cargos_desembolso, moneda)} ayuda="GPS" />
            <FilaCosto etiqueta="GPS mantenimiento (en las cuotas)" valor={formatoMoneda(indicadores.total_gps_mantenimiento, moneda)} />
            <FilaCosto etiqueta="Costo financiero adicional" valor={formatoMoneda(costoFinanciero, moneda)} />
            <div className="flex items-center justify-between py-2.5 text-sm">
              <dt className="flex items-center gap-1 font-semibold text-slate-800">
                Total pagado por el crédito <AyudaTooltip termino="Costo total del credito" />
              </dt>
              <dd className="text-right">
                <span className="text-base font-bold text-marca-700">
                  {formatoMoneda(indicadores.costo_total_credito, moneda)}
                </span>
                {equivalente(indicadores.costo_total_credito) && (
                  <span className="block text-xs font-normal text-slate-400">
                    {equivalente(indicadores.costo_total_credito)}
                  </span>
                )}
              </dd>
            </div>
            <FilaCosto
              etiqueta="Total desembolsado (incluye cuota inicial)"
              valor={formatoMoneda(indicadores.monto_total_pagado, moneda)}
            />
          </dl>
      </div>

      {/* Indicadores complementarios. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador titulo="Cuota inicial" valor={formatoMoneda(indicadores.cuota_inicial, moneda)} ayuda="Cuota inicial" />
        <Indicador titulo="TEM (mensual)" valor={formatoPorcentaje(indicadores.tem)} ayuda="TEM" />
        <Indicador titulo="COK anual" valor={formatoPorcentaje(indicadores.cok_anual)} ayuda="COK" />
        <Indicador
          titulo="Tasa descuento VAN"
          valor={formatoPorcentaje(indicadores.tasa_descuento_van)}
          ayuda="VAN"
        />
        <Indicador titulo="VAN" valor={formatoMoneda(indicadores.van, moneda)} ayuda="VAN" />
        <Indicador titulo="TIR mensual" valor={formatoPorcentaje(indicadores.tir_mensual)} ayuda="TIR" />
        <Indicador titulo="TIR anual" valor={formatoPorcentaje(indicadores.tir_anual)} ayuda="TIR" />
        <Indicador
          titulo="Cuota balón (final)"
          valor={formatoMoneda(indicadores.cuota_final, moneda)}
          ayuda="Cuota balon"
        />
      </div>

      {/* Cronograma de pagos. */}
      <div className="tarjeta overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cronograma de pagos</h3>
            <p className="text-xs text-slate-500">
              Método francés vencido, con meses comerciales de 30 días. La cuota del mes incluye
              interés, amortización, seguros y cargos; la última incluye la cuota balón.
            </p>
          </div>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => descargarCronogramaCsv(cronograma, codigo ?? "simulacion")}
          >
            Descargar detalle (CSV)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-5 py-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Período de gracia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-marca-100 ring-1 ring-marca-200" /> Cuota con balón final
          </span>
        </div>

        <div className="max-h-[28rem] overflow-auto">
          <table className="tabla-base tabular-nums">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="text-right">N°</th>
                <th>Vencimiento</th>
                <th>Concepto</th>
                <th className="text-right">Saldo inicial</th>
                <th className="text-right">Interés</th>
                <th className="text-right">Amortización</th>
                <th className="text-right">Seguros</th>
                <th className="text-right">Cargos</th>
                <th className="text-right">Cuota del mes</th>
                <th className="text-right">Saldo final</th>
              </tr>
            </thead>
            <tbody>
              {cronograma.map((fila, indice) => {
                const seguros = fila.seguro_desgravamen + fila.seguro_vehicular;
                const cargos = fila.gps_mantenimiento;
                const claseFila = fila.tipo_periodo === "CUOTA_FINAL"
                  ? "bg-marca-50"
                  : fila.tipo_periodo.startsWith("GRACIA")
                    ? "bg-amber-50"
                    : indice % 2 === 1
                      ? "bg-slate-50/60"
                      : "";
                return (
                  <tr key={fila.numero_periodo} className={claseFila}>
                    <td className="text-right text-slate-500">{fila.numero_periodo}</td>
                    <td className="whitespace-nowrap">{formatoFecha(fila.fecha_pago)}</td>
                    <td>
                      <span className={`insignia ${ESTILO_PERIODO[fila.tipo_periodo] ?? ""}`}>
                        {ETIQUETA_TIPO_PERIODO[fila.tipo_periodo]}
                      </span>
                    </td>
                    <td className="text-right text-slate-500">
                      {formatoMoneda(fila.saldo_inicial, moneda)}
                    </td>
                    <td className="text-right">{formatoMoneda(fila.interes, moneda)}</td>
                    <td className="text-right">{formatoMoneda(fila.amortizacion, moneda)}</td>
                    <td className="text-right text-slate-500">
                      {seguros > 0 ? formatoMoneda(seguros, moneda) : "-"}
                    </td>
                    <td className="text-right text-slate-500">
                      {cargos > 0 ? formatoMoneda(cargos, moneda) : "-"}
                    </td>
                    <td className="text-right font-semibold text-slate-900">
                      {formatoMoneda(fila.cuota_total, moneda)}
                    </td>
                    <td className="text-right text-slate-500">
                      {formatoMoneda(fila.saldo_final, moneda)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0">
              <tr className="bg-slate-100 font-semibold text-slate-700">
                <td colSpan={4} className="text-right">
                  Totales
                </td>
                <td className="text-right">{formatoMoneda(totales.interes, moneda)}</td>
                <td className="text-right">{formatoMoneda(totales.amortizacion, moneda)}</td>
                <td className="text-right">{formatoMoneda(totales.seguros, moneda)}</td>
                <td className="text-right">{formatoMoneda(totales.cargos, moneda)}</td>
                <td className="text-right text-marca-700">{formatoMoneda(totales.cuota, moneda)}</td>
                <td className="text-right">{formatoMoneda(0, moneda)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilaCosto({
  etiqueta,
  valor,
  ayuda,
  resaltar = false,
}: {
  etiqueta: string;
  valor: string;
  ayuda?: string;
  resaltar?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <dt className="flex items-center gap-1 text-slate-500">
        {etiqueta}
        {ayuda && <AyudaTooltip termino={ayuda} />}
      </dt>
      <dd className={resaltar ? "font-bold text-slate-900" : "font-semibold text-slate-700"}>
        {valor}
      </dd>
    </div>
  );
}

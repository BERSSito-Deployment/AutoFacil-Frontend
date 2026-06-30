// Muestra los indicadores financieros, el resumen de costos y el cronograma.
import type { FilaCronograma, Indicadores, Moneda } from "../tipos";
import { formatoFecha, formatoMoneda, formatoPorcentaje } from "../utilidades/formato";
import { AyudaTooltip } from "./AyudaTooltip";

interface PropiedadesResultados {
  indicadores: Indicadores;
  cronograma: FilaCronograma[];
  // Tipo de cambio referencial para el equivalente en Soles (creditos en USD).
  tipoCambio?: number;
}

// Abreviatura del plazo de gracia (P.G.) como en el modelo del profesor.
const PG_ABREV: Record<string, string> = {
  GRACIA_TOTAL: "T",
  GRACIA_PARCIAL: "P",
  CUOTA_ORDINARIA: "S",
  CUOTA_FINAL: "S",
};

// Formatea un numero con dos decimales sin simbolo de moneda (para el cronograma).
function fmt(n: number): string {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Celda de saldo. Celda de egreso en rojo entre parentesis (! para vencer al color base de la tabla).
function Saldo({ valor }: { valor: number }) {
  return <td className="text-right !text-slate-700">{fmt(valor)}</td>;
}

function Egreso({ valor }: { valor: number }) {
  if (!valor) {
    return <td className="text-right !text-slate-300">0.00</td>;
  }
  return <td className="text-right font-semibold !text-red-600">({fmt(valor)})</td>;
}

function Indicador({ titulo, valor, ayuda }: { titulo: string; valor: string; ayuda?: string }) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {titulo}
        {ayuda && <AyudaTooltip termino={ayuda} />}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{valor}</p>
    </div>
  );
}

export function ResultadosSimulacion({ indicadores, cronograma, tipoCambio }: PropiedadesResultados) {
  const moneda: Moneda = indicadores.moneda;

  const equivalente = (valorUsd: number): string | null =>
    moneda === "USD" && tipoCambio ? `≈ ${formatoMoneda(valorUsd * tipoCambio, "PEN")}` : null;

  return (
    <div className="space-y-6">
      {/* Los tres numeros mas importantes. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Cuota mensual <AyudaTooltip termino="Sistema frances" />
          </p>
          <p className="mt-1 text-3xl font-bold text-marca-700">
            {formatoMoneda(indicadores.cuota_mensual, moneda)}
          </p>
          {equivalente(indicadores.cuota_mensual) && (
            <p className="text-xs text-slate-400">{equivalente(indicadores.cuota_mensual)}</p>
          )}
          <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cuota final (cuotón)
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatoMoneda(indicadores.cuota_final, moneda)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Se paga en el periodo {indicadores.numero_cuotas + 1}.
            </p>
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Total pagado (cuotas + cuotón) <AyudaTooltip termino="Costo total del credito" />
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {formatoMoneda(indicadores.monto_total_pagado, moneda)}
          </p>
          {equivalente(indicadores.monto_total_pagado) && (
            <p className="text-xs text-slate-400">{equivalente(indicadores.monto_total_pagado)}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">No incluye la cuota inicial.</p>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            TCEA <AyudaTooltip termino="TCEA" />
          </p>
          <p className="mt-1 text-3xl font-bold text-acento-700">
            {formatoPorcentaje(indicadores.tcea)}
          </p>
          <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              TEA equivalente
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatoPorcentaje(indicadores.tea_equivalente)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Costo anual total del crédito.</p>
          </div>
        </div>
      </div>

      {/* Resumen de costos. */}
      <div className="tarjeta p-5">
        <h3 className="text-sm font-bold text-slate-800">Resumen de costos</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Desglose de lo que financias y pagas (Plan {indicadores.plan === "PLAN_24" ? "24" : "36"}).
        </p>
        <dl className="mt-4 divide-y divide-slate-100">
          <FilaCosto etiqueta="Precio del vehículo" valor={formatoMoneda(indicadores.precio_vehiculo, moneda)} />
          <FilaCosto
            etiqueta={`Cuota inicial (${formatoPorcentaje(indicadores.porcentaje_cuota_inicial, 2)})`}
            valor={formatoMoneda(indicadores.cuota_inicial, moneda)}
            ayuda="Cuota inicial"
          />
          <FilaCosto
            etiqueta={`Cuota final / cuotón (${formatoPorcentaje(indicadores.porcentaje_cuota_final, 2)})`}
            valor={formatoMoneda(indicadores.cuota_final, moneda)}
            ayuda="Cuota balon"
          />
          {indicadores.total_costos_financiados > 0 && (
            <FilaCosto
              etiqueta="Costos iniciales financiados"
              valor={formatoMoneda(indicadores.total_costos_financiados, moneda)}
            />
          )}
          <FilaCosto
            etiqueta="Monto del préstamo"
            valor={formatoMoneda(indicadores.monto_prestamo, moneda)}
            ayuda="Monto financiado"
            resaltar
          />
          <FilaCosto
            etiqueta="Saldo financiado con cuotas"
            valor={formatoMoneda(indicadores.saldo_financiado, moneda)}
          />
          <FilaCosto etiqueta="Intereses totales" valor={formatoMoneda(indicadores.total_intereses, moneda)} />
          <FilaCosto
            etiqueta="Seguro de desgravamen"
            valor={formatoMoneda(indicadores.total_seguro_desgravamen, moneda)}
            ayuda="Seguro de desgravamen"
          />
          <FilaCosto
            etiqueta="Seguro contra todo riesgo"
            valor={formatoMoneda(indicadores.total_seguro_riesgo, moneda)}
            ayuda="Seguro vehicular"
          />
          <FilaCosto etiqueta="GPS" valor={formatoMoneda(indicadores.total_gps, moneda)} ayuda="GPS" />
          <FilaCosto etiqueta="Portes" valor={formatoMoneda(indicadores.total_portes, moneda)} />
          <FilaCosto etiqueta="Gastos administrativos" valor={formatoMoneda(indicadores.total_gastos_adm, moneda)} />
          {indicadores.total_costos_efectivo > 0 && (
            <FilaCosto
              etiqueta="Costos pagados al contado"
              valor={formatoMoneda(indicadores.total_costos_efectivo, moneda)}
            />
          )}
          <div className="flex items-center justify-between py-2.5 text-sm">
            <dt className="flex items-center gap-1 font-semibold text-slate-800">
              Total pagado (cuotas + cuotón) <AyudaTooltip termino="Costo total del credito" />
            </dt>
            <dd className="text-right">
              <span className="text-base font-bold text-marca-700">
                {formatoMoneda(indicadores.monto_total_pagado, moneda)}
              </span>
              {equivalente(indicadores.monto_total_pagado) && (
                <span className="block text-xs font-normal text-slate-400">
                  {equivalente(indicadores.monto_total_pagado)}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Indicadores complementarios. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador titulo="TEM (mensual)" valor={formatoPorcentaje(indicadores.tem)} ayuda="TEM" />
        <Indicador titulo="N° de cuotas" valor={`${indicadores.numero_cuotas}`} />
        <Indicador titulo="COK anual" valor={formatoPorcentaje(indicadores.cok_anual)} ayuda="COK" />
        <Indicador titulo="COK mensual" valor={formatoPorcentaje(indicadores.cok_mensual)} ayuda="COK" />
        <Indicador titulo="VAN" valor={formatoMoneda(indicadores.van, moneda)} ayuda="VAN" />
        <Indicador titulo="TIR mensual" valor={formatoPorcentaje(indicadores.tir_mensual)} ayuda="TIR" />
        <Indicador titulo="TIR anual" valor={formatoPorcentaje(indicadores.tir_anual)} ayuda="TIR" />
        <Indicador titulo="Cuota final (cuotón)" valor={formatoMoneda(indicadores.cuota_final, moneda)} ayuda="Cuota balon" />
      </div>

      {/* Cronograma de pagos completo (replica el modelo del Excel). */}
      <div className="tarjeta overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Cronograma de pagos</h3>
            <p className="text-xs text-slate-500">
              Método francés vencido, meses comerciales de 30 días. Incluye el cronograma del cuotón
              (cuota final diferida) y el de la cuota regular. Importes en {moneda === "USD" ? "US$" : "S/"}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-5 py-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Período de gracia (T/P)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-marca-100 ring-1 ring-marca-200" /> Pago del cuotón
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-medium text-red-600">(rojo)</span> = lo que pagas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="tabla-base tabla-compacta tabular-nums whitespace-nowrap text-right">
            <thead>
              <tr>
                <th rowSpan={2} className="text-right align-bottom">N°</th>
                <th rowSpan={2} className="text-center align-bottom">P.G.</th>
                <th rowSpan={2} className="text-left align-bottom">Vencimiento</th>
                <th colSpan={5} className="!bg-marca-50 text-center !text-marca-700">
                  Cronograma de la cuota final (cuotón)
                </th>
                <th colSpan={5} className="!bg-sky-50 text-center !text-sky-700">
                  Cronograma de la cuota regular
                </th>
                <th colSpan={4} className="!bg-amber-50 text-center !text-amber-700">
                  Costos de operación
                </th>
                <th rowSpan={2} className="text-right align-bottom">Saldo final</th>
                <th rowSpan={2} className="text-right align-bottom">Flujo</th>
              </tr>
              <tr>
                <th className="!bg-marca-50/60 text-right">S. inicial</th>
                <th className="!bg-marca-50/60 text-right">Interés</th>
                <th className="!bg-marca-50/60 text-right">Amort.</th>
                <th className="!bg-marca-50/60 text-right">Desgrav.</th>
                <th className="!bg-marca-50/60 text-right">S. final</th>
                <th className="!bg-sky-50/60 text-right">S. inicial</th>
                <th className="!bg-sky-50/60 text-right">Interés</th>
                <th className="!bg-sky-50/60 text-right">Cuota</th>
                <th className="!bg-sky-50/60 text-right">Amort.</th>
                <th className="!bg-sky-50/60 text-right">Desgrav.</th>
                <th className="!bg-amber-50/60 text-right">Seg. riesgo</th>
                <th className="!bg-amber-50/60 text-right">GPS</th>
                <th className="!bg-amber-50/60 text-right">Portes</th>
                <th className="!bg-amber-50/60 text-right">Gastos adm.</th>
              </tr>
            </thead>
            <tbody>
              {/* Periodo 0: recibes el monto del prestamo (ingreso). */}
              <tr className="bg-emerald-50/50">
                <td className="text-right !text-slate-500">0</td>
                <td className="text-center !text-slate-400">—</td>
                <td className="text-left !text-slate-400">—</td>
                <td colSpan={14} className="text-center text-xs !text-slate-400">
                  Desembolso del préstamo
                </td>
                <td className="text-right !text-slate-300">—</td>
                <td className="text-right font-semibold !text-emerald-700">
                  {fmt(indicadores.monto_prestamo)}
                </td>
              </tr>
              {cronograma.map((fila, indice) => {
                const claseFila =
                  fila.tipo_periodo === "CUOTA_FINAL"
                    ? "bg-marca-50"
                    : fila.tipo_periodo.startsWith("GRACIA")
                      ? "bg-amber-50"
                      : indice % 2 === 1
                        ? "bg-slate-50/60"
                        : "";
                return (
                  <tr key={fila.numero_periodo} className={claseFila}>
                    <td className="text-right text-slate-500">{fila.numero_periodo}</td>
                    <td className="text-center font-semibold text-slate-600">
                      {PG_ABREV[fila.tipo_periodo] ?? "S"}
                    </td>
                    <td className="text-left !text-slate-600">{formatoFecha(fila.fecha_pago)}</td>
                    {/* Cuotón */}
                    <Saldo valor={fila.saldo_inicial_cuoton} />
                    <Egreso valor={fila.interes_cuoton} />
                    <Egreso valor={fila.amortizacion_cuoton} />
                    <Egreso valor={fila.desgravamen_cuoton} />
                    <Saldo valor={fila.saldo_final_cuoton} />
                    {/* Cuota regular */}
                    <Saldo valor={fila.saldo_inicial} />
                    <Egreso valor={fila.interes} />
                    <Egreso valor={fila.cuota} />
                    <Egreso valor={fila.amortizacion} />
                    <Egreso valor={fila.seguro_desgravamen} />
                    {/* Costos de operación */}
                    <Egreso valor={fila.seguro_riesgo} />
                    <Egreso valor={fila.gps} />
                    <Egreso valor={fila.portes} />
                    <Egreso valor={fila.gastos_adm} />
                    {/* Saldo final y flujo */}
                    <Saldo valor={fila.saldo_final} />
                    <Egreso valor={-fila.flujo} />
                  </tr>
                );
              })}
            </tbody>
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

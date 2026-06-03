// Vista publica de solo lectura, compartible con el cliente final.
// No requiere autenticacion: se accede mediante el token del enlace compartido.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { AyudaTooltip } from "../componentes/AyudaTooltip";
import { mensajeError } from "../api/cliente";
import { obtenerSimulacionCompartida } from "../api/servicios";
import type { SimulacionClienteVista } from "../tipos";
import {
  ETIQUETA_TIPO_PERIODO,
  etiquetaSimulacion,
  formatoFecha,
  formatoMoneda,
  formatoPorcentaje,
} from "../utilidades/formato";

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
  nota,
  destacado = false,
}: {
  titulo: string;
  valor: string;
  ayuda?: string;
  nota?: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        destacado ? "border-marca-200 bg-marca-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {titulo}
        {ayuda && <AyudaTooltip termino={ayuda} />}
      </p>
      <p className={`mt-1 text-lg font-bold ${destacado ? "text-marca-800" : "text-slate-800"}`}>
        {valor}
      </p>
      {nota && <p className="mt-0.5 text-xs text-slate-400">{nota}</p>}
    </div>
  );
}

export function VistaCliente() {
  const { token } = useParams();
  const [datos, setDatos] = useState<SimulacionClienteVista | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }
    obtenerSimulacionCompartida(token)
      .then(setDatos)
      .catch((err) => setError(mensajeError(err, "No se pudo cargar la simulación compartida.")))
      .finally(() => setCargando(false));
  }, [token]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Cargando mensaje="Cargando tu simulación..." />
      </div>
    );
  }
  if (error || !datos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md">
          <Mensaje tipo="error">{error || "Simulación no encontrada."}</Mensaje>
        </div>
      </div>
    );
  }

  const moneda = datos.moneda;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-marca-900 px-6 py-6 text-slate-100">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 p-1">
            <img src="/logo.png" alt="AutoFácil" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight">AutoFácil</p>
            <p className="text-xs text-slate-300">Resumen de tu crédito vehicular</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="tarjeta p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-bold text-slate-800">
              Propuesta · {datos.nombre || etiquetaSimulacion(datos.codigo)}
            </h1>
            <span className="text-sm text-slate-500">
              Inicio: {formatoFecha(datos.fecha_inicio)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {datos.vehiculo_descripcion ?? "Vehículo"} · Cliente: {datos.cliente_nombre ?? "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador
            titulo="Cuota mensual"
            valor={formatoMoneda(datos.cuota_mensual, moneda)}
            ayuda="Sistema frances"
            destacado
          />
          <Indicador
            titulo="Cuota mensual con seguros y cargos"
            valor={formatoMoneda(datos.cuota_total_promedio, moneda)}
          />
          <Indicador titulo="Plazo" valor={`${datos.plazo_meses} meses`} />
          <Indicador
            titulo="Precio del vehículo"
            valor={formatoMoneda(datos.precio_vehiculo, moneda)}
          />
          <Indicador
            titulo="Cuota inicial"
            valor={formatoMoneda(datos.cuota_inicial, moneda)}
            ayuda="Cuota inicial"
          />
          {datos.cuota_final > 0 && (
            <Indicador
              titulo="Cuota balón (pago final)"
              valor={formatoMoneda(datos.cuota_final, moneda)}
              ayuda="Cuota balon"
              destacado
            />
          )}
          <Indicador
            titulo="Monto financiado"
            valor={formatoMoneda(datos.monto_financiado, moneda)}
            ayuda="Monto financiado"
          />
          <Indicador titulo="TCEA" valor={formatoPorcentaje(datos.tcea)} ayuda="TCEA" destacado />
        </div>

        <div className="tarjeta p-5">
          <h2 className="mb-3 text-base font-bold text-slate-700">Transparencia del crédito</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador titulo="TEA" valor={formatoPorcentaje(datos.tea_equivalente)} ayuda="TEA" />
            <Indicador titulo="TEM" valor={formatoPorcentaje(datos.tem)} ayuda="TEM" />
            <Indicador
              titulo="Costo total del crédito"
              valor={formatoMoneda(datos.costo_total_credito, moneda)}
              ayuda="Costo total del credito"
            />
            <Indicador
              titulo="Total intereses"
              valor={formatoMoneda(datos.total_intereses, moneda)}
            />
            <Indicador titulo="Total seguros" valor={formatoMoneda(datos.total_seguros, moneda)} />
            <Indicador
              titulo="Gastos iniciales financiados"
              valor={formatoMoneda(datos.total_gastos_iniciales, moneda)}
            />
            <Indicador
              titulo="GPS instalación (al desembolso)"
              valor={formatoMoneda(datos.total_cargos_desembolso, moneda)}
            />
            <Indicador
              titulo="GPS mantenimiento (en cuotas)"
              valor={formatoMoneda(datos.total_gps_mantenimiento, moneda)}
            />
            <Indicador
              titulo="Tasa moratoria (nominal anual)"
              valor={formatoPorcentaje(datos.tasa_moratoria_anual)}
            />
            <Indicador titulo="Tasa de interés" valor="Fija" />
            <Indicador
              titulo="Total pagado mediante el crédito"
              valor={formatoMoneda(datos.costo_total_credito, moneda)}
              nota="No incluye la cuota inicial"
            />
            <Indicador
              titulo="Desembolso total del cliente"
              valor={formatoMoneda(datos.monto_total_pagado, moneda)}
              nota="Incluye la cuota inicial"
              destacado
            />
          </div>
        </div>

        {/* Desglose de cargos y datos del seguro (transparencia, art. 25 SBS). */}
        <div className="tarjeta p-5">
          <h2 className="mb-3 text-base font-bold text-slate-700">Detalle de cargos y seguro</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador
              titulo="Gastos notariales"
              valor={formatoMoneda(datos.gastos_notariales, moneda)}
              nota="Financiado"
            />
            <Indicador
              titulo="Gastos registrales"
              valor={formatoMoneda(datos.gastos_registrales, moneda)}
              nota="Financiado"
            />
            <Indicador
              titulo="Tasación"
              valor={formatoMoneda(datos.tasacion, moneda)}
              nota="Financiado"
            />
            <Indicador
              titulo="Seguro desgravamen"
              valor={
                datos.desgravamen_consentido
                  ? formatoPorcentaje(datos.seguro_desgravamen_anual)
                  : "No contratado"
              }
            />
            <Indicador
              titulo="Seguro vehicular (mes)"
              valor={formatoMoneda(datos.seguro_vehicular_mensual, moneda)}
            />
            <Indicador
              titulo="GPS instalación"
              valor={formatoMoneda(datos.gps_instalacion, moneda)}
              nota="Al desembolso"
            />
            <Indicador
              titulo="GPS mantenimiento (mes)"
              valor={formatoMoneda(datos.gps_mantenimiento_mensual, moneda)}
            />
            <Indicador
              titulo="GPS reposición (referencial)"
              valor={formatoMoneda(datos.gps_reposicion, moneda)}
              nota="No se cobra al contratar"
            />
          </div>
          {(datos.aseguradora || datos.numero_poliza || datos.coberturas) && (
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Póliza del seguro
              </p>
              {datos.aseguradora && (
                <p>
                  Aseguradora: <span className="font-medium text-slate-800">{datos.aseguradora}</span>
                </p>
              )}
              {datos.numero_poliza && (
                <p>
                  N° de póliza:{" "}
                  <span className="font-medium text-slate-800">{datos.numero_poliza}</span>
                </p>
              )}
              {datos.coberturas && (
                <p>
                  Coberturas: <span className="font-medium text-slate-800">{datos.coberturas}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="tarjeta overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-bold text-slate-700">Cronograma de pagos</h2>
            <p className="text-xs text-slate-500">
              Método francés vencido, con meses de 30 días. La cuota total ya incluye seguros y cargos.
            </p>
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
                  <th className="text-right">Desgravamen</th>
                  <th className="text-right">Seg. vehicular</th>
                  <th className="text-right">Otros cargos</th>
                  <th className="text-right">Cuota del mes</th>
                  <th className="text-right">Saldo final</th>
                </tr>
              </thead>
              <tbody>
                {datos.cronograma.map((fila, indice) => {
                  const otros = fila.gps_mantenimiento;
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
                        {fila.seguro_desgravamen > 0
                          ? formatoMoneda(fila.seguro_desgravamen, moneda)
                          : "-"}
                      </td>
                      <td className="text-right text-slate-500">
                        {fila.seguro_vehicular > 0
                          ? formatoMoneda(fila.seguro_vehicular, moneda)
                          : "-"}
                      </td>
                      <td className="text-right text-slate-500">
                        {otros > 0 ? formatoMoneda(otros, moneda) : "-"}
                      </td>
                      <td className="text-right font-semibold text-slate-800">
                        {formatoMoneda(fila.cuota_total, moneda)}
                      </td>
                      <td className="text-right text-slate-500">
                        {formatoMoneda(fila.saldo_final, moneda)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-slate-400">
          Documento informativo de carácter referencial. La TCEA refleja el costo total anual del
          crédito incluyendo intereses, seguros y gastos.
        </p>
      </main>
    </div>
  );
}

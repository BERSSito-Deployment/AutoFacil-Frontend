// Detalle de una simulacion: datos, indicadores, cronograma y acciones.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { ResultadosSimulacion } from "../componentes/ResultadosSimulacion";
import { mensajeError } from "../api/cliente";
import { archivarSimulacion, obtenerSimulacion, recalcularSimulacion } from "../api/servicios";
import type { Simulacion } from "../tipos";
import {
  ETIQUETA_MONEDA,
  etiquetaSimulacion,
  formatoFecha,
  formatoMoneda,
  formatoPorcentaje,
} from "../utilidades/formato";

// Muestra un par etiqueta/valor dentro de la cuadricula de parametros.
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="text-sm font-medium text-slate-700">{valor}</p>
    </div>
  );
}

export function SimulacionDetalle() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [simulacion, setSimulacion] = useState<Simulacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  const cargar = async () => {
    if (!id) {
      return;
    }
    setCargando(true);
    try {
      setSimulacion(await obtenerSimulacion(Number(id)));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const recalcular = async () => {
    if (!id) {
      return;
    }
    setError("");
    setMensajeOk("");
    try {
      const actualizada = await recalcularSimulacion(Number(id));
      setSimulacion(actualizada);
      setMensajeOk("La simulación se recalculó correctamente.");
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  const eliminar = async () => {
    if (!id) {
      return;
    }
    if (!window.confirm("¿Eliminar esta simulación? Se quitará del historial.")) {
      return;
    }
    setError("");
    setMensajeOk("");
    try {
      await archivarSimulacion(Number(id));
      navegar("/simulaciones");
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  if (cargando) {
    return <Cargando mensaje="Cargando simulación..." />;
  }
  if (!simulacion) {
    return <Mensaje tipo="error">{error || "No se encontró la simulación."}</Mensaje>;
  }

  const archivada = simulacion.estado === "ARCHIVADA";
  const moneda = simulacion.moneda;
  const gracia =
    simulacion.meses_gracia_total === 0 && simulacion.meses_gracia_parcial === 0
      ? "Sin gracia"
      : `${simulacion.meses_gracia_total} total + ${simulacion.meses_gracia_parcial} parcial`;

  const costosIniciales = [
    {
      etiqueta: "Gastos notariales",
      monto: simulacion.costo_notarial,
      financiado: simulacion.costo_notarial_financiado,
    },
    {
      etiqueta: "Gastos registrales",
      monto: simulacion.costo_registral,
      financiado: simulacion.costo_registral_financiado,
    },
    {
      etiqueta: "Tasación",
      monto: simulacion.costo_tasacion,
      financiado: simulacion.costo_tasacion_financiado,
    },
    {
      etiqueta: "Comisión de estudio",
      monto: simulacion.comision_estudio,
      financiado: simulacion.comision_estudio_financiado,
    },
    {
      etiqueta: "Comisión de activación",
      monto: simulacion.comision_activacion,
      financiado: simulacion.comision_activacion_financiado,
    },
  ].filter((costo) => costo.monto > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{etiquetaSimulacion(simulacion.id)}</h1>
          {simulacion.nombre && (
            <p className="text-sm font-medium text-slate-600">{simulacion.nombre}</p>
          )}
          <p className="text-sm text-slate-500">
            Registrada el {formatoFecha(simulacion.fecha_creacion)} por{" "}
            {simulacion.usuario_nombre ?? "-"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/simulaciones/${simulacion.id}/editar`} className="boton-secundario">
            Editar
          </Link>
          <button type="button" className="boton-secundario" onClick={recalcular}>
            Recalcular
          </button>
          {!archivada && (
            <button type="button" className="boton-secundario text-red-600" onClick={eliminar}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {mensajeOk && <Mensaje tipo="exito">{mensajeOk}</Mensaje>}

      <section className="tarjeta grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Vehículo</p>
          <p className="text-sm font-medium text-slate-700">
            {simulacion.vehiculo_descripcion ?? "-"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Inicio del crédito</p>
          <p className="text-sm font-medium text-slate-700">{formatoFecha(simulacion.fecha_inicio)}</p>
        </div>
      </section>

      <section className="tarjeta p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Parámetros de la operación
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Dato etiqueta="Moneda" valor={ETIQUETA_MONEDA[moneda]} />
          <Dato etiqueta="Precio del vehículo" valor={formatoMoneda(simulacion.precio_vehiculo, moneda)} />
          {moneda === "USD" && simulacion.tipo_cambio_referencial != null && (
            <Dato etiqueta="Tipo de cambio ref." valor={simulacion.tipo_cambio_referencial.toFixed(4)} />
          )}
          <Dato
            etiqueta="Plan"
            valor={`${simulacion.plan === "PLAN_24" ? "Plan 24" : "Plan 36"} (${simulacion.numero_cuotas} cuotas)`}
          />
          <Dato
            etiqueta="Cuota inicial"
            valor={`${formatoMoneda(simulacion.cuota_inicial, moneda)} (${formatoPorcentaje(
              simulacion.porcentaje_cuota_inicial,
              2
            )})`}
          />
          <Dato
            etiqueta="Cuota final (cuotón)"
            valor={`${formatoMoneda(simulacion.cuota_final, moneda)} (${formatoPorcentaje(
              simulacion.porcentaje_cuota_final,
              2
            )})`}
          />
          <Dato etiqueta="Monto del préstamo" valor={formatoMoneda(simulacion.monto_prestamo, moneda)} />
          <Dato
            etiqueta="Saldo financiado"
            valor={formatoMoneda(simulacion.saldo_financiado, moneda)}
          />
          <Dato
            etiqueta="Tasa ingresada"
            valor={`${simulacion.tipo_tasa === "EFECTIVA" ? "TEA" : "TNA"} ${formatoPorcentaje(
              simulacion.tasa_ingresada,
              4
            )}`}
          />
          {simulacion.capitalizacion && (
            <Dato
              etiqueta="Capitalización"
              valor={simulacion.capitalizacion === "DIARIA" ? "Diaria" : "Mensual"}
            />
          )}
          <Dato etiqueta="TEA equivalente" valor={formatoPorcentaje(simulacion.tea_equivalente)} />
          <Dato etiqueta="TEM" valor={formatoPorcentaje(simulacion.tem)} />
          <Dato etiqueta="Gracia" valor={gracia} />
          <Dato etiqueta="COK anual" valor={formatoPorcentaje(simulacion.cok_anual)} />
          <Dato etiqueta="COK mensual" valor={formatoPorcentaje(simulacion.cok_mensual)} />
          <Dato
            etiqueta="Seguro desgravamen (mensual)"
            valor={formatoPorcentaje(simulacion.seguro_desgravamen_mensual)}
          />
          <Dato
            etiqueta="Seguro riesgo (anual)"
            valor={formatoPorcentaje(simulacion.seguro_riesgo_anual)}
          />
          <Dato etiqueta="GPS (por cuota)" valor={formatoMoneda(simulacion.gps_periodico, moneda)} />
          <Dato etiqueta="Portes (por cuota)" valor={formatoMoneda(simulacion.portes_periodico, moneda)} />
          <Dato
            etiqueta="Gastos adm. (por cuota)"
            valor={formatoMoneda(simulacion.gastos_adm_periodico, moneda)}
          />
        </div>
        {costosIniciales.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Costos / gastos iniciales
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {costosIniciales.map((costo) => (
                <Dato
                  key={costo.etiqueta}
                  etiqueta={`${costo.etiqueta} (${costo.financiado ? "financiado" : "al contado"})`}
                  valor={formatoMoneda(costo.monto, moneda)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <ResultadosSimulacion
        indicadores={simulacion}
        cronograma={simulacion.cronograma}
        tipoCambio={moneda === "USD" ? simulacion.tipo_cambio_referencial ?? undefined : undefined}
      />

      <button type="button" className="boton-secundario" onClick={() => navegar("/simulaciones")}>
        Volver al listado
      </button>
    </div>
  );
}

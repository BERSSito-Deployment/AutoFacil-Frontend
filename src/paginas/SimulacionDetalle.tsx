// Detalle de una simulacion: datos, indicadores, cronograma y acciones.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { ResultadosSimulacion } from "../componentes/ResultadosSimulacion";
import { mensajeError } from "../api/cliente";
import {
  archivarSimulacion,
  obtenerSimulacion,
  recalcularSimulacion,
} from "../api/servicios";
import type { Simulacion } from "../tipos";
import {
  ETIQUETA_MONEDA,
  etiquetaSimulacion,
  formatoFecha,
  formatoMoneda,
  formatoPorcentaje,
} from "../utilidades/formato";

const ETIQUETA_GRACIA: Record<string, string> = {
  NINGUNA: "Sin gracia",
  TOTAL: "Gracia total",
  PARCIAL: "Gracia parcial",
};

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
    if (
      !window.confirm(
        "¿Eliminar esta simulación? Se quitará del historial y dejará de compartirse con el cliente."
      )
    ) {
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

  // Genera el enlace publico de solo lectura y lo copia al portapapeles.
  const compartir = async () => {
    if (!simulacion?.token_compartir) {
      return;
    }
    const enlace = `${window.location.origin}/compartir/${simulacion.token_compartir}`;
    setError("");
    try {
      await navigator.clipboard.writeText(enlace);
      setMensajeOk(`Enlace para el cliente copiado al portapapeles: ${enlace}`);
    } catch {
      // Si el navegador bloquea el portapapeles, se abre el enlace en otra pestana.
      window.open(enlace, "_blank", "noopener");
      setMensajeOk(`Enlace para el cliente: ${enlace}`);
    }
  };

  if (cargando) {
    return <Cargando mensaje="Cargando simulación..." />;
  }
  if (!simulacion) {
    return <Mensaje tipo="error">{error || "No se encontró la simulación."}</Mensaje>;
  }

  // El enlace publico solo sirve propuestas vigentes (calculadas).
  const compartible = simulacion.estado === "CALCULADA";
  const archivada = simulacion.estado === "ARCHIVADA";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {etiquetaSimulacion(simulacion.id)}
          </h1>
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
          {compartible ? (
            <button type="button" className="boton-primario" onClick={compartir}>
              Compartir con el cliente
            </button>
          ) : (
            <span
              className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400"
              title="Solo se comparten propuestas calculadas"
            >
              No compartible
            </span>
          )}
          {!archivada && (
            <button type="button" className="boton-secundario text-red-600" onClick={eliminar}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {mensajeOk && <Mensaje tipo="exito">{mensajeOk}</Mensaje>}

      <section className="tarjeta grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Cliente</p>
          <p className="text-sm font-medium text-slate-700">{simulacion.cliente_nombre ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Vehículo</p>
          <p className="text-sm font-medium text-slate-700">
            {simulacion.vehiculo_descripcion ?? "-"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Inicio del crédito</p>
          <p className="text-sm font-medium text-slate-700">
            {formatoFecha(simulacion.fecha_inicio)}
          </p>
        </div>
      </section>

      <section className="tarjeta p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Parámetros de la operación
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Dato etiqueta="Moneda" valor={ETIQUETA_MONEDA[simulacion.moneda]} />
          <Dato
            etiqueta="Precio del vehículo"
            valor={formatoMoneda(simulacion.precio_vehiculo, simulacion.moneda)}
          />
          {simulacion.moneda === "USD" && simulacion.tipo_cambio_referencial != null && (
            <Dato
              etiqueta="Tipo de cambio ref."
              valor={simulacion.tipo_cambio_referencial.toFixed(4)}
            />
          )}
          <Dato
            etiqueta="Cuota inicial"
            valor={`${formatoMoneda(simulacion.cuota_inicial, simulacion.moneda)} (${formatoPorcentaje(
              simulacion.porcentaje_cuota_inicial,
              2
            )})`}
          />
          <Dato
            etiqueta="Cuota balón (final)"
            valor={`${formatoMoneda(simulacion.cuota_final, simulacion.moneda)} (${formatoPorcentaje(
              simulacion.porcentaje_cuota_final,
              2
            )})`}
          />
          <Dato etiqueta="Plazo" valor={`${simulacion.plazo_meses} meses`} />
          <Dato
            etiqueta="Tasa ingresada"
            valor={`${simulacion.tipo_tasa === "EFECTIVA" ? "TEA" : "TNA"} ${formatoPorcentaje(
              simulacion.tasa_ingresada,
              4
            )}`}
          />
          {simulacion.capitalizacion && (
            <Dato etiqueta="Capitalización" valor={simulacion.capitalizacion} />
          )}
          <Dato etiqueta="TEA equivalente" valor={formatoPorcentaje(simulacion.tea_equivalente)} />
          <Dato etiqueta="TEM" valor={formatoPorcentaje(simulacion.tem)} />
          <Dato etiqueta="Tasa de interés" valor="Fija" />
          <Dato
            etiqueta="Gracia"
            valor={
              simulacion.tipo_gracia === "NINGUNA"
                ? ETIQUETA_GRACIA[simulacion.tipo_gracia]
                : `${ETIQUETA_GRACIA[simulacion.tipo_gracia]} (${simulacion.meses_gracia} meses)`
            }
          />
          <Dato etiqueta="COK anual" valor={formatoPorcentaje(simulacion.cok_anual)} />
          <Dato
            etiqueta="Tasa descuento VAN"
            valor={formatoPorcentaje(simulacion.tasa_descuento_van)}
          />
          <Dato
            etiqueta="Desgravamen anual"
            valor={
              simulacion.desgravamen_consentido
                ? formatoPorcentaje(simulacion.seguro_desgravamen_anual)
                : "No contratado"
            }
          />
          <Dato
            etiqueta="Seguro vehicular (mes)"
            valor={formatoMoneda(simulacion.seguro_vehicular_mensual, simulacion.moneda)}
          />
          <Dato
            etiqueta="GPS instalación (al desembolso)"
            valor={formatoMoneda(simulacion.gps_instalacion, simulacion.moneda)}
          />
          <Dato
            etiqueta="GPS mantenimiento (mes)"
            valor={formatoMoneda(simulacion.gps_mantenimiento_mensual, simulacion.moneda)}
          />
          <Dato
            etiqueta="GPS reposición (referencial)"
            valor={formatoMoneda(simulacion.gps_reposicion, simulacion.moneda)}
          />
          <Dato
            etiqueta="Gastos iniciales financiados"
            valor={formatoMoneda(simulacion.gastos_iniciales, simulacion.moneda)}
          />
          {simulacion.tasa_moratoria_anual > 0 && (
            <Dato
              etiqueta="Tasa moratoria (nominal anual)"
              valor={formatoPorcentaje(simulacion.tasa_moratoria_anual)}
            />
          )}
        </div>
        {(simulacion.gastos_notariales > 0 ||
          simulacion.gastos_registrales > 0 ||
          simulacion.tasacion > 0) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Desglose de gastos financiados
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Dato
                etiqueta="Gastos notariales"
                valor={formatoMoneda(simulacion.gastos_notariales, simulacion.moneda)}
              />
              <Dato
                etiqueta="Gastos registrales"
                valor={formatoMoneda(simulacion.gastos_registrales, simulacion.moneda)}
              />
              <Dato
                etiqueta="Tasación"
                valor={formatoMoneda(simulacion.tasacion, simulacion.moneda)}
              />
            </div>
          </div>
        )}
        {(simulacion.aseguradora || simulacion.numero_poliza || simulacion.coberturas) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Seguro
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {simulacion.aseguradora && (
                <Dato etiqueta="Aseguradora" valor={simulacion.aseguradora} />
              )}
              {simulacion.numero_poliza && (
                <Dato etiqueta="Póliza" valor={simulacion.numero_poliza} />
              )}
              {simulacion.coberturas && (
                <Dato etiqueta="Coberturas" valor={simulacion.coberturas} />
              )}
            </div>
          </div>
        )}
      </section>

      <ResultadosSimulacion
        indicadores={simulacion}
        cronograma={simulacion.cronograma}
        codigo={simulacion.codigo}
        tipoCambio={
          simulacion.moneda === "USD"
            ? simulacion.tipo_cambio_referencial ?? undefined
            : undefined
        }
      />

      <button type="button" className="boton-secundario" onClick={() => navegar("/simulaciones")}>
        Volver al listado
      </button>
    </div>
  );
}

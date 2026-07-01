// Pagina para crear (o editar) una simulacion Compra Inteligente.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Campo } from "../componentes/Campo";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { ResultadosSimulacion } from "../componentes/ResultadosSimulacion";
import { mensajeError } from "../api/cliente";
import {
  actualizarSimulacion,
  calcularSimulacion,
  guardarSimulacion,
  listarVehiculos,
  obtenerSimulacion,
  obtenerTipoCambio,
} from "../api/servicios";
import type {
  Capitalizacion,
  Moneda,
  ParametrosSimulacion,
  Plan,
  ResultadoCalculo,
  TipoCambio,
  TipoTasa,
  Vehiculo,
} from "../tipos";
import {
  ETIQUETA_MONEDA,
  decimalAPorcentaje,
  formatoMoneda,
  porcentajeADecimal,
} from "../utilidades/formato";

interface FormularioSimulacion {
  nombre: string;
  vehiculo_id: number;
  moneda: Moneda;
  tipo_cambio_referencial: number;
  plan: Plan;
  tipo_tasa: TipoTasa;
  valor_tasa: number;
  capitalizacion: Capitalizacion | "";
  porcentaje_cuota_inicial: number;
  porcentaje_cuota_final: number;
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
  actualizar_precio: boolean;
  fecha_inicio: string;
}

const VALOR_INICIAL: FormularioSimulacion = {
  nombre: "",
  vehiculo_id: 0,
  moneda: "PEN",
  tipo_cambio_referencial: 3.75,
  plan: "PLAN_36",
  tipo_tasa: "NOMINAL",
  valor_tasa: 15,
  capitalizacion: "DIARIA",
  porcentaje_cuota_inicial: 20,
  porcentaje_cuota_final: 40,
  meses_gracia_total: 0,
  meses_gracia_parcial: 0,
  costo_notarial: 0,
  costo_notarial_financiado: true,
  costo_registral: 0,
  costo_registral_financiado: true,
  costo_tasacion: 0,
  costo_tasacion_financiado: true,
  comision_estudio: 0,
  comision_estudio_financiado: true,
  comision_activacion: 0,
  comision_activacion_financiado: true,
  gps_periodico: 0,
  portes_periodico: 0,
  gastos_adm_periodico: 0,
  seguro_desgravamen_mensual: 0,
  seguro_riesgo_anual: 0,
  cok_anual: 20,
  actualizar_precio: false,
  fecha_inicio: "",
};

const CAPITALIZACIONES: Capitalizacion[] = ["DIARIA", "MENSUAL"];

const CUOTAS_POR_PLAN: Record<Plan, number> = { PLAN_24: 24, PLAN_36: 36 };
const CUOTA_FINAL_POR_PLAN: Record<Plan, number> = { PLAN_24: 50, PLAN_36: 40 };

// Encabezado de paso con un numero en circulo, para guiar el formulario.
function Paso({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-600 text-xs font-bold text-white">
        {numero}
      </span>
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">{titulo}</p>
    </div>
  );
}

// Campo de un costo inicial: monto + modalidad (financiado al credito o al contado).
function CostoInicialCampo({
  etiqueta,
  descripcion,
  monto,
  financiado,
  onMonto,
  onModalidad,
}: {
  etiqueta: string;
  descripcion: string;
  monto: number;
  financiado: boolean;
  onMonto: (valor: number) => void;
  onModalidad: (financiado: boolean) => void;
}) {
  return (
    <Campo etiqueta={etiqueta} descripcion={descripcion}>
      <input
        className="campo-entrada"
        type="number"
        step="0.01"
        min="0"
        value={monto}
        onChange={(evento) => onMonto(Number(evento.target.value))}
      />
      <div className="mt-2 inline-flex overflow-hidden rounded-md border border-slate-300 text-xs">
        <button
          type="button"
          className={`px-3 py-1.5 font-medium ${
            financiado ? "bg-marca-600 text-white" : "bg-white text-slate-600"
          }`}
          onClick={() => onModalidad(true)}
        >
          Financiado
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 font-medium ${
            !financiado ? "bg-marca-600 text-white" : "bg-white text-slate-600"
          }`}
          onClick={() => onModalidad(false)}
        >
          Al contado
        </button>
      </div>
    </Campo>
  );
}

export function NuevaSimulacion() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();
  const [parametrosUrl] = useSearchParams();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [datos, setDatos] = useState<FormularioSimulacion>(VALOR_INICIAL);
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const [cargandoListas, setCargandoListas] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  // La cuota inicial puede ingresarse como % del precio o como monto.
  const [modoCuotaInicial, setModoCuotaInicial] = useState<"porcentaje" | "monto">("porcentaje");
  // Tipo de cambio en tiempo real (solo informativo, para creditos en Dolares).
  const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);

  // Vehiculos del usuario disponibles para simular.
  const vehiculosActivos = useMemo(() => vehiculos.filter((v) => v.activo), [vehiculos]);

  useEffect(() => {
    // Al editar se incluyen los vehiculos dados de baja para mostrar el de la
    // simulacion historica aunque ya no este activo.
    listarVehiculos(undefined, editando)
      .then((listaVehiculos) => {
        setVehiculos(listaVehiculos);
        const vehiculoUrl = Number(parametrosUrl.get("vehiculo"));
        if (!id && vehiculoUrl) {
          const vehiculo = listaVehiculos.find((item) => item.id === vehiculoUrl);
          if (vehiculo) {
            setDatos((anterior) => ({
              ...anterior,
              vehiculo_id: vehiculo.id,
              moneda: vehiculo.moneda,
            }));
          }
        }
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargandoListas(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    obtenerSimulacion(Number(id))
      .then((simulacion) => {
        setDatos({
          nombre: simulacion.nombre ?? "",
          vehiculo_id: simulacion.vehiculo_id,
          moneda: simulacion.moneda,
          tipo_cambio_referencial: simulacion.tipo_cambio_referencial ?? 3.75,
          plan: simulacion.plan,
          tipo_tasa: simulacion.tipo_tasa,
          valor_tasa: decimalAPorcentaje(simulacion.tasa_ingresada),
          capitalizacion: simulacion.capitalizacion ?? "",
          porcentaje_cuota_inicial: decimalAPorcentaje(simulacion.porcentaje_cuota_inicial),
          porcentaje_cuota_final: decimalAPorcentaje(simulacion.porcentaje_cuota_final),
          meses_gracia_total: simulacion.meses_gracia_total,
          meses_gracia_parcial: simulacion.meses_gracia_parcial,
          costo_notarial: simulacion.costo_notarial,
          costo_notarial_financiado: simulacion.costo_notarial_financiado,
          costo_registral: simulacion.costo_registral,
          costo_registral_financiado: simulacion.costo_registral_financiado,
          costo_tasacion: simulacion.costo_tasacion,
          costo_tasacion_financiado: simulacion.costo_tasacion_financiado,
          comision_estudio: simulacion.comision_estudio,
          comision_estudio_financiado: simulacion.comision_estudio_financiado,
          comision_activacion: simulacion.comision_activacion,
          comision_activacion_financiado: simulacion.comision_activacion_financiado,
          gps_periodico: simulacion.gps_periodico,
          portes_periodico: simulacion.portes_periodico,
          gastos_adm_periodico: simulacion.gastos_adm_periodico,
          seguro_desgravamen_mensual: decimalAPorcentaje(simulacion.seguro_desgravamen_mensual),
          seguro_riesgo_anual: decimalAPorcentaje(simulacion.seguro_riesgo_anual),
          cok_anual: decimalAPorcentaje(simulacion.cok_anual),
          actualizar_precio: false,
          fecha_inicio: simulacion.fecha_inicio,
        });
        setResultado({ ...simulacion, cronograma: simulacion.cronograma });
      })
      .catch((err) => setError(mensajeError(err)));
  }, [id]);

  const vehiculoSeleccionado = useMemo(
    () => vehiculos.find((vehiculo) => vehiculo.id === datos.vehiculo_id),
    [vehiculos, datos.vehiculo_id]
  );

  // Opciones del desplegable: los vehiculos activos y, al editar, tambien el
  // vehiculo de la simulacion aunque haya sido dado de baja.
  const vehiculosOpciones = useMemo(() => {
    if (vehiculoSeleccionado && !vehiculosActivos.some((v) => v.id === vehiculoSeleccionado.id)) {
      return [vehiculoSeleccionado, ...vehiculosActivos];
    }
    return vehiculosActivos;
  }, [vehiculoSeleccionado, vehiculosActivos]);

  // La moneda del credito la elige el usuario y puede diferir de la del vehiculo:
  // en ese caso el precio se convierte con el tipo de cambio.
  const monedaCredito = datos.moneda;
  const monedaVehiculo = vehiculoSeleccionado ? vehiculoSeleccionado.moneda : datos.moneda;
  const precioVehiculo = vehiculoSeleccionado ? vehiculoSeleccionado.precio : 0;
  const requiereTipoCambio = Boolean(vehiculoSeleccionado) && monedaVehiculo !== monedaCredito;
  const tipoCambioValor = datos.tipo_cambio_referencial;
  const precioCredito = !vehiculoSeleccionado
    ? 0
    : monedaVehiculo === monedaCredito
      ? precioVehiculo
      : monedaVehiculo === "PEN"
        ? tipoCambioValor > 0
          ? precioVehiculo / tipoCambioValor
          : 0
        : precioVehiculo * tipoCambioValor;
  const montoCuotaInicial = (precioCredito * datos.porcentaje_cuota_inicial) / 100;
  const numeroCuotas = CUOTAS_POR_PLAN[datos.plan];
  const porcentajeCuotaFinal = datos.porcentaje_cuota_final;
  const montoCuotaFinal = (precioCredito * porcentajeCuotaFinal) / 100;
  const simboloMoneda = monedaCredito === "USD" ? "US$" : "S/";

  useEffect(() => {
    if (!requiereTipoCambio) {
      return;
    }
    let activo = true;
    obtenerTipoCambio("USD", "PEN")
      .then((tc) => {
        if (!activo) {
          return;
        }
        setTipoCambio(tc);
        if (!editando) {
          setDatos((anterior) => ({
            ...anterior,
            tipo_cambio_referencial: Number(tc.tasa.toFixed(4)),
          }));
        }
      })
      .catch(() => undefined);
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiereTipoCambio]);

  const aplicarTipoCambioEnVivo = async () => {
    try {
      const tc = await obtenerTipoCambio("USD", "PEN");
      setTipoCambio(tc);
      setDatos((anterior) => ({
        ...anterior,
        tipo_cambio_referencial: Number(tc.tasa.toFixed(4)),
      }));
      setResultado(null);
    } catch {
      setError("No se pudo obtener el tipo de cambio en este momento.");
    }
  };

  // Cualquier cambio de parametro invalida el resultado calculado previamente.
  const actualizar = (campo: keyof FormularioSimulacion, valor: string | number | boolean) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
    setResultado(null);
  };

  const seleccionarVehiculo = (vehiculoId: number) => {
    const vehiculo = vehiculos.find((item) => item.id === vehiculoId);
    setDatos((anterior) => ({
      ...anterior,
      vehiculo_id: vehiculoId,
      moneda: vehiculo ? vehiculo.moneda : anterior.moneda,
    }));
    setResultado(null);
  };

  const cambiarMontoCuotaInicial = (monto: number) => {
    if (precioCredito <= 0) {
      return;
    }
    const porcentaje = (monto / precioCredito) * 100;
    setDatos((anterior) => ({
      ...anterior,
      porcentaje_cuota_inicial: Math.round(porcentaje * 1e6) / 1e6,
    }));
    setResultado(null);
  };

  const validar = (): string | null => {
    if (!datos.vehiculo_id) {
      return "Debe seleccionar un vehículo.";
    }
    if (datos.tipo_tasa === "NOMINAL" && !datos.capitalizacion) {
      return "Debe indicar la capitalización cuando la tasa es nominal.";
    }
    if (datos.meses_gracia_total + datos.meses_gracia_parcial >= numeroCuotas) {
      return "Los meses de gracia deben ser menores que el número de cuotas del plan.";
    }
    if (datos.porcentaje_cuota_inicial > 100) {
      return "La cuota inicial no puede superar el 100% del precio.";
    }
    if (datos.porcentaje_cuota_inicial + porcentajeCuotaFinal >= 100) {
      return "La cuota inicial y la cuota final del plan no pueden sumar el 100% del precio o más.";
    }
    if (requiereTipoCambio && datos.tipo_cambio_referencial <= 0) {
      return "Indica un tipo de cambio válido para simular en una moneda distinta a la del vehículo.";
    }
    return null;
  };

  const construirCarga = (): ParametrosSimulacion => ({
    vehiculo_id: datos.vehiculo_id,
    nombre: datos.nombre.trim() || null,
    moneda: monedaCredito,
    // Se envia el tipo de cambio cuando la moneda del credito difiere de la del
    // vehiculo, o cuando el credito es en Dolares (equivalencias informativas).
    tipo_cambio_referencial:
      requiereTipoCambio || monedaCredito === "USD" ? datos.tipo_cambio_referencial : null,
    plan: datos.plan,
    porcentaje_cuota_inicial: porcentajeADecimal(datos.porcentaje_cuota_inicial),
    porcentaje_cuota_final: porcentajeADecimal(datos.porcentaje_cuota_final),
    tipo_tasa: datos.tipo_tasa,
    valor_tasa: porcentajeADecimal(datos.valor_tasa),
    capitalizacion: datos.tipo_tasa === "NOMINAL" ? (datos.capitalizacion as Capitalizacion) : null,
    meses_gracia_total: datos.meses_gracia_total,
    meses_gracia_parcial: datos.meses_gracia_parcial,
    costo_notarial: datos.costo_notarial,
    costo_notarial_financiado: datos.costo_notarial_financiado,
    costo_registral: datos.costo_registral,
    costo_registral_financiado: datos.costo_registral_financiado,
    costo_tasacion: datos.costo_tasacion,
    costo_tasacion_financiado: datos.costo_tasacion_financiado,
    comision_estudio: datos.comision_estudio,
    comision_estudio_financiado: datos.comision_estudio_financiado,
    comision_activacion: datos.comision_activacion,
    comision_activacion_financiado: datos.comision_activacion_financiado,
    gps_periodico: datos.gps_periodico,
    portes_periodico: datos.portes_periodico,
    gastos_adm_periodico: datos.gastos_adm_periodico,
    seguro_desgravamen_mensual: porcentajeADecimal(datos.seguro_desgravamen_mensual),
    seguro_riesgo_anual: porcentajeADecimal(datos.seguro_riesgo_anual),
    cok_anual: porcentajeADecimal(datos.cok_anual),
    fecha_inicio: datos.fecha_inicio || null,
  });

  const calcular = async () => {
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      setResultado(null);
      return;
    }
    setError("");
    setCalculando(true);
    try {
      const calculo = await calcularSimulacion(construirCarga());
      setResultado(calculo);
    } catch (err) {
      setError(mensajeError(err, "No se pudo calcular la simulación."));
      setResultado(null);
    } finally {
      setCalculando(false);
    }
  };

  const guardar = async () => {
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError("");
    setGuardando(true);
    try {
      const carga = construirCarga();
      const simulacion =
        editando && id
          ? await actualizarSimulacion(Number(id), {
              ...carga,
              actualizar_precio: datos.actualizar_precio,
            })
          : await guardarSimulacion({ ...carga, estado: "CALCULADA" });
      navegar(`/simulaciones/${simulacion.id}`);
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la simulación."));
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoListas) {
    return <Cargando mensaje="Cargando datos..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {editando ? "Editar simulación" : "Nueva simulación"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Producto Compra Inteligente: elige el vehículo, el plan (que define la cuota final), la
          cuota inicial, la gracia y los cargos, y pulsa
          <span className="font-medium text-slate-700"> Ver vista previa</span> para revisar la cuota
          y la TCEA antes de guardar.
        </p>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={1} titulo="Vehículo" />
        {vehiculosActivos.length === 0 && (
          <Mensaje tipo="info">
            Necesitas al menos un vehículo. Agrégalo en la pantalla de inicio ("Mis vehículos") para
            poder simular.
          </Mensaje>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo etiqueta="Vehículo" descripcion="Vehículo a financiar. Su precio es la base del cálculo.">
            <select
              className="campo-entrada"
              value={datos.vehiculo_id}
              onChange={(evento) => seleccionarVehiculo(Number(evento.target.value))}
            >
              <option value={0}>Seleccione un vehículo</option>
              {vehiculosOpciones.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.marca} {vehiculo.modelo} - {formatoMoneda(vehiculo.precio, vehiculo.moneda)}
                  {!vehiculo.activo ? " (dado de baja)" : ""}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Nombre de la simulación" descripcion="Etiqueta para reconocer esta simulación (por ejemplo: Compra Inteligente Plan 36). Es opcional.">
            <input
              className="campo-entrada"
              value={datos.nombre}
              placeholder="Opcional"
              onChange={(evento) => actualizar("nombre", evento.target.value)}
            />
          </Campo>
        </div>
        {vehiculoSeleccionado && (
          <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Precio del vehículo:{" "}
            <span className="font-semibold text-slate-900">
              {formatoMoneda(vehiculoSeleccionado.precio, vehiculoSeleccionado.moneda)}
            </span>
            . El crédito se calcula en{" "}
            <span className="font-semibold text-slate-900">{ETIQUETA_MONEDA[monedaCredito]}</span>
            {requiereTipoCambio && (
              <>
                {" "}
                (precio convertido:{" "}
                <span className="font-semibold text-slate-900">
                  {formatoMoneda(precioCredito, monedaCredito)}
                </span>
                )
              </>
            )}
            .
          </div>
        )}
        {editando && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-marca-600 focus:ring-marca-500"
              checked={datos.actualizar_precio}
              onChange={(evento) => actualizar("actualizar_precio", evento.target.checked)}
            />
            Actualizar al precio actual del vehículo (por defecto se conserva el precio original de
            la propuesta)
          </label>
        )}
      </section>

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={2} titulo="Condiciones del crédito" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Moneda del crédito" descripcion="Moneda en la que se otorga el crédito. Puede ser distinta a la del vehículo: en ese caso el precio se convierte con el tipo de cambio que indiques.">
            <select
              className="campo-entrada"
              value={datos.moneda}
              onChange={(evento) => actualizar("moneda", evento.target.value as Moneda)}
            >
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </Campo>
          <Campo
            etiqueta="Plan de pagos"
            ayuda="Cuota balon"
            descripcion="Plan 24: 24 cuotas (cuota final por defecto 50%). Plan 36: 36 cuotas (cuota final por defecto 40%). Al cambiar de plan, la cuota final vuelve a su valor por defecto, pero puedes editarla."
          >
            <select
              className="campo-entrada"
              value={datos.plan}
              onChange={(evento) => {
                const nuevoPlan = evento.target.value as Plan;
                setDatos((anterior) => ({
                  ...anterior,
                  plan: nuevoPlan,
                  porcentaje_cuota_final: CUOTA_FINAL_POR_PLAN[nuevoPlan],
                }));
                setResultado(null);
              }}
            >
              <option value="PLAN_36">Plan 36 (36 cuotas)</option>
              <option value="PLAN_24">Plan 24 (24 cuotas)</option>
            </select>
          </Campo>
          <Campo etiqueta="Tipo de tasa" ayuda="Tasa efectiva">
            <select
              className="campo-entrada"
              value={datos.tipo_tasa}
              onChange={(evento) => actualizar("tipo_tasa", evento.target.value as TipoTasa)}
            >
              <option value="NOMINAL">Nominal anual (TNA)</option>
              <option value="EFECTIVA">Efectiva anual (TEA)</option>
            </select>
          </Campo>
          <Campo etiqueta="Valor de la tasa (%)" ayuda={datos.tipo_tasa === "EFECTIVA" ? "TEA" : "TNA"}>
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              value={datos.valor_tasa}
              onChange={(evento) => actualizar("valor_tasa", Number(evento.target.value))}
            />
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Capitalización" ayuda="Capitalizacion" descripcion="Frecuencia de capitalización de la tasa nominal. Solo aplica si la tasa es nominal (TNA).">
            <select
              className="campo-entrada"
              value={datos.capitalizacion}
              disabled={datos.tipo_tasa !== "NOMINAL"}
              onChange={(evento) =>
                actualizar("capitalizacion", evento.target.value as Capitalizacion)
              }
            >
              <option value="">Seleccione</option>
              {CAPITALIZACIONES.map((capitalizacion) => (
                <option key={capitalizacion} value={capitalizacion}>
                  {capitalizacion === "DIARIA" ? "Diaria" : "Mensual"}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Fecha de inicio" descripcion="Fecha de desembolso del crédito. Las cuotas vencen cada 30 días a partir de esta fecha.">
            <input
              className="campo-entrada"
              type="date"
              value={datos.fecha_inicio}
              onChange={(evento) => actualizar("fecha_inicio", evento.target.value)}
            />
          </Campo>
          <Campo
            etiqueta="COK (Costo de Oportunidad) %"
            ayuda="COK"
            descripcion="Rendimiento anual que esperarías de un uso alternativo de tu dinero. Se usa para descontar el flujo en el VAN."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              value={datos.cok_anual}
              onChange={(evento) => actualizar("cok_anual", Number(evento.target.value))}
            />
          </Campo>
        </div>

        {(requiereTipoCambio || monedaCredito === "USD") && (
          <div className="rounded-md border border-marca-100 bg-marca-50/60 p-4">
            {requiereTipoCambio && (
              <p className="mb-3 text-xs text-slate-600">
                El vehículo está en {ETIQUETA_MONEDA[monedaVehiculo]} y el crédito en{" "}
                {ETIQUETA_MONEDA[monedaCredito]}: el precio se convierte con este tipo de cambio, que
                queda guardado en la simulación.
              </p>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Campo etiqueta="Tipo de cambio (1 US$ en S/)" descripcion="Cotización del Dólar en Soles. Se usa para convertir el precio cuando el vehículo y el crédito están en monedas distintas, y para mostrar equivalencias.">
                <input
                  className="campo-entrada"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={datos.tipo_cambio_referencial}
                  onChange={(evento) =>
                    actualizar("tipo_cambio_referencial", Number(evento.target.value))
                  }
                />
              </Campo>
              <div className="sm:col-span-1 lg:col-span-3 flex flex-col justify-end gap-1 text-sm text-slate-600">
                {tipoCambio ? (
                  <p>
                    Tipo de cambio en tiempo real:{" "}
                    <span className="font-semibold text-slate-900">
                      1 US$ = S/ {tipoCambio.tasa.toFixed(4)}
                    </span>{" "}
                    <span className="text-xs text-slate-400">
                      ({tipoCambio.en_linea ? `fuente: ${tipoCambio.fuente}` : tipoCambio.fuente})
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-400">Consultando el tipo de cambio...</p>
                )}
                <button type="button" className="boton-secundario w-fit" onClick={aplicarTipoCambioEnVivo}>
                  Actualizar con la tasa de hoy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cuota inicial: se puede ingresar como porcentaje o como monto. */}
          <Campo
            etiqueta="Cuota inicial"
            ayuda="Cuota inicial"
            descripcion="Pago que adelantas al inicio. Puedes ingresarlo como porcentaje del precio o como monto en dinero."
          >
            <div className="flex gap-2">
              <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-slate-300">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaInicial === "porcentaje" ? "bg-marca-600 text-white" : "bg-white text-slate-600"
                  }`}
                  onClick={() => setModoCuotaInicial("porcentaje")}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaInicial === "monto" ? "bg-marca-600 text-white" : "bg-white text-slate-600"
                  }`}
                  onClick={() => setModoCuotaInicial("monto")}
                  disabled={precioVehiculo <= 0}
                  title={precioVehiculo <= 0 ? "Selecciona un vehículo primero" : undefined}
                >
                  {simboloMoneda}
                </button>
              </div>
              {modoCuotaInicial === "porcentaje" ? (
                <input
                  className="campo-entrada"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={datos.porcentaje_cuota_inicial}
                  onChange={(evento) =>
                    actualizar("porcentaje_cuota_inicial", Number(evento.target.value))
                  }
                />
              ) : (
                <input
                  className="campo-entrada"
                  type="number"
                  step="0.01"
                  min="0"
                  max={precioVehiculo}
                  value={Number(montoCuotaInicial.toFixed(2))}
                  onChange={(evento) => cambiarMontoCuotaInicial(Number(evento.target.value))}
                />
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {precioVehiculo > 0
                ? modoCuotaInicial === "porcentaje"
                  ? `Equivale a ${formatoMoneda(montoCuotaInicial, monedaCredito)}`
                  : `Equivale al ${datos.porcentaje_cuota_inicial.toFixed(2)} % del precio`
                : "Selecciona un vehículo para ver la equivalencia."}
            </p>
          </Campo>

          {/* Cuota final (cuoton): parte del precio que se difiere al final. Editable;
              su valor por defecto viene del plan (40% Plan 36, 50% Plan 24). */}
          <Campo
            etiqueta="Cuota final (%)"
            ayuda="Cuota balon"
            descripcion="Parte del precio que se difiere y se paga al final del crédito. Por defecto la define el plan (40% en Plan 36, 50% en Plan 24), pero puedes cambiarla."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0"
              max="99"
              value={datos.porcentaje_cuota_final}
              onChange={(evento) =>
                actualizar("porcentaje_cuota_final", Number(evento.target.value))
              }
            />
            <p className="mt-1 text-xs text-slate-500">
              {precioVehiculo > 0
                ? `Equivale a ${formatoMoneda(montoCuotaFinal, monedaCredito)}, se paga en el periodo ${numeroCuotas + 1}.`
                : `Se paga en el periodo ${numeroCuotas + 1}.`}
            </p>
          </Campo>

          <Campo
            etiqueta="Meses de gracia total"
            ayuda="Gracia total"
            descripcion="Meses iniciales en los que no se paga capital ni intereses (los intereses se capitalizan). Los cargos sí se cobran."
          >
            <input
              className="campo-entrada"
              type="number"
              min="0"
              value={datos.meses_gracia_total}
              onChange={(evento) => actualizar("meses_gracia_total", Number(evento.target.value))}
            />
          </Campo>
          <Campo
            etiqueta="Meses de gracia parcial"
            ayuda="Gracia parcial"
            descripcion="Meses (a continuación de la gracia total) en los que solo se paga el interés; no se amortiza capital."
          >
            <input
              className="campo-entrada"
              type="number"
              min="0"
              value={datos.meses_gracia_parcial}
              onChange={(evento) => actualizar("meses_gracia_parcial", Number(evento.target.value))}
            />
          </Campo>
        </div>
      </section>

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={3} titulo="Seguros y costos" />

        {/* Seguros. Son PORCENTAJES, no montos. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Seguro de desgravamen (% mensual)"
            ayuda="Seguro de desgravamen"
            descripcion="Tasa mensual del seguro de desgravamen, aplicada sobre el saldo. Va incluida en la cuota. Es un porcentaje, por ejemplo 0.049 (= 0.049%)."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              placeholder="Ej: 0.049"
              value={datos.seguro_desgravamen_mensual}
              onChange={(evento) =>
                actualizar("seguro_desgravamen_mensual", Number(evento.target.value))
              }
            />
            <p className="mt-1 text-xs text-slate-500">Porcentaje mensual sobre el saldo.</p>
          </Campo>
          <Campo
            etiqueta="Seguro contra todo riesgo (% anual)"
            ayuda="Seguro vehicular"
            descripcion="Tasa anual del seguro vehicular sobre el precio del vehículo. Es un porcentaje, por ejemplo 0.30 (= 0.30%). Se prorratea por cuota."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              placeholder="Ej: 0.30"
              value={datos.seguro_riesgo_anual}
              onChange={(evento) => actualizar("seguro_riesgo_anual", Number(evento.target.value))}
            />
            <p className="mt-1 text-xs text-slate-500">
              {precioCredito > 0 && datos.seguro_riesgo_anual > 0
                ? `≈ ${formatoMoneda(
                    (datos.seguro_riesgo_anual / 100) * precioCredito / 12,
                    monedaCredito
                  )} por cuota`
                : "Porcentaje anual sobre el precio del vehículo."}
            </p>
          </Campo>
        </div>

        {/* Costos periodicos por cuota. */}
        <div className="border-t border-slate-200 pt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Costos periódicos (monto por cada cuota)
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Ingresa el monto de <span className="font-medium">una</span> cuota, no el total. Se cobran
            en cada uno de los {numeroCuotas + 1} periodos.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Campo etiqueta="GPS (por cuota)" ayuda="GPS" descripcion="Costo mensual del GPS que se cobra en cada cuota. Forma parte de la TCEA.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 20"
                value={datos.gps_periodico}
                onChange={(evento) => actualizar("gps_periodico", Number(evento.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">
                {datos.gps_periodico > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(datos.gps_periodico * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
            <Campo etiqueta="Portes (por cuota)" descripcion="Cargo mensual de portes que se cobra en cada cuota.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 3.50"
                value={datos.portes_periodico}
                onChange={(evento) => actualizar("portes_periodico", Number(evento.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">
                {datos.portes_periodico > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(datos.portes_periodico * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
            <Campo etiqueta="Gastos adm. (por cuota)" descripcion="Cargo mensual de gastos administrativos que se cobra en cada cuota.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 3.50"
                value={datos.gastos_adm_periodico}
                onChange={(evento) => actualizar("gastos_adm_periodico", Number(evento.target.value))}
              />
              <p className="mt-1 text-xs text-slate-500">
                {datos.gastos_adm_periodico > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(datos.gastos_adm_periodico * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
          </div>
        </div>

        {/* Costos / gastos iniciales con modalidad. */}
        <div className="border-t border-slate-200 pt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Costos / gastos iniciales
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Marca cada uno como <span className="font-medium">Financiado</span> (se suma al préstamo y
            se paga en las cuotas) o <span className="font-medium">Al contado</span> (lo pagas
            aparte). Déjalos en 0 si no aplican.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <CostoInicialCampo
              etiqueta="Gastos notariales"
              descripcion="Honorarios notariales de la operación."
              monto={datos.costo_notarial}
              financiado={datos.costo_notarial_financiado}
              onMonto={(v) => actualizar("costo_notarial", v)}
              onModalidad={(v) => actualizar("costo_notarial_financiado", v)}
            />
            <CostoInicialCampo
              etiqueta="Gastos registrales"
              descripcion="Gastos de inscripción en registros públicos (incluye la prenda vehicular)."
              monto={datos.costo_registral}
              financiado={datos.costo_registral_financiado}
              onMonto={(v) => actualizar("costo_registral", v)}
              onModalidad={(v) => actualizar("costo_registral_financiado", v)}
            />
            <CostoInicialCampo
              etiqueta="Tasación"
              descripcion="Costo de tasación del vehículo."
              monto={datos.costo_tasacion}
              financiado={datos.costo_tasacion_financiado}
              onMonto={(v) => actualizar("costo_tasacion", v)}
              onModalidad={(v) => actualizar("costo_tasacion_financiado", v)}
            />
            <CostoInicialCampo
              etiqueta="Comisión de estudio"
              descripcion="Comisión por el estudio y evaluación del crédito."
              monto={datos.comision_estudio}
              financiado={datos.comision_estudio_financiado}
              onMonto={(v) => actualizar("comision_estudio", v)}
              onModalidad={(v) => actualizar("comision_estudio_financiado", v)}
            />
            <CostoInicialCampo
              etiqueta="Comisión de activación"
              descripcion="Comisión por la activación del crédito."
              monto={datos.comision_activacion}
              financiado={datos.comision_activacion_financiado}
              onMonto={(v) => actualizar("comision_activacion", v)}
              onModalidad={(v) => actualizar("comision_activacion_financiado", v)}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="boton-primario"
          onClick={guardar}
          disabled={guardando || !datos.vehiculo_id}
        >
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar simulación"}
        </button>
        <button type="button" className="boton-secundario" onClick={calcular} disabled={calculando}>
          {calculando ? "Calculando..." : "Ver vista previa"}
        </button>
        <span className="self-center text-sm text-slate-500">
          Al guardar, la simulación queda en el historial.
        </span>
      </div>

      {resultado && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Resultado de la simulación</h2>
          <ResultadosSimulacion
            indicadores={resultado}
            cronograma={resultado.cronograma}
            tipoCambio={monedaCredito === "USD" ? datos.tipo_cambio_referencial : undefined}
          />
        </section>
      )}
    </div>
  );
}

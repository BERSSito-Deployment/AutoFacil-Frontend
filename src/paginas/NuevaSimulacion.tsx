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
  ETIQUETA_CAPITALIZACION,
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
  numero_cuotas: number;
  dias_anio: number;
  porcentaje_cuota_inicial: number;
  porcentaje_cuota_final: number;
  meses_gracia_total: number;
  meses_gracia_parcial: number;
  costo_notarial: string;
  costo_notarial_financiado: boolean;
  costo_registral: string;
  costo_registral_financiado: boolean;
  costo_tasacion: string;
  costo_tasacion_financiado: boolean;
  comision_estudio: string;
  comision_estudio_financiado: boolean;
  comision_activacion: string;
  comision_activacion_financiado: boolean;
  gps_periodico: string;
  portes_periodico: string;
  gastos_adm_periodico: string;
  seguro_desgravamen_mensual: string;
  seguro_riesgo_anual: string;
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
  numero_cuotas: 36,
  dias_anio: 360,
  porcentaje_cuota_inicial: 20,
  porcentaje_cuota_final: 40,
  meses_gracia_total: 0,
  meses_gracia_parcial: 0,
  costo_notarial: "",
  costo_notarial_financiado: true,
  costo_registral: "",
  costo_registral_financiado: true,
  costo_tasacion: "",
  costo_tasacion_financiado: true,
  comision_estudio: "",
  comision_estudio_financiado: true,
  comision_activacion: "",
  comision_activacion_financiado: true,
  gps_periodico: "",
  portes_periodico: "",
  gastos_adm_periodico: "",
  seguro_desgravamen_mensual: "",
  seguro_riesgo_anual: "",
  cok_anual: 20,
  actualizar_precio: false,
  fecha_inicio: "",
};

const CAPITALIZACIONES: Capitalizacion[] = [
  "DIARIA",
  "QUINCENAL",
  "MENSUAL",
  "BIMESTRAL",
  "TRIMESTRAL",
  "CUATRIMESTRAL",
  "SEMESTRAL",
  "ANUAL",
];

const CUOTA_FINAL_POR_PLAN: Record<string, number> = { PLAN_24: 50, PLAN_36: 40 };

type CampoMonto =
  | "costo_notarial"
  | "costo_registral"
  | "costo_tasacion"
  | "comision_estudio"
  | "comision_activacion"
  | "gps_periodico"
  | "portes_periodico"
  | "gastos_adm_periodico";

const CAMPOS_MONTO: CampoMonto[] = [
  "costo_notarial",
  "costo_registral",
  "costo_tasacion",
  "comision_estudio",
  "comision_activacion",
  "gps_periodico",
  "portes_periodico",
  "gastos_adm_periodico",
];

function aTexto(valor: number): string {
  return valor === 0 ? "" : String(valor);
}

function redondearMonto(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function aTextoMonto(valor: number): string {
  return redondearMonto(valor).toFixed(2);
}

function convertirTextoMonto(valor: string, factor: number): string {
  if (valor.trim() === "") {
    return valor;
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero === 0) {
    return valor;
  }
  return aTextoMonto(numero * factor);
}

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
  monto: string;
  financiado: boolean;
  onMonto: (valor: string) => void;
  onModalidad: (financiado: boolean) => void;
}) {
  return (
    <Campo etiqueta={etiqueta} descripcion={descripcion}>
      <input
        className="campo-entrada"
        type="number"
        step="0.01"
        min="0"
        placeholder="0"
        value={monto}
        onChange={(evento) => onMonto(evento.target.value)}
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
  const [modoCuotaInicial, setModoCuotaInicial] = useState<"porcentaje" | "monto">("porcentaje");
  const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);

  useEffect(() => {

    listarVehiculos()
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
          numero_cuotas: simulacion.numero_cuotas,
          dias_anio: simulacion.dias_anio,
          meses_gracia_total: simulacion.meses_gracia_total,
          meses_gracia_parcial: simulacion.meses_gracia_parcial,
          costo_notarial: aTexto(simulacion.costo_notarial),
          costo_notarial_financiado: simulacion.costo_notarial_financiado,
          costo_registral: aTexto(simulacion.costo_registral),
          costo_registral_financiado: simulacion.costo_registral_financiado,
          costo_tasacion: aTexto(simulacion.costo_tasacion),
          costo_tasacion_financiado: simulacion.costo_tasacion_financiado,
          comision_estudio: aTexto(simulacion.comision_estudio),
          comision_estudio_financiado: simulacion.comision_estudio_financiado,
          comision_activacion: aTexto(simulacion.comision_activacion),
          comision_activacion_financiado: simulacion.comision_activacion_financiado,
          gps_periodico: aTexto(simulacion.gps_periodico),
          portes_periodico: aTexto(simulacion.portes_periodico),
          gastos_adm_periodico: aTexto(simulacion.gastos_adm_periodico),
          seguro_desgravamen_mensual: aTexto(decimalAPorcentaje(simulacion.seguro_desgravamen_mensual)),
          seguro_riesgo_anual: aTexto(decimalAPorcentaje(simulacion.seguro_riesgo_anual)),
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
  const numeroCuotas =
    datos.plan === "PLAN_24" ? 24 : datos.plan === "PLAN_36" ? 36 : datos.numero_cuotas;
  const porcentajeCuotaFinal = datos.porcentaje_cuota_final;
  const montoCuotaFinal = (precioCredito * porcentajeCuotaFinal) / 100;
  const simboloMoneda = monedaCredito === "USD" ? "US$" : "S/";

  useEffect(() => {
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
            tipo_cambio_referencial:
              anterior.tipo_cambio_referencial === VALOR_INICIAL.tipo_cambio_referencial
                ? Number(tc.tasa.toFixed(4))
                : anterior.tipo_cambio_referencial,
          }));
        }
      })
      .catch(() => undefined);
    return () => {
      activo = false;
    };
  }, [editando]);

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

  const convertirImportes = (monedaDestino: Moneda) => {
    if (datos.moneda === monedaDestino) {
      return;
    }
    if (datos.tipo_cambio_referencial <= 0) {
      setError("Indica un tipo de cambio válido antes de convertir los montos.");
      return;
    }

    const factor =
      monedaDestino === "USD" ? 1 / datos.tipo_cambio_referencial : datos.tipo_cambio_referencial;

    setDatos((anterior) => {
      const convertido: FormularioSimulacion = {
        ...anterior,
        moneda: monedaDestino,
      };
      CAMPOS_MONTO.forEach((campo) => {
        convertido[campo] = convertirTextoMonto(anterior[campo], factor);
      });
      return convertido;
    });
    setError("");
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
    if (datos.plan === "PERSONALIZADO" && (!datos.numero_cuotas || datos.numero_cuotas < 1)) {
      return "Indica el número de meses del plan personalizado.";
    }
    if (datos.meses_gracia_total + datos.meses_gracia_parcial >= numeroCuotas) {
      return "Los meses de gracia deben ser menores que el número de cuotas del plan.";
    }
    if (datos.porcentaje_cuota_inicial > 100) {
      return "La cuota inicial no puede superar el 100% del precio.";
    }
    if (datos.porcentaje_cuota_inicial + porcentajeCuotaFinal >= 100) {
      return "La cuota inicial y la cuota final no pueden sumar el 100% del precio o más.";
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
    tipo_cambio_referencial: datos.tipo_cambio_referencial,
    plan: datos.plan,
    numero_cuotas: datos.plan === "PERSONALIZADO" ? datos.numero_cuotas : null,
    dias_anio: datos.dias_anio,
    porcentaje_cuota_inicial: porcentajeADecimal(datos.porcentaje_cuota_inicial),
    porcentaje_cuota_final: porcentajeADecimal(datos.porcentaje_cuota_final),
    tipo_tasa: datos.tipo_tasa,
    valor_tasa: porcentajeADecimal(datos.valor_tasa),
    capitalizacion: datos.tipo_tasa === "NOMINAL" ? (datos.capitalizacion as Capitalizacion) : null,
    meses_gracia_total: datos.meses_gracia_total,
    meses_gracia_parcial: datos.meses_gracia_parcial,
    costo_notarial: Number(datos.costo_notarial) || 0,
    costo_notarial_financiado: datos.costo_notarial_financiado,
    costo_registral: Number(datos.costo_registral) || 0,
    costo_registral_financiado: datos.costo_registral_financiado,
    costo_tasacion: Number(datos.costo_tasacion) || 0,
    costo_tasacion_financiado: datos.costo_tasacion_financiado,
    comision_estudio: Number(datos.comision_estudio) || 0,
    comision_estudio_financiado: datos.comision_estudio_financiado,
    comision_activacion: Number(datos.comision_activacion) || 0,
    comision_activacion_financiado: datos.comision_activacion_financiado,
    gps_periodico: Number(datos.gps_periodico) || 0,
    portes_periodico: Number(datos.portes_periodico) || 0,
    gastos_adm_periodico: Number(datos.gastos_adm_periodico) || 0,
    seguro_desgravamen_mensual: porcentajeADecimal(Number(datos.seguro_desgravamen_mensual) || 0),
    seguro_riesgo_anual: porcentajeADecimal(Number(datos.seguro_riesgo_anual) || 0),
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
          : await guardarSimulacion(carga);
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
        <p className="mt-1 text-xs text-slate-400">
          Basado en el financiamiento vehicular Compra Inteligente del banco Interbank.
        </p>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={1} titulo="Vehículo" />
        {vehiculos.length === 0 && (
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
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.marca} {vehiculo.modelo} - {formatoMoneda(vehiculo.precio, vehiculo.moneda)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Nombre de la simulación" descripcion="Etiqueta para reconocer esta simulación en tu historial. Es opcional.">
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
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="boton-secundario px-3 py-1.5 text-xs"
                onClick={() => convertirImportes("USD")}
                disabled={datos.moneda === "USD"}
              >
                Convertir montos a US$
              </button>
              <button
                type="button"
                className="boton-secundario px-3 py-1.5 text-xs"
                onClick={() => convertirImportes("PEN")}
                disabled={datos.moneda === "PEN"}
              >
                Convertir montos a S/
              </button>
            </div>
          </Campo>
          <Campo
            etiqueta="Plan de pagos"
            ayuda="Cuota balon"
            descripcion="Plan 24: 24 cuotas (cuota final sugerida 50%). Plan 36: 36 cuotas (sugerida 40%). Personalizado: tú eliges los meses. Al cambiar a Plan 24 o 36 la cuota final vuelve a la sugerida, pero puedes editarla."
          >
            <select
              className="campo-entrada"
              value={datos.plan}
              onChange={(evento) => {
                const nuevoPlan = evento.target.value as Plan;
                setDatos((anterior) => ({
                  ...anterior,
                  plan: nuevoPlan,
                  porcentaje_cuota_final:
                    CUOTA_FINAL_POR_PLAN[nuevoPlan] ?? anterior.porcentaje_cuota_final,
                }));
                setResultado(null);
              }}
            >
              <option value="PLAN_36">Plan 36 (36 cuotas)</option>
              <option value="PLAN_24">Plan 24 (24 cuotas)</option>
              <option value="PERSONALIZADO">Personalizado (elige los meses)</option>
            </select>
            {datos.plan === "PERSONALIZADO" && (
              <input
                className="campo-entrada mt-2"
                type="number"
                min="1"
                max="120"
                placeholder="Número de meses"
                value={datos.numero_cuotas}
                onChange={(evento) => actualizar("numero_cuotas", Number(evento.target.value))}
              />
            )}
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
                  {ETIQUETA_CAPITALIZACION[capitalizacion]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo
            etiqueta="Días por año"
            descripcion="Base para convertir las tasas: año ordinario de 360 días (12 cuotas exactas al año) o año natural de 365 días."
          >
            <select
              className="campo-entrada"
              value={datos.dias_anio}
              onChange={(evento) => actualizar("dias_anio", Number(evento.target.value))}
            >
              <option value={360}>Ordinario (360 días)</option>
              <option value={365}>Natural (365 días)</option>
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

        {(
          <div className="border-t border-slate-200 pt-4">
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
                  <p className="text-slate-500">
                    Tipo de cambio referencial:{" "}
                    <span className="font-semibold text-slate-900">
                      1 US$ = S/ {datos.tipo_cambio_referencial.toFixed(4)}
                    </span>
                    . Puedes editarlo si usarás otro valor.
                  </p>
                )}
                <button type="button" className="boton-secundario w-fit" onClick={aplicarTipoCambioEnVivo}>
                  Actualizar con la tasa de hoy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {}
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
                  disabled={precioCredito <= 0}
                  title={precioCredito <= 0 ? "Selecciona un vehículo primero" : undefined}
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
                  max={precioCredito}
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

          {}
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

        {}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Seguro de desgravamen (% mensual)"
            ayuda="Seguro de desgravamen"
            descripcion="Tasa mensual del seguro de desgravamen, aplicada sobre el saldo. Va incluida en la cuota. Se ingresa como porcentaje."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0"
              value={datos.seguro_desgravamen_mensual}
              onChange={(evento) =>
                actualizar("seguro_desgravamen_mensual", evento.target.value)
              }
            />
            <p className="mt-1 text-xs text-slate-500">Porcentaje mensual sobre el saldo.</p>
          </Campo>
          <Campo
            etiqueta="Seguro contra todo riesgo (% anual)"
            ayuda="Seguro vehicular"
            descripcion="Tasa anual del seguro vehicular sobre el precio del vehículo. Se ingresa como porcentaje y se reparte entre las cuotas."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0"
              value={datos.seguro_riesgo_anual}
              onChange={(evento) => actualizar("seguro_riesgo_anual", evento.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              {precioCredito > 0 && Number(datos.seguro_riesgo_anual) > 0
                ? `≈ ${formatoMoneda(
                    (Number(datos.seguro_riesgo_anual) / 100) * precioCredito / 12,
                    monedaCredito
                  )} por cuota`
                : "Porcentaje anual sobre el precio del vehículo."}
            </p>
          </Campo>
        </div>

        {}
        <div className="border-t border-slate-200 pt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Costos periódicos (monto por cada cuota)
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Ingresa el monto de una cuota, no el total. Se cobran en cada uno de los periodos.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Campo etiqueta="GPS (por cuota)" ayuda="GPS" descripcion="Costo mensual del GPS que se cobra en cada cuota. Forma parte de la TCEA.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={datos.gps_periodico}
                onChange={(evento) => actualizar("gps_periodico", evento.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                {Number(datos.gps_periodico) > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(Number(datos.gps_periodico) * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
            <Campo etiqueta="Portes (por cuota)" descripcion="Cargo mensual de portes que se cobra en cada cuota.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={datos.portes_periodico}
                onChange={(evento) => actualizar("portes_periodico", evento.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                {Number(datos.portes_periodico) > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(Number(datos.portes_periodico) * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
            <Campo etiqueta="Gastos adm. (por cuota)" descripcion="Cargo mensual de gastos administrativos que se cobra en cada cuota.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={datos.gastos_adm_periodico}
                onChange={(evento) => actualizar("gastos_adm_periodico", evento.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                {Number(datos.gastos_adm_periodico) > 0
                  ? `× ${numeroCuotas + 1} = ${formatoMoneda(Number(datos.gastos_adm_periodico) * (numeroCuotas + 1), monedaCredito)} en total`
                  : "Monto por cada cuota."}
              </p>
            </Campo>
          </div>
        </div>

        { }
        <div className="border-t border-slate-200 pt-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Costos / gastos iniciales
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Si eliges Financiado, el monto se suma al préstamo.
            Si lo pagarás por separado, selecciona Al contado. Si no aplica,
            déjalo en 0.
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
            tipoCambio={datos.tipo_cambio_referencial > 0 ? datos.tipo_cambio_referencial : undefined}
          />
        </section>
      )}
    </div>
  );
}

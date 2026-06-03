// Pagina para crear (o editar) una simulacion: seleccion, parametros y calculo.
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
  listarClientes,
  listarVehiculos,
  obtenerSimulacion,
  obtenerTipoCambio,
} from "../api/servicios";
import type {
  Capitalizacion,
  Cliente,
  Moneda,
  ParametrosSimulacion,
  ResultadoCalculo,
  TipoCambio,
  TipoGracia,
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
  cliente_id: number;
  vehiculo_id: number;
  moneda: Moneda;
  tipo_cambio_referencial: number;
  tipo_tasa: TipoTasa;
  valor_tasa: number;
  capitalizacion: Capitalizacion | "";
  plazo_meses: number;
  porcentaje_cuota_inicial: number;
  porcentaje_cuota_final: number;
  tipo_gracia: TipoGracia;
  meses_gracia: number;
  seguro_desgravamen_anual: number;
  desgravamen_consentido: boolean;
  seguro_vehicular_mensual: number;
  gps_instalacion: number;
  gps_mantenimiento_mensual: number;
  gps_reposicion: number;
  gastos_notariales: number;
  gastos_registrales: number;
  tasacion: number;
  cok_anual: number;
  tasa_descuento_van: number;
  tasa_moratoria_anual: number;
  aseguradora: string;
  numero_poliza: string;
  coberturas: string;
  actualizar_precio: boolean;
  fecha_inicio: string;
}

const VALOR_INICIAL: FormularioSimulacion = {
  nombre: "",
  cliente_id: 0,
  vehiculo_id: 0,
  moneda: "PEN",
  tipo_cambio_referencial: 3.75,
  tipo_tasa: "EFECTIVA",
  valor_tasa: 14.5,
  capitalizacion: "",
  plazo_meses: 48,
  porcentaje_cuota_inicial: 20,
  porcentaje_cuota_final: 0,
  tipo_gracia: "NINGUNA",
  meses_gracia: 0,
  seguro_desgravamen_anual: 0,
  desgravamen_consentido: false,
  seguro_vehicular_mensual: 0,
  gps_instalacion: 0,
  gps_mantenimiento_mensual: 0,
  gps_reposicion: 0,
  gastos_notariales: 0,
  gastos_registrales: 0,
  tasacion: 0,
  cok_anual: 12,
  tasa_descuento_van: 12,
  tasa_moratoria_anual: 0,
  aseguradora: "",
  numero_poliza: "",
  coberturas: "",
  actualizar_precio: false,
  fecha_inicio: "",
};

const CAPITALIZACIONES: Capitalizacion[] = [
  "DIARIA",
  "MENSUAL",
  "BIMESTRAL",
  "TRIMESTRAL",
  "CUATRIMESTRAL",
  "SEMESTRAL",
  "ANUAL",
];

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

export function NuevaSimulacion() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();
  const [parametrosUrl] = useSearchParams();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [datos, setDatos] = useState<FormularioSimulacion>(VALOR_INICIAL);
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const [cargandoListas, setCargandoListas] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  // La cuota inicial y la cuota balon pueden ingresarse como % del precio o como monto.
  const [modoCuotaInicial, setModoCuotaInicial] = useState<"porcentaje" | "monto">("porcentaje");
  const [modoCuotaFinal, setModoCuotaFinal] = useState<"porcentaje" | "monto">("porcentaje");
  // Permite incluir o excluir del calculo los seguros y cargos del credito.
  const [incluirCargos, setIncluirCargos] = useState(true);
  // Tipo de cambio en tiempo real (solo informativo, para creditos en Dolares).
  const [tipoCambio, setTipoCambio] = useState<TipoCambio | null>(null);

  // Se ofrecen todos los vehiculos activos del asesor.
  const vehiculosActivos = useMemo(
    () => vehiculos.filter((v) => v.activo),
    [vehiculos]
  );

  useEffect(() => {
    // Al editar se incluyen los vehiculos dados de baja para que la propuesta
    // historica muestre su vehiculo aunque ya no este activo.
    Promise.all([listarClientes(), listarVehiculos(undefined, editando)])
      .then(([listaClientes, listaVehiculos]) => {
        setClientes(listaClientes);
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
          cliente_id: simulacion.cliente_id,
          vehiculo_id: simulacion.vehiculo_id,
          moneda: simulacion.moneda,
          tipo_cambio_referencial: simulacion.tipo_cambio_referencial ?? 3.75,
          tipo_tasa: simulacion.tipo_tasa,
          valor_tasa: decimalAPorcentaje(simulacion.tasa_ingresada),
          capitalizacion: simulacion.capitalizacion ?? "",
          plazo_meses: simulacion.plazo_meses,
          porcentaje_cuota_inicial: decimalAPorcentaje(simulacion.porcentaje_cuota_inicial),
          porcentaje_cuota_final: decimalAPorcentaje(simulacion.porcentaje_cuota_final),
          tipo_gracia: simulacion.tipo_gracia,
          meses_gracia: simulacion.meses_gracia,
          seguro_desgravamen_anual: decimalAPorcentaje(simulacion.seguro_desgravamen_anual),
          desgravamen_consentido: simulacion.desgravamen_consentido,
          seguro_vehicular_mensual: simulacion.seguro_vehicular_mensual,
          gps_instalacion: simulacion.gps_instalacion,
          gps_mantenimiento_mensual: simulacion.gps_mantenimiento_mensual,
          gps_reposicion: simulacion.gps_reposicion,
          gastos_notariales: simulacion.gastos_notariales,
          gastos_registrales: simulacion.gastos_registrales,
          tasacion: simulacion.tasacion,
          cok_anual: decimalAPorcentaje(simulacion.cok_anual),
          tasa_descuento_van: decimalAPorcentaje(
            simulacion.tasa_descuento_van ?? simulacion.cok_anual
          ),
          tasa_moratoria_anual: decimalAPorcentaje(simulacion.tasa_moratoria_anual),
          actualizar_precio: false,
          aseguradora: simulacion.aseguradora ?? "",
          numero_poliza: simulacion.numero_poliza ?? "",
          coberturas: simulacion.coberturas ?? "",
          fecha_inicio: simulacion.fecha_inicio,
        });
        setIncluirCargos(
          simulacion.seguro_desgravamen_anual > 0 ||
            simulacion.seguro_vehicular_mensual > 0 ||
            simulacion.gps_instalacion > 0 ||
            simulacion.gps_mantenimiento_mensual > 0 ||
            simulacion.gps_reposicion > 0 ||
            simulacion.gastos_notariales > 0 ||
            simulacion.gastos_registrales > 0 ||
            simulacion.tasacion > 0
        );
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
    if (
      vehiculoSeleccionado &&
      !vehiculosActivos.some((v) => v.id === vehiculoSeleccionado.id)
    ) {
      return [vehiculoSeleccionado, ...vehiculosActivos];
    }
    return vehiculosActivos;
  }, [vehiculoSeleccionado, vehiculosActivos]);

  // La moneda del credito la elige el asesor y puede diferir de la del vehiculo:
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
  const montoCuotaFinal = (precioCredito * datos.porcentaje_cuota_final) / 100;
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

  // Cualquier cambio de parametro invalida el resultado calculado previamente:
  // hay que volver a calcular antes de poder guardar.
  const actualizar = (
    campo: keyof FormularioSimulacion,
    valor: string | number | boolean
  ) => {
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

  const cambiarMontoCuotaFinal = (monto: number) => {
    if (precioCredito <= 0) {
      return;
    }
    const porcentaje = (monto / precioCredito) * 100;
    setDatos((anterior) => ({
      ...anterior,
      porcentaje_cuota_final: Math.round(porcentaje * 1e6) / 1e6,
    }));
    setResultado(null);
  };

  const validar = (): string | null => {
    if (!datos.cliente_id) {
      return "Debe seleccionar un cliente.";
    }
    if (!datos.vehiculo_id) {
      return "Debe seleccionar un vehículo.";
    }
    if (datos.tipo_tasa === "NOMINAL" && !datos.capitalizacion) {
      return "Debe indicar la capitalización cuando la tasa es nominal.";
    }
    if (datos.tipo_gracia !== "NINGUNA" && datos.meses_gracia >= datos.plazo_meses) {
      return "Los meses de gracia deben ser menores que el plazo total.";
    }
    if (datos.porcentaje_cuota_inicial > 100) {
      return "La cuota inicial no puede superar el 100% del precio.";
    }
    if (datos.porcentaje_cuota_inicial + datos.porcentaje_cuota_final >= 100) {
      return "La cuota inicial y la cuota balón no pueden sumar el 100% del precio o más.";
    }
    if (requiereTipoCambio && datos.tipo_cambio_referencial <= 0) {
      return "Indica un tipo de cambio válido para simular en una moneda distinta a la del vehículo.";
    }
    return null;
  };

  const construirCarga = (): ParametrosSimulacion => ({
    cliente_id: datos.cliente_id,
    vehiculo_id: datos.vehiculo_id,
    nombre: datos.nombre.trim() || null,
    moneda: monedaCredito,
    // Se envia el tipo de cambio cuando la moneda del credito difiere de la del
    // vehiculo, o cuando el credito es en Dolares (equivalencias informativas).
    tipo_cambio_referencial:
      requiereTipoCambio || monedaCredito === "USD" ? datos.tipo_cambio_referencial : null,
    tipo_tasa: datos.tipo_tasa,
    valor_tasa: porcentajeADecimal(datos.valor_tasa),
    capitalizacion: datos.tipo_tasa === "NOMINAL" ? (datos.capitalizacion as Capitalizacion) : null,
    plazo_meses: datos.plazo_meses,
    porcentaje_cuota_inicial: porcentajeADecimal(datos.porcentaje_cuota_inicial),
    porcentaje_cuota_final: porcentajeADecimal(datos.porcentaje_cuota_final),
    tipo_gracia: datos.tipo_gracia,
    meses_gracia: datos.tipo_gracia === "NINGUNA" ? 0 : datos.meses_gracia,
    // Si los seguros y cargos estan desactivados, se envian en cero.
    seguro_desgravamen_anual: incluirCargos
      ? porcentajeADecimal(datos.seguro_desgravamen_anual)
      : 0,
    desgravamen_consentido: incluirCargos ? datos.desgravamen_consentido : false,
    seguro_vehicular_mensual: incluirCargos ? datos.seguro_vehicular_mensual : 0,
    gps_instalacion: incluirCargos ? datos.gps_instalacion : 0,
    gps_mantenimiento_mensual: incluirCargos ? datos.gps_mantenimiento_mensual : 0,
    gps_reposicion: incluirCargos ? datos.gps_reposicion : 0,
    gastos_notariales: incluirCargos ? datos.gastos_notariales : 0,
    gastos_registrales: incluirCargos ? datos.gastos_registrales : 0,
    tasacion: incluirCargos ? datos.tasacion : 0,
    cok_anual: porcentajeADecimal(datos.cok_anual),
    tasa_descuento_van: porcentajeADecimal(datos.tasa_descuento_van),
    tasa_moratoria_anual: porcentajeADecimal(datos.tasa_moratoria_anual),
    aseguradora: datos.aseguradora.trim() || null,
    numero_poliza: datos.numero_poliza.trim() || null,
    coberturas: datos.coberturas.trim() || null,
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
      // Al editar no se cambia el estado de la simulacion (lo conserva el backend).
      // Solo se actualiza el precio al actual del vehiculo si el asesor lo pidio.
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
          Producto Compra Inteligente: elige el cliente y el vehículo, define la cuota inicial, la
          cuota balón final y los cargos, y pulsa
          <span className="font-medium text-slate-700"> Ver vista previa</span> para revisar la
          cuota y la TCEA antes de guardar.
        </p>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={1} titulo="Cliente y vehículo" />
        {(vehiculosActivos.length === 0 || clientes.length === 0) && (
          <Mensaje tipo="info">
            Necesitas al menos un cliente y un vehículo. Agrégalos en las secciones "Clientes" y
            "Catálogo vehicular" para poder simular.
          </Mensaje>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Campo etiqueta="Cliente" descripcion="Persona interesada en el crédito. Regístrala antes en la sección Clientes.">
            <select
              className="campo-entrada"
              value={datos.cliente_id}
              onChange={(evento) => actualizar("cliente_id", Number(evento.target.value))}
            >
              <option value={0}>Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombres} {cliente.apellidos} - {cliente.numero_documento}
                </option>
              ))}
            </select>
          </Campo>
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
          <Campo etiqueta="Nombre de la simulación" descripcion="Etiqueta para reconocer esta simulación (por ejemplo: Compra Inteligente a 48 meses). Es opcional.">
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
          <Campo etiqueta="Tipo de tasa" ayuda="Tasa efectiva">
            <select
              className="campo-entrada"
              value={datos.tipo_tasa}
              onChange={(evento) => actualizar("tipo_tasa", evento.target.value as TipoTasa)}
            >
              <option value="EFECTIVA">Efectiva anual (TEA)</option>
              <option value="NOMINAL">Nominal anual (TNA)</option>
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
          <Campo etiqueta="Capitalización" ayuda="Capitalizacion">
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
                  {capitalizacion}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {(requiereTipoCambio || monedaCredito === "USD") && (
          <div className="rounded-md border border-marca-100 bg-marca-50/60 p-4">
            {requiereTipoCambio && (
              <p className="mb-3 text-xs text-slate-600">
                El vehículo está en {ETIQUETA_MONEDA[monedaVehiculo]} y el crédito en{" "}
                {ETIQUETA_MONEDA[monedaCredito]}: el precio se convierte con este tipo de cambio,
                que queda guardado en la simulación.
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
                <button
                  type="button"
                  className="boton-secundario w-fit"
                  onClick={aplicarTipoCambioEnVivo}
                >
                  Actualizar con la tasa de hoy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Plazo (meses)" descripcion="Número total de meses del crédito, incluyendo los meses de gracia.">
            <input
              className="campo-entrada"
              type="number"
              min="1"
              value={datos.plazo_meses}
              onChange={(evento) => actualizar("plazo_meses", Number(evento.target.value))}
            />
          </Campo>

          {/* Cuota inicial: el asesor elige ingresarla como porcentaje o como monto. */}
          <Campo
            etiqueta="Cuota inicial"
            ayuda="Cuota inicial"
            descripcion="Pago que adelanta el cliente al inicio. Puedes ingresarlo como porcentaje del precio o como monto en dinero."
          >
            <div className="flex gap-2">
              <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-slate-300">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaInicial === "porcentaje"
                      ? "bg-marca-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                  onClick={() => setModoCuotaInicial("porcentaje")}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaInicial === "monto"
                      ? "bg-marca-600 text-white"
                      : "bg-white text-slate-600"
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

          {/* Cuota balon (Compra Inteligente): valor futuro pagado al final. */}
          <Campo
            etiqueta="Cuota balón (final)"
            descripcion="Valor futuro del vehículo que se paga al final del crédito (cuota balón de Compra Inteligente). Reduce las cuotas mensuales. Ingrésalo como porcentaje del precio o como monto."
          >
            <div className="flex gap-2">
              <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-slate-300">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaFinal === "porcentaje"
                      ? "bg-marca-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                  onClick={() => setModoCuotaFinal("porcentaje")}
                >
                  %
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm font-medium ${
                    modoCuotaFinal === "monto"
                      ? "bg-marca-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                  onClick={() => setModoCuotaFinal("monto")}
                  disabled={precioVehiculo <= 0}
                  title={precioVehiculo <= 0 ? "Selecciona un vehículo primero" : undefined}
                >
                  {simboloMoneda}
                </button>
              </div>
              {modoCuotaFinal === "porcentaje" ? (
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
              ) : (
                <input
                  className="campo-entrada"
                  type="number"
                  step="0.01"
                  min="0"
                  max={precioVehiculo}
                  value={Number(montoCuotaFinal.toFixed(2))}
                  onChange={(evento) => cambiarMontoCuotaFinal(Number(evento.target.value))}
                />
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {precioVehiculo > 0
                ? modoCuotaFinal === "porcentaje"
                  ? `Equivale a ${formatoMoneda(montoCuotaFinal, monedaCredito)}`
                  : `Equivale al ${datos.porcentaje_cuota_final.toFixed(2)} % del precio`
                : "Déjalo en 0 para un crédito sin cuota balón."}
            </p>
          </Campo>

          <Campo
            etiqueta="Período de gracia"
            ayuda="Gracia total"
            descripcion="Total: no se pagan capital ni intereses (se capitalizan), pero los seguros y cargos sí se cobran. Parcial: se pagan solo los intereses y los cargos; no se amortiza capital."
          >
            <select
              className="campo-entrada"
              value={datos.tipo_gracia}
              onChange={(evento) => actualizar("tipo_gracia", evento.target.value as TipoGracia)}
            >
              <option value="NINGUNA">Sin gracia</option>
              <option value="TOTAL">Gracia total</option>
              <option value="PARCIAL">Gracia parcial</option>
            </select>
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Meses de gracia" ayuda="Gracia parcial">
            <input
              className="campo-entrada"
              type="number"
              min="0"
              value={datos.meses_gracia}
              disabled={datos.tipo_gracia === "NINGUNA"}
              onChange={(evento) => actualizar("meses_gracia", Number(evento.target.value))}
            />
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
            descripcion="Rendimiento mínimo anual que el cliente esperaría de un uso alternativo de su dinero."
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
          <Campo
            etiqueta="Tasa de Descuento VAN (%)"
            ayuda="VAN"
            descripcion="Tasa anual con la que se descuenta el flujo para calcular el VAN. Si la dejas igual al COK, el VAN se evalúa al costo de oportunidad."
          >
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              value={datos.tasa_descuento_van}
              onChange={(evento) => actualizar("tasa_descuento_van", Number(evento.target.value))}
            />
          </Campo>
        </div>
      </section>

      <section className="tarjeta space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Paso numero={3} titulo="Seguros y cargos del crédito" />
          <button
            type="button"
            role="switch"
            aria-checked={incluirCargos}
            onClick={() => {
              setIncluirCargos((v) => !v);
              setResultado(null);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              incluirCargos
                ? "border-marca-200 bg-marca-50 text-marca-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <span
              className={`relative h-4 w-7 rounded-full transition-colors ${
                incluirCargos ? "bg-marca-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                  incluirCargos ? "left-3.5" : "left-0.5"
                }`}
              />
            </span>
            {incluirCargos ? "Cargos incluidos" : "Cargos desactivados"}
          </button>
        </div>
        {!incluirCargos && (
          <p className="text-xs text-slate-500">
            Los seguros y cargos están desactivados: la simulación se calcula sin ellos. Actívalos
            para incluirlos en la cuota y en la TCEA.
          </p>
        )}
        <fieldset disabled={!incluirCargos} className="space-y-5 disabled:opacity-50">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Seguro de desgravamen (%)"
            ayuda="Seguro de desgravamen"
            descripcion="Tasa anual del seguro de desgravamen. Es opcional: solo se cobra si el cliente lo contrató (Res. SBS 890-2025)."
          >
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-marca-600 focus:ring-marca-500"
                checked={datos.desgravamen_consentido}
                onChange={(evento) => actualizar("desgravamen_consentido", evento.target.checked)}
              />
              El cliente contrató el seguro de desgravamen
            </label>
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              value={datos.seguro_desgravamen_anual}
              disabled={!datos.desgravamen_consentido}
              onChange={(evento) =>
                actualizar("seguro_desgravamen_anual", Number(evento.target.value))
              }
            />
          </Campo>
          <Campo etiqueta="Seguro vehicular mensual" descripcion="Monto fijo mensual del seguro vehicular. Se incluye en cada cuota y forma parte de la TCEA. Déjalo en 0 si no aplica.">
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0"
              value={datos.seguro_vehicular_mensual}
              onChange={(evento) =>
                actualizar("seguro_vehicular_mensual", Number(evento.target.value))
              }
            />
          </Campo>
        </div>

        {/* GPS: instalacion (unica al desembolso), mantenimiento (mensual) y reposicion (referencial). */}
        <div className="rounded-md border border-slate-200 bg-slate-50/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            GPS (dispositivo de rastreo)
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Campo etiqueta="Instalación (cargo único)" descripcion="Costo único de instalación del GPS. Se cobra al desembolso y forma parte de la TCEA.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.gps_instalacion}
                onChange={(evento) => actualizar("gps_instalacion", Number(evento.target.value))}
              />
            </Campo>
            <Campo etiqueta="Mantenimiento mensual" descripcion="Costo mensual de mantenimiento del GPS. Se incluye en cada cuota y forma parte de la TCEA.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.gps_mantenimiento_mensual}
                onChange={(evento) =>
                  actualizar("gps_mantenimiento_mensual", Number(evento.target.value))
                }
              />
            </Campo>
            <Campo etiqueta="Reposición (referencial)" descripcion="Costo de reposición del GPS ante pérdida o reemplazo. Es un tarifario informativo: NO se cobra al contratar ni afecta la TCEA; se muestra solo como referencia.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.gps_reposicion}
                onChange={(evento) => actualizar("gps_reposicion", Number(evento.target.value))}
              />
            </Campo>
          </div>
        </div>

        {/* Gastos de terceros que se financian (se suman al monto y entran en la TCEA). */}
        <div className="rounded-md border border-slate-200 bg-slate-50/60 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Gastos de terceros (se financian)
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Son opcionales. Se suman al monto financiado y se pagan dentro de las cuotas, por lo que
            forman parte de la TCEA. Déjalos en 0 si no aplican.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Campo etiqueta="Gastos notariales" descripcion="Honorarios notariales de la operación.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.gastos_notariales}
                onChange={(evento) => actualizar("gastos_notariales", Number(evento.target.value))}
              />
            </Campo>
            <Campo etiqueta="Gastos registrales" descripcion="Gastos de inscripción en registros públicos (incluye la prenda vehicular).">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.gastos_registrales}
                onChange={(evento) =>
                  actualizar("gastos_registrales", Number(evento.target.value))
                }
              />
            </Campo>
            <Campo etiqueta="Tasación" descripcion="Costo de tasación del vehículo.">
              <input
                className="campo-entrada"
                type="number"
                step="0.01"
                min="0"
                value={datos.tasacion}
                onChange={(evento) => actualizar("tasacion", Number(evento.target.value))}
              />
            </Campo>
          </div>
        </div>
        </fieldset>
      </section>

      <section className="tarjeta space-y-5 p-6">
        <Paso numero={4} titulo="Transparencia para el cliente (opcional)" />
        <p className="text-sm text-slate-500">
          Estos datos no alteran el cálculo: se muestran en la hoja resumen que se comparte con el
          cliente (art. 25 del Reglamento de Transparencia SBS).
        </p>
        <p className="text-xs text-slate-500">
          La tasa de interés del crédito es fija (efectiva o nominal). Durante un período de gracia
          total no se pagan capital ni intereses (se capitalizan), pero los seguros y cargos sí se
          cobran cada mes.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Tasa moratoria anual (%)" descripcion="Tasa de mora nominal anual (no capitalizable) aplicable ante atrasos, según la SBS. Es informativa: no entra en la cuota ni en la TCEA.">
            <input
              className="campo-entrada"
              type="number"
              step="0.0001"
              min="0"
              value={datos.tasa_moratoria_anual}
              onChange={(evento) => actualizar("tasa_moratoria_anual", Number(evento.target.value))}
            />
          </Campo>
          <Campo etiqueta="Aseguradora" descripcion="Compañía de seguros de la póliza vehicular.">
            <input
              className="campo-entrada"
              value={datos.aseguradora}
              placeholder="Opcional"
              onChange={(evento) => actualizar("aseguradora", evento.target.value)}
            />
          </Campo>
          <Campo etiqueta="Número de póliza" descripcion="Identificador de la póliza del seguro.">
            <input
              className="campo-entrada"
              value={datos.numero_poliza}
              placeholder="Opcional"
              onChange={(evento) => actualizar("numero_poliza", evento.target.value)}
            />
          </Campo>
        </div>
        <Campo etiqueta="Principales coberturas" descripcion="Resumen de las coberturas del seguro para informar al cliente.">
          <textarea
            className="campo-entrada min-h-[80px]"
            value={datos.coberturas}
            placeholder="Opcional (por ejemplo: todo riesgo, robo, responsabilidad civil)"
            onChange={(evento) => actualizar("coberturas", evento.target.value)}
          />
        </Campo>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="boton-primario"
          onClick={guardar}
          disabled={guardando || !datos.cliente_id || !datos.vehiculo_id}
        >
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Guardar simulación"}
        </button>
        <button
          type="button"
          className="boton-secundario"
          onClick={calcular}
          disabled={calculando}
        >
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

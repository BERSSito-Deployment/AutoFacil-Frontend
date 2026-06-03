// Formulario de creacion y edicion de clientes de la entidad.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Campo } from "../componentes/Campo";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { mensajeError } from "../api/cliente";
import { actualizarCliente, crearCliente, obtenerCliente } from "../api/servicios";
import type { Cliente, Moneda } from "../tipos";
import { ETIQUETA_MONEDA } from "../utilidades/formato";

type FormularioCliente = Omit<
  Cliente,
  "id" | "activo" | "fecha_creacion" | "fecha_actualizacion"
>;

const VALOR_INICIAL: FormularioCliente = {
  tipo_documento: "DNI",
  numero_documento: "",
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
  direccion: "",
  fecha_nacimiento: "",
  ingreso_mensual: 0,
  gastos_mensuales: 0,
  otras_deudas: 0,
  moneda_ingresos: "PEN",
};

export function ClienteFormulario() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();

  const [datos, setDatos] = useState<FormularioCliente>(VALOR_INICIAL);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }
    obtenerCliente(Number(id))
      .then((cliente) =>
        setDatos({
          tipo_documento: cliente.tipo_documento,
          numero_documento: cliente.numero_documento,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          correo: cliente.correo ?? "",
          telefono: cliente.telefono ?? "",
          direccion: cliente.direccion ?? "",
          fecha_nacimiento: cliente.fecha_nacimiento ?? "",
          ingreso_mensual: cliente.ingreso_mensual,
          gastos_mensuales: cliente.gastos_mensuales,
          otras_deudas: cliente.otras_deudas,
          moneda_ingresos: cliente.moneda_ingresos,
        })
      )
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const actualizar = (campo: keyof FormularioCliente, valor: string | number) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    const carga: Record<string, unknown> = { ...datos };
    ["correo", "telefono", "direccion", "fecha_nacimiento"].forEach((campo) => {
      if (!carga[campo]) {
        carga[campo] = null;
      }
    });
    try {
      if (editando && id) {
        await actualizarCliente(Number(id), carga);
      } else {
        await crearCliente(carga);
      }
      navegar("/clientes");
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar el cliente."));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <Cargando mensaje="Cargando cliente..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">
        {editando ? "Editar cliente" : "Nuevo cliente"}
      </h1>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <form onSubmit={enviar} className="tarjeta space-y-5 p-6">
        <p className="titulo-seccion">Identificación</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo etiqueta="Tipo de documento" descripcion="Tipo de documento de identidad del cliente.">
            <select
              className="campo-entrada"
              value={datos.tipo_documento}
              onChange={(evento) => actualizar("tipo_documento", evento.target.value)}
            >
              <option value="DNI">DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="RUC">RUC</option>
            </select>
          </Campo>
          <Campo etiqueta="Número de documento" className="sm:col-span-2" descripcion="Número del documento. Debe ser único por cliente.">
            <input
              className="campo-entrada"
              value={datos.numero_documento}
              onChange={(evento) => actualizar("numero_documento", evento.target.value)}
              required
            />
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombres" descripcion="Nombres del cliente.">
            <input
              className="campo-entrada"
              value={datos.nombres}
              onChange={(evento) => actualizar("nombres", evento.target.value)}
              required
            />
          </Campo>
          <Campo etiqueta="Apellidos" descripcion="Apellidos del cliente.">
            <input
              className="campo-entrada"
              value={datos.apellidos}
              onChange={(evento) => actualizar("apellidos", evento.target.value)}
              required
            />
          </Campo>
        </div>

        <p className="titulo-seccion">Contacto</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Correo electrónico" descripcion="Correo de contacto. Opcional.">
            <input
              className="campo-entrada"
              type="email"
              value={datos.correo ?? ""}
              onChange={(evento) => actualizar("correo", evento.target.value)}
            />
          </Campo>
          <Campo etiqueta="Teléfono" descripcion="Teléfono de contacto. Opcional.">
            <input
              className="campo-entrada"
              value={datos.telefono ?? ""}
              onChange={(evento) => actualizar("telefono", evento.target.value)}
            />
          </Campo>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Dirección" descripcion="Dirección del cliente. Opcional.">
            <input
              className="campo-entrada"
              value={datos.direccion ?? ""}
              onChange={(evento) => actualizar("direccion", evento.target.value)}
            />
          </Campo>
          <Campo etiqueta="Fecha de nacimiento" descripcion="Fecha de nacimiento. Opcional.">
            <input
              className="campo-entrada"
              type="date"
              value={datos.fecha_nacimiento ?? ""}
              onChange={(evento) => actualizar("fecha_nacimiento", evento.target.value)}
            />
          </Campo>
        </div>

        <p className="titulo-seccion">Información económica (opcional)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Moneda de ingresos" descripcion="Moneda en la que el cliente percibe sus ingresos.">
            <select
              className="campo-entrada"
              value={datos.moneda_ingresos}
              onChange={(evento) => actualizar("moneda_ingresos", evento.target.value as Moneda)}
            >
              {Object.entries(ETIQUETA_MONEDA).map(([codigo, etiqueta]) => (
                <option key={codigo} value={codigo}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Ingreso mensual" descripcion="Ingreso mensual neto declarado.">
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0"
              value={datos.ingreso_mensual}
              onChange={(evento) => actualizar("ingreso_mensual", Number(evento.target.value))}
            />
          </Campo>
          <Campo etiqueta="Gastos mensuales" descripcion="Gastos mensuales estimados.">
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0"
              value={datos.gastos_mensuales}
              onChange={(evento) => actualizar("gastos_mensuales", Number(evento.target.value))}
            />
          </Campo>
          <Campo etiqueta="Otras deudas" descripcion="Cuotas mensuales de otras deudas vigentes.">
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0"
              value={datos.otras_deudas}
              onChange={(evento) => actualizar("otras_deudas", Number(evento.target.value))}
            />
          </Campo>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="boton-secundario" onClick={() => navegar("/clientes")}>
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

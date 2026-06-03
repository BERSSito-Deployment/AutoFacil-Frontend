// Formulario de creacion y edicion de vehiculos.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Campo } from "../componentes/Campo";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { mensajeError } from "../api/cliente";
import { actualizarVehiculo, crearVehiculo, obtenerVehiculo } from "../api/servicios";
import type { Moneda, Vehiculo } from "../tipos";
import { ETIQUETA_MONEDA } from "../utilidades/formato";

type FormularioVehiculo = Omit<
  Vehiculo,
  "id" | "activo" | "fecha_creacion" | "fecha_actualizacion"
>;

const VALOR_INICIAL: FormularioVehiculo = {
  marca: "",
  modelo: "",
  version: "",
  anio: new Date().getFullYear(),
  tipo: "",
  precio: 0,
  moneda: "PEN",
  descripcion: "",
  url_imagen: "",
};

export function VehiculoFormulario() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();

  const [datos, setDatos] = useState<FormularioVehiculo>(VALOR_INICIAL);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    obtenerVehiculo(Number(id))
      .then((vehiculo) =>
        setDatos({
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          version: vehiculo.version ?? "",
          anio: vehiculo.anio,
          tipo: vehiculo.tipo ?? "",
          precio: vehiculo.precio,
          moneda: vehiculo.moneda,
          descripcion: vehiculo.descripcion ?? "",
          url_imagen: vehiculo.url_imagen ?? "",
        })
      )
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const actualizar = (campo: keyof FormularioVehiculo, valor: string | number) => {
    if (campo === "url_imagen" || campo === "marca" || campo === "tipo") {
      setErrorImagen(false);
    }
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const carga = { ...datos, url_imagen: datos.url_imagen?.trim() || null };
      if (editando && id) {
        await actualizarVehiculo(Number(id), carga);
      } else {
        await crearVehiculo(carga);
      }
      navegar("/");
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar el vehículo."));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <Cargando mensaje="Cargando vehículo..." />;
  }

  const urlImagen = (datos.url_imagen ?? "").trim();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">
        {editando ? "Editar vehículo" : "Nuevo vehículo"}
      </h1>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <form onSubmit={enviar} className="tarjeta space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Marca" descripcion="Marca o fabricante del vehículo.">
            <input
              className="campo-entrada"
              value={datos.marca}
              onChange={(evento) => actualizar("marca", evento.target.value)}
              required
            />
          </Campo>
          <Campo etiqueta="Modelo" descripcion="Modelo del vehículo.">
            <input
              className="campo-entrada"
              value={datos.modelo}
              onChange={(evento) => actualizar("modelo", evento.target.value)}
              required
            />
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo etiqueta="Versión" descripcion="Versión o acabado del vehículo. Campo opcional.">
            <input
              className="campo-entrada"
              value={datos.version ?? ""}
              onChange={(evento) => actualizar("version", evento.target.value)}
            />
          </Campo>
          <Campo etiqueta="Año" descripcion="Año de fabricación del vehículo.">
            <input
              className="campo-entrada"
              type="number"
              min="1900"
              max="2100"
              value={datos.anio}
              onChange={(evento) => actualizar("anio", Number(evento.target.value))}
              required
            />
          </Campo>
          <Campo etiqueta="Tipo" descripcion="Tipo de vehículo: sedán, SUV, hatchback, etc.">
            <input
              className="campo-entrada"
              placeholder="Sedán, SUV, etc."
              value={datos.tipo ?? ""}
              onChange={(evento) => actualizar("tipo", evento.target.value)}
            />
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo etiqueta="Precio" descripcion="Precio de venta del vehículo, en la moneda seleccionada.">
            <input
              className="campo-entrada"
              type="number"
              step="0.01"
              min="0.01"
              value={datos.precio}
              onChange={(evento) => actualizar("precio", Number(evento.target.value))}
              required
            />
          </Campo>
          <Campo etiqueta="Moneda" descripcion="Moneda del precio del vehículo (Soles o Dólares). Define la moneda del crédito al simular.">
            <select
              className="campo-entrada"
              value={datos.moneda}
              onChange={(evento) => actualizar("moneda", evento.target.value as Moneda)}
            >
              {Object.entries(ETIQUETA_MONEDA).map(([codigo, etiqueta]) => (
                <option key={codigo} value={codigo}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <Campo
          etiqueta="URL de imagen (opcional)"
          descripcion="Enlace a una foto del vehículo. Si lo dejas vacío, en el catálogo se mostrará un marcador con la marca."
        >
          <input
            className="campo-entrada"
            type="url"
            placeholder="https://..."
            value={datos.url_imagen ?? ""}
            onChange={(evento) => actualizar("url_imagen", evento.target.value)}
          />
        </Campo>

        {urlImagen && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Vista previa de la imagen</p>
            {errorImagen ? (
              <div className="flex h-40 w-full max-w-sm items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                No se pudo cargar la imagen desde esa URL.
              </div>
            ) : (
              <img
                src={urlImagen}
                alt="Vista previa del vehículo"
                className="h-40 w-full max-w-sm rounded-md object-cover ring-1 ring-slate-200"
                onError={() => setErrorImagen(true)}
              />
            )}
          </div>
        )}

        <Campo etiqueta="Descripción" descripcion="Detalle o características adicionales del vehículo. Campo opcional.">
          <textarea
            className="campo-entrada"
            rows={3}
            value={datos.descripcion ?? ""}
            onChange={(evento) => actualizar("descripcion", evento.target.value)}
          />
        </Campo>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="boton-secundario" onClick={() => navegar("/")}>
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

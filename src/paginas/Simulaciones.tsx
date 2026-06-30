// Historial de simulaciones: listado, busqueda y acceso al detalle.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks, Search } from "lucide-react";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { mensajeError } from "../api/cliente";
import { listarSimulaciones } from "../api/servicios";
import type { SimulacionListado } from "../tipos";
import { etiquetaSimulacion, formatoFecha, formatoMoneda, formatoPorcentaje } from "../utilidades/formato";

export function Simulaciones() {
  const [simulaciones, setSimulaciones] = useState<SimulacionListado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (texto?: string) => {
    setCargando(true);
    setError("");
    try {
      // El historial muestra solo las propuestas vigentes (no las archivadas).
      setSimulaciones(
        await listarSimulaciones({ busqueda: texto || undefined, estado: "CALCULADA" })
      );
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de simulaciones</h1>
          <p className="text-sm text-slate-500">Abre o edita las propuestas guardadas.</p>
        </div>
        <Link to="/simulaciones/nueva" className="boton-primario">
          Nueva simulación
        </Link>
      </div>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          cargar(busqueda);
        }}
        className="relative max-w-md"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="campo-entrada pl-9"
          placeholder="Buscar por vehículo o nombre"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </form>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <div className="tarjeta overflow-x-auto">
        {cargando ? (
          <Cargando />
        ) : simulaciones.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ListChecks className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">
              {busqueda
                ? "Ninguna simulación coincide con la búsqueda."
                : "Aún no hay simulaciones guardadas."}
            </p>
            <Link to="/simulaciones/nueva" className="boton-primario">
              Crear una simulación
            </Link>
          </div>
        ) : (
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Simulación</th>
                <th>Vehículo</th>
                <th className="text-right">Monto del préstamo</th>
                <th className="text-right">Cuota mensual</th>
                <th className="text-right">TCEA</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {simulaciones.map((simulacion) => (
                <tr key={simulacion.id} className="hover:bg-slate-50">
                  <td>
                    <Link
                      to={`/simulaciones/${simulacion.id}`}
                      className="font-semibold text-marca-700 hover:underline"
                    >
                      {etiquetaSimulacion(simulacion.id)}
                    </Link>
                    {simulacion.nombre && (
                      <p className="text-xs text-slate-400">{simulacion.nombre}</p>
                    )}
                  </td>
                  <td>{simulacion.vehiculo_descripcion ?? "-"}</td>
                  <td className="text-right">
                    {formatoMoneda(simulacion.monto_prestamo, simulacion.moneda)}
                  </td>
                  <td className="text-right">
                    {formatoMoneda(simulacion.cuota_mensual, simulacion.moneda)}
                  </td>
                  <td className="text-right">{formatoPorcentaje(simulacion.tcea)}</td>
                  <td>{formatoFecha(simulacion.fecha_creacion)}</td>
                  <td className="space-x-3 whitespace-nowrap text-right">
                    <Link
                      to={`/simulaciones/${simulacion.id}`}
                      className="text-sm font-medium text-marca-600 hover:underline"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/simulaciones/${simulacion.id}/editar`}
                      className="text-sm font-medium text-marca-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

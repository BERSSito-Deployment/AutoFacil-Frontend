// Pantalla de inicio: el catalogo vehicular es lo primero que ve el asesor.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { VehiculoCard } from "../componentes/VehiculoCard";
import { mensajeError } from "../api/cliente";
import { desactivarVehiculo, listarVehiculos, obtenerResumen } from "../api/servicios";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";
import type { ResumenDashboard, Vehiculo } from "../tipos";
import {
  etiquetaSimulacion,
  formatoFecha,
  formatoMoneda,
  formatoPorcentaje,
} from "../utilidades/formato";

export function Dashboard() {
  const { usuario } = useAutenticacion();

  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarVehiculos = (texto?: string) =>
    listarVehiculos(texto)
      .then(setVehiculos)
      .catch((err) => setError(mensajeError(err)));

  useEffect(() => {
    Promise.all([obtenerResumen(), listarVehiculos()])
      .then(([resumenData, vehiculosData]) => {
        setResumen(resumenData);
        setVehiculos(vehiculosData);
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, []);

  const quitarVehiculo = async (vehiculo: Vehiculo) => {
    if (!window.confirm(`¿Dar de baja el ${vehiculo.marca} ${vehiculo.modelo} del catálogo?`)) {
      return;
    }
    try {
      await desactivarVehiculo(vehiculo.id);
      await cargarVehiculos(busqueda);
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  if (cargando) {
    return <Cargando mensaje="Cargando el catálogo..." />;
  }

  return (
    <div className="space-y-8">
      {/* Encabezado: el catalogo es el protagonista. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-marca-700">
            {usuario ? `Hola, ${usuario.nombre}` : "Bienvenido"}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Catálogo vehicular</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Elige un vehículo y pulsa "Simular crédito" para preparar la propuesta del cliente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/vehiculos/nuevo" className="boton-secundario">
            <Plus className="h-4 w-4" />
            Agregar vehículo
          </Link>
          <Link to="/simulaciones/nueva" className="boton-primario">
            Nueva simulación
          </Link>
        </div>
      </div>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {/* Buscador del catalogo. */}
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          cargarVehiculos(busqueda);
        }}
        className="relative max-w-md"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="campo-entrada pl-9"
          placeholder="Buscar por marca, modelo o versión"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </form>

      {vehiculos.length === 0 ? (
        <div className="tarjeta border-dashed py-14 text-center">
          <p className="text-sm text-slate-500">No hay vehículos que coincidan.</p>
          <Link to="/vehiculos/nuevo" className="boton-primario mt-3">
            Agregar un vehículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehiculos.map((vehiculo) => (
            <VehiculoCard
              key={vehiculo.id}
              vehiculo={vehiculo}
              gestion
              onDesactivar={quitarVehiculo}
            />
          ))}
        </div>
      )}

      {/* Simulaciones recientes. */}
      {resumen && resumen.simulaciones_recientes.length > 0 && (
        <div className="tarjeta p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Simulaciones recientes</h2>
            <Link to="/simulaciones" className="text-sm font-semibold text-marca-700 hover:underline">
              Ver historial
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="tabla-base">
              <thead>
                <tr>
                  <th>Simulación</th>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th className="text-right">Cuota mensual</th>
                  <th className="text-right">TCEA</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {resumen.simulaciones_recientes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td>
                      <Link to={`/simulaciones/${s.id}`} className="font-semibold text-marca-700 hover:underline">
                        {etiquetaSimulacion(s.id)}
                      </Link>
                    </td>
                    <td>{s.cliente_nombre ?? "-"}</td>
                    <td>{s.vehiculo_descripcion ?? "-"}</td>
                    <td className="text-right">{formatoMoneda(s.cuota_mensual, s.moneda)}</td>
                    <td className="text-right">{formatoPorcentaje(s.tcea)}</td>
                    <td>{formatoFecha(s.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

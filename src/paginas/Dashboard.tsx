// Pantalla de inicio: el catalogo vehicular es lo primero que ve el asesor.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { VehiculoCard } from "../componentes/VehiculoCard";
import { mensajeError } from "../api/cliente";
import { desactivarVehiculo, listarVehiculos } from "../api/servicios";
import type { Vehiculo } from "../tipos";

export function Dashboard() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarVehiculos = (texto?: string) =>
    listarVehiculos(texto)
      .then(setVehiculos)
      .catch((err) => setError(mensajeError(err)));

  useEffect(() => {
    listarVehiculos()
      .then(setVehiculos)
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
          <h1 className="text-3xl font-bold text-slate-900">Catálogo vehicular</h1>
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

    </div>
  );
}

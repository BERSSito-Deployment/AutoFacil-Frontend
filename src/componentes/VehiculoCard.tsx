// Tarjeta de vehiculo para el catalogo y la gestion del mismo.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import type { Vehiculo } from "../tipos";
import { formatoMoneda, imagenVehiculo } from "../utilidades/formato";

interface PropsVehiculoCard {
  vehiculo: Vehiculo;
  // Muestra acciones de gestion (editar/desactivar) ademas de simular.
  gestion?: boolean;
  // Se pasa cuando se permite dar de baja el vehiculo del catalogo.
  onDesactivar?: (vehiculo: Vehiculo) => void;
}

export function VehiculoCard({ vehiculo, gestion = false, onDesactivar }: PropsVehiculoCard) {
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <div className="tarjeta group flex flex-col overflow-hidden">
      {/* Foto del vehiculo; si no carga, un marcador elegante con la marca. */}
      <div className="relative h-44 w-full overflow-hidden">
        {errorImagen ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100">
            <Car className="h-12 w-12 text-marca-300" />
            <span className="mt-2 text-xs font-medium uppercase tracking-wide text-marca-400">
              {vehiculo.marca}
            </span>
          </div>
        ) : (
          <img
            src={imagenVehiculo(vehiculo)}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setErrorImagen(true)}
          />
        )}
        <span className="absolute left-3 top-3 rounded-md bg-white/85 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {vehiculo.anio}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-marca-600">
          {vehiculo.marca}
        </p>
        <h3 className="text-lg font-bold text-slate-900">{vehiculo.modelo}</h3>
        <p className="text-sm text-slate-500">
          {[vehiculo.version, vehiculo.tipo].filter(Boolean).join(" · ") || "Vehículo"}
        </p>

        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Precio</p>
          <p className="text-xl font-bold text-slate-900">
            {formatoMoneda(vehiculo.precio, vehiculo.moneda)}
          </p>
        </div>

        {vehiculo.descripcion && (
          <p className="mt-3 line-clamp-2 text-xs text-slate-500">{vehiculo.descripcion}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={`/simulaciones/nueva?vehiculo=${vehiculo.id}`}
            className="boton-primario flex-1 justify-center"
          >
            Simular crédito
          </Link>
          {gestion && (
            <>
              <Link to={`/vehiculos/${vehiculo.id}`} className="boton-secundario">
                Editar
              </Link>
              {onDesactivar && (
                <button
                  type="button"
                  className="boton-secundario text-red-600"
                  onClick={() => onDesactivar(vehiculo)}
                  title="Dar de baja"
                >
                  Quitar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

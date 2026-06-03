// Listado y busqueda de los clientes del asesor.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Users } from "lucide-react";
import { Cargando } from "../componentes/Cargando";
import { Mensaje } from "../componentes/Mensaje";
import { mensajeError } from "../api/cliente";
import { desactivarCliente, listarClientes } from "../api/servicios";
import type { Cliente } from "../tipos";
import { formatoMoneda } from "../utilidades/formato";

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (texto?: string) => {
    setCargando(true);
    setError("");
    try {
      setClientes(await listarClientes(texto));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const desactivar = async (cliente: Cliente) => {
    if (!window.confirm(`¿Deseas desactivar al cliente ${cliente.nombres} ${cliente.apellidos}?`)) {
      return;
    }
    try {
      await desactivarCliente(cliente.id);
      cargar(busqueda);
    } catch (err) {
      setError(mensajeError(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Personas a las que ofreces el crédito vehicular.</p>
        </div>
        <Link to="/clientes/nuevo" className="boton-primario">
          <UserPlus className="h-4 w-4" />
          Nuevo cliente
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
          placeholder="Buscar por documento, nombres o apellidos"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </form>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      <div className="tarjeta overflow-x-auto">
        {cargando ? (
          <Cargando />
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">
              {busqueda
                ? "No se encontraron clientes con ese criterio."
                : "Aún no has registrado clientes."}
            </p>
            <Link to="/clientes/nuevo" className="boton-primario">
              <UserPlus className="h-4 w-4" />
              Registrar el primero
            </Link>
          </div>
        ) : (
          <table className="tabla-base">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombres y apellidos</th>
                <th>Teléfono</th>
                <th>Ingreso mensual</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50">
                  <td>
                    {cliente.tipo_documento} {cliente.numero_documento}
                  </td>
                  <td className="font-medium text-slate-700">
                    {cliente.nombres} {cliente.apellidos}
                  </td>
                  <td>{cliente.telefono ?? "-"}</td>
                  <td>{formatoMoneda(cliente.ingreso_mensual, cliente.moneda_ingresos)}</td>
                  <td className="space-x-3 text-right">
                    <Link
                      to={`/clientes/${cliente.id}`}
                      className="text-sm font-semibold text-marca-600 hover:underline"
                    >
                      Editar
                    </Link>
                    {cliente.activo && (
                      <button
                        type="button"
                        className="text-sm font-semibold text-red-600 hover:underline"
                        onClick={() => desactivar(cliente)}
                      >
                        Desactivar
                      </button>
                    )}
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

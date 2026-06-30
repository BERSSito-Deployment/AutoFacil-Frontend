// Estructura principal: barra lateral y cabecera fijas; solo el contenido scrollea.
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";

interface Enlace {
  ruta: string;
  etiqueta: string;
  activo: (pathname: string) => boolean;
}

const ENLACES: Enlace[] = [
  {
    ruta: "/",
    etiqueta: "Mis vehículos",
    activo: (p) => p === "/" || p.startsWith("/vehiculos"),
  },
  {
    ruta: "/simulaciones/nueva",
    etiqueta: "Nueva simulación",
    activo: (p) => p === "/simulaciones/nueva" || p.endsWith("/editar"),
  },
  {
    ruta: "/simulaciones",
    etiqueta: "Simulaciones",
    activo: (p) =>
      p === "/simulaciones" ||
      (p.startsWith("/simulaciones/") && p !== "/simulaciones/nueva" && !p.endsWith("/editar")),
  },
  {
    ruta: "/perfil",
    etiqueta: "Mi perfil",
    activo: (p) => p === "/perfil",
  },
];

export function Layout() {
  const { usuario, salir } = useAutenticacion();
  const navegar = useNavigate();
  const { pathname } = useLocation();

  const cerrarSesion = () => {
    salir();
    navegar("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img src="/logo.png" alt="AutoFácil" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900">
            AutoFácil
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {ENLACES.map(({ ruta, etiqueta, activo }) => (
            <Link
              key={ruta}
              to={ruta}
              className={`block px-3 py-2 text-sm font-medium transition-colors ${
                activo(pathname)
                  ? "bg-marca-50 text-marca-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {etiqueta}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">
              {usuario ? `${usuario.nombre} ${usuario.apellido}` : ""}
            </p>
            <p className="text-xs text-slate-400">{usuario?.correo}</p>
          </div>
          <button type="button" className="boton-secundario" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </header>

        {/* Navegacion compacta para pantallas pequenas. */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {ENLACES.map(({ ruta, etiqueta, activo }) => (
            <Link
              key={ruta}
              to={ruta}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium ${
                activo(pathname) ? "bg-marca-600 text-white" : "text-slate-600"
              }`}
            >
              {etiqueta}
            </Link>
          ))}
        </nav>

        {/* Unica zona con scroll: el contenido de la pestana seleccionada. */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

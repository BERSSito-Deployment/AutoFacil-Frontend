// Pagina de registro: tarjeta centrada y simple.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mensaje } from "../componentes/Mensaje";
import { EntradaContrasena } from "../componentes/EntradaContrasena";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";
import { mensajeError } from "../api/cliente";

export function Registro() {
  const { registrar, autenticado } = useAutenticacion();
  const navegar = useNavigate();
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    usuario: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (autenticado) {
      navegar("/", { replace: true });
    }
  }, [autenticado, navegar]);

  const actualizar = (campo: keyof typeof datos, valor: string) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");
    if (datos.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      await registrar({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        correo: datos.correo.trim(),
        usuario: datos.usuario.trim(),
        password: datos.password,
      });
      navegar("/", { replace: true });
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear la cuenta."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo.png" alt="AutoFácil" className="h-14 w-14 object-contain" />
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">AutoFácil</h1>
        </div>

        <div className="tarjeta p-6">
          <form onSubmit={enviar} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta-campo">Nombre</label>
                <input
                  className="campo-entrada"
                  value={datos.nombre}
                  onChange={(evento) => actualizar("nombre", evento.target.value)}
                  required
                />
              </div>
              <div>
                <label className="etiqueta-campo">Apellido</label>
                <input
                  className="campo-entrada"
                  value={datos.apellido}
                  onChange={(evento) => actualizar("apellido", evento.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="etiqueta-campo">Correo</label>
              <input
                className="campo-entrada"
                type="email"
                value={datos.correo}
                onChange={(evento) => actualizar("correo", evento.target.value)}
                required
              />
            </div>
            <div>
              <label className="etiqueta-campo">Usuario</label>
              <input
                className="campo-entrada"
                value={datos.usuario}
                onChange={(evento) => actualizar("usuario", evento.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="etiqueta-campo">Contraseña</label>
              <EntradaContrasena
                value={datos.password}
                onChange={(valor) => actualizar("password", valor)}
                autoComplete="new-password"
                required
              />
              <p className="mt-1 text-xs text-slate-400">Mínimo 6 caracteres.</p>
            </div>

            {error && <Mensaje tipo="error">{error}</Mensaje>}

            <button type="submit" className="boton-primario w-full" disabled={enviando}>
              {enviando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-semibold text-marca-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

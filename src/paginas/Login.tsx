// Pagina de inicio de sesion: tarjeta centrada y simple.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mensaje } from "../componentes/Mensaje";
import { EntradaContrasena } from "../componentes/EntradaContrasena";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";
import { mensajeError } from "../api/cliente";

export function Login() {
  const { entrar, autenticado } = useAutenticacion();
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (autenticado) {
      navegar("/", { replace: true });
    }
  }, [autenticado, navegar]);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await entrar(usuario.trim(), password);
      navegar("/", { replace: true });
    } catch (err) {
      setError(mensajeError(err, "No se pudo iniciar sesión."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-marca-50 via-slate-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo.png" alt="AutoFácil" className="h-14 w-14 object-contain" />
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">AutoFácil</h1>
          <p className="text-sm text-slate-500">Simulador de crédito vehicular</p>
        </div>

        <div className="tarjeta p-6">
          <h2 className="text-lg font-bold text-slate-900">Inicia sesión</h2>
          <form onSubmit={enviar} className="mt-5 space-y-4">
            <div>
              <label className="etiqueta-campo">Usuario o correo</label>
              <input
                className="campo-entrada"
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="etiqueta-campo">Contraseña</label>
              <EntradaContrasena
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <Mensaje tipo="error">{error}</Mensaje>}

            <button type="submit" className="boton-primario w-full" disabled={enviando}>
              {enviando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro" className="font-semibold text-marca-700 hover:underline">
            Crea una gratis
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          Cuenta de prueba: <span className="font-medium text-slate-500">demo</span> /{" "}
          <span className="font-medium text-slate-500">Demo1234</span>
        </p>
      </div>
    </div>
  );
}

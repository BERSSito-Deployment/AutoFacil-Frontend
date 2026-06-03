// Pagina de perfil del usuario: ver y actualizar sus datos y contrasena.
import { useState } from "react";
import { Campo } from "../componentes/Campo";
import { Mensaje } from "../componentes/Mensaje";
import { EntradaContrasena } from "../componentes/EntradaContrasena";
import { mensajeError } from "../api/cliente";
import { actualizarPerfil } from "../api/servicios";
import { useAutenticacion } from "../contexto/ContextoAutenticacion";

export function Perfil() {
  const { usuario, refrescar } = useAutenticacion();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [apellido, setApellido] = useState(usuario?.apellido ?? "");
  const [correo, setCorreo] = useState(usuario?.correo ?? "");
  const [nombreUsuario, setNombreUsuario] = useState(usuario?.usuario ?? "");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");
    setOk("");
    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre,
        apellido,
        correo,
        usuario: nombreUsuario,
        password_actual: passwordActual || undefined,
        password_nueva: passwordNueva || undefined,
      });
      await refrescar();
      setPasswordActual("");
      setPasswordNueva("");
      setOk("Perfil actualizado correctamente.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar el perfil."));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi perfil</h1>
        <p className="text-sm text-slate-500">
          Actualiza tus datos personales y tu contraseña.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {error && <Mensaje tipo="error">{error}</Mensaje>}
        {ok && <Mensaje tipo="exito">{ok}</Mensaje>}

        <form onSubmit={guardar} className="tarjeta space-y-5 p-6">
          <p className="titulo-seccion">Datos personales</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre" descripcion="Tu nombre.">
              <input className="campo-entrada" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Campo>
            <Campo etiqueta="Apellido" descripcion="Tu apellido.">
              <input className="campo-entrada" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </Campo>
          </div>
          <Campo etiqueta="Correo" descripcion="Correo de contacto.">
            <input className="campo-entrada" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </Campo>
          <Campo
            etiqueta="Usuario"
            descripcion="Nombre con el que inicias sesión. Mínimo 3 caracteres, sin '@' y no solo números."
          >
            <input
              className="campo-entrada"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              autoComplete="username"
              minLength={3}
              required
            />
          </Campo>

          <hr className="border-slate-100" />
          <p className="titulo-seccion">Cambiar contraseña (opcional)</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta="Contraseña actual" descripcion="Requerida solo si vas a cambiar la contraseña.">
              <EntradaContrasena
                value={passwordActual}
                onChange={setPasswordActual}
                autoComplete="current-password"
              />
            </Campo>
            <Campo etiqueta="Contraseña nueva" descripcion="Mínimo 6 caracteres. Déjala vacía para no cambiarla.">
              <EntradaContrasena
                value={passwordNueva}
                onChange={setPasswordNueva}
                autoComplete="new-password"
              />
            </Campo>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="boton-primario" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

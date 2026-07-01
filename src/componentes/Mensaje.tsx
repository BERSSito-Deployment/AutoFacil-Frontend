// Cuadro de mensaje para errores, exitos o avisos informativos.
type TipoMensaje = "error" | "exito" | "info";

const CLASES: Record<TipoMensaje, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  exito: "border-green-200 bg-green-50 text-green-700",
  info: "border-marca-100 bg-marca-50 text-marca-800",
};

export function Mensaje({
  tipo = "info",
  children,
}: {
  tipo?: TipoMensaje;
  children: React.ReactNode;
}) {
  if (!children) {
    return null;
  }
  return (
    <div className={`rounded-sm border px-4 py-3 text-sm ${CLASES[tipo]}`}>{children}</div>
  );
}

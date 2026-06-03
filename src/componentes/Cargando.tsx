// Indicador de carga sencillo y reutilizable.
export function Cargando({ mensaje = "Cargando..." }: { mensaje?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-marca-600 border-t-transparent" />
      <span className="text-sm">{mensaje}</span>
    </div>
  );
}

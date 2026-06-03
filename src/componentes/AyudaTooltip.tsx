// Componente reutilizable que muestra una ayuda emergente para terminos tecnicos.
import { useState } from "react";
import { GLOSARIO } from "../utilidades/glosario";

interface PropiedadesAyuda {
  termino: keyof typeof GLOSARIO | string;
  // Texto explicito opcional; si se omite se busca el termino en el glosario.
  texto?: string;
}

export function AyudaTooltip({ termino, texto }: PropiedadesAyuda) {
  const [visible, setVisible] = useState(false);
  const explicacion = texto ?? GLOSARIO[termino] ?? "Sin descripcion disponible.";

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={`Ayuda sobre ${termino}`}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-marca-600 text-[10px] font-bold leading-none text-marca-600 hover:bg-marca-600 hover:text-white"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={(evento) => {
          evento.preventDefault();
          setVisible((anterior) => !anterior);
        }}
      >
        ?
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-700 shadow-lg">
          <span className="mb-1 block font-semibold text-marca-700">{String(termino)}</span>
          {explicacion}
        </span>
      )}
    </span>
  );
}

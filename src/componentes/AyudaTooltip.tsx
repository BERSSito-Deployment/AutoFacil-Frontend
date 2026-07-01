// Ayuda emergente para terminos tecnicos.
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOSARIO } from "../utilidades/glosario";

interface PropiedadesAyuda {
  termino: keyof typeof GLOSARIO | string;
  texto?: string;
}

interface Posicion {
  top: number;
  bottom: number;
  left: number;
}

export function AyudaTooltip({ termino, texto }: PropiedadesAyuda) {
  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const refBoton = useRef<HTMLButtonElement>(null);
  const explicacion = texto ?? GLOSARIO[termino] ?? "Sin descripcion disponible.";

  // Calcula la posicion del boton para ubicar el popup.
  const mostrar = () => {
    const caja = refBoton.current?.getBoundingClientRect();
    if (!caja) {
      return;
    }
    const centro = caja.left + caja.width / 2;
    const izquierda = Math.min(Math.max(centro, 140), window.innerWidth - 140);
    setPosicion({ top: caja.top, bottom: caja.bottom, left: izquierda });
  };

  const ocultar = () => setPosicion(null);

  // Si el boton esta muy arriba, el popup va debajo; si no, va encima.
  const haciaAbajo = posicion ? posicion.top < 160 : false;

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={refBoton}
        type="button"
        aria-label={`Ayuda sobre ${termino}`}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-marca-600 text-[10px] font-bold leading-none text-marca-600 hover:bg-marca-600 hover:text-white"
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        onClick={(evento) => {
          evento.preventDefault();
          posicion ? ocultar() : mostrar();
        }}
      >
        ?
      </button>
      {posicion &&
        createPortal(
          <span
            style={{
              position: "fixed",
              left: posicion.left,
              top: haciaAbajo ? posicion.bottom + 8 : posicion.top - 8,
              transform: haciaAbajo ? "translateX(-50%)" : "translate(-50%, -100%)",
            }}
            className="pointer-events-none z-[9999] block w-64 rounded-sm border border-slate-400 bg-white p-3 text-xs font-normal leading-relaxed text-slate-700"
          >
            <span className="mb-1 block font-semibold text-marca-700">{String(termino)}</span>
            {explicacion}
          </span>,
          document.body
        )}
    </span>
  );
}

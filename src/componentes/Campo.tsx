import type { ReactNode } from "react";
import { AyudaTooltip } from "./AyudaTooltip";

interface PropiedadesCampo {
  etiqueta: string;
  ayuda?: string;
  descripcion?: string;
  children: ReactNode;
  className?: string;
}

export function Campo({ etiqueta, ayuda, descripcion, children, className = "" }: PropiedadesCampo) {
  return (
    <div className={className}>
      <label className="etiqueta-campo">
        {etiqueta}
        {descripcion ? (
          <AyudaTooltip termino={etiqueta} texto={descripcion} />
        ) : (
          ayuda && <AyudaTooltip termino={ayuda} />
        )}
      </label>
      {children}
    </div>
  );
}

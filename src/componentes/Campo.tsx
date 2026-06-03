// Envoltorio de campo de formulario con etiqueta y ayuda (tooltip) obligatoria.
import type { ReactNode } from "react";
import { AyudaTooltip } from "./AyudaTooltip";

interface PropiedadesCampo {
  etiqueta: string;
  // Termino del glosario para mostrar la definicion tecnica del concepto.
  ayuda?: string;
  // Texto de ayuda libre sobre como llenar el campo (cuando no es un termino tecnico).
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

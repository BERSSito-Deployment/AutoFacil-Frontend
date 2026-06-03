// Campo de contraseña con boton para mostrar/ocultar el texto.
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

export function EntradaContrasena({
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        className="campo-entrada pr-10"
        type={visible ? "text" : "password"}
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((anterior) => !anterior)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-marca-600"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

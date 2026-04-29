import type { InputHTMLAttributes } from "react";

// Extendemos los atributos estándar de un <input> de HTML
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Añadimos la propiedad label como opcional
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {/* Si existe la prop label, la renderizamos */}
      {label && (
        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-gray-900 text-white p-3 rounded-xl border border-gray-700 
        focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none 
        transition-all text-sm placeholder:text-gray-600 ${className}`}
        {...props}
      />
    </div>
  );
}
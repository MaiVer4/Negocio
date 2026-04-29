// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void; // <--- Añade esta línea
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div 
      onClick={onClick} // <--- Pasa el evento al div real
      className={`bg-gray-900 border border-gray-800 p-6 rounded-3xl ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </div>
  );
}
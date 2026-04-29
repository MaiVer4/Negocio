import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger';
}

export default function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  const bgColor = variant === 'primary' ? 'bg-primary' : 'bg-danger';
  return (
    <button
      {...props}
      className={`${bgColor} w-full p-3 rounded-xl font-bold text-dark active:scale-95 transition-transform hover:opacity-90 disabled:opacity-50 shadow-lg cursor-pointer`}
    >
      {children}
    </button>
  )
}
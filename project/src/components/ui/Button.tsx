import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ 
  onClick, 
  disabled = false, 
  icon: Icon, 
  children,
  variant = 'primary' 
}: ButtonProps) {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:hover:bg-blue-600",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white disabled:hover:bg-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:hover:bg-red-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
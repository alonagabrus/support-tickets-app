import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500 hover:border-teal-600 shadow-sm hover:shadow focus:ring-teal-500',
    secondary: 'bg-white text-gray-700 border border-teal-500 hover:bg-gray-50 focus:ring-teal-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-sm hover:shadow focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

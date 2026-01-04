import React from 'react';

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  error?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  required = false,
  className = '',
  autoFocus = false
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 ${error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400'
          }`}
      />
      {error && <p className="text-red-600 text-sm font-medium flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
    </div>
  );
};

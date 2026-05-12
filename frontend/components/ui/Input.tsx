import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-theme-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          block w-full px-4 py-2.5 border rounded-lg text-sm text-theme-primary
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-all duration-200
          ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-200' : 'border-theme'}
          bg-theme-secondary
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

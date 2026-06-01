import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={[
          'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800',
          'bg-white placeholder:text-gray-400 placeholder:font-normal',
          'focus:outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20',
          'transition-all duration-150',
          error ? 'border-red-400' : '',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={id}
        {...props}
        className={[
          'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800',
          'bg-white placeholder:text-gray-400 placeholder:font-normal resize-y leading-relaxed',
          'focus:outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20',
          'transition-all duration-150',
          className,
        ].join(' ')}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export function Select({ label, className = '', id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={[
          'w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white',
          'focus:outline-none focus:border-naranja focus:ring-2 focus:ring-naranja/20',
          'transition-all duration-150 cursor-pointer',
          className,
        ].join(' ')}
      >
        {children}
      </select>
    </div>
  );
}

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-gradient-to-br from-naranja to-naranja-400 text-white shadow-[0_4px_14px_rgba(255,107,53,0.35)] hover:shadow-[0_6px_20px_rgba(255,107,53,0.45)] hover:brightness-105 active:scale-[0.98]',
  secondary: 'bg-gradient-to-br from-violeta to-violeta-light text-white shadow-[0_4px_14px_rgba(124,58,237,0.30)] hover:brightness-105 active:scale-[0.98]',
  ghost:     'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 active:scale-[0.98]',
  danger:    'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.30)] hover:brightness-105 active:scale-[0.98]',
  success:   'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_14px_rgba(34,197,94,0.30)] hover:brightness-105 active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-bold rounded-xl border-0 cursor-pointer transition-all duration-150',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
}

const variants = {
  primary: 'bg-gold text-bg hover:bg-gold-light',
  danger: 'border border-red-500 text-red-400 hover:bg-red-500/10',
  ghost: 'border border-gold text-gold hover:bg-gold/10',
};

export function AdminButton({
  loading = false,
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${loading ? 'scale-[0.98]' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0"
          aria-hidden
        />
      )}
      <span>{loading ? (typeof children === 'string' ? `${children}...` : children) : children}</span>
    </button>
  );
}

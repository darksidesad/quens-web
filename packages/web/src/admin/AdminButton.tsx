import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
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
  success = false,
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}: Props) {
  const label =
    loading && typeof children === 'string'
      ? children.replace('Guardar', 'Guardando').replace('Eliminar', 'Eliminando')
      : children;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'relative inline-flex min-h-[40px] min-w-[120px] items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        loading ? 'scale-[0.97] ring-2 ring-gold/60 ring-offset-2 ring-offset-[#121212]' : '',
        success ? 'bg-green-600 text-white ring-2 ring-green-400' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-current/25 border-t-current"
          style={{ animation: 'quenns-btn-spin 0.65s linear infinite' }}
          aria-hidden
        />
      )}
      {success && !loading && <span aria-hidden>✓</span>}
      <span>{loading ? `${label}...` : children}</span>
      <style>{`
        @keyframes quenns-btn-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

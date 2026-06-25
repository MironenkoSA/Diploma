// src/components/ui/Button.tsx
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--sand)',
    color: 'var(--white)',
    border: '1px solid var(--sand)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--brown-dark)',
    border: '1px solid var(--cream-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'transparent',
    color: 'var(--error)',
    border: '1px solid var(--error)',
  },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '0.8rem', letterSpacing: '0.08em' },
  md: { padding: '10px 24px', fontSize: '0.85rem', letterSpacing: '0.1em' },
  lg: { padding: '14px 36px', fontSize: '0.9rem', letterSpacing: '0.12em' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: 400,
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading && variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--sand-dark)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--sand-dark)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading && variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--sand)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--sand)';
        }
      }}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  );
}

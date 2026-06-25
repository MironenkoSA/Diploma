// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, style, ...rest }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style as any }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.92rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 400,
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          padding: '10px 14px',
          background: 'var(--white)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--cream-border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color var(--transition)',
          width: '100%',
        }}
        onFocus={e => {
          (e.target as HTMLInputElement).style.borderColor = error ? 'var(--error)' : 'var(--sand)';
        }}
        onBlur={e => {
          (e.target as HTMLInputElement).style.borderColor = error ? 'var(--error)' : 'var(--cream-border)';
        }}
        {...rest}
      />
      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-hint)' }}>{hint}</span>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...rest }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.92rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={4}
        style={{
          padding: '10px 14px',
          background: 'var(--white)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--cream-border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          resize: 'vertical',
          width: '100%',
          fontFamily: 'var(--font-body)',
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{error}</span>}
    </div>
  );
}

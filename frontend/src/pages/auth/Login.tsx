// src/pages/auth/Login.tsx
// ИСПРАВЛЕНО: BUG-20 (интерфейс на русском языке)

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom = (location.state as any)?.from?.pathname || '/';
  const from = (rawFrom === '/register' || rawFrom === '/login') ? '/' : rawFrom;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Введите email';
    if (!password) errs.password = 'Введите пароль';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await login(email, password);
      toast.success('Добро пожаловать!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка входа. Попробуйте снова.';
      toast.error(msg);
      setErrors({ general: 'Неверный email или пароль' });
    }
  }

  return (
    <main
      className="page-enter"
      style={{
        minHeight: 'calc(100dvh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '2rem',
              color: 'var(--brown-dark)',
              marginBottom: '8px',
            }}
          >
            Войти
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Добро пожаловать в Ателье Историй
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          noValidate
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          {errors.general && (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--error)',
                padding: '10px 14px',
                background: 'rgba(184,64,64,0.06)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(184,64,64,0.15)',
              }}
            >
              {errors.general}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isLoading}>
            Войти
          </Button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '28px',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
          }}
        >
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--sand-dark)', textDecoration: 'none' }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  );
}

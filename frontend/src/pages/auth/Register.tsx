// src/pages/auth/Register.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const register  = useAuthStore(s => s.register);
  const isLoading = useAuthStore(s => s.isLoading);
  const location  = useLocation();
  const rawFrom = (location.state as any)?.from?.pathname || '/';
  // Защита от redirect loop — не возвращаем на /register или /login
  const from = (rawFrom === '/register' || rawFrom === '/login') ? '/' : rawFrom;

  const [form, setForm] = React.useState({
    name: '', email: '', password: '', confirmPassword: '',
    consentGiven: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [registered, setRegistered] = React.useState(false);

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Введите ваше имя';
    if (!form.email.trim()) errs.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Некорректный email';
    if (form.password.length < 8) errs.password = 'Пароль должен содержать минимум 8 символов';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Пароль должен содержать заглавную латинскую букву (A-Z)';
    else if (!/[a-z]/.test(form.password)) errs.password = 'Пароль должен содержать строчную латинскую букву (a-z)';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Пароль должен содержать цифру';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    if (!form.consentGiven) errs.consentGiven = 'Необходимо принять политику обработки персональных данных';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await register({ name: form.name, email: form.email, password: form.password, consentGiven: true });
      setRegistered(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      if (msg.includes('уже существует') || msg.includes('already')) {
        setErrors({ email: 'Пользователь с таким email уже зарегистрирован' });
      } else {
        toast.error(msg);
      }
    }
  }

  // После успешной регистрации — показываем экран подтверждения
  if (registered) {
    return (
      <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--cream-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
            📧
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '16px' }}>
            Подтвердите email
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            На адрес <strong>{form.email}</strong> отправлено письмо со ссылкой для подтверждения.
          </p>
          <p style={{ color: 'var(--text-hint)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '28px' }}>
            Пройдите по ссылке в письме чтобы активировать аккаунт. Ссылка действительна 24 часа.
          </p>
          <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Не получили письмо? Проверьте папку «Спам». Письмо могло прийти через несколько минут.
          </div>
          <Link to={from} style={{ textDecoration: 'none' }}>
            <Button variant="secondary" fullWidth>Продолжить без подтверждения</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '10px' }}>
            Ателье Историй
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '2rem' }}>
            Создать аккаунт
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Ваше имя" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Анна Иванова" error={errors.name} autoComplete="name" />

          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="anna@example.com" error={errors.email} autoComplete="email" />

          <Input label="Пароль" type="password" value={form.password} onChange={e => set('password', e.target.value)}
            hint="Минимум 8 символов. Только латинские буквы (A-Z, a-z) и цифры. Пример: MyPass123"
            error={errors.password} autoComplete="new-password" />

          <Input label="Подтвердите пароль" type="password" value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            error={errors.confirmPassword} autoComplete="new-password" />

          {/* Чекбокс согласия — обязателен по 152-ФЗ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.consentGiven}
                onChange={e => set('consentGiven', e.target.checked)}
                style={{ marginTop: '3px', flexShrink: 0, accentColor: 'var(--sand)', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                Я даю согласие на{' '}
                <a href="/privacy" target="_blank" style={{ color: 'var(--sand-dark)', textDecoration: 'underline' }}>
                  обработку персональных данных
                </a>{' '}
                в соответствии с Федеральным законом № 152-ФЗ «О персональных данных»
              </span>
            </label>
            {errors.consentGiven && (
              <p style={{ fontSize: '0.82rem', color: 'var(--error)', marginLeft: '26px' }}>
                {errors.consentGiven}
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={isLoading} style={{ marginTop: '8px' }}>
            Зарегистрироваться
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" state={{ from: location.state?.from }} style={{ color: 'var(--sand-dark)', textDecoration: 'none', fontWeight: 500 }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

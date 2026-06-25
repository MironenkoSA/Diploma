// src/pages/auth/EmailVerified.tsx
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function EmailVerified() {
  const [params] = useSearchParams();
  const status  = params.get('status');
  const message = params.get('message');
  const success = status === 'success';

  return (
    <div className="page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{
          width: '72px', height: '72px',
          background: success ? 'rgba(74,124,89,0.1)' : 'rgba(184,64,64,0.08)',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px',
        }}>
          {success ? '✅' : '❌'}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '16px' }}>
          {success ? 'Email подтверждён!' : 'Ошибка подтверждения'}
        </h1>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, marginBottom: '32px' }}>
          {success
            ? 'Ваш email успешно подтверждён. Теперь вы можете пользоваться всеми возможностями сайта.'
            : message || 'Ссылка недействительна или устарела. Запросите новое письмо в личном кабинете.'}
        </p>

        <Link to={success ? '/' : '/account/profile'}>
          <Button fullWidth size="lg">
            {success ? 'На главную' : 'В личный кабинет'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

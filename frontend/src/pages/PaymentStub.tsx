// src/pages/PaymentStub.tsx
// Заглушка оплаты (п.5 ТЗ) — подключение платёжной системы не предусмотрено
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const PAYMENT_METHODS = [
  {
    id: 'card',
    icon: <CreditCard size={24} strokeWidth={1.5} />,
    title: 'Банковская карта',
    description: 'Visa, Mastercard, Maestro',
    note: 'Будет доступно после интеграции платёжного шлюза',
    available: false,
  },
  {
    id: 'transfer',
    icon: <Banknote size={24} strokeWidth={1.5} />,
    title: 'Банковский перевод',
    description: 'Реквизиты будут отправлены на email',
    note: 'Оплата в течение 3 рабочих дней',
    available: true,
  },
  {
    id: 'cash',
    icon: <Banknote size={24} strokeWidth={1.5} />,
    title: 'Наличными при получении',
    description: 'При самовывозе или курьерской доставке',
    note: 'Согласовывается отдельно',
    available: true,
  },
];

export default function PaymentStub() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);

  if (confirmed) {
    return (
      <main className="page-enter" style={{ minHeight: 'calc(100dvh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(74,124,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} style={{ color: 'var(--success)' }} strokeWidth={1.5} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '2rem', color: 'var(--brown-dark)', marginBottom: '12px' }}>
            Заказ принят!
          </h1>

          {orderId && (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-hint)', letterSpacing: '0.1em', marginBottom: '16px', fontFamily: 'monospace' }}>
              №{orderId.slice(0,8).toUpperCase()}
            </p>
          )}

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px', fontSize: '0.95rem' }}>
            Мы получили ваш заказ и свяжемся с вами в течение 24 часов для уточнения деталей оплаты и доставки.
            Письмо с подтверждением отправлено на вашу почту.
          </p>

          <div style={{ background: 'rgba(200,168,130,0.08)', border: '1px solid var(--sand-light)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '32px', textAlign: 'left' }}>
            <p style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '8px' }}>
              Выбранный способ оплаты
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {PAYMENT_METHODS.find(m => m.id === selected)?.title ?? 'Будет уточнён'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/account/orders"><Button>Мои заказы</Button></Link>
            <Link to="/shop"><Button variant="secondary">Продолжить покупки</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-enter">
      <div className="container" style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)', maxWidth: '600px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Clock size={18} style={{ color: 'var(--sand)' }} strokeWidth={1.5} />
          <p style={{ fontSize: '0.88rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--sand)' }}>
            Подтверждение заказа
          </p>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '12px' }}>
          Выберите способ оплаты
        </h1>

        {orderId && (
          <p style={{ fontSize: '0.95rem', color: 'var(--text-hint)', marginBottom: '32px', fontFamily: 'monospace' }}>
            Заказ №{orderId.slice(0,8).toUpperCase()}
          </p>
        )}

        {/* Уведомление о заглушке */}
        <div style={{
          background: 'rgba(200,168,130,0.08)', border: '1px solid var(--sand-light)',
          borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '28px',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <CreditCard size={18} style={{ color: 'var(--sand)', flexShrink: 0, marginTop: '2px' }} strokeWidth={1.5} />
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--brown-dark)', marginBottom: '4px', fontWeight: 500 }}>
              Онлайн-оплата временно недоступна
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.85 }}>
              Интеграция платёжного шлюза запланирована в следующей версии.
              Сейчас принимаем оплату банковским переводом или наличными.
            </p>
          </div>
        </div>

        {/* Методы оплаты */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => method.available && setSelected(method.id)}
              disabled={!method.available}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '18px 20px',
                background: selected === method.id ? 'rgba(200,168,130,0.08)' : 'var(--white)',
                border: `1px solid ${selected === method.id ? 'var(--sand)' : 'var(--cream-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: method.available ? 'pointer' : 'not-allowed',
                opacity: method.available ? 1 : 0.5,
                textAlign: 'left',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-body)',
                width: '100%',
              }}
            >
              <div style={{ color: selected === method.id ? 'var(--sand)' : 'var(--text-hint)', flexShrink: 0 }}>
                {method.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '3px', fontWeight: selected === method.id ? 500 : 400 }}>
                  {method.title}
                </p>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>{method.description}</p>
                <p style={{ fontSize: '0.88rem', color: method.available ? 'var(--text-hint)' : 'var(--error)', marginTop: '3px' }}>
                  {method.note}
                </p>
              </div>
              {selected === method.id && (
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                </div>
              )}
            </button>
          ))}
        </div>

        <Button
          fullWidth size="lg"
          disabled={!selected}
          onClick={() => setConfirmed(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          Подтвердить заказ <ArrowRight size={16} />
        </Button>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', textAlign: 'center', marginTop: '16px', lineHeight: 1.8 }}>
          Нажимая «Подтвердить», вы соглашаетесь с условиями оказания услуг.
          Мы свяжемся с вами для уточнения деталей.
        </p>
      </div>
    </main>
  );
}

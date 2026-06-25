// src/pages/Checkout.tsx
// ИСПРАВЛЕНО: BUG-20 (форма на русском языке)
// УЛУЧШЕНО: Более понятные placeholder'ы, единый язык интерфейса

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ordersApi } from '../api';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState(() => ({
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: 'Россия',
    shippingZip: '',
    notes: '',
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.shippingAddress.trim()) errs.shippingAddress = 'Введите адрес';
    if (!form.shippingCity.trim()) errs.shippingCity = 'Введите город';
    if (!form.shippingCountry.trim()) errs.shippingCountry = 'Введите страну';
    if (!form.shippingZip.trim()) errs.shippingZip = 'Введите почтовый индекс';
    else if (!/^\d{6}$/.test(form.shippingZip.trim())) errs.shippingZip = 'Индекс: 6 цифр (например, 344082)';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user === null) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await ordersApi.create({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        ...form,
      });
      clearCart();
      toast.success('Заказ оформлен! Проверьте почту для подтверждения.');
      navigate(`/payment?orderId=${data.data!.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Не удалось оформить заказ. Попробуйте снова.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main
        className="page-enter container"
        style={{ padding: '80px 16px', textAlign: 'center' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-hint)',
            marginBottom: '16px',
          }}
        >
          Корзина пуста
        </h2>
        <Link to="/shop">
          <Button variant="secondary">Перейти в магазин</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="page-enter">
      <div
        className="container"
        style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,48px)' }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            color: 'var(--brown-dark)',
            marginBottom: '40px',
          }}
        >
          Оформление заказа
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Форма доставки */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            noValidate
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '1.4rem',
                color: 'var(--brown-dark)',
                marginBottom: '4px',
              }}
            >
              Адрес доставки
            </h2>

            <Input
              label="Улица и номер дома"
              placeholder="Например: ул. Пушкина, д. 10, кв. 5"
              value={form.shippingAddress}
              onChange={e => set('shippingAddress', e.target.value)}
              error={errors.shippingAddress}
              autoComplete="street-address"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Город"
                placeholder="Москва"
                value={form.shippingCity}
                onChange={e => set('shippingCity', e.target.value)}
                error={errors.shippingCity}
                autoComplete="address-level2"
              />
              <Input
                label="Индекс"
                placeholder="123456"
                value={form.shippingZip}
                onChange={e => set('shippingZip', e.target.value)}
                error={errors.shippingZip}
                autoComplete="postal-code"
              />
            </div>
            <Input
              label="Страна"
              placeholder="Россия"
              value={form.shippingCountry}
              onChange={e => set('shippingCountry', e.target.value)}
              error={errors.shippingCountry}
              autoComplete="country-name"
            />
            <Textarea
              label="Примечание к заказу (необязательно)"
              placeholder="Особые пожелания по упаковке или доставке"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />

            {user === null && (
              <div
                style={{
                  padding: '14px',
                  background: 'rgba(200,168,130,0.1)',
                  border: '1px solid var(--sand-light)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Пожалуйста,{' '}
                  <Link
                    to="/login"
                    state={{ from: { pathname: '/checkout' } }}
                    style={{ color: 'var(--sand-dark)', textDecoration: 'none' }}
                  >
                    войдите
                  </Link>{' '}
                  или{' '}
                  <Link to="/register" style={{ color: 'var(--sand-dark)', textDecoration: 'none' }}>
                    создайте аккаунт
                  </Link>{' '}
                  для оформления заказа.
                </p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={user === null}
            >
              Оформить заказ · ₽{totalPrice().toFixed(2)}
            </Button>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', lineHeight: 1.8 }}>
              Оформляя заказ, вы соглашаетесь с условиями обслуживания.
              Оплата производится при получении или банковским переводом.
            </p>
          </form>

          {/* Состав заказа */}
          <div
            style={{
              background: 'var(--white)',
              border: '1px solid var(--cream-border)',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              position: 'sticky',
              top: '90px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '1.3rem',
                color: 'var(--brown-dark)',
                marginBottom: '20px',
              }}
            >
              Ваш заказ
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, i) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '14px 0',
                    borderBottom:
                      i < items.length - 1 ? '1px solid var(--cream-border)' : 'none',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.product.images[0] || '/placeholder.jpg'}
                    alt={item.product.name}
                    style={{
                      width: '52px',
                      height: '65px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.95rem',
                        color: 'var(--brown-dark)',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                      Кол-во: {item.quantity}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ₽{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--cream-border)',
                paddingTop: '16px',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: 'var(--brown-dark)',
                }}
              >
                Итого
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  color: 'var(--brown-dark)',
                }}
              >
                ₽{totalPrice().toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '8px' }}>
              + стоимость доставки рассчитывается отдельно
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

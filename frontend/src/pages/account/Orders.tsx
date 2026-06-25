// src/pages/account/Orders.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api';
import { Order, OrderStatus } from '../../types';

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  PENDING:   { bg: 'rgba(200,168,130,0.12)', color: 'var(--sand-dark)' },
  CONFIRMED: { bg: 'rgba(74,124,89,0.10)',   color: 'var(--success)' },
  SHIPPED:   { bg: 'rgba(74,124,89,0.18)',   color: 'var(--success)' },
  DELIVERED: { bg: 'rgba(74,124,89,0.22)',   color: 'var(--success)' },
  CANCELLED: { bg: 'rgba(184,64,64,0.08)',   color: 'var(--error)' },
};

export default function AccountOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders().then(r => r.data.data!),
  });

  return (
    <main className="page-enter">
      <div className="container" style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,48px)', maxWidth: '860px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '40px' }}>
          История заказов
        </h1>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : !orders?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-hint)', marginBottom: '12px' }}>
              Заказов пока нет
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginBottom: '28px' }}>
              Здесь появится история ваших покупок
            </p>
            <Link to="/shop" style={{ color: 'var(--sand-dark)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Перейти в магазин →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <article
                key={order.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  transition: 'box-shadow var(--transition)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
              >
                {/* Order header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontSize: '0.88rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '4px' }}>
                      Заказ №{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '0.88rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        ...STATUS_COLORS[order.status],
                      }}
                    >
                      {order.status}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--brown-dark)' }}>
                      ₽{Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={item.product.images?.[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        style={{ width: '52px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                      />
                      <div>
                        <Link
                          to={`/shop/${item.product.slug}`}
                          style={{ fontSize: '0.88rem', color: 'var(--text-primary)', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}
                        >
                          {item.product.name}
                        </Link>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                          {item.quantity} шт. · ₽{Number(item.priceAtTime).toFixed(2)} за шт.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-hint)', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--cream-border)' }}>
                  Shipping to: {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

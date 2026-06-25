// src/components/cart/CartDrawer.tsx
// УЛУЧШЕНО: BUG-19 (предупреждение о возможно устаревших ценах),
//           UX: кнопки минус/плюс более доступны, пустая корзина — явный призыв к действию

import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, RefreshCw } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { productsApi } from '../../api';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems, clearCart } =
    useCartStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  // BUG-19: Обновить цены из сервера перед оформлением
  async function refreshPrices() {
    setRefreshing(true);
    let updated = 0;
    try {
      for (const item of items) {
        try {
          const { data } = await productsApi.getBySlug(item.product.slug);
          const fresh = data.data!;
          if (
            Number(fresh.price) !== Number(item.product.price) ||
            fresh.stock !== item.product.stock
          ) {
            // Обновляем товар в корзине через removeItem + addItem
            removeItem(item.product.id);
            if (fresh.stock > 0) {
              useCartStore.getState().addItem(
                fresh,
                Math.min(item.quantity, fresh.stock)
              );
            }
            updated++;
          }
        } catch {
          // Товар мог быть удалён
          removeItem(item.product.id);
          updated++;
        }
      }
      if (updated > 0) {
        toast.success(`Цены и наличие обновлены (${updated} позиций)`);
      } else {
        toast.success('Все цены актуальны');
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      {/* Затемнение */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(42,31,22,0.35)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />

      {/* Панель */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Корзина"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
          width: 'min(420px, 100vw)',
          background: 'var(--cream)',
          borderLeft: '1px solid var(--cream-border)',
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
          boxShadow: '-8px 0 40px rgba(42,31,22,0.12)',
        }}
      >
        {/* Шапка */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--cream-border)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 400,
              color: 'var(--brown-dark)',
            }}
          >
            Корзина
            {totalItems() > 0 && (
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-hint)',
                  marginLeft: '8px',
                }}
              >
                ({totalItems()})
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {items.length > 0 && (
              <button
                onClick={refreshPrices}
                disabled={refreshing}
                title="Обновить цены и наличие"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-hint)', padding: '4px', display: 'flex',
                  opacity: refreshing ? 0.5 : 1,
                }}
              >
                <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            )}
            <button
              onClick={closeCart}
              aria-label="Закрыть корзину"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px',
              }}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Список товаров */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem',
                  color: 'var(--text-hint)',
                  marginBottom: '12px',
                }}
              >
                Корзина пуста
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-hint)', marginBottom: '24px' }}>
                Добавьте понравившиеся товары
              </p>
              <Button variant="secondary" size="sm" onClick={closeCart}>
                <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Перейти в магазин
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              {/* BUG-19: Предупреждение об устаревших ценах */}
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-hint)',
                  textAlign: 'center',
                  padding: '10px 0 6px',
                  letterSpacing: '0.03em',
                }}
              >
                Цены могут измениться.{' '}
                <button
                  onClick={refreshPrices}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--sand)', fontSize: '0.88rem', padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Обновить
                </button>
              </p>
              {items.map((item, i) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr auto',
                    gap: '14px',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom:
                      i < items.length - 1 ? '1px solid var(--cream-border)' : 'none',
                  }}
                >
                  {/* Миниатюра */}
                  <Link to={`/shop/${item.product.slug}`} onClick={closeCart}>
                    <img
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      style={{
                        width: '72px', height: '90px',
                        objectFit: 'cover', borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </Link>

                  {/* Информация */}
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.95rem',
                        color: 'var(--brown-dark)',
                        lineHeight: 1.3,
                        marginBottom: '6px',
                      }}
                    >
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--sand-dark)' }}>
                      ₽{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>

                    {/* Количество */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        aria-label="Уменьшить количество"
                        style={{
                          background: 'var(--cream-dark)', border: 'none',
                          borderRadius: '50%', width: '26px', height: '26px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--text-muted)',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        style={{
                          fontSize: '0.88rem',
                          minWidth: '22px',
                          textAlign: 'center',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        aria-label="Увеличить количество"
                        style={{
                          background: 'var(--cream-dark)', border: 'none',
                          borderRadius: '50%', width: '26px', height: '26px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer',
                          color: 'var(--text-muted)',
                          opacity: item.quantity >= item.product.stock ? 0.4 : 1,
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Удалить */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    aria-label="Удалить товар"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-hint)', padding: '4px', alignSelf: 'flex-start',
                    }}
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Подвал */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--cream-border)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
                alignItems: 'baseline',
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
            <Link to="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg">Перейти к оформлению</Button>
            </Link>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-hint)',
                textAlign: 'center',
                marginTop: '10px',
                letterSpacing: '0.04em',
              }}
            >
              Стоимость доставки рассчитывается при оформлении
            </p>
          </div>
        )}
      </aside>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

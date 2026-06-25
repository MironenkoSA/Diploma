// src/pages/ProductDetail.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowLeft, Star } from 'lucide-react';
import { productsApi } from '../api';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: 'Отличное — безупречное состояние',
  GOOD:      'Хорошее — незначительные следы времени',
  FAIR:      'Удовлетворительное — видимый износ, полностью рабочее',
  POOR:      'Плохое — значительный износ, продаётся как есть',
};

const COUNTRY_RU: Record<string, string> = {
  'France': 'Франция', 'Italy': 'Италия', 'United Kingdom': 'Великобритания',
  'Germany': 'Германия', 'United States': 'США', 'Denmark': 'Дания',
  'Norway': 'Норвегия', 'Switzerland': 'Швейцария', 'Japan': 'Япония',
  'Soviet Union': 'СССР', 'Belgium': 'Бельгия', 'Finland': 'Финляндия',
  'Sweden': 'Швеция', 'Netherlands': 'Нидерланды', 'Austria': 'Австрия',
  'Spain': 'Испания', 'Poland': 'Польша', 'Czech Republic': 'Чехия', 'Russia': 'Россия',
};
function localizeCountry(country: string): string {
  return COUNTRY_RU[country] || country;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const { addItem, items } = useCartStore();
  const isInCart = items.some(i => i.product.slug === slug);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!).then(r => r.data.data!),
    enabled: !!slug,
  });

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} добавлен в корзину`);
  }

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="container page-enter" style={{ padding: '80px 16px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-hint)', marginBottom: '16px' }}>
        Товар не найден
      </h2>
      <Link to="/shop"><Button variant="secondary">Назад в магазин</Button></Link>
    </div>
  );

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  return (
    <main className="page-enter">
      <div className="container" style={{ padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)' }}>

        {/* Хлебные крошки */}
        <nav style={{ marginBottom: '32px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-hint)' }}>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={13} /> Магазин
          </Link>
          <span>/</span>
          <Link to={`/shop?categoryId=${product.categoryId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {product.category.name}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </nav>

        {/* Основная сетка */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'start' }}>

          {/* Галерея */}
          <div>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '3/4', marginBottom: '12px', background: 'var(--cream-dark)' }}>
              <img
                src={product.images[activeImage] || '/placeholder.jpg'}
                alt={product.name}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent && !parent.querySelector('.img-fallback')) {
                    const div = document.createElement('div');
                    div.className = 'img-fallback';
                    div.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--cream-dark);color:var(--text-hint);font-size:0.9rem;';
                    div.textContent = 'Фото не загрузилось';
                    parent.appendChild(div);
                  }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
              />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: '72px', height: '90px', padding: 0, cursor: 'pointer',
                      border: `2px solid ${i === activeImage ? 'var(--sand)' : 'var(--cream-border)'}`,
                      borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                      background: 'none', transition: 'border-color var(--transition)',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Фото ${i + 1}`}
                      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Информация */}
          <div style={{ position: 'sticky', top: '90px' }}>
            {/* Категория + эпоха */}
            <p style={{ fontSize: '0.88rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>
              {product.category.name}{product.era && ` · ${product.era.replace('s', '-е')}`}
            </p>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '16px', lineHeight: 1.15 }}>
              {product.name}
            </h1>

            {/* Рейтинг */}
            {avgRating !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(avgRating) ? 'var(--sand)' : 'none'} color="var(--sand)" />
                ))}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-hint)', marginLeft: '4px' }}>
                  ({product.reviews?.length})
                </span>
              </div>
            )}

            {/* Цена */}
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--sand-dark)', marginBottom: '28px' }}>
              ₽{Number(product.price).toFixed(0)}
            </p>

            {/* Описание */}
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '32px', fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Характеристики */}
            <div style={{ borderTop: '1px solid var(--cream-border)', borderBottom: '1px solid var(--cream-border)', padding: '20px 0', marginBottom: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {product.countryOfOrigin && <Spec label="Происхождение" value={localizeCountry(product.countryOfOrigin)} />}
                {product.era && <Spec label="Эпоха" value={product.era.replace('s', '-е')} />}
                {product.yearManufactured && <Spec label="Год" value={String(product.yearManufactured)} />}
                <Spec label="Состояние" value={CONDITION_LABELS[product.condition]} />
                <Spec label="Артикул" value={product.id.slice(0, 8).toUpperCase()} />
              </div>
            </div>

            {/* Остаток на складе */}
            {product.stock > 0 && product.stock <= 2 && (
              <p style={{ fontSize: '0.92rem', color: 'var(--sand-dark)', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Осталось {product.stock === 1 ? 'всего 1 экземпляр' : `${product.stock} экземпляра`}
              </p>
            )}

            {/* Количество + Кнопка */}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {product.stock > 1 && (
                  <select
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                    style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: 'var(--white)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                  >
                    {Array.from({ length: Math.min(product.stock, 10) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                )}
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
                >
                  <ShoppingBag size={18} />
                  {isInCart ? '✓ В корзине' : 'В корзину'}
                </Button>
              </div>
            ) : (
              <div style={{ padding: '14px', background: 'var(--cream-dark)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Продано</p>
              </div>
            )}

            {/* Гарантии */}
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '16px', lineHeight: 1.9 }}>
              Возврат в течение 14 дней · Доставка по России · Гарантия подлинности
            </p>
          </div>
        </div>

        {/* Отзывы */}
        {product.reviews && product.reviews.length > 0 && (
          <section style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid var(--cream-border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '32px' }}>
              Отзывы ({product.reviews.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {product.reviews.map(review => (
                <div key={review.id} style={{ padding: '20px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? 'var(--sand)' : 'none'} color="var(--sand)" />
                    ))}
                  </div>
                  {review.comment && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '12px' }}>
                      {review.comment}
                    </p>
                  )}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>
                    {review.user.name} · {new Date(review.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container" style={{ padding: '48px 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-md)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '14px', width: '40%' }} />
          <div className="skeleton" style={{ height: '40px', width: '80%' }} />
          <div className="skeleton" style={{ height: '32px', width: '30%' }} />
          <div className="skeleton" style={{ height: '100px' }} />
          <div className="skeleton" style={{ height: '48px' }} />
        </div>
      </div>
    </div>
  );
}

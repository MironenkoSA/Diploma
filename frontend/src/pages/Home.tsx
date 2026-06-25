// src/pages/Home.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, promotionsApi, categoriesApi } from '../api';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { ArrowRight, Package, Clock, Leaf, BookOpen } from 'lucide-react';

// Фоновые изображения для категорий
// Чтобы заменить картинку — положи файл в /public/images/categories/
// и переименуй: jewellery.jpg, clothing.jpg, tableware.jpg, art-decor.jpg, watches.jpg
const CATEGORY_PHOTOS: Record<string, string> = {
  'jewellery': '/images/categories/jewellery.jpg',
  'clothing':  '/images/categories/clothing.jpg',
  'tableware': '/images/categories/tableware.jpg',
  'art-decor': '/images/categories/art-decor.jpg',
  'watches':   '/images/categories/watches.jpg',
};

// Fallback если локальный файл не загрузился
const CATEGORY_FALLBACK: Record<string, string> = {
  'jewellery': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'clothing':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'tableware': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
  'art-decor': 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&q=80',
  'watches':   'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
};

export default function Home() {
  const navigate = useNavigate();

  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeatured(8).then(r => r.data.data),
  });
  const { data: newest } = useQuery({
    queryKey: ['newest-products'],
    queryFn: () => productsApi.getAll({ sort: 'newest', limit: '4' } as any).then(r => r.data?.data ?? []),
  });
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => productsApi.getRecommendations().then(r => r.data.data),
  });
  const { data: promotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsApi.getActive().then(r => r.data.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const [showNewest, setShowNewest] = React.useState(false);

  return (
    <main className="page-enter">

      {/* ══ HERO — полная ширина, текст поверх фото ══════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Фоновое фото на всю ширину */}
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=85"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            filter: 'sepia(15%) brightness(0.75)',
          }}
        />

        {/* Градиент — затемняем правую часть меньше, левую — сильнее для читаемости текста */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, rgba(30,18,10,0.78) 0%, rgba(30,18,10,0.55) 45%, rgba(30,18,10,0.15) 100%)',
        }} />

        {/* Контент */}
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px,10vw,140px) clamp(24px,5vw,80px)' }}>
          <div style={{ maxWidth: '560px' }}>
            {/* Декоративная линия */}
            <div style={{ width: '40px', height: '2px', background: 'var(--sand)', marginBottom: '28px' }} />

            <p style={{
              fontSize: '0.82rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--sand-light)',
              marginBottom: '20px',
            }}>
              Антиквариат с 2018 года
            </p>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#fff',
              marginBottom: '24px',
              lineHeight: 1.1,
              fontSize: 'clamp(2.8rem,5vw,4.5rem)',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}>
              Вещи с историей,<br />красота на века
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.85,
              maxWidth: '440px',
              marginBottom: '44px',
            }}>
              Украшения, одежда, посуда и предметы декора — каждая вещь лично отобрана по всей Европе за характер и подлинность.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/shop"><Button size="lg">В магазин</Button></Link>
              <Link to="/about">
                <Button variant="secondary" size="lg" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                  Наша история
                </Button>
              </Link>
            </div>

            {/* Статистика */}
            <div style={{
              display: 'flex',
              gap: '40px',
              marginTop: '56px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}>
              {[['70+', 'уникальных вещей'], ['5', 'категорий'], ['100%', 'подлинность']].map(([num, label]) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: '#fff', lineHeight: 1 }}>{num}</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Карточка «Новое поступление» — интерактивная ══════════ */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          right: 'clamp(24px,4vw,64px)',
          zIndex: 2,
        }}>
          <button
            onClick={() => setShowNewest(s => !s)}
            style={{
              background: 'rgba(250,247,242,0.95)',
              backdropFilter: 'blur(16px)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(200,168,130,0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '220px',
              transition: 'transform var(--transition), box-shadow var(--transition)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'none';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sand)' }}>
                Новые поступления
              </p>
              <span style={{
                fontSize: '0.7rem',
                background: 'var(--sand)',
                color: '#fff',
                borderRadius: '50px',
                padding: '2px 7px',
                letterSpacing: '0.05em',
              }}>
                {newest?.length ?? 0}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.97rem', color: 'var(--brown-dark)', lineHeight: 1.35 }}>
              {newest?.[0]?.name ?? 'Новые поступления в каталоге'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--sand-dark)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showNewest ? 'Скрыть ↑' : 'Смотреть →'}
            </p>
          </button>

          {/* Всплывающие карточки новинок */}
          {showNewest && newest && newest.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 12px)',
              right: 0,
              width: '320px',
              background: 'rgba(250,247,242,0.97)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(200,168,130,0.3)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--cream-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Новинки</p>
                <Link to="/shop?sort=newest" onClick={() => setShowNewest(false)} style={{ fontSize: '0.78rem', color: 'var(--sand)', textDecoration: 'none' }}>
                  Все →
                </Link>
              </div>
              {newest.slice(0, 4).map((product: any) => (
                <Link
                  key={product.id}
                  to={`/shop/${product.slug}`}
                  onClick={() => setShowNewest(false)}
                  style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--cream-border)', textDecoration: 'none', alignItems: 'center' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--cream-dark)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', color: 'var(--brown-dark)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--sand-dark)', marginTop: '4px' }}>
                      ₽{Number(product.price).toFixed(0)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ ПРОМО-БАННЕР ══════════════════════════════════════════ */}
      {promotions && promotions.length > 0 && (
        <section style={{ background: 'var(--brown-dark)', padding: '18px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {promotions.map((promo: any) => (
              <div key={promo.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--sand)', fontSize: '0.82rem', letterSpacing: '0.2em' }}>✦</span>
                <p style={{ color: 'var(--cream)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{promo.title}</p>
                {promo.linkUrl && (
                  <Link to={promo.linkUrl} style={{ color: 'var(--sand-light)', fontSize: '0.85rem', textDecoration: 'underline', textDecorationColor: 'rgba(200,168,130,0.5)' }}>
                    Подробнее →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ КАТЕГОРИИ — горизонтальная лента с фото ══════════════ */}
      {categories && categories.length > 0 && (
        <section style={{ padding: 'clamp(64px,9vw,112px) 0', background: 'var(--cream)' }}>
          <div className="container">
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '10px' }}>Коллекция</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)' }}>Категории</h2>
            </div>

            {/* Карточки — фото + название поверх */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
            }}>
              {categories.slice(0, 5).map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/shop?categoryId=${cat.id}`}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <div style={{
                    position: 'relative',
                    height: '260px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => {
                      const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLElement;
                      if (img) img.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={e => {
                      const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLElement;
                      if (img) img.style.transform = 'scale(1)';
                    }}
                  >
                    {/* Фото */}
                    <img
                      src={CATEGORY_PHOTOS[cat.slug] || CATEGORY_PHOTOS['jewellery']}
                      alt={cat.name}
                      onError={(e) => {
                        const img = e.currentTarget;
                        const fallback = CATEGORY_FALLBACK[cat.slug];
                        if (fallback && img.src !== fallback) img.src = fallback;
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'sepia(20%) brightness(0.8)',
                        transition: 'transform 0.5s var(--ease)',
                      }}
                    />
                    {/* Градиент снизу */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(30,18,10,0.75) 0%, transparent 55%)',
                    }} />
                    {/* Текст */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 16px' }}>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        color: '#fff',
                        marginBottom: '3px',
                      }}>
                        {cat.name}
                      </p>
                      {cat._count && (
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.05em' }}>
                          {cat._count.products} вещей
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ ИЗБРАННЫЕ ВЕЩИ ════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section style={{ padding: 'clamp(64px,9vw,112px) 0', background: 'var(--cream-dark)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '10px' }}>Специальный выбор</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)' }}>Избранные вещи</h2>
              </div>
              <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sand-dark)', textDecoration: 'none' }}>
                Все товары <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '24px' }}>
              {featured.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ ПОЛОСА ДОВЕРИЯ ════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) 0', background: 'var(--brown-dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {[
              { Icon: Package, title: 'Бережная доставка', desc: 'Каждая вещь упаковывается индивидуально с защитными материалами' },
              { Icon: Clock, title: 'Гарантия подлинности', desc: 'Все предметы проходят экспертизу перед добавлением в каталог' },
              { Icon: Leaf, title: 'Осознанный выбор', desc: 'Антиквариат — самая устойчивая форма покупки для планеты' },
              { Icon: BookOpen, title: 'История каждой вещи', desc: 'Мы исследуем происхождение и делимся историей предмета' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Icon size={24} color="var(--sand)" strokeWidth={1.5} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)', fontWeight: 400 }}>{title}</p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(228,207,176,0.65)', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ РЕКОМЕНДАЦИИ ══════════════════════════════════════════ */}
      {recommendations && recommendations.length > 0 && (
        <section style={{ padding: 'clamp(64px,9vw,112px) 0', background: 'var(--cream)' }}>
          <div className="container">
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '10px' }}>Для вас</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)' }}>Рекомендации</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '24px' }}>
              {recommendations.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ РЕДАКЦИОННАЯ ЦИТАТА ═══════════════════════════════════ */}
      <section style={{
        padding: 'clamp(80px,10vw,140px) 0',
        background: 'var(--cream-dark)',
        borderTop: '1px solid var(--cream-border)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)', fontSize: '20rem', color: 'var(--cream-border)',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>"</div>
        <div className="container" style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', color: 'var(--brown-dark)',
            lineHeight: 1.45, marginBottom: '32px',
          }}>
            Каждая вещь несёт в себе историю. Мы здесь, чтобы помочь вам найти следующую главу своей.
          </p>
          <Link to="/about">
            <Button variant="ghost" style={{ color: 'var(--sand-dark)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Об Ателье Историй <ArrowRight size={14} style={{ marginLeft: '6px' }} />
            </Button>
          </Link>
        </div>
      </section>

    </main>
  );
}

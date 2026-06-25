// src/pages/Fairs.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag, Calendar, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { fairsApi } from '../api';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';

// Список всех ярмарок
export default function Fairs() {
  const { data: fairs = [], isLoading } = useQuery({
    queryKey: ['fairs'],
    queryFn: () => fairsApi.getAll().then(r => r.data.data ?? []),
  });

  const now = new Date();
  const active = (fairs as any[]).filter((f: any) =>
    new Date(f.startsAt) <= now && new Date(f.endsAt) >= now
  );
  const upcoming = (fairs as any[]).filter((f: any) => new Date(f.startsAt) > now);
  const past = (fairs as any[]).filter((f: any) => new Date(f.endsAt) < now);

  return (
    <main className="page-enter">
      {/* Header */}
      <div style={{
        background: 'var(--brown-dark)',
        padding: 'clamp(48px,7vw,80px) 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          border: '1px solid rgba(200,168,130,0.15)',
        }} />
        <div className="container">
          <p style={{ fontSize: '0.88rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>
            Тематические распродажи
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--cream)', marginBottom: '16px' }}>
            Ярмарки
          </h1>
          <p style={{ color: 'rgba(228,207,176,0.7)', maxWidth: '500px', lineHeight: 1.75, fontSize: '0.95rem' }}>
            Тематические подборки с отобранными вещами по особым ценам.
            Каждая ярмарка — отдельный взгляд на одну эпоху или стиль.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : (
          <>
            {/* Active fairs */}
            {active.length > 0 && (
              <section style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '1.6rem' }}>
                    Идёт сейчас
                  </h2>
                  <span style={{ background: 'rgba(74,124,89,0.1)', color: 'var(--success)', fontSize: '0.88rem', padding: '3px 10px', borderRadius: '50px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Активно
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {active.map((f: any) => <FairCard key={f.id} fair={f} active />)}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section style={{ marginBottom: '56px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '24px', fontSize: '1.5rem' }}>
                  Скоро
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {upcoming.map((f: any) => <FairCard key={f.id} fair={f} />)}
                </div>
              </section>
            )}

            {active.length === 0 && upcoming.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Tag size={40} style={{ color: 'var(--text-hint)', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-hint)', marginBottom: '8px' }}>
                  Ближайших ярмарок нет
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginBottom: '24px' }}>Следите за расписанием</p>
                <Link to="/shop"><Button variant="secondary">Перейти в магазин</Button></Link>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section style={{ paddingTop: '40px', borderTop: '1px solid var(--cream-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--text-hint)', marginBottom: '20px', fontSize: '1.3rem' }}>
                  Прошедшие ярмарки
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {past.map((f: any) => (
                    <div key={f.id} style={{
                      padding: '18px', background: 'var(--cream-dark)', border: '1px solid var(--cream-border)',
                      borderRadius: 'var(--radius-md)', opacity: 0.65,
                    }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--brown-dark)', marginBottom: '8px' }}>{f.title}</p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>
                        {new Date(f.startsAt).toLocaleDateString('ru-RU')} — {new Date(f.endsAt).toLocaleDateString('ru-RU')}
                      </p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                        {f._count?.items ?? 0} лотов
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function FairCard({ fair, active }: { fair: any; active?: boolean }) {
  const daysLeft = Math.ceil((new Date(fair.endsAt).getTime() - Date.now()) / 86400000);
  const daysUntil = Math.ceil((new Date(fair.startsAt).getTime() - Date.now()) / 86400000);

  return (
    <Link to={`/fairs/${fair.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article style={{
        background: active ? 'var(--white)' : 'var(--cream-dark)',
        border: `1px solid ${active ? 'var(--sand-light)' : 'var(--cream-border)'}`,
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        transition: 'box-shadow var(--transition)',
        boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        height: '100%',
      }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = active ? 'var(--shadow-md)' : 'var(--shadow-sm)')}
      >
        {/* Banner */}
        <div style={{
          height: '160px',
          background: fair.imageUrl ? `url(${fair.imageUrl}) center/cover` : `linear-gradient(135deg, var(--cream-dark) 0%, var(--sand-light) 100%)`,
          position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px',
        }}>
          {active && daysLeft <= 3 && (
            <span style={{
              background: 'var(--sand)', color: '#fff',
              fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 'var(--radius-sm)',
            }}>
              Осталось {daysLeft} {daysLeft === 1 ? 'день' : 'дня'}
            </span>
          )}
        </div>

        <div style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.15rem', color: 'var(--brown-dark)', marginBottom: '8px', lineHeight: 1.25 }}>
            {fair.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.8 }}>
            {fair.description.length > 100 ? fair.description.slice(0, 100) + '…' : fair.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} />
              {active
                ? `до ${new Date(fair.endsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
                : `с ${new Date(fair.startsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
              }
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>
              {fair._count?.items ?? 0} товаров
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Страница конкретной ярмарки ──────────────────────────
export function FairDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: fair, isLoading } = useQuery({
    queryKey: ['fair', id],
    queryFn: () => fairsApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="container" style={{ padding: '80px 16px' }}>
      <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)', marginBottom: '32px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-md)' }} />)}
      </div>
    </div>
  );

  if (!fair) return (
    <div className="container page-enter" style={{ padding: '80px 16px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-hint)' }}>Ярмарка не найдена</h2>
      <Link to="/fairs" style={{ marginTop: '16px', display: 'inline-block' }}><Button variant="secondary">Все ярмарки</Button></Link>
    </div>
  );

  const now = new Date();
  const isActive = new Date(fair.startsAt) <= now && new Date(fair.endsAt) >= now;
  const isUpcoming = new Date(fair.startsAt) > now;
  const daysLeft = Math.ceil((new Date(fair.endsAt).getTime() - now.getTime()) / 86400000);

  return (
    <main className="page-enter">
      {/* Hero */}
      <div style={{
        background: fair.imageUrl ? `linear-gradient(rgba(42,31,22,0.55),rgba(42,31,22,0.55)), url(${fair.imageUrl}) center/cover` : 'var(--brown-dark)',
        padding: 'clamp(48px,7vw,88px) 0',
      }}>
        <div className="container">
          <Link to="/fairs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(228,207,176,0.7)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '20px' }}>
            <ArrowLeft size={13} /> Все ярмарки
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              {isActive && (
                <span style={{ background: 'rgba(74,124,89,0.8)', color: '#fff', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: '12px' }}>
                  Идёт сейчас
                </span>
              )}
              {isUpcoming && (
                <span style={{ background: 'rgba(200,168,130,0.7)', color: '#fff', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: '12px' }}>
                  Скоро
                </span>
              )}
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--cream)', fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: '12px' }}>
                {fair.title}
              </h1>
              <p style={{ color: 'rgba(228,207,176,0.8)', maxWidth: '520px', lineHeight: 1.75 }}>
                {fair.description}
              </p>
            </div>

            <div style={{ background: 'rgba(250,247,242,0.1)', borderRadius: 'var(--radius-md)', padding: '20px 24px', minWidth: '180px', backdropFilter: 'blur(8px)' }}>
              <p style={{ fontSize: '0.88rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(228,207,176,0.6)', marginBottom: '6px' }}>Сроки</p>
              <p style={{ color: 'var(--cream)', fontSize: '0.88rem', marginBottom: '12px' }}>
                {new Date(fair.startsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} —{' '}
                {new Date(fair.endsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {isActive && (
                <p style={{ color: 'var(--sand-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={13} /> Осталось {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
                </p>
              )}
              <p style={{ color: 'rgba(228,207,176,0.6)', fontSize: '0.92rem', marginTop: '8px' }}>
                {fair.items?.length ?? 0} товаров в ярмарке
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container" style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)' }}>
        {fair.items?.length === 0 ? (
          <p style={{ color: 'var(--text-hint)', textAlign: 'center', padding: '60px 0' }}>
            Товары ещё не добавлены
          </p>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '32px', fontSize: '1.5rem' }}>
              Товары ярмарки
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {fair.items.map((item: any) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  {item.discountPct && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                      background: 'var(--sand)', color: '#fff',
                      fontSize: '0.88rem', fontWeight: 500, letterSpacing: '0.05em',
                      padding: '3px 9px', borderRadius: 'var(--radius-sm)',
                    }}>
                      −{item.discountPct}%
                    </div>
                  )}
                  <ProductCard product={item.product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

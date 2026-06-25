// src/pages/Events.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { eventsApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Events() {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll().then(r => r.data.data ?? []),
  });

  const registerMutation = useMutation({
    mutationFn: (id: string) => eventsApi.register(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Вы успешно записаны! Письмо с подтверждением отправлено на вашу почту.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Не удалось записаться');
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: (id: string) => eventsApi.unregister(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Запись отменена');
    },
  });

  const upcoming = (events as any[]).filter((e: any) => new Date(e.endsAt) >= new Date());
  const past = (events as any[]).filter((e: any) => new Date(e.endsAt) < new Date());

  return (
    <main className="page-enter">
      {/* Header */}
      <div style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--cream-border)', padding: 'clamp(40px,6vw,72px) 0' }}>
        <div className="container">
          <p style={{ fontSize: '0.88rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>
            Мероприятия
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)', marginBottom: '16px' }}>
            События и встречи
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '560px', lineHeight: 1.75 }}>
            Лекции, мастер-классы и тематические вечера для любителей винтажа.
            Запишитесь онлайн — мы пришлём подтверждение на почту.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)' }}>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section style={{ marginBottom: '56px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '28px', fontSize: '1.6rem' }}>
                  Предстоящие мероприятия
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {upcoming.map((event: any) => (
                    <EventCard
                      key={event.id} event={event}
                      isAuthenticated={user !== null}
                      onRegister={() => registerMutation.mutate(event.id)}
                      onUnregister={() => unregisterMutation.mutate(event.id)}
                      registerLoading={registerMutation.isPending}
                      unregisterLoading={unregisterMutation.isPending}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcoming.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Calendar size={40} style={{ color: 'var(--text-hint)', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-hint)', marginBottom: '8px' }}>
                  Ближайших мероприятий нет
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>Следите за обновлениями</p>
              </div>
            )}

            {/* Past events */}
            {past.length > 0 && (
              <section style={{ paddingTop: '40px', borderTop: '1px solid var(--cream-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--text-hint)', marginBottom: '24px', fontSize: '1.4rem' }}>
                  Прошедшие
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {past.map((event: any) => (
                    <div key={event.id} style={{
                      padding: '20px', background: 'var(--cream-dark)', border: '1px solid var(--cream-border)',
                      borderRadius: 'var(--radius-md)', opacity: 0.7,
                    }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--brown-dark)', marginBottom: '8px' }}>{event.title}</p>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(event.startsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                        Участников: {event.registrationCount}
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

function EventCard({ event, isAuthenticated, onRegister, onUnregister, registerLoading, unregisterLoading }: any) {
  const isFull = event.maxCapacity && event.registrationCount >= event.maxCapacity;
  const isStartingSoon = new Date(event.startsAt).getTime() - Date.now() < 7 * 86400000;

  return (
    <article style={{
      background: 'var(--white)', border: '1px solid var(--cream-border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'box-shadow var(--transition)',
      boxShadow: 'var(--shadow-sm)',
    }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)')}
    >
      {/* Image or gradient banner */}
      <div style={{
        height: '140px', background: event.imageUrl
          ? `url(${event.imageUrl}) center/cover` : 'linear-gradient(135deg, var(--cream-dark), var(--sand-light))',
        position: 'relative',
      }}>
        {isStartingSoon && (
          <span style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'var(--sand)', color: '#fff',
            fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: 'var(--radius-sm)',
          }}>
            Скоро
          </span>
        )}
        {isFull && (
          <span style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(42,31,22,0.8)', color: '#fff',
            fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: 'var(--radius-sm)',
          }}>
            Мест нет
          </span>
        )}
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.15rem', color: 'var(--brown-dark)', lineHeight: 1.25 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.85, flex: 1 }}>
          {event.description.length > 120 ? event.description.slice(0, 120) + '…' : event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            {new Date(event.startsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            {event.location}
          </p>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={13} style={{ flexShrink: 0 }} />
            {event.registrationCount} записалось
            {event.maxCapacity && ` из ${event.maxCapacity}`}
          </p>
        </div>

        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" fullWidth style={{ color: 'var(--sand-dark)', fontSize: '0.85rem' }}>Подробнее →</Button>
              </Link>
          {!isAuthenticated ? (
            <Link to="/login" state={{ from: { pathname: location.pathname } }} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" fullWidth>Войдите, чтобы записаться</Button>
            </Link>
          ) : event.registrationStatus === 'PENDING_PAYMENT' ? (
            <div style={{ padding: '9px 14px', background: 'rgba(200,168,130,0.1)', border: '1px solid var(--sand-light)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--sand-dark)' }}>📧 Ожидает оплаты</p>
            </div>
          ) : event.registrationStatus === 'CANCELLED' ? (
            <div style={{ padding: '9px 14px', background: 'rgba(184,64,64,0.06)', border: '1px solid rgba(184,64,64,0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--error)' }}>❌ Бронь аннулирована</p>
            </div>
          ) : event.isRegistered ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                flex: 1, padding: '9px 14px', background: 'rgba(74,124,89,0.08)',
                border: '1px solid rgba(74,124,89,0.25)', borderRadius: 'var(--radius-sm)',
                textAlign: 'center', fontSize: '0.95rem', color: 'var(--success)',
              }}>
                ✓ Вы записаны
              </div>
              <Button variant="ghost" size="sm" loading={unregisterLoading} onClick={onUnregister}
                style={{ color: 'var(--error)', borderColor: 'transparent', whiteSpace: 'nowrap' }}>
                Отмена
              </Button>
            </div>
          ) : isFull ? (
            <Button variant="secondary" size="sm" fullWidth disabled>Мест нет</Button>
          ) : (
            <Button size="sm" fullWidth loading={registerLoading} onClick={onRegister}>
              Записаться
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

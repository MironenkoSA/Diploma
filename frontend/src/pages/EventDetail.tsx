// src/pages/EventDetail.tsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Users, User, ArrowLeft, Tag } from 'lucide-react';
import { eventsApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () => eventsApi.register(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Вы записаны! Подтверждение отправлено на почту.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Не удалось записаться');
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: () => eventsApi.unregister(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast.success('Запись отменена');
    },
  });

  if (isLoading) return <EventDetailSkeleton />;

  if (!event) return (
    <div className="container page-enter" style={{ padding: '80px 16px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-hint)', marginBottom: '16px' }}>
        Мероприятие не найдено
      </h2>
      <Link to="/events"><Button variant="secondary">Все события</Button></Link>
    </div>
  );

  const now = new Date();
  const hasEnded = new Date(event.endsAt) < now;
  const isFull = event.maxCapacity && event.registrationCount >= event.maxCapacity;
  const spotsLeft = event.maxCapacity
    ? event.maxCapacity - event.registrationCount
    : null;
  const isFree = event.price === 0 || event.price === null || event.price === undefined;
  const encodedLocation = encodeURIComponent(event.location);
  const yandexMapUrl = `https://yandex.ru/maps/?text=${encodedLocation}&z=16`;
  const yandexEmbedUrl = `https://yandex.ru/map-widget/v1/?text=${encodedLocation}&z=15&l=map`;

  return (
    <main className="page-enter">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        background: event.imageUrl
          ? `linear-gradient(rgba(30,18,10,0.6),rgba(30,18,10,0.6)), url(${event.imageUrl}) center/cover`
          : 'var(--brown-dark)',
        padding: 'clamp(48px,7vw,88px) 0',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="container">
          <Link
            to="/events"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(228,207,176,0.7)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '24px' }}
          >
            <ArrowLeft size={13} /> Все события
          </Link>

          {hasEnded && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(228,207,176,0.8)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--radius-sm)' }}>
                Завершено
              </span>
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300, color: '#fff',
            fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: '16px', maxWidth: '700px', lineHeight: 1.15,
          }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(228,207,176,0.85)', fontSize: '0.9rem' }}>
              <Calendar size={14} />
              {new Date(event.startsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(228,207,176,0.85)', fontSize: '0.9rem' }}>
              <Clock size={14} />
              {new Date(event.startsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — {new Date(event.endsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.maxCapacity && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(228,207,176,0.85)', fontSize: '0.9rem' }}>
                <Users size={14} />
                {event.registrationCount} / {event.maxCapacity} мест
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: isFree ? 'rgba(120,200,140,0.9)' : 'rgba(228,207,176,0.85)' }}>
              <Tag size={14} />
              {isFree ? 'Бесплатно' : `₽${Number(event.price).toFixed(0)}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Основной контент ──────────────────────────────── */}
      <div className="container" style={{ padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)', gap: '48px', alignItems: 'start' }}>

          {/* Левая колонка */}
          <div>
            {/* Описание */}
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '20px', fontSize: '1.5rem' }}>
                О мероприятии
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </section>

            {/* Спикер */}
            {event.speaker && (
              <section style={{ marginBottom: '48px', padding: '24px 28px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--sand)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <User size={16} color="var(--sand-dark)" strokeWidth={1.5} />
                  <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--sand-dark)' }}>
                    Спикер
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown-dark)', lineHeight: 1.4 }}>
                  {event.speaker}
                </p>
              </section>
            )}

            {/* Карта Яндекс */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <MapPin size={16} color="var(--sand-dark)" strokeWidth={1.5} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '1.3rem' }}>
                  Место проведения
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
                {event.location}
              </p>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--cream-border)', height: '360px', position: 'relative' }}>
                <iframe
                  src={yandexEmbedUrl}
                  width="100%"
                  height="360"
                  style={{ border: 'none', display: 'block' }}
                  title={`Карта: ${event.location}`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <a
                href={yandexMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '0.85rem', color: 'var(--sand-dark)', textDecoration: 'none' }}
              >
                Открыть в Яндекс.Картах →
              </a>
            </section>
          </div>

          {/* Правая колонка — карточка записи */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--cream-border)',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              boxShadow: 'var(--shadow-md)',
            }}>
              {/* Стоимость */}
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--cream-border)' }}>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '8px' }}>
                  Стоимость
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: isFree ? 'var(--success)' : 'var(--sand-dark)', lineHeight: 1 }}>
                  {isFree ? 'Бесплатно' : `₽${Number(event.price).toFixed(0)}`}
                </p>
              </div>

              {/* Детали */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <InfoRow icon={<Calendar size={15} />} label="Дата">
                  {new Date(event.startsAt).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </InfoRow>
                <InfoRow icon={<Clock size={15} />} label="Время">
                  {new Date(event.startsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — {new Date(event.endsAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </InfoRow>
                <InfoRow icon={<MapPin size={15} />} label="Место">
                  {event.location}
                </InfoRow>
                {event.maxCapacity && (
                  <InfoRow icon={<Users size={15} />} label="Мест осталось">
                    {isFull ? (
                      <span style={{ color: 'var(--error)' }}>Мест нет</span>
                    ) : (
                      <span style={{ color: spotsLeft && spotsLeft <= 5 ? 'var(--sand-dark)' : 'inherit' }}>
                        {spotsLeft} из {event.maxCapacity}
                      </span>
                    )}
                  </InfoRow>
                )}
              </div>

              {/* Кнопка */}
              {hasEnded ? (
                <div style={{ padding: '12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-hint)', letterSpacing: '0.08em' }}>Мероприятие завершено</p>
                </div>
              ) : event.registrationStatus === 'PENDING_PAYMENT' ? (
                <div>
                  <div style={{ padding: '14px 16px', background: 'rgba(200,168,130,0.1)', border: '1px solid var(--sand-light)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--sand-dark)', fontWeight: 500, marginBottom: '6px' }}>📧 Ожидает оплаты</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Письмо с реквизитами отправлено на вашу почту. Оплатите участие до истечения срока.
                    </p>
                    {event.paymentDeadline && (
                      <PaymentCountdown deadline={new Date(event.paymentDeadline)} />
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => unregisterMutation.mutate()}
                    loading={unregisterMutation.isPending}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Отменить бронь
                  </Button>
                </div>
              ) : event.registrationStatus === 'CANCELLED' ? (
                <div>
                  <div style={{ padding: '12px 16px', background: 'rgba(184,64,64,0.06)', border: '1px solid rgba(184,64,64,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--error)' }}>❌ Бронь аннулирована</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-hint)', marginTop: '4px' }}>Оплата не поступила вовремя</p>
                  </div>
                  <Button fullWidth size="lg" onClick={() => registerMutation.mutate()} loading={registerMutation.isPending}>
                    Забронировать снова
                  </Button>
                </div>
              ) : event.isRegistered ? (
                <div>
                  <div style={{ padding: '12px 16px', background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--success)' }}>✓ Участие подтверждено</p>
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => unregisterMutation.mutate()}
                    loading={unregisterMutation.isPending}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Отменить запись
                  </Button>
                </div>
              ) : user ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => registerMutation.mutate()}
                  loading={registerMutation.isPending}
                  disabled={!!isFull}
                >
                  {isFull ? 'Мест нет' : 'Записаться'}
                </Button>
              ) : (
                <div>
                  <Link to="/login" state={{ from: { pathname: `/events/${id}` } }}>
                    <Button fullWidth size="lg">Войдите, чтобы записаться</Button>
                  </Link>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-hint)', textAlign: 'center', marginTop: '10px' }}>
                    Нет аккаунта?{' '}
                    <Link to="/register" state={{ from: { pathname: `/events/${id}` } }} style={{ color: 'var(--sand-dark)', textDecoration: 'none' }}>
                      Зарегистрироваться
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function PaymentCountdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    function update() {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Время вышло'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}ч ${m}м до аннуляции`);
    }
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [deadline]);

  const isUrgent = deadline.getTime() - Date.now() < 6 * 3600000;

  return (
    <p style={{ fontSize: '0.82rem', marginTop: '8px', fontWeight: 500, color: isUrgent ? 'var(--error)' : 'var(--sand-dark)' }}>
      ⏰ {timeLeft}
    </p>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--sand)', marginTop: '2px', flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{children}</p>
      </div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height: '260px' }} />
      <div className="container" style={{ padding: '48px 16px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '24px', width: '60%' }} />
          <div className="skeleton" style={{ height: '120px' }} />
          <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
        </div>
        <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}

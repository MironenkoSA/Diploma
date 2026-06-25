// src/pages/About.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { ArrowRight, ShieldCheck, Search, Leaf, BookOpen, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { settingsApi } from '../api';

const VALUES = [
  { Icon: ShieldCheck, title: 'Подлинность', body: 'Каждый предмет лично проверяется. Мы никогда не продаём копии и не искажаем состояние. Наша репутация построена на доверии.' },
  { Icon: Search, title: 'Строгий отбор', body: 'Мы работаем с антикварами Франции, Италии, Великобритании и Германии. Менее 10% найденного попадает в магазин.' },
  { Icon: Leaf, title: 'Экология', body: 'Покупка антиквариата — самая экологичная форма шопинга. Мы верим в бесконечное продление жизни красивых вещей.' },
  { Icon: BookOpen, title: 'Истории', body: 'Там, где нам известна история вещи, мы её рассказываем. Происхождение предмета — часть того, что делает его ценным.' },
];

export default function About() {
  const { data: settings } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => settingsApi.get().then(r => r.data.data),
  });

  const phone   = settings?.phone   || '+7 (863) 210-45-78';
  const email   = settings?.email   || 'hello@atelier-istoriy.ru';
  const address = settings?.address || 'ул. Пушкинская, д. 48';
  const city    = settings?.city    || 'г. Ростов-на-Дону, 344082';
  const hours   = settings?.hours   || 'Пн–Сб, 10:00–19:00';

  return (
    <main className="page-enter">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '65vh', overflow: 'hidden' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=80"
            alt="Антикварный магазин"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(10%) brightness(0.92)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 70%, var(--cream-dark) 100%)' }} />
        </div>

        <div style={{ background: 'var(--cream-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(48px,7vw,100px) clamp(32px,5vw,72px)' }}>
          <div style={{ width: '40px', height: '2px', background: 'var(--sand)', marginBottom: '28px' }} />
          <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '16px' }}>Наша история</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontStyle: 'italic', color: 'var(--brown-dark)', marginBottom: '24px', lineHeight: 1.15, fontSize: 'clamp(2rem,4vw,3rem)' }}>
            Возвращаем красивым вещам вторую жизнь
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            Ателье Историй основано в Ростове-на-Дону двумя коллекционерами, убеждёнными: лучшие вещи в мире уже созданы — и найти их значит не просто купить, а прикоснуться к истории.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '36px' }}>
            Каждая вещь в нашем магазине лично осмотрена, изучена и выбрана потому, что ей есть что рассказать.
          </p>
          <Link to="/shop">
            <Button>Перейти в магазин <ArrowRight size={15} style={{ marginLeft: '6px' }} /></Button>
          </Link>
        </div>
      </section>

      {/* ══ ЦЕННОСТИ ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(72px,9vw,120px) 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>Наши принципы</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)' }}>Почему выбирают нас</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px', background: 'var(--cream-border)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title} style={{ background: 'var(--white)', padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--cream-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="var(--sand-dark)" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--brown-dark)' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ КОНТАКТЫ — данные из настроек ═════════════════════════ */}
      <section style={{ padding: 'clamp(72px,9vw,120px) 0', background: 'var(--cream-dark)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>Приходите к нам</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)', marginBottom: '24px' }}>Связаться с нами</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, marginBottom: '36px' }}>
                Мы рады помочь вам найти идеальную вещь или ответить на любые вопросы об антиквариате. Приходите в шоурум или пишите нам.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { Icon: Mail,  label: 'Электронная почта', value: email,           href: `mailto:${email}` },
                  { Icon: Phone, label: 'Телефон',            value: phone,           href: `tel:${phone.replace(/\D/g,'')}` },
                  { Icon: MapPin,label: 'Адрес',              value: `${address}, ${city}`, href: undefined },
                  { Icon: Clock, label: 'Часы работы',        value: hours,           href: undefined },
                ].map(({ Icon, label, value, href }) => (
                  <div key={label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="var(--sand-dark)" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '3px' }}>{label}</p>
                      {href
                        ? <a href={href} style={{ color: 'var(--text-primary)', fontSize: '0.97rem', textDecoration: 'none' }}>{value}</a>
                        : <p style={{ color: 'var(--text-primary)', fontSize: '0.97rem' }}>{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--cream-border)', boxShadow: 'var(--shadow-md)', height: '400px', position: 'relative', background: 'var(--cream)' }}>
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80"
                alt="Город"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(20%) brightness(0.9)' }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(8px)', padding: '20px 28px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--cream-border)' }}>
                  <MapPin size={24} color="var(--sand)" strokeWidth={1.5} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--brown-dark)' }}>{address}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

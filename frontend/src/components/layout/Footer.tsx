// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api';
import { Mail, Phone, MapPin } from 'lucide-react';

const faqs = [
  { q: 'Как вы проверяете подлинность?', a: 'Каждая вещь лично осматривается и датируется перед выставлением на продажу.' },
  { q: 'Какая у вас политика возврата?', a: 'Принимаем возврат в течение 14 дней без лишних вопросов.' },
  { q: 'Вы доставляете по всей России?', a: 'Да, доставляем по всей России. Стоимость рассчитывается при оформлении.' },
  { q: 'Можно ли заказать оценку вещи?', a: 'Напишите нам на почту — мы организуем осмотр и оценку.' },
];

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => settingsApi.get().then(r => r.data.data),
    staleTime: 60_000,
  });
  const phone   = settings?.phone   || '+7 (863) 210-45-78';
  const email   = settings?.email   || 'hello@atelier-istoriy.ru';
  const address = settings?.address || 'ул. Пушкинская, д. 48';
  const city    = settings?.city    || 'г. Ростов-на-Дону, 344082';
  const hours   = settings?.hours   || 'Пн–Сб, 10:00–19:00';

  return (
    <footer
      style={{
        background: 'var(--brown-dark)',
        color: 'var(--cream)',
        marginTop: 'auto',
      }}
    >
      {/* Main footer */}
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          padding: '64px clamp(16px, 4vw, 48px)',
        }}
      >
        {/* Brand */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 300,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--sand-light)',
              marginBottom: '16px',
            }}
          >
            Ателье Историй
          </p>
          <p style={{ color: 'var(--sand-light)', opacity: 0.7, fontSize: '0.9rem', lineHeight: 1.7 }}>
            Отобранные винтажные вещи со всей Европы — выбранные за качество,
            историю и непреходящую красоту.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ color: 'var(--sand)', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Навигация
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[['/', 'Главная'], ['/shop', 'Магазин'], ['/about', 'О нас'], ['/account/profile', 'Кабинет'], ['/events', 'События'], ['/fairs', 'Ярмарки']].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{ color: 'var(--sand-light)', opacity: 0.7, fontSize: '0.95rem', textDecoration: 'none', transition: 'opacity var(--transition)' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '1')}
                onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '0.7')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: 'var(--sand)', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Контакты
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sand-light)', opacity: 0.8, fontSize: '0.95rem', textDecoration: 'none' }}>
              <Mail size={14} /> {email}
            </a>
            <a href="tel:+78632104578" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sand-light)', opacity: 0.8, fontSize: '0.95rem', textDecoration: 'none' }}>
              <Phone size={14} /> {phone}
            </a>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--sand-light)', opacity: 0.8, fontSize: '0.95rem' }}>
              <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
              {address}<br />{city}
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h4 style={{ color: 'var(--sand)', fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Вопросы
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <p style={{ color: 'var(--sand-light)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '4px' }}>{q}</p>
                <p style={{ color: 'var(--sand-light)', opacity: 0.6, fontSize: '0.95rem', lineHeight: 1.8 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(200,168,130,0.15)',
          padding: '20px clamp(16px, 4vw, 48px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
        className="container"
      >
        <p style={{ color: 'var(--sand-light)', opacity: 0.45, fontSize: '0.92rem', letterSpacing: '0.05em' }}>
          © {new Date().getFullYear()} Ателье Историй. Все права защищены.
        </p>
        <p style={{ color: 'var(--sand-light)', opacity: 0.45, fontSize: '0.92rem' }}>
          Сделано с любовью · 
        </p>
      </div>
    </footer>
  );
}

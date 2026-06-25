// src/components/layout/Header.tsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { NotificationBell } from '../notifications/NotificationBell';
import toast from 'react-hot-toast';

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { totalItems, totalPrice, toggleCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success('Вы вышли из аккаунта');
    navigate('/');
  }

  const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    fontSize: '0.86rem', letterSpacing: '0.08em', textTransform: 'uppercase',
    color: isActive ? 'var(--sand-dark)' : 'var(--text-muted)',
    textDecoration: 'none', transition: 'color var(--transition)',
    borderBottom: isActive ? '1px solid var(--sand)' : '1px solid transparent',
    paddingBottom: '2px',
  });

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(250,247,242,0.96)' : 'var(--cream)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--cream-border)' : 'transparent'}`,
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: '76px', gap: '24px' }}>

        {/* Nav left */}
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="desktop-nav">
          <NavLink to="/" end style={navLinkStyle}>Главная</NavLink>
          <NavLink to="/shop" style={navLinkStyle}>Магазин</NavLink>
          <NavLink to="/events" style={navLinkStyle}>События</NavLink>
          <NavLink to="/fairs" style={navLinkStyle}>Ярмарки</NavLink>
          <NavLink to="/about" style={navLinkStyle}>О нас</NavLink>
        </nav>

        {/* Logo */}
        <Link to="/" style={{
          fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300,
          letterSpacing: '0.22em', color: 'var(--brown-dark)', textDecoration: 'none',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          Ателье Историй
        </Link>

        {/* Icons right */}
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <NotificationBell />

          {user !== null ? (
            <Link to="/account/profile" aria-label="Личный кабинет" style={{ color: 'var(--text-muted)', display: 'flex', position: 'relative' }}>
              <User size={20} strokeWidth={1.5} />
              {user?.role === 'ADMIN' && (
                <Link to="/admin" style={{ position: 'absolute', top: '-5px', right: '-5px', width: '9px', height: '9px', background: 'var(--sand)', borderRadius: '50%', border: '1.5px solid var(--cream)' }} title="Админ-панель" />
              )}
            </Link>
          ) : (
            <Link to="/login" aria-label="Войти" style={{ color: 'var(--text-muted)', display: 'flex' }}>
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <button onClick={toggleCart} aria-label={`Корзина — ₽${totalPrice().toFixed(2)}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems() > 0 && (
              <>
                <span style={{ position: 'absolute', top: '-7px', right: '-7px', background: 'var(--sand)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems()}
                </span>
                <span className="cart-price" style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  ₽{totalPrice().toFixed(2)}
                </span>
              </>
            )}
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню" className="mobile-menu-btn"
            style={{ display: 'none', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav style={{ background: 'var(--cream)', borderTop: '1px solid var(--cream-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[['/', 'Главная'], ['/shop', 'Магазин'], ['/events', 'События'], ['/fairs', 'Ярмарки'], ['/about', 'О нас']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} style={navLinkStyle} onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
          {user !== null ? (
            <>
              <NavLink to="/account/profile" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Кабинет</NavLink>
              <NavLink to="/account/notifications" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Уведомления</NavLink>
              {user?.role === 'ADMIN' && <NavLink to="/admin" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Админ</NavLink>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ ...navLinkStyle({ isActive: false }), background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                Выйти
              </button>
            </>
          ) : (
            <NavLink to="/login" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Войти</NavLink>
          )}
        </nav>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } .cart-price { display: none !important; } }
      `}</style>
    </header>
  );
}

// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { useAuthStore } from './store/authStore';

const Home           = React.lazy(() => import('./pages/Home'));
const Shop           = React.lazy(() => import('./pages/Shop'));
const ProductDetail  = React.lazy(() => import('./pages/ProductDetail'));
const About          = React.lazy(() => import('./pages/About'));
const Checkout       = React.lazy(() => import('./pages/Checkout'));
const PaymentStub    = React.lazy(() => import('./pages/PaymentStub'));
const Events         = React.lazy(() => import('./pages/Events'));
const EventDetail    = React.lazy(() => import('./pages/EventDetail'));
const Fairs          = React.lazy(() => import('./pages/Fairs'));
const FairDetail     = React.lazy(() => import('./pages/Fairs').then(m => ({ default: m.FairDetail })));
const Login          = React.lazy(() => import('./pages/auth/Login'));
const Register       = React.lazy(() => import('./pages/auth/Register'));
const EmailVerified  = React.lazy(() => import('./pages/auth/EmailVerified'));
const Profile        = React.lazy(() => import('./pages/account/Profile'));
const AccountOrders  = React.lazy(() => import('./pages/account/Orders'));
const NotifSettings  = React.lazy(() => import('./pages/account/NotificationSettings'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  if (user === null) return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  if (user === null) return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '2px solid var(--cream-border)', borderTopColor: 'var(--sand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);
  React.useEffect(() => {
    if (localStorage.getItem('access_token')) fetchMe();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Header />
      <CartDrawer />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/shop"       element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/about"      element={<About />} />
          <Route path="/events"     element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/fairs"      element={<Fairs />} />
          <Route path="/fairs/:id"  element={<FairDetail />} />
          <Route path="/checkout"   element={<Checkout />} />
          <Route path="/payment"    element={<PaymentStub />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/email-verified" element={<EmailVerified />} />

          <Route path="/account/profile"       element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/account/orders"        element={<RequireAuth><AccountOrders /></RequireAuth>} />
          <Route path="/account/notifications" element={<RequireAuth><NotifSettings /></RequireAuth>} />

          <Route path="/admin"   element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

          <Route path="*" element={
            <div className="container page-enter" style={{ padding: '120px 16px', textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-hint)', fontSize: '5rem', marginBottom: '16px' }}>404</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Страница не найдена</p>
              <a href="/" style={{ color: 'var(--sand-dark)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>На главную →</a>
            </div>
          } />
        </Routes>
      </React.Suspense>
      <Footer />
      <Toaster position="bottom-right" toastOptions={{
        style: { fontFamily: 'var(--font-body)', fontSize: '0.88rem', background: 'var(--brown-dark)', color: 'var(--cream)', borderRadius: '4px', padding: '12px 16px' },
        success: { iconTheme: { primary: 'var(--sand)', secondary: '#fff' } },
        error: { iconTheme: { primary: 'var(--error)', secondary: '#fff' } },
        duration: 3000,
      }} />
    </>
  );
}

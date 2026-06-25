// src/components/notifications/NotificationBell.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api';
import { useAuthStore } from '../../store/authStore';

export function NotificationBell() {
  const user = useAuthStore(s => s.user);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications-bell'],
    queryFn: () => notificationsApi.getAll(1).then(r => r.data),
    enabled: user !== null,
    refetchInterval: 60_000, // раз в минуту
  });

  const unread = data?.meta?.unread ?? 0;
  const recent = data?.data?.slice(0, 5) ?? [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications-bell'] }),
  });

  // Закрыть по клику вне
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (user === null) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Уведомления${unread > 0 ? `: ${unread} непрочитанных` : ''}`}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', position: 'relative', display: 'flex',
          padding: '2px',
        }}
      >
        <Bell size={20} strokeWidth={1.5} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: 'var(--sand)', color: '#fff',
            borderRadius: '50%', width: '16px', height: '16px',
            fontSize: '0.6rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 500,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: '-8px',
          width: '320px', background: 'var(--white)',
          border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', zIndex: 300,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--cream-border)',
          }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Уведомления
            </p>
            {unread > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                style={{ fontSize: '0.88rem', color: 'var(--sand)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Прочитать все
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {recent.length === 0 ? (
              <p style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '0.88rem' }}>
                Нет уведомлений
              </p>
            ) : (
              recent.map((n: any) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--cream-border)',
                    background: n.isRead ? 'transparent' : 'rgba(200,168,130,0.06)',
                    cursor: 'default',
                  }}
                >
                  <p style={{
                    fontSize: '0.95rem', color: 'var(--text-primary)',
                    marginBottom: '3px', fontWeight: n.isRead ? 400 : 500,
                  }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-hint)', lineHeight: 1.75 }}>{n.body}</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                    {new Date(n.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--cream-border)', textAlign: 'center' }}>
            <Link
              to="/account/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: '0.92rem', color: 'var(--sand)', letterSpacing: '0.08em', textDecoration: 'none' }}
            >
              Все уведомления →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

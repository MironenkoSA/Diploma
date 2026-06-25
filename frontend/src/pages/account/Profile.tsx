// src/pages/account/Profile.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';
import { usersApi } from '../../api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const logout = useAuthStore(s => s.logout);
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = React.useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = React.useState(false);
  const [pwLoading, setPwLoading] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  async function handleProfileSave() {
    setLoading(true);
    try {
      const { data } = await usersApi.updateProfile(form);
      updateUser(data.data);
      setEditMode(false);
      toast.success('Профиль обновлён');
    } catch {
      toast.error('Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    const pw = pwForm.newPassword;
    if (pw.length < 8) { toast.error('Пароль должен содержать минимум 8 символов'); return; }
    if (!/[A-Z]/.test(pw)) { toast.error('Пароль должен содержать заглавную букву'); return; }
    if (!/[a-z]/.test(pw)) { toast.error('Пароль должен содержать строчную букву'); return; }
    if (!/[0-9]/.test(pw)) { toast.error('Пароль должен содержать цифру'); return; }
    setPwLoading(true);
    try {
      await usersApi.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Пароль успешно изменён');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Не удалось изменить пароль');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success('Вы вышли из аккаунта');
    } catch {
      toast.error('Ошибка при выходе');
    }
  }

  async function handleDeleteAccount() {
    try {
      await usersApi.deleteAccount();
      await logout();
      toast.success('Аккаунт удалён. Ваши данные удалены.');
    } catch {
      toast.error('Не удалось удалить аккаунт');
    }
  }

  return (
    <main className="page-enter">
      <div className="container" style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,48px)', maxWidth: '640px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '40px' }}>Мой кабинет</h1>

        {/* Profile section */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.4rem', color: 'var(--brown-dark)' }}>Личные данные</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)} style={{ color: 'var(--sand)' }}>
              {editMode ? 'Отмена' : 'Редактировать'}
            </Button>
          </div>

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Полное имя" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Телефон" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Адрес" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <Button onClick={handleProfileSave} loading={loading}>Сохранить</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Имя', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Телефон', value: user?.phone || '—' },
                { label: 'Адрес', value: user?.address || '—' },
              ].map(f => (
                <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <p style={{ fontSize: '0.88rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-hint)', paddingTop: '2px' }}>{f.label}</p>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Change password */}
        <section style={{ marginBottom: '48px', paddingTop: '32px', borderTop: '1px solid var(--cream-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.4rem', color: 'var(--brown-dark)', marginBottom: '24px' }}>Смена пароля</h2>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
            <Input label="Текущий пароль" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} autoComplete="current-password" />
            <Input label="Новый пароль" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} autoComplete="new-password" hint="Минимум 8 символов, латинские буквы (A-Z, a-z) и цифра. Пример: MyPass123" />
            <Button type="submit" variant="secondary" loading={pwLoading}>Изменить пароль</Button>
          </form>
        </section>

        {/* GDPR: Delete account */}
        <section style={{ paddingTop: '32px', borderTop: '1px solid var(--cream-border)' }}>
          {/* Выход из аккаунта */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--cream-border)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.4rem', color: 'var(--brown-dark)', marginBottom: '6px' }}>Выход из аккаунта</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Завершить текущую сессию</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>Выйти</Button>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.4rem', color: 'var(--brown-dark)', marginBottom: '12px' }}>Удалить аккаунт</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.7 }}>
            Аккаунт будет удалён, а личные данные анонимизированы. История заказов сохраняется для бухгалтерской отчётности.
          </p>
          {!showDelete ? (
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Удалить аккаунт</Button>
          ) : (
            <div style={{ padding: '20px', background: 'rgba(184,64,64,0.04)', border: '1px solid rgba(184,64,64,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--error)', marginBottom: '16px', fontWeight: 500 }}>Вы уверены? Это действие необратимо.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>Да, удалить мой аккаунт</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDelete(false)}>Отмена</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

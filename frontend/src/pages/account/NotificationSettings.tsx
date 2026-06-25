// src/pages/account/NotificationSettings.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react';
import { notificationsApi, categoriesApi, countriesApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ERAS = ['1820s','1850s','1870s','1880s','1890s','1900s','1910s','1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','modern'];

const RULE_EXAMPLES = [
  { name: 'Американские вещи 1980-х', countryOfOrigin: 'United States', eraFrom: '1980', eraTo: '1990' },
  { name: 'Французские украшения', countryOfOrigin: 'France' },
  { name: 'Швейцарские часы', countryOfOrigin: 'Switzerland' },
  { name: 'Любой винтаж до ₽100', maxPrice: 100 },
  { name: 'Советский дизайн', countryOfOrigin: 'Soviet Union' },
];

const emptyForm = {
  name: '', isActive: true,
  categoryId: '', countryOfOrigin: '',
  eraFrom: '', eraTo: '',
  minPrice: '', maxPrice: '',
  keyword: '',
  notifyByEmail: true, notifyInApp: true,
};

export default function NotificationSettings() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ ...emptyForm });
  const [expandedRule, setExpandedRule] = React.useState<string | null>(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['notification-rules'],
    queryFn: () => notificationsApi.getRules().then(r => r.data.data ?? []),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data ?? []),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['product-countries'],
    queryFn: () => countriesApi.getAll().then(r => r.data.data ?? []),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: () => notificationsApi.getAll(1).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => notificationsApi.createRule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-rules'] });
      toast.success('Правило создано');
      setShowForm(false);
      setForm({ ...emptyForm });
    },
    onError: () => toast.error('Не удалось создать правило'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      notificationsApi.updateRule(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-rules'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-rules'] });
      toast.success('Правило удалено');
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-bell'] });
      toast.success('Все уведомления прочитаны');
    },
  });

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function applyExample(ex: any) {
    setForm({ ...emptyForm, ...ex });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Укажите название правила'); return; }
    if (!form.notifyByEmail && !form.notifyInApp) { toast.error('Выберите хотя бы один способ уведомления'); return; }

    const payload: any = {
      name: form.name.trim(),
      isActive: form.isActive,
      notifyByEmail: form.notifyByEmail,
      notifyInApp: form.notifyInApp,
    };
    if (form.categoryId) payload.categoryId = form.categoryId;
    if (form.countryOfOrigin.trim()) payload.countryOfOrigin = form.countryOfOrigin.trim();
    if (form.eraFrom) payload.eraFrom = form.eraFrom;
    if (form.eraTo) payload.eraTo = form.eraTo;
    if (form.minPrice) payload.minPrice = parseFloat(form.minPrice);
    if (form.maxPrice) payload.maxPrice = parseFloat(form.maxPrice);
    if (form.keyword.trim()) payload.keyword = form.keyword.trim();

    createMutation.mutate(payload);
  }

  return (
    <main className="page-enter">
      <div className="container" style={{ padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,48px)', maxWidth: '760px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '8px' }}>
            Уведомления
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            Создавайте правила — и мы будем оповещать вас когда появляется подходящий товар.
            Например: «украшения из Франции» или «американские вещи 1980-х до ₽200».
          </p>
        </div>

        {/* История уведомлений */}
        {notifications?.data?.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem', color: 'var(--brown-dark)' }}>
                Последние уведомления
                {notifications.meta?.unread > 0 && (
                  <span style={{ fontSize: '0.8rem', background: 'var(--sand)', color: '#fff', borderRadius: '50px', padding: '2px 8px', marginLeft: '10px', verticalAlign: 'middle' }}>
                    {notifications.meta.unread}
                  </span>
                )}
              </h2>
              {notifications.meta?.unread > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  style={{ fontSize: '0.92rem', color: 'var(--sand)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}
                >
                  Прочитать все
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {notifications.data.slice(0, 8).map((n: any, i: number) => (
                <div key={n.id} style={{
                  padding: '14px 18px',
                  background: n.isRead ? 'var(--white)' : 'rgba(200,168,130,0.07)',
                  borderBottom: i < notifications.data.length - 1 ? '1px solid var(--cream-border)' : 'none',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: n.isRead ? 'transparent' : 'var(--sand)',
                    marginTop: '6px', flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px', fontWeight: n.isRead ? 400 : 500 }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{n.body}</p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Мои правила */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem', color: 'var(--brown-dark)' }}>
              Мои правила
            </h2>
            <Button size="sm" onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Новое правило
            </Button>
          </div>

          {/* Форма создания */}
          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: 'var(--white)', border: '1px solid var(--cream-border)',
              borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--brown-dark)', marginBottom: '20px' }}>
                Настройка правила
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <Input
                    label="Название правила"
                    placeholder="Например: Американские вещи 1980-х"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Категория
                  </label>
                  <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: 'var(--white)', outline: 'none' }}>
                    <option value="">Любая категория</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Страна происхождения
                  </label>
                  <select
                    value={form.countryOfOrigin}
                    onChange={e => set('countryOfOrigin', e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: 'var(--white)', outline: 'none', color: 'var(--text-primary)' }}
                  >
                    <option value="">Любая страна</option>
                    {(countries as string[]).map((country: string) => {
                      const COUNTRY_RU: Record<string,string> = {
    'France': 'Франция', 'Italy': 'Италия', 'United Kingdom': 'Великобритания',
    'Germany': 'Германия', 'United States': 'США', 'Denmark': 'Дания',
    'Norway': 'Норвегия', 'Switzerland': 'Швейцария', 'Japan': 'Япония',
    'Soviet Union': 'СССР', 'Belgium': 'Бельгия', 'Finland': 'Финляндия',
    'Sweden': 'Швеция', 'Netherlands': 'Нидерланды', 'Austria': 'Австрия',
    'Spain': 'Испания', 'Poland': 'Польша', 'Czech Republic': 'Чехия', 'Russia': 'Россия',
  };
                      return (
                        <option key={country} value={country}>
                          {COUNTRY_RU[country] || country}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Эпоха от
                  </label>
                  <select value={form.eraFrom} onChange={e => set('eraFrom', e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: 'var(--white)', outline: 'none' }}>
                    <option value="">Любая</option>
                    {ERAS.map(e => <option key={e} value={e.replace('s','')}>{e === 'modern' ? 'Современное' : e.replace('s', '-е')}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Эпоха до
                  </label>
                  <select value={form.eraTo} onChange={e => set('eraTo', e.target.value)}
                    style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', background: 'var(--white)', outline: 'none' }}>
                    <option value="">Любая</option>
                    {ERAS.map(e => <option key={e} value={e.replace('s','')}>{e === 'modern' ? 'Современное' : e.replace('s', '-е')}</option>)}
                  </select>
                </div>

                <Input label="Цена от (₽)" type="number" min="0" placeholder="0"
                  value={form.minPrice} onChange={e => set('minPrice', e.target.value)} />
                <Input label="Цена до (₽)" type="number" min="0" placeholder="∞"
                  value={form.maxPrice} onChange={e => set('maxPrice', e.target.value)} />

                <div style={{ gridColumn: '1/-1' }}>
                  <Input
                    label="Ключевое слово (в названии / описании)"
                    placeholder="Например: silver, brooch, Limoges"
                    value={form.keyword}
                    onChange={e => set('keyword', e.target.value)}
                  />
                </div>

                {/* Способы уведомления */}
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={form.notifyByEmail} onChange={e => set('notifyByEmail', e.target.checked)}
                      style={{ accentColor: 'var(--sand)', width: '15px', height: '15px' }} />
                    Уведомления на email
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={form.notifyInApp} onChange={e => set('notifyInApp', e.target.checked)}
                      style={{ accentColor: 'var(--sand)', width: '15px', height: '15px' }} />
                    Уведомления на сайте
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Button type="submit" loading={createMutation.isPending}>Создать правило</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setForm({ ...emptyForm }); }}>
                  Отмена
                </Button>
              </div>
            </form>
          )}

          {/* Список правил */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />)}
            </div>
          ) : rules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--cream-border)' }}>
              <Bell size={32} style={{ color: 'var(--text-hint)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-hint)', fontSize: '0.9rem', marginBottom: '8px' }}>
                Правил пока нет
              </p>
              <p style={{ color: 'var(--text-hint)', fontSize: '0.95rem' }}>
                Создайте правило — и мы уведомим вас при появлении подходящего товара
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(rules as any[]).map((rule: any) => (
                <div key={rule.id} style={{
                  background: 'var(--white)', border: '1px solid var(--cream-border)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  opacity: rule.isActive ? 1 : 0.6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => toggleMutation.mutate({ id: rule.id, isActive: !rule.isActive })}
                        title={rule.isActive ? 'Отключить' : 'Включить'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: rule.isActive ? 'var(--sand)' : 'var(--text-hint)', flexShrink: 0 }}
                      >
                        {rule.isActive ? <Bell size={18} /> : <BellOff size={18} />}
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rule.name}
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '2px' }}>
                          {[
                            rule.countryOfOrigin && `Страна: ${rule.countryOfOrigin}`,
                            rule.eraFrom && `от ${rule.eraFrom}s`,
                            rule.eraTo && `до ${rule.eraTo}s`,
                            rule.maxPrice && `до ₽${rule.maxPrice}`,
                            rule.keyword && `«${rule.keyword}»`,
                          ].filter(Boolean).join(' · ') || 'Все новые товары'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>
                        {rule._count?.notifications ?? 0} уведомл.
                      </span>
                      <button
                        onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-hint)', padding: '2px' }}
                      >
                        {expandedRule === rule.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <button
                        onClick={() => { if (confirm('Удалить это правило?')) deleteMutation.mutate(rule.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedRule === rule.id && (
                    <div style={{ padding: '0 18px 14px', borderTop: '1px solid var(--cream-border)', paddingTop: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                        {[
                          ['Категория', rule.categoryId ? 'задана' : '—'],
                          ['Страна', rule.countryOfOrigin || '—'],
                          ['Эпоха от', rule.eraFrom ? `${rule.eraFrom}s` : '—'],
                          ['Эпоха до', rule.eraTo ? `${rule.eraTo}s` : '—'],
                          ['Цена от', rule.minPrice ? `₽${rule.minPrice}` : '—'],
                          ['Цена до', rule.maxPrice ? `₽${rule.maxPrice}` : '—'],
                          ['Слово', rule.keyword || '—'],
                          ['Email', rule.notifyByEmail ? '✓' : '✗'],
                          ['На сайте', rule.notifyInApp ? '✓' : '✗'],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-hint)' }}>{label}</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Примеры правил */}
        <section style={{ paddingTop: '32px', borderTop: '1px solid var(--cream-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--brown-dark)', marginBottom: '16px' }}>
            Примеры готовых правил
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {RULE_EXAMPLES.map(ex => (
              <button
                key={ex.name}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '8px 14px', background: 'var(--cream-dark)', border: '1px solid var(--cream-border)',
                  borderRadius: '50px', fontSize: '0.95rem', color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all var(--transition)', fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sand)'; (e.currentTarget as HTMLElement).style.color = 'var(--sand-dark)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--cream-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                + {ex.name}
              </button>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

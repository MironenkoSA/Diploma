// src/pages/admin/Dashboard.tsx
// Дипломный проект — Панель администратора
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi, promotionsApi, categoriesApi, eventsApi, fairsApi, settingsApi, uploadApi, countriesApi } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Order, Product, OrderStatus } from '../../types';
import { Pencil, Trash2, Plus, Package, ShoppingBag, Tag, Calendar, Tent, Users, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

type AdminTab = 'orders' | 'products' | 'promotions' | 'events' | 'fairs' | 'settings';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'];

export default function AdminDashboard() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<AdminTab>('orders');
  const qc = useQueryClient();

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user, navigate]);

  const TABS = [
    { key: 'orders', label: 'Заказы', icon: <ShoppingBag size={15} /> },
    { key: 'products', label: 'Товары', icon: <Package size={15} /> },
    { key: 'promotions', label: 'Акции', icon: <Tag size={15} /> },
    { key: 'events', label: 'События', icon: <Calendar size={15} /> },
    { key: 'fairs', label: 'Ярмарки', icon: <Tent size={15} /> },
    { key: 'settings', label: 'Настройки', icon: <Settings size={15} /> },
  ];

  return (
    <main className="page-enter">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100dvh - 70px)' }}>
        <aside style={{ background: 'var(--brown-dark)', padding: '32px 0' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(228,207,176,0.5)', padding: '0 24px', marginBottom: '20px' }}>
            Управление
          </p>
          {TABS.map(item => (
            <button key={item.key} onClick={() => setTab(item.key as AdminTab)} style={{
              width: '100%', padding: '11px 24px', background: tab === item.key ? 'rgba(200,168,130,0.15)' : 'none',
              border: 'none', borderLeft: `3px solid ${tab === item.key ? 'var(--sand)' : 'transparent'}`,
              color: tab === item.key ? 'var(--sand-light)' : 'rgba(228,207,176,0.45)',
              fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all var(--transition)', fontFamily: 'var(--font-body)',
            }}>
              {item.icon} {item.label}
            </button>
          ))}
          <div style={{ margin: '32px 24px 0', borderTop: '1px solid rgba(200,168,130,0.1)', paddingTop: '20px' }}>
            <Link to="/" style={{ fontSize: '0.88rem', color: 'rgba(228,207,176,0.35)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ← На сайт
            </Link>
          </div>
        </aside>

        <div style={{ padding: 'clamp(24px,3vw,40px)', overflowY: 'auto', background: 'var(--cream)' }}>
          {tab === 'orders' && <AdminOrders qc={qc} />}
          {tab === 'products' && <AdminProducts qc={qc} />}
          {tab === 'promotions' && <AdminPromotions qc={qc} />}
          {tab === 'events' && <AdminEvents qc={qc} />}
          {tab === 'fairs' && <AdminFairs qc={qc} />}
          {tab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </main>
  );
}

// ── Заказы ────────────────────────────────────────────
function AdminOrders({ qc }: { qc: any }) {
  const [statusFilter, setStatusFilter] = React.useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => ordersApi.getAll({ status: statusFilter || undefined }).then(r => r.data.data),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: any) => ordersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Статус обновлён'); },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '1.6rem' }}>Заказы</h2>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', background: 'var(--white)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {isLoading ? <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} /> : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--cream-dark)' }}>
                {['Номер','Покупатель','Товаров','Сумма','Дата','Статус'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hint)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.orders || []).map((order: Order, i: number) => (
                <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid var(--cream-border)' : 'none' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.92rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{order.id.slice(0,8).toUpperCase()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{(order as any).user?.name}</p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>{(order as any).user?.email}</p>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.items.length}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--brown-dark)' }}>₽{Number(order.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <select value={order.status} onChange={e => updateMutation.mutate({ id: order.id, status: e.target.value })}
                      style={{ padding: '5px 8px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', background: 'var(--cream)', outline: 'none', cursor: 'pointer' }}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.orders?.length && <p style={{ padding: '48px', textAlign: 'center', color: 'var(--text-hint)' }}>Заказов нет</p>}
        </div>
      )}
    </div>
  );
}

// ── Товары ────────────────────────────────────────────
function AdminProducts({ qc }: { qc: any }) {
  const [showForm, setShowForm] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getAll({ limit: 100 }).then(r => r.data.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Товар удалён'); },
  });

  function openEdit(p: Product) { setEditProduct(p); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditProduct(null); }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '1.6rem' }}>Товары</h2>
        <Button size="sm" onClick={() => { setEditProduct(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> Добавить товар
        </Button>
      </div>

      {showForm && (
        <ProductForm product={editProduct} categories={categories || []} onClose={closeForm}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['admin-products'] }); closeForm(); }} />
      )}

      {isLoading ? <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} /> : (
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--cream-dark)' }}>
                {['','Название','Категория','Цена','Остаток','Статус','Ярмарка',''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hint)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(products || []).map((p: Product, i: number) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--cream-border)' : 'none' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <img src={p.images[0]} alt="" style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: '180px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    {(p as any).hideFromMain && <p style={{ fontSize: '0.85rem', color: 'var(--sand)', marginTop: '2px' }}>скрыт из каталога</p>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.category?.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--brown-dark)' }}>₽{Number(p.price).toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: p.stock === 0 ? 'var(--error)' : p.stock <= 2 ? 'var(--sand-dark)' : 'var(--success)' }}>{p.stock}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.88rem', textTransform: 'uppercase', color: p.isActive ? 'var(--success)' : 'var(--text-hint)' }}>{p.isActive ? 'Активен' : 'Скрыт'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {(p as any).isForFair && <span style={{ fontSize: '0.85rem', background: 'rgba(200,168,130,0.15)', color: 'var(--sand-dark)', padding: '2px 8px', borderRadius: '50px', letterSpacing: '0.05em' }}>ярмарка</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px' }}><Pencil size={14} /></button>
                      <button onClick={() => { if (window.confirm(`Деактивировать товар "${p.name}"? Он будет скрыт из каталога.`)) deleteMutation.mutate(p.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '3px' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Форма товара ──────────────────────────────────────
function ProductForm({ product, categories, onClose, onSaved }: any) {
  const isEdit = !!product;
  const { data: existingCountries = [] } = useQuery({
    queryKey: ['product-countries'],
    queryFn: () => countriesApi.getAll().then(r => r.data.data ?? []),
  });
  const [form, setForm] = React.useState({
    name: product?.name || '', slug: product?.slug || '',
    description: product?.description || '', price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '1', categoryId: product?.categoryId || categories[0]?.id || '',
    era: product?.era || '', countryOfOrigin: product?.countryOfOrigin || '',
    condition: product?.condition || 'GOOD', isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isForFair: product?.isForFair ?? false, hideFromMain: product?.hideFromMain ?? false,
    images: product?.images?.join('\n') || '',
  });
  const [loading, setLoading] = React.useState(false);

  function set(key: string, value: any) {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (key === 'name' && !isEdit) {
        const translit: Record<string,string> = {
          'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh',
          'з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o',
          'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
          'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        };
        next.slug = value.toLowerCase()
          .split('').map(ch => translit[ch] ?? ch).join('')
          .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
          .slice(0, 100);
      }
      if (key === 'isForFair' && !value) next.hideFromMain = false;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Проверяем обязательные поля
    if (!form.name.trim()) { toast.error('Укажите название товара'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { toast.error('Укажите цену'); return; }
    if (!form.categoryId) { toast.error('Выберите категорию'); return; }
    if (!form.description.trim()) { toast.error('Добавьте описание'); return; }
    setLoading(true);
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), images: form.images.split('\n').map((s:string) => s.trim()).filter(Boolean) };
    try {
      if (isEdit) { await productsApi.update(product.id, payload as any); toast.success('Товар обновлён'); }
      else { await productsApi.create(payload as any); toast.success('Товар добавлен'); }
      onSaved();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat().join(', ');
        toast.error(`Заполните все поля: ${msgs}`);
      } else {
        toast.error(err.response?.data?.message || 'Ошибка сохранения');
      }
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', marginBottom: '20px', fontSize: '1.2rem' }}>
        {isEdit ? `Редактировать: ${product.name}` : 'Новый товар'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }} noValidate>
        <Input label="Название" value={form.name} onChange={e => set('name', e.target.value)} required />
        {/* slug генерируется автоматически из названия */}
        <Input label="Цена (₽)" type="number" step="1" min="1" value={form.price} onChange={e => set('price', e.target.value)} required />
        <Input label="Остаток" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Категория</label>
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', outline: 'none', background: 'var(--white)' }}>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Состояние</label>
          <select value={form.condition} onChange={e => set('condition', e.target.value)} style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', outline: 'none', background: 'var(--white)' }}>
            {[
              {v:'EXCELLENT',l:'Отличное'},
              {v:'GOOD',l:'Хорошее'},
              {v:'FAIR',l:'Удовлетворительное'},
              {v:'POOR',l:'Плохое'},
            ].map(({v,l}) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <label style={{ fontSize:'0.92rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Эпоха</label>
          <select value={form.era} onChange={e => set('era', e.target.value)}
            style={{ padding:'10px 14px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.9rem', outline:'none', background:'var(--white)' }}>
            <option value="">— не указана —</option>
            {['1820s','1850s','1860s','1870s','1880s','1890s','1900s','1910s','1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','modern'].map(e => (
              <option key={e} value={e}>{e === 'modern' ? 'Современное' : e.replace('s','-е')}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
          <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Страна</label>
          <input
            list="countries-list"
            value={form.countryOfOrigin}
            onChange={e => set('countryOfOrigin', e.target.value)}
            placeholder="Например: France, Germany"
            style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', outline: 'none', background: 'var(--white)', color: 'var(--text-primary)' }}
          />
          <datalist id="countries-list">
            {(existingCountries as string[]).map((country: string) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Описание</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'var(--font-body)', outline: 'none' }} />
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Изображения товара
          </label>

          {/* Превью загруженных фото */}
          {form.images && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {form.images.split('\n').filter(Boolean).map((url: string, i: number) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '100px' }}>
                  <img
                    src={url.trim()}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-border)' }}
                    onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const urls = form.images.split('\n').filter(Boolean);
                      urls.splice(i, 1);
                      set('images', urls.join('\n'));
                    }}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center', padding: 0 }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Кнопка загрузки файла */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: '1px dashed var(--sand)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--sand-dark)', background: 'var(--cream)', width: 'fit-content' }}>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              style={{ display: 'none' }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  try {
                    const { data } = await uploadApi.image(file);
                    const current = form.images ? form.images.split('\n').filter(Boolean) : [];
                    set('images', [...current, data.data.url].join('\n'));
                  } catch {
                    toast.error(`Не удалось загрузить ${file.name}`);
                  }
                }
                e.target.value = '';
              }}
            />
            📎 Выбрать файлы с компьютера
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-hint)' }}>
            JPG, PNG · до 10 МБ · можно несколько
          </p>
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[['isActive','Активен'],['isFeatured','На главной']].map(([k,l]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--sand)' }} />
              {l}
            </label>
          ))}
        </div>

        {/* Ярмарочные настройки (п.4 ТЗ) */}
        <div style={{ gridColumn: '1/-1', padding: '16px', background: 'rgba(200,168,130,0.06)', border: '1px solid var(--sand-light)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontSize: '0.88rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '12px' }}>Настройки ярмарки (только для администратора)</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isForFair} onChange={e => set('isForFair', e.target.checked)} style={{ accentColor: 'var(--sand)' }} />
              Товар для ярмарки
            </label>
            {form.isForFair && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.hideFromMain} onChange={e => set('hideFromMain', e.target.checked)} style={{ accentColor: 'var(--sand)' }} />
                Не показывать в основном каталоге
              </label>
            )}
          </div>
          {form.isForFair && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)', marginTop: '8px' }}>
              Этот товар будет доступен для добавления в ярмарки.
              {form.hideFromMain && ' Он не будет отображаться в обычном каталоге.'}
            </p>
          )}
        </div>

        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
          <Button type="submit" loading={loading}>{isEdit ? 'Сохранить' : 'Создать'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
        </div>
      </form>
    </div>
  );
}


// ── Загрузчик изображения ────────────────────────────────────────────
function ImageUploadField({ value, onChange, label = "Изображение" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.92rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</label>
      {value && (
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-border)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
          <button type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--error)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center', padding: 0 }}>
            ×
          </button>
        </div>
      )}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', border: '1px dashed var(--sand)', borderRadius: 'var(--radius-sm)', cursor: uploading ? 'wait' : 'pointer', fontSize: '0.88rem', color: 'var(--sand-dark)', background: 'var(--cream)', width: 'fit-content' }}>
        <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
          onChange={async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const { data } = await uploadApi.image(file);
              onChange(data.data.url);
            } catch { toast.error('Не удалось загрузить файл'); }
            finally { setUploading(false); (e.target as HTMLInputElement).value = ''; }
          }}
        />
        {uploading ? '⏳ Загрузка...' : '📎 Выбрать файл'}
      </label>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-hint)' }}>JPG, PNG · до 10 МБ</p>
    </div>
  );
}

// ── Акции ─────────────────────────────────────────────
function AdminPromotions({ qc }: { qc: any }) {
  const [showForm, setShowForm] = React.useState(false);
  const { data: promos } = useQuery({ queryKey: ['admin-promotions'], queryFn: () => promotionsApi.getAll().then(r => r.data.data) });
  const [form, setForm] = React.useState({ title:'', description:'', imageUrl:'', linkUrl:'', isActive:true, startsAt:'', endsAt:'' });
  const deleteMutation = useMutation({ mutationFn:(id:string) => promotionsApi.delete(id), onSuccess:() => { qc.invalidateQueries({queryKey:['admin-promotions']}); toast.success('Удалено'); } });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Укажите заголовок акции'); return; }
    if (!form.startsAt) { toast.error('Укажите дату начала акции'); return; }
    if (!form.endsAt) { toast.error('Укажите дату окончания акции'); return; }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) { toast.error('Дата окончания должна быть позже даты начала'); return; }
    try {
      await promotionsApi.create({ ...form, startsAt:new Date(form.startsAt).toISOString(), endsAt:new Date(form.endsAt).toISOString() } as any);
      toast.success('Акция создана');
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      setShowForm(false);
    } catch(err:any) { toast.error(err.response?.data?.message || 'Ошибка при создании акции'); }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:400, color:'var(--brown-dark)', fontSize:'1.6rem' }}>Акции и баннеры</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:'6px' }}><Plus size={14} /> Новая акция</Button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', padding:'20px', marginBottom:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px' }}>
          <Input label="Заголовок" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required style={{gridColumn:'1/-1'} as any} />
          <Input label="Описание" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          <ImageUploadField label="Изображение баннера" value={form.imageUrl} onChange={url => setForm(f=>({...f,imageUrl:url}))} />
          <Input label="Ссылка баннера (куда ведёт при клике)" value={form.linkUrl} onChange={e => setForm(f=>({...f,linkUrl:e.target.value}))} placeholder="/shop или https://..." />
          <Input label="Начало" type="datetime-local" value={form.startsAt} onChange={e => setForm(f=>({...f,startsAt:e.target.value}))} required />
          <Input label="Конец" type="datetime-local" value={form.endsAt} onChange={e => setForm(f=>({...f,endsAt:e.target.value}))} required />
          <div style={{ gridColumn:'1/-1', display:'flex', gap:'10px' }}><Button type="submit">Создать</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button></div>
        </form>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {(promos||[]).map((p:any) => (
          <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', gap:'12px', flexWrap:'wrap' }}>
            <div><p style={{ fontSize:'0.92rem', color:'var(--text-primary)', marginBottom:'3px' }}>{p.title}</p>
              <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>{new Date(p.startsAt).toLocaleDateString('ru-RU')} → {new Date(p.endsAt).toLocaleDateString('ru-RU')} · <span style={{ color:p.isActive?'var(--success)':'var(--error)' }}>{p.isActive?'Активна':'Неактивна'}</span></p></div>
            <button onClick={() => { if(window.confirm('Удалить акцию?')) deleteMutation.mutate(p.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--error)' }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── События (админ) ────────────────────────────────────
function AdminEvents({ qc }: { qc: any }) {
  const [showForm, setShowForm] = React.useState(false);
  const [editEv, setEditEv] = React.useState<any>(null);
  const [viewRegs, setViewRegs] = React.useState<string|null>(null);
  const { data: events } = useQuery({ queryKey:['admin-events'], queryFn:() => eventsApi.adminGetAll().then(r => r.data.data) });
  const { data: regs } = useQuery({ queryKey:['event-regs',viewRegs], queryFn:() => eventsApi.getRegistrations(viewRegs!).then(r => r.data.data), enabled:!!viewRegs });
  const emptyForm = { title:'', description:'', location:'', speaker:'', price:'', paymentHolder:'', paymentBank:'', paymentCard:'', startsAt:'', endsAt:'', maxCapacity:'', isPublished:false, imageUrl:'' };
  const [form, setForm] = React.useState(emptyForm);
  const deleteMutation = useMutation({ mutationFn:(id:string)=>eventsApi.delete(id), onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-events']}); toast.success('Мероприятие удалено'); } });

  function openCreate() { setEditEv(null); setForm(emptyForm); setShowForm(true); }
  function openEdit(ev: any) {
    setEditEv(ev);
    setForm({
      title: ev.title||'', description: ev.description||'', location: ev.location||'',
      speaker: ev.speaker||'', price: ev.price!=null?String(ev.price):'', paymentHolder: ev.paymentHolder||'', paymentBank: ev.paymentBank||'', paymentCard: ev.paymentCard||'',
      startsAt: ev.startsAt ? new Date(ev.startsAt).toISOString().slice(0,16) : '',
      endsAt:   ev.endsAt   ? new Date(ev.endsAt).toISOString().slice(0,16)   : '',
      maxCapacity: ev.maxCapacity?String(ev.maxCapacity):'',
      isPublished: ev.isPublished||false, imageUrl: ev.imageUrl||'',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Укажите название мероприятия'); return; }
    if (!form.location.trim()) { toast.error('Укажите место проведения'); return; }
    if (!form.startsAt) { toast.error('Укажите дату начала'); return; }
    if (!form.endsAt) { toast.error('Укажите дату окончания'); return; }
    if (new Date(form.startsAt) < new Date()) { toast.error('Дата начала не может быть в прошлом'); return; }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) { toast.error('Дата окончания должна быть позже даты начала'); return; }
    const payload = {
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt:   new Date(form.endsAt).toISOString(),
      maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
      price: form.price !== '' ? parseFloat(form.price) : null,
      speaker: form.speaker || undefined,
      paymentHolder: form.paymentHolder || undefined,
      paymentBank: form.paymentBank || undefined,
      paymentCard: form.paymentCard || undefined,
    };
    try {
      if (editEv) {
        await eventsApi.update(editEv.id, payload);
        toast.success('Мероприятие обновлено');
      } else {
        await eventsApi.create(payload);
        toast.success('Мероприятие создано');
      }
      qc.invalidateQueries({ queryKey:['admin-events'] });
      setShowForm(false); setEditEv(null);
    } catch(err:any) { toast.error(err.response?.data?.message||'Ошибка'); }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:400, color:'var(--brown-dark)', fontSize:'1.6rem' }}>Мероприятия</h2>
        <Button size="sm" onClick={openCreate} style={{ display:'flex', alignItems:'center', gap:'6px' }}><Plus size={14} /> Новое мероприятие</Button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', padding:'20px', marginBottom:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'14px' }}>
          <Input label="Название" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required style={{gridColumn:'1/-1'} as any} />
          <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'0.92rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Описание</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ padding:'10px 14px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.9rem', fontFamily:'var(--font-body)', outline:'none', resize:'vertical' }} required />
          </div>
          <Input label="Место проведения" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} required />
          <Input label="Спикер (необязательно)" value={form.speaker} onChange={e=>setForm(f=>({...f,speaker:e.target.value}))} />
          <Input label="Стоимость ₽ (0 = бесплатно)" type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
          {form.price && parseFloat(form.price) > 0 && (<>
            <Input label="Получатель платежа" value={form.paymentHolder} onChange={e=>setForm(f=>({...f,paymentHolder:e.target.value}))} placeholder="ИП Иванова А.В." />
            <Input label="Банк" value={form.paymentBank} onChange={e=>setForm(f=>({...f,paymentBank:e.target.value}))} placeholder="Тинькофф Банк" />
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'0.92rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Номер карты</label>
              <input
                value={form.paymentCard}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0,16);
                  const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                  setForm(f=>({...f,paymentCard:formatted}));
                }}
                style={{ padding:'10px 14px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.9rem', outline:'none', letterSpacing:'0.1em' }}
              />
            </div>
          </>)}
          <ImageUploadField label="Изображение мероприятия" value={form.imageUrl} onChange={url => setForm(f=>({...f,imageUrl:url}))} />
          <Input label="Начало" type="datetime-local" value={form.startsAt} min={new Date().toISOString().slice(0,16)} onChange={e=>setForm(f=>({...f,startsAt:e.target.value}))} required />
          <Input label="Конец" type="datetime-local" value={form.endsAt} min={form.startsAt || new Date().toISOString().slice(0,16)} onChange={e=>setForm(f=>({...f,endsAt:e.target.value}))} required />
          <Input label="Макс. участников (пусто = без ограничений)" type="number" min="1" value={form.maxCapacity} onChange={e=>setForm(f=>({...f,maxCapacity:e.target.value}))} />
          <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'var(--text-muted)', cursor:'pointer' }}>
            <input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))} style={{ accentColor:'var(--sand)' }} />
            Опубликовать сразу
          </label>
          <div style={{ gridColumn:'1/-1', display:'flex', gap:'10px' }}><Button type="submit">{editEv ? 'Сохранить' : 'Создать'}</Button><Button type="button" variant="secondary" onClick={()=>{ setShowForm(false); setEditEv(null); }}>Отмена</Button></div>
        </form>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {(events||[]).map((ev:any) => (
          <div key={ev.id} style={{ background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <p style={{ fontSize:'0.92rem', color:'var(--text-primary)', marginBottom:'3px', fontWeight:500 }}>{ev.title}</p>
                <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>
                  {new Date(ev.startsAt).toLocaleDateString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · {ev.location} ·{' '}
                  <span style={{ color:ev.isPublished?'var(--success)':'var(--text-hint)' }}>{ev.isPublished?'Опубликован':'Черновик'}</span>
                </p>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <button onClick={()=>setViewRegs(viewRegs===ev.id?null:ev.id)} style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--cream-dark)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', padding:'5px 10px', fontSize:'0.92rem', cursor:'pointer', color:'var(--text-muted)' }}>
                  <Users size={13} /> {ev._count?.registrations??0} записей
                </button>
                <button onClick={()=>openEdit(ev)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--sand-dark)' }}><Pencil size={15} /></button>
                <button onClick={()=>{ if(window.confirm(`Удалить мероприятие "${ev.title}"?`)) deleteMutation.mutate(ev.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--error)' }}><Trash2 size={15} /></button>
              </div>
            </div>
            {viewRegs === ev.id && (
              <div style={{ borderTop:'1px solid var(--cream-border)', padding:'14px 18px', background:'var(--cream-dark)' }}>
                <p style={{ fontSize:'0.88rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-hint)', marginBottom:'12px' }}>
                  Список участников ({(regs||[]).length})
                </p>
                {(regs||[]).length === 0 ? (
                  <p style={{ fontSize:'0.85rem', color:'var(--text-hint)' }}>Никто не записался</p>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'8px' }}>
                    {(regs||[]).map((r:any) => (
                      <div key={r.id} style={{ background:'var(--white)', padding:'10px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--cream-border)' }}>
                        <p style={{ fontSize:'0.85rem', color:'var(--text-primary)' }}>{r.user.name}</p>
                        <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>{r.user.email}</p>
                        {r.user.phone && <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>{r.user.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ярмарки (админ) ───────────────────────────────────
function AdminFairs({ qc }: { qc: any }) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingItems, setEditingItems] = React.useState<string|null>(null);
  const [fairSearch, setFairSearch] = React.useState('');
  const { data: fairs } = useQuery({ queryKey:['admin-fairs'], queryFn:()=>fairsApi.adminGetAll().then(r=>r.data.data) });
  const { data: fairProducts } = useQuery({ queryKey:['fair-products',fairSearch], queryFn:()=>fairsApi.getFairProducts(fairSearch?{search:fairSearch}:{}).then(r=>r.data.data) });
  const [selectedItems, setSelectedItems] = React.useState<Record<string,{discountPct:string}>>({});
  const [form, setForm] = React.useState({ title:'', description:'', startsAt:'', endsAt:'', isPublished:false, imageUrl:'' });
  const deleteMutation = useMutation({ mutationFn:(id:string)=>fairsApi.delete(id), onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-fairs']}); toast.success('Ярмарка удалена'); } });
  const saveItemsMutation = useMutation({
    mutationFn:({id,items}:any)=>fairsApi.updateItems(id,items),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-fairs']}); toast.success('Товары обновлены'); setEditingItems(null); },
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Укажите название ярмарки'); return; }
    if (!form.startsAt) { toast.error('Укажите дату начала'); return; }
    if (!form.endsAt) { toast.error('Укажите дату окончания'); return; }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) { toast.error('Дата окончания должна быть позже даты начала'); return; }
    try {
      await fairsApi.create({ ...form, startsAt:new Date(form.startsAt).toISOString(), endsAt:new Date(form.endsAt).toISOString() });
      toast.success('Ярмарка создана');
      qc.invalidateQueries({queryKey:['admin-fairs']});
      setShowForm(false);
    } catch(err:any) { toast.error(err.response?.data?.message||'Ошибка'); }
  }

  function toggleProduct(productId: string) {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[productId]) delete next[productId];
      else next[productId] = { discountPct: '' };
      return next;
    });
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:400, color:'var(--brown-dark)', fontSize:'1.6rem' }}>Ярмарки</h2>
        <Button size="sm" onClick={()=>setShowForm(!showForm)} style={{ display:'flex', alignItems:'center', gap:'6px' }}><Plus size={14} /> Новая ярмарка</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', padding:'20px', marginBottom:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'14px' }}>
          <Input label="Название" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required style={{gridColumn:'1/-1'} as any} />
          <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'0.92rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Описание</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} style={{ padding:'10px 14px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.9rem', fontFamily:'var(--font-body)', outline:'none', resize:'vertical' }} required />
          </div>
          <ImageUploadField label="Обложка ярмарки" value={form.imageUrl} onChange={url => setForm(f=>({...f,imageUrl:url}))} />
          <Input label="Дата начала" type="datetime-local" value={form.startsAt} onChange={e=>setForm(f=>({...f,startsAt:e.target.value}))} required />
          <Input label="Дата конца" type="datetime-local" value={form.endsAt} onChange={e=>setForm(f=>({...f,endsAt:e.target.value}))} required />
          <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'var(--text-muted)', cursor:'pointer' }}>
            <input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))} style={{ accentColor:'var(--sand)' }} />
            Опубликовать сразу
          </label>
          <div style={{ gridColumn:'1/-1', display:'flex', gap:'10px' }}><Button type="submit">{editEv ? 'Сохранить' : 'Создать'}</Button><Button type="button" variant="secondary" onClick={()=>{ setShowForm(false); setEditEv(null); }}>Отмена</Button></div>
        </form>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {(fairs||[]).map((fair:any) => (
          <div key={fair.id} style={{ background:'var(--white)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <p style={{ fontSize:'0.92rem', color:'var(--text-primary)', marginBottom:'3px', fontWeight:500 }}>{fair.title}</p>
                <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>
                  {new Date(fair.startsAt).toLocaleDateString('ru-RU')} → {new Date(fair.endsAt).toLocaleDateString('ru-RU')} ·{' '}
                  {fair._count?.items??0} товаров ·{' '}
                  <span style={{ color:fair.isPublished?'var(--success)':'var(--text-hint)' }}>{fair.isPublished?'Опубликована':'Черновик'}</span>
                </p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>{ setEditingItems(editingItems===fair.id?null:fair.id); setSelectedItems({}); setFairSearch(''); }}
                  style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--cream-dark)', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', padding:'5px 10px', fontSize:'0.92rem', cursor:'pointer', color:'var(--text-muted)' }}>
                  <Package size={13} /> Товары
                </button>
                <button onClick={()=>{ if(window.confirm(`Удалить ярмарку "${fair.title}"?`)) deleteMutation.mutate(fair.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--error)' }}><Trash2 size={15} /></button>
              </div>
            </div>

            {/* Редактор товаров */}
            {editingItems === fair.id && (
              <div style={{ borderTop:'1px solid var(--cream-border)', padding:'16px 18px', background:'var(--cream-dark)' }}>
                <p style={{ fontSize:'0.88rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-hint)', marginBottom:'12px' }}>
                  Выбор товаров для ярмарки (только товары с флагом «для ярмарки»)
                </p>
                <input type="search" placeholder="Поиск по названию..." value={fairSearch} onChange={e=>setFairSearch(e.target.value)}
                  style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.85rem', marginBottom:'12px', outline:'none', background:'var(--white)' }} />

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'8px', maxHeight:'300px', overflowY:'auto', marginBottom:'12px' }}>
                  {(fairProducts||[]).map((p:any) => {
                    const selected = !!selectedItems[p.id];
                    return (
                      <div key={p.id} onClick={()=>toggleProduct(p.id)} style={{
                        padding:'10px 12px', background:selected?'rgba(200,168,130,0.12)':'var(--white)',
                        border:`1px solid ${selected?'var(--sand)':'var(--cream-border)'}`, borderRadius:'var(--radius-sm)',
                        cursor:'pointer', transition:'all var(--transition)',
                      }}>
                        <p style={{ fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'3px' }}>{p.name}</p>
                        <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>₽{Number(p.price).toFixed(2)} · {p.era}</p>
                        {selected && (
                          <div onClick={e=>e.stopPropagation()} style={{ marginTop:'8px' }}>
                            <input type="number" min="0" max="90" placeholder="Скидка %" value={selectedItems[p.id]?.discountPct}
                              onChange={e=>setSelectedItems(prev=>({...prev,[p.id]:{discountPct:e.target.value}}))}
                              style={{ width:'100%', padding:'4px 8px', border:'1px solid var(--cream-border)', borderRadius:'var(--radius-sm)', fontSize:'0.95rem', outline:'none' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(fairProducts||[]).length === 0 && (
                    <p style={{ fontSize:'0.85rem', color:'var(--text-hint)', padding:'20px' }}>
                      Нет товаров с флагом «для ярмарки». Добавьте флаг в настройках товара.
                    </p>
                  )}
                </div>

                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <Button size="sm" loading={saveItemsMutation.isPending}
                    onClick={()=>saveItemsMutation.mutate({ id:fair.id, items:Object.entries(selectedItems).map(([productId,{discountPct}])=>({ productId, discountPct:discountPct?parseInt(discountPct):undefined })) })}>
                    Сохранить {Object.keys(selectedItems).length > 0 && `(${Object.keys(selectedItems).length})`}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={()=>setEditingItems(null)}>Отмена</Button>
                  <p style={{ fontSize:'0.88rem', color:'var(--text-hint)' }}>Кликните на товар для выбора. Это заменит весь список товаров ярмарки.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Настройки магазина ────────────────────────────────
function AdminSettings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => settingsApi.get().then(r => r.data.data),
  });
  const [form, setForm] = React.useState<any>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (settings && !form) setForm({ ...settings });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => settingsApi.update(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['shop-settings'] });
      setForm(res.data.data);
      setSaved(true);
      toast.success('Настройки сохранены');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => toast.error('Ошибка сохранения'),
  });

  if (isLoading || !form) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-sm)' }} />)}
    </div>
  );

  function set(key: string, value: string) { setForm((f: any) => ({ ...f, [key]: value })); }

  const fields = [
    { key: 'shopName',    label: 'Название магазина',        placeholder: 'Ателье Историй' },
    { key: 'email',       label: 'Электронная почта',        placeholder: 'hello@atelier-istoriy.ru', type: 'email' },
    { key: 'phone',       label: 'Номер телефона',           placeholder: '+7 (863) 210-45-78', type: 'tel' },
    { key: 'address',     label: 'Адрес (улица, дом)',       placeholder: 'ул. Пушкинская, д. 48' },
    { key: 'city',        label: 'Город и индекс',           placeholder: 'г. Ростов-на-Дону, 344082' },
    { key: 'hours',       label: 'Часы работы',              placeholder: 'Пн–Сб, 10:00–19:00' },
    { key: 'paymentCardHolder', label: 'Получатель платежей',     placeholder: 'ИП Иванова А.В.' },
    { key: 'paymentBankName',   label: 'Банк получателя',         placeholder: 'Тинькофф Банк' },
    { key: 'paymentCardNumber', label: 'Номер карты',             placeholder: '0000 0000 0000 0000' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--brown-dark)', fontSize: '1.6rem', marginBottom: '8px' }}>Настройки магазина</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Контактная информация отображается на странице «О нас» и в подвале сайта.</p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', padding: '32px', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {fields.map(({ key, label, placeholder, type }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</label>
              <input
                type={type || 'text'}
                value={form[key] || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', color: 'var(--text-primary)', outline: 'none', background: 'var(--white)', transition: 'border-color var(--transition)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--sand)')}
                onBlur={e => (e.target.style.borderColor = 'var(--cream-border)')}
              />
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Описание (подвал)</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3}
              style={{ padding: '10px 14px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', background: 'var(--white)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--sand)')}
              onBlur={e => (e.target.style.borderColor = 'var(--cream-border)')}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '8px' }}>
            <Button onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>Сохранить изменения</Button>
            {saved && <span style={{ fontSize: '0.88rem', color: 'var(--success)' }}>✓ Сохранено</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', background: 'var(--cream-dark)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)', padding: '24px', maxWidth: '600px' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-hint)', marginBottom: '16px' }}>Предпросмотр</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brown-dark)', marginBottom: '6px' }}>{form.shopName}</p>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.7 }}>{form.description}</p>
        {[['📧', form.email],['📞', form.phone],[`📍`, `${form.address}, ${form.city}`],['🕐', form.hours]].map(([icon, val]) => (
          <p key={icon} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{icon} {val}</p>
        ))}
      </div>
    </div>
  );
}

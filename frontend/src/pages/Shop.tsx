// src/pages/Shop.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { productsApi, categoriesApi } from '../api';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { ProductFilters } from '../types';

// Эпохи — отображаем на русском "1920-е" вместо "1920s"
const ERAS = [
  { value: '1850s', label: '1850-е' },
  { value: '1860s', label: '1860-е' },
  { value: '1870s', label: '1870-е' },
  { value: '1880s', label: '1880-е' },
  { value: '1890s', label: '1890-е' },
  { value: '1900s', label: '1900-е' },
  { value: '1910s', label: '1910-е' },
  { value: '1920s', label: '1920-е' },
  { value: '1930s', label: '1930-е' },
  { value: '1940s', label: '1940-е' },
  { value: '1950s', label: '1950-е' },
  { value: '1960s', label: '1960-е' },
  { value: '1970s', label: '1970-е' },
  { value: '1980s', label: '1980-е' },
  { value: '1990s', label: '1990-е' },
  { value: '2000s', label: '2000-е' },
  { value: 'modern', label: 'Современное' },
];

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Отличное' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Удовлетворительное' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'popular', label: 'Популярные' },
];

// Простой debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const filters: ProductFilters = {
    categoryId: searchParams.get('categoryId') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    era: searchParams.get('era') || undefined,
    condition: searchParams.get('condition') || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  };

  const [searchInput, setSearchInput] = React.useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Применяем debounced search к URL params
  React.useEffect(() => {
    setFilter('search', debouncedSearch || null);
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getAll(filters).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  function setFilter(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function clearAll() { setSearchParams({}); }

  const hasFilters = !!(filters.categoryId || filters.minPrice || filters.maxPrice || filters.era || filters.condition || filters.search);

  return (
    <main className="page-enter">
      {/* Заголовок страницы */}
      <div style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--cream-border)', padding: 'clamp(32px,5vw,56px) 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--brown-dark)', marginBottom: '8px' }}>
            Магазин
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {data?.meta ? `${data.meta.total} вещей в нашей коллекции` : 'Наша коллекция'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,48px)' }}>
        {/* Панель инструментов */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
          {/* Поиск */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '340px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Поиск вещей..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', fontSize: '0.9rem', outline: 'none', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Фильтры */}
          <Button
            variant={filtersOpen ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <SlidersHorizontal size={14} /> Фильтры
            {hasFilters && <span style={{ background: 'var(--sand)', color: 'var(--white)', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
          </Button>

          {/* Сортировка */}
          <select
            value={filters.sort}
            onChange={e => setFilter('sort', e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', background: 'var(--white)', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Сбросить фильтры */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <X size={13} /> Сбросить
            </Button>
          )}
        </div>

        {/* Панель фильтров */}
        {filtersOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '32px', padding: '24px', background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-md)' }}>
            {/* Категория */}
            <div>
              <FilterLabel>Категория</FilterLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <FilterOption active={!filters.categoryId} onClick={() => setFilter('categoryId', null)}>Все</FilterOption>
                {categories?.map(cat => (
                  <FilterOption key={cat.id} active={filters.categoryId === cat.id} onClick={() => setFilter('categoryId', cat.id)}>
                    {cat.name}
                  </FilterOption>
                ))}
              </div>
            </div>

            {/* Цена */}
            <div>
              <FilterLabel>Диапазон цен (₽)</FilterLabel>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" min="0" placeholder="от"
                  defaultValue={filters.minPrice}
                  onChange={e => setFilter('minPrice', e.target.value || null)}
                  style={{ width: '80px', padding: '6px 10px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', outline: 'none' }}
                />
                <span style={{ color: 'var(--text-hint)' }}>–</span>
                <input type="number" min="0" placeholder="до"
                  defaultValue={filters.maxPrice}
                  onChange={e => setFilter('maxPrice', e.target.value || null)}
                  style={{ width: '80px', padding: '6px 10px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Эпоха */}
            <div>
              <FilterLabel>Эпоха</FilterLabel>
              <select
                value={filters.era || ''}
                onChange={e => setFilter('era', e.target.value || null)}
                style={{ padding: '7px 10px', border: '1px solid var(--cream-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', color: 'var(--text-primary)' }}
              >
                <option value="">Любая</option>
                {ERAS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            {/* Состояние */}
            <div>
              <FilterLabel>Состояние</FilterLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <FilterOption active={!filters.condition} onClick={() => setFilter('condition', null)}>Любое</FilterOption>
                {CONDITIONS.map(c => (
                  <FilterOption key={c.value} active={filters.condition === c.value} onClick={() => setFilter('condition', c.value)}>
                    {c.label}
                  </FilterOption>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Сетка товаров */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: '14px', marginTop: '12px', width: '60%' }} />
                <div className="skeleton" style={{ height: '20px', marginTop: '8px', width: '40%' }} />
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-hint)', marginBottom: '12px' }}>Ничего не найдено</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-hint)' }}>Попробуйте изменить фильтры</p>
            <Button variant="secondary" size="sm" style={{ marginTop: '24px' }} onClick={clearAll}>Сбросить все фильтры</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {data?.data?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilter('page', String((filters.page || 1) - 1))}>
              Назад
            </Button>

            {Array.from({ length: data.meta.totalPages }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === filters.page;
              const showPage = p === 1 || p === data.meta.totalPages || Math.abs(p - (filters.page || 1)) <= 1;
              if (!showPage) return null;
              return (
                <button key={p} onClick={() => setFilter('page', String(p))}
                  style={{ width: '36px', height: '36px', border: `1px solid ${isCurrent ? 'var(--sand)' : 'var(--cream-border)'}`, background: isCurrent ? 'var(--sand)' : 'transparent', color: isCurrent ? 'var(--white)' : 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {p}
                </button>
              );
            })}

            <Button variant="secondary" size="sm"
              disabled={filters.page === data.meta.totalPages}
              onClick={() => setFilter('page', String((filters.page || 1) + 1))}>
              Вперёд
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
      {children}
    </p>
  );
}

function FilterOption({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', padding: '0', color: active ? 'var(--sand-dark)' : 'var(--text-muted)', fontWeight: active ? 500 : 400, fontFamily: 'var(--font-body)', transition: 'color var(--transition)' }}>
      {active ? '› ' : ''}{children}
    </button>
  );
}

// src/components/products/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  style?: React.CSSProperties;
}


const COUNTRY_RU: Record<string, string> = {
  'France': 'Франция',
  'Italy': 'Италия',
  'United Kingdom': 'Великобритания',
  'Germany': 'Германия',
  'United States': 'США',
  'Denmark': 'Дания',
  'Norway': 'Норвегия',
  'Switzerland': 'Швейцария',
  'Japan': 'Япония',
  'Soviet Union': 'СССР',
  'Belgium': 'Бельгия',
  'Finland': 'Финляндия',
  'Sweden': 'Швеция',
  'Netherlands': 'Нидерланды',
  'Austria': 'Австрия',
  'Spain': 'Испания',
  'Poland': 'Польша',
  'Czech Republic': 'Чехия',
  'Russia': 'Россия',
};
function localizeCountry(country: string): string {
  return COUNTRY_RU[country] || country;
}

export function ProductCard({ product, style }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const [hovered, setHovered] = React.useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`, { duration: 2000 });
  }

  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/shop/${product.slug}`}
      style={{ display: 'block', textDecoration: 'none', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--cream-border)',
          transition: 'box-shadow var(--transition), transform var(--transition)',
          boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          transform: hovered ? 'translateY(-3px)' : 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s var(--ease)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />

          {/* Era badge */}
          {product.era && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(250,247,242,0.92)',
                color: 'var(--brown)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {product.era ? product.era.replace('s', '-е') : ''}
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(250,247,242,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.88rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--cream-border)',
                  padding: '4px 12px',
                  background: 'var(--white)',
                }}
              >
                Sold
              </span>
            </div>
          )}

          {/* Add to cart button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'var(--sand)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.85)',
                transition: 'opacity 0.25s ease, transform 0.25s ease, background var(--transition)',
                boxShadow: 'var(--shadow-md)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sand-dark)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p
            style={{
              fontSize: '0.88rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-hint)',
            }}
          >
            {product.category?.name}
            {product.countryOfOrigin && ` · ${localizeCountry(product.countryOfOrigin)}`}
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 400,
              color: 'var(--brown-dark)',
              lineHeight: 1.25,
              flex: 1,
            }}
          >
            {product.name}
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--sand-dark)',
              marginTop: '4px',
            }}
          >
            ₽{Number(product.price).toFixed(2)}
          </p>
        </div>
      </article>
    </Link>
  );
}

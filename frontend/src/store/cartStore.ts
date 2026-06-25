// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find(i => i.product.id === product.id);

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, product.stock);
          set({
            items: items.map(i =>
              i.product.id === product.id ? { ...i, quantity: newQty } : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, { product, quantity }], isOpen: true });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.product.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.product.id === productId
              ? { ...i, quantity: Math.min(quantity, i.product.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    { name: 'wsk-auth', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, variant = null) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product._id && i.variant === variant);
          if (existing) {
            return { items: state.items.map((i) => i.productId === product._id && i.variant === variant ? { ...i, qty: i.qty + qty } : i) };
          }
          return { items: [...state.items, { productId: product._id, name: product.name, brand: product.brand, price: product.price, mrp: product.mrp, image: product.images?.[0]?.url || '', qty, variant }] };
        });
      },

      updateQty: (productId, qty, variant = null) => {
        if (qty < 1) return;
        set((state) => ({ items: state.items.map((i) => i.productId === productId && i.variant === variant ? { ...i, qty } : i) }));
      },

      removeItem: (productId, variant = null) => {
        set((state) => ({ items: state.items.filter((i) => !(i.productId === productId && i.variant === variant)) }));
      },

      clearCart: () => set({ items: [] }),

      get total() { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
      get count() { return get().items.reduce((s, i) => s + i.qty, 0); },
    }),
    { name: 'wsk-cart' }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        set((state) => {
          const exists = state.items.find((i) => i._id === product._id);
          return exists ? { items: state.items.filter((i) => i._id !== product._id) } : { items: [...state.items, product] };
        });
      },
      isWishlisted: (id) => get().items.some((i) => i._id === id),
    }),
    { name: 'wsk-wishlist' }
  )
);

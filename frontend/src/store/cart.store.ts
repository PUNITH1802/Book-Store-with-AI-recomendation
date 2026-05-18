import { create } from 'zustand';
import type { Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  setCart: (cart: Cart | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  setCart: (cart) =>
    set({
      cart,
      itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    }),
  clear: () => set({ cart: null, itemCount: 0 }),
}));

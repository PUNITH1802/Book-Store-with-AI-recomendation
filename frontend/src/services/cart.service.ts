import { api } from '@/lib/axios';
import type { Cart, ApiResponse } from '@/types';

export const cartService = {
  get: () => api.get<ApiResponse<Cart>>('/cart').then((r) => r.data.data),

  addItem: (bookId: string, quantity = 1) =>
    api.post<ApiResponse<Cart>>('/cart/items', { bookId, quantity }).then((r) => r.data.data),

  updateQuantity: (bookId: string, quantity: number) =>
    api.patch(`/cart/items/${bookId}`, { quantity }),

  removeItem: (bookId: string) => api.delete(`/cart/items/${bookId}`),

  clear: () => api.delete('/cart'),
};

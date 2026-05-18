import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await cartService.get();
      setCart(cart);
      return cart;
    },
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { setCart } = useCartStore();

  return useMutation({
    mutationFn: ({ bookId, quantity = 1 }: { bookId: string; quantity?: number }) =>
      cartService.addItem(bookId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => cartService.removeItem(bookId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: string; quantity: number }) =>
      cartService.updateQuantity(bookId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

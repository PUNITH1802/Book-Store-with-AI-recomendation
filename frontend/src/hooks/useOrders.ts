import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => ordersService.list(page),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

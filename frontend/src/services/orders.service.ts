import { api } from '@/lib/axios';
import type { Order, ApiResponse, PaginatedResponse } from '@/types';

export const ordersService = {
  create: (data: { shippingAddress: object; couponCode?: string; notes?: string }) =>
    api.post<ApiResponse<Order>>('/orders', data).then((r) => r.data.data),

  list: (page = 1) =>
    api.get<PaginatedResponse<Order>>('/orders', { params: { page } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data),

  cancel: (id: string) =>
    api.post<ApiResponse<Order>>(`/orders/${id}/cancel`).then((r) => r.data.data),
};

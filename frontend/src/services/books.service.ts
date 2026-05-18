import { api } from '@/lib/axios';
import type { Book, PaginatedResponse, ApiResponse } from '@/types';

export interface BookFilters {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  seller?: string;
}

export const booksService = {
  list: (filters: BookFilters = {}) =>
    api.get<PaginatedResponse<Book>>('/books', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Book>>(`/books/${id}`).then((r) => r.data.data),

  getFeatured: () =>
    api.get<ApiResponse<Book[]>>('/books/featured').then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<string[]>>('/books/categories').then((r) => r.data.data),

  getSimilar: (id: string) =>
    api.get<ApiResponse<Book[]>>(`/books/${id}/similar`).then((r) => r.data.data),

  search: (q: string, page = 1) =>
    api.get<PaginatedResponse<Book>>('/books/search', { params: { q, page } }).then((r) => r.data),

  create: (data: Partial<Book>) =>
    api.post<ApiResponse<Book>>('/books', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Book>) =>
    api.patch<ApiResponse<Book>>(`/books/${id}`, data).then((r) => r.data.data),
};

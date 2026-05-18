import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService, type BookFilters } from '@/services/books.service';

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (filters: BookFilters) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  featured: () => [...bookKeys.all, 'featured'] as const,
  categories: () => [...bookKeys.all, 'categories'] as const,
  similar: (id: string) => [...bookKeys.all, 'similar', id] as const,
};

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: bookKeys.list(filters),
    queryFn: () => booksService.list(filters),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => booksService.getById(id),
    enabled: !!id,
  });
}

export function useFeaturedBooks() {
  return useQuery({
    queryKey: bookKeys.featured(),
    queryFn: booksService.getFeatured,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: bookKeys.categories(),
    queryFn: booksService.getCategories,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSimilarBooks(id: string) {
  return useQuery({
    queryKey: bookKeys.similar(id),
    queryFn: () => booksService.getSimilar(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  });
}

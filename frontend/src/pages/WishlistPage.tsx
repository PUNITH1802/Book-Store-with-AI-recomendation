import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { BookCard } from '@/components/ui/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import type { Book, ApiResponse } from '@/types';

export function WishlistPage() {
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<ApiResponse<Book[]>>('/users/wishlist').then((r) => r.data.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="w-6 h-6 text-brand-500" /> My Wishlist
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }, (_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : !wishlist?.length ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save books you want to read later.</p>
          <Link to="/books" className="btn-primary px-8 py-3">Browse Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {wishlist.map((book) => <BookCard key={book._id} book={book} />)}
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, ArrowLeft, Package, Book } from 'lucide-react';
import { useBook, useSimilarBooks } from '@/hooks/useBooks';
import { useAddToCart } from '@/hooks/useCart';
import { BookCard } from '@/components/ui/BookCard';
import { RatingStars } from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, calcDiscount } from '@/lib/utils';
import toast from 'react-hot-toast';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id!);
  const { data: similar } = useSimilarBooks(id!);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ bookId: id! });
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-10">
          <Skeleton className="w-64 h-96 flex-shrink-0 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const discount = calcDiscount(book.price, book.discountPrice);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/books" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Books
      </Link>

      <div className="grid md:grid-cols-[280px_1fr] gap-10">
        {/* Cover */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          </div>
          {book.images?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {book.images.slice(0, 4).map((img, i) => (
                <div key={i} className="w-14 h-20 rounded-lg overflow-hidden border border-surface-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="text-sm text-brand-400 font-medium">{book.category}</span>
          <h1 className="text-3xl font-bold mt-1 leading-tight">{book.title}</h1>
          <p className="text-lg text-gray-400 mt-1">by <span className="text-white">{book.author}</span></p>

          <div className="flex items-center gap-3 mt-3">
            <RatingStars rating={book.rating} />
            <span className="text-sm font-medium">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({book.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-5">
            {book.discountPrice ? (
              <>
                <span className="text-3xl font-bold">{formatPrice(book.discountPrice)}</span>
                <span className="text-lg text-gray-500 line-through">{formatPrice(book.price)}</span>
                {discount > 0 && <span className="bg-brand-600 text-white text-sm font-bold px-2 py-0.5 rounded">-{discount}%</span>}
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(book.price)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className={`text-sm ${book.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0 || addToCart.isPending}
              className="btn-primary flex items-center gap-2 px-8 py-3"
            >
              <ShoppingCart className="w-5 h-5" />
              {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="btn-ghost p-3 border border-surface-border rounded-lg hover:border-brand-600/40">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-surface-border">
            <h3 className="font-semibold mb-3">About this book</h3>
            <p className="text-gray-400 leading-relaxed">{book.description}</p>
          </div>

          {/* Metadata */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Publisher', value: book.publisher },
              { label: 'Language', value: book.language },
              { label: 'Pages', value: book.pages },
              { label: 'ISBN', value: book.isbn ?? 'N/A' },
            ].filter(({ value }) => value).map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium mt-0.5">{String(value)}</p>
              </div>
            ))}
          </div>

          {book.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full border border-surface-border text-xs text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Similar Books */}
      {similar && similar.length > 0 && (
        <section className="mt-16 pt-10 border-t border-surface-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Book className="w-5 h-5 text-brand-500" /> Readers Also Enjoyed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similar.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}

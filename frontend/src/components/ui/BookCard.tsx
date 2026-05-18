import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Book } from '@/types';
import { formatPrice, calcDiscount, cn } from '@/lib/utils';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const { setCart } = useCartStore();
  const discount = calcDiscount(book.price, book.discountPrice);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const cart = await cartService.addItem(book._id);
      setCart(cart);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('group card overflow-hidden hover:border-brand-600/40 transition-colors', className)}
    >
      <Link to={`/books/${book._id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {book.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Out of Stock</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-xs text-brand-400 font-medium mb-1 truncate">{book.category}</p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-brand-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-600">({book.reviewCount})</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {book.discountPrice ? (
              <>
                <span className="font-bold text-white">{formatPrice(book.discountPrice)}</span>
                <span className="text-xs text-gray-500 line-through">{formatPrice(book.price)}</span>
              </>
            ) : (
              <span className="font-bold">{formatPrice(book.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

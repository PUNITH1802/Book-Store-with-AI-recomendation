import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart, useRemoveFromCart, useUpdateCartQty } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveFromCart();
  const updateQty = useUpdateCartQty();

  const subtotal = cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-4 mb-4 card p-4">
            <Skeleton className="w-16 h-24 rounded-lg" />
            <div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/4" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any books yet.</p>
        <Link to="/books" className="btn-primary px-8 py-3">Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-brand-500" /> Shopping Cart
        <span className="text-lg text-gray-500 font-normal">({cart.items.length} items)</span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-3">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.book._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="card p-4 flex gap-4"
              >
                <Link to={`/books/${item.book._id}`}>
                  <img src={item.book.coverImage} alt={item.book.title} className="w-16 h-24 object-cover rounded-lg flex-shrink-0" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${item.book._id}`} className="font-semibold hover:text-brand-300 transition-colors line-clamp-1">
                    {item.book.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">{(item.book as unknown as { author: string }).author ?? ''}</p>
                  <p className="text-brand-400 font-bold mt-2">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem.mutate(item.book._id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item.quantity > 1 && updateQty.mutate({ bookId: item.book._id, quantity: item.quantity - 1 })}
                      className="w-6 h-6 rounded border border-surface-border flex items-center justify-center hover:border-brand-600/40 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty.mutate({ bookId: item.book._id, quantity: item.quantity + 1 })}
                      className="w-6 h-6 rounded border border-surface-border flex items-center justify-center hover:border-brand-600/40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-5">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tax (8%)</span><span>{formatPrice(subtotal * 0.08)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-green-400">Free</span></div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-surface-border">
              <span>Total</span>
              <span>{formatPrice(subtotal * 1.08)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/books" className="text-center text-sm text-gray-500 hover:text-white mt-3 block transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  refunded: 'text-gray-400 bg-gray-400/10',
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Package className="w-6 h-6 text-brand-500" /> My Orders
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card p-5">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/books" className="btn-primary px-8 py-3">Browse Books</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((order, i) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order._id}`} className="card p-5 block hover:border-brand-600/40 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs text-gray-500">Order</span>
                      <span className="ml-2 font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full capitalize', statusColors[order.status] ?? 'text-gray-400')}>
                        {order.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{formatDate(order.createdAt)}</p>

                  <div className="flex items-center gap-4 justify-between">
                    <div className="flex gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <img key={item.book} src={item.coverImage} alt={item.title} className="w-10 h-14 object-cover rounded" />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-14 bg-surface-muted rounded flex items-center justify-center text-xs text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

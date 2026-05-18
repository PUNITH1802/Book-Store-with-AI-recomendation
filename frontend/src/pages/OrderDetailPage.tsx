import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const cancel = useCancelOrder();

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync(id!);
      toast.success('Order cancelled');
    } catch {
      toast.error('Cannot cancel this order');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        {['pending', 'confirmed'].includes(order.status) && (
          <button onClick={handleCancel} disabled={cancel.isPending} className="text-sm text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors">
            {cancel.isPending ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    i <= currentStep ? 'bg-brand-600' : 'bg-surface-muted border border-surface-border',
                  )}>
                    {i < currentStep ? <CheckCircle className="w-4 h-4 text-white" /> :
                      i === currentStep ? <Clock className="w-4 h-4 text-white" /> :
                        <span className="w-2 h-2 rounded-full bg-gray-600" />}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 capitalize hidden sm:block">{step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-1', i < currentStep ? 'bg-brand-600' : 'bg-surface-border')} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={String(item.book)} className="flex gap-3 items-center">
              <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-surface-border mt-5 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-green-400">-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-400">Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-surface-border">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="card p-6">
        <h3 className="font-semibold mb-3">Shipping Address</h3>
        <address className="not-italic text-sm text-gray-400 leading-relaxed">
          {order.shippingAddress.line1}<br />
          {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
          {order.shippingAddress.country}
        </address>
        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-surface-border">
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="font-mono text-brand-400 mt-1">{order.trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required').default('US'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { data: cart } = useCart();
  const createOrder = useCreateOrder();
  const { clear } = useCartStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'US' },
  });

  const subtotal = cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const { couponCode, notes, ...address } = data;
      const order = await createOrder.mutateAsync({
        shippingAddress: address,
        couponCode,
        notes,
      });
      clear();
      toast.success('Order placed successfully!');
      navigate(`/orders/${order._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Checkout failed';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h3 className="font-semibold mb-5">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Street Address *</label>
                  <input {...register('line1')} className="input" placeholder="123 Main St" />
                  {errors.line1 && <p className="text-red-400 text-xs mt-1">{errors.line1.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400 mb-1 block">Apt, Suite, etc.</label>
                  <input {...register('line2')} className="input" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">City *</label>
                  <input {...register('city')} className="input" />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">State *</label>
                  <input {...register('state')} className="input" />
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Postal Code *</label>
                  <input {...register('postalCode')} className="input" />
                  {errors.postalCode && <p className="text-red-400 text-xs mt-1">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Country</label>
                  <input {...register('country')} className="input" />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Discount Code</h3>
              <input {...register('couponCode')} className="input" placeholder="Enter coupon code" />
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Order Notes</h3>
              <textarea {...register('notes')} className="input resize-none" rows={3} placeholder="Optional notes..." />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-5">Order Summary</h3>
              <div className="space-y-2 mb-5">
                {cart?.items.map((item) => (
                  <div key={item.book._id} className="flex justify-between text-sm">
                    <span className="text-gray-400 line-clamp-1 flex-1 mr-2">{item.book.title} × {item.quantity}</span>
                    <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tax (8%)</span><span>{formatPrice(subtotal * 0.08)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-surface-border">
                  <span>Total</span><span>{formatPrice(subtotal * 1.08)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createOrder.isPending}
                className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </motion.button>

              <p className="text-xs text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secure checkout
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

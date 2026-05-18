import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface SellerDashboardData { totalBooks: number; activeBooks: number; totalOrders: number; revenue: number; }
interface Analytics { monthlySales: { _id: { year: number; month: number }; revenue: number; orders: number }[]; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SellerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => api.get<{ data: SellerDashboardData }>('/seller/dashboard').then((r) => r.data.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: () => api.get<{ data: Analytics }>('/seller/analytics').then((r) => r.data.data),
  });

  const chartData = analytics?.monthlySales.map((m) => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.orders,
  })) ?? [];

  const stats = [
    { label: 'Total Books', value: data?.totalBooks.toLocaleString() ?? '—', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Active Books', value: data?.activeBooks.toLocaleString() ?? '—', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Orders', value: data?.totalOrders.toLocaleString() ?? '—', icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Revenue', value: data ? formatPrice(data.revenue) : '—', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track your book sales and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{stat.value}</p>}
          </motion.div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" /> Sales Trend
        </h3>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-600 text-sm">No sales data yet. Start listing books!</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#17171f', border: '1px solid #2a2a38', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: number) => [formatPrice(v), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#c44cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

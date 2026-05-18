import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, BookOpen, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface Analytics {
  totalUsers: number;
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  monthlySales: { _id: { year: number; month: number }; revenue: number; count: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get<{ data: Analytics }>('/admin/analytics').then((r) => r.data.data),
  });

  const chartData = data?.monthlySales.map((m) => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    orders: m.count,
  })) ?? [];

  const stats = [
    { label: 'Total Users', value: data?.totalUsers.toLocaleString() ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Books', value: data?.totalBooks.toLocaleString() ?? '—', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total Orders', value: data?.totalOrders.toLocaleString() ?? '—', icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Total Revenue', value: data ? formatPrice(data.totalRevenue) : '—', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of platform activity</p>
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
          <TrendingUp className="w-4 h-4 text-brand-500" /> Monthly Revenue
        </h3>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-600 text-sm">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#17171f', border: '1px solid #2a2a38', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: number) => [formatPrice(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#c44cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

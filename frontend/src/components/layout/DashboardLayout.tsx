import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types';
import {
  LayoutDashboard, BookOpen, ShoppingCart, Users, Settings,
  BarChart2, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/books', label: 'Books', icon: BookOpen },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const sellerNav = [
  { to: '/seller', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/seller/books', label: 'My Books', icon: BookOpen },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart2 },
];

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const nav = user?.role === UserRole.Admin ? adminNav : sellerNav;

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-60 border-r border-surface-border flex flex-col">
        <div className="p-6 border-b border-surface-border">
          <span className="text-xl font-bold text-gradient">BookCart</span>
          <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role} Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-muted',
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
              {user?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

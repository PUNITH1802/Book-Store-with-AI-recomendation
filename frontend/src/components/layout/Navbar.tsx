import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types';
import { Search, ShoppingCart, Heart, User, LogOut, LayoutDashboard, BookOpen, Bot, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/books?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    logout();
    navigate('/');
    toast.success('Logged out');
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="text-2xl font-bold text-gradient flex-shrink-0">
            BookCart
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors, genres..."
                className="input pl-10 pr-4"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <NavLink to="/books" className={({ isActive }) => cn('btn-ghost text-sm', isActive && 'text-white')}>Books</NavLink>
            <NavLink to="/ai-chat" className={({ isActive }) => cn('btn-ghost text-sm flex items-center gap-1', isActive && 'text-white')}>
              <Bot className="w-4 h-4" /> AI Chat
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 ml-4">
            <Link to="/wishlist" className="btn-ghost p-2 relative">
              <Heart className="w-5 h-5" />
            </Link>

            <Link to="/cart" className="btn-ghost p-2 relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold hover:ring-2 ring-brand-400 transition-all">
                  {user?.name[0]}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 card shadow-xl py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-surface-border">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <MenuItem to="/profile" icon={User} label="Profile" onClose={() => setUserMenuOpen(false)} />
                    <MenuItem to="/orders" icon={BookOpen} label="Orders" onClose={() => setUserMenuOpen(false)} />
                    {(user?.role === UserRole.Admin || user?.role === UserRole.Seller) && (
                      <MenuItem to={user.role === UserRole.Admin ? '/admin' : '/seller'} icon={LayoutDashboard} label="Dashboard" onClose={() => setUserMenuOpen(false)} />
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Sign in</Link>
            )}

            <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card animate-fade-in">
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-10" />
              </div>
            </form>
            <nav className="mt-3 space-y-1">
              <Link to="/books" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-white">Books</Link>
              <Link to="/ai-chat" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-white">AI Chat</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, icon: Icon, label, onClose }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; onClose: () => void }) {
  return (
    <Link to={to} onClick={onClose} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-muted transition-colors">
      <Icon className="w-4 h-4" /> {label}
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gradient">
              <BookOpen className="w-5 h-5 text-brand-500" /> BookCart
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Your AI-powered destination for discovering and buying books you'll love.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/books" className="hover:text-white transition-colors">All Books</Link></li>
              <li><Link to="/books?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
              <li><Link to="/ai-chat" className="hover:text-white transition-colors">AI Recommendations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Sell</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/seller" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Seller</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} BookCart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" className="text-gray-600 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="https://twitter.com" className="text-gray-600 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

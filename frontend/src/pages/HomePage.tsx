import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useFeaturedBooks, useCategories } from '@/hooks/useBooks';
import { BookCard } from '@/components/ui/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';

export function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: featured, isLoading } = useFeaturedBooks();
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/books?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0 bg-gradient-radial from-brand-900/30 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-powered book discovery
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              Find your next <span className="text-gradient">great read</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed">
              Millions of books. Personalized for you. Let our AI help you discover stories you'll love — based on your taste, not algorithms.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Try "books like Dune but shorter"'
                  className="input pl-12 py-3.5 text-base"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 text-base">Search</button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Fiction', 'Self-Help', 'Science', 'Fantasy'].map((c) => (
                <Link key={c} to={`/books?category=${c}`} className="text-xs px-3 py-1 rounded-full border border-surface-border text-gray-400 hover:border-brand-600/40 hover:text-white transition-colors">
                  {c}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-surface-border bg-surface-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { label: 'Books Available', value: '50,000+' },
              { label: 'Happy Readers', value: '120,000+' },
              { label: 'Categories', value: '200+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gradient">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-500" /> Featured Books
            </h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked titles worth your time</p>
          </div>
          <Link to="/books?featured=true" className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <BookCardSkeleton key={i} />)
            : featured?.slice(0, 6).map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="border-t border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-500" /> Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/books?category=${cat}`}
                    className="card p-4 hover:border-brand-600/40 hover:bg-surface-muted transition-all group flex items-center justify-between"
                  >
                    <span className="font-medium group-hover:text-brand-300 transition-colors">{cat}</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI CTA */}
      <section className="border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-brand-900/20 via-transparent to-transparent" />
            <div className="relative">
              <Sparkles className="w-10 h-10 text-brand-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-3">Not sure what to read next?</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Chat with our AI assistant. Describe your mood, a book you loved, or what you're curious about — and get personalized recommendations instantly.
              </p>
              <Link to="/ai-chat" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Try AI Chat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

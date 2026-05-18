import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { useBooks, useCategories } from '@/hooks/useBooks';
import { BookCard } from '@/components/ui/BookCard';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const featured = searchParams.get('featured') === 'true' ? true : undefined;

  const { data, isLoading } = useBooks({ page, q, category, featured, limit: 20 });
  const { data: categories } = useCategories();

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {q ? `Results for "${q}"` : featured ? 'Featured Books' : category ?? 'All Books'}
          </h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">{data.meta.total.toLocaleString()} books found</p>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn('btn-ghost flex items-center gap-2 text-sm', filtersOpen && 'text-white bg-surface-muted')}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={cn(
          'w-60 flex-shrink-0 space-y-6 transition-all',
          filtersOpen ? 'block' : 'hidden md:block'
        )}>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Category</h3>
              {category && (
                <button onClick={() => setFilter('category', undefined)} className="text-xs text-brand-400 hover:text-brand-300">
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {categories?.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter('category', cat === category ? undefined : cat)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                    cat === category ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-surface-muted',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(q || category) && (
            <div className="card p-4">
              <h3 className="font-semibold text-sm mb-3">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {q && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-600/20 text-brand-400 text-xs">
                    "{q}"
                    <button onClick={() => setFilter('q', undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-600/20 text-brand-400 text-xs">
                    {category}
                    <button onClick={() => setFilter('category', undefined)}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }, (_, i) => <BookCardSkeleton key={i} />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-24">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {data?.data.map((book, i) => (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </div>

              {data && data.meta.totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <Pagination
                    page={page}
                    totalPages={data.meta.totalPages}
                    onPageChange={(p) => setFilter('page', String(p))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

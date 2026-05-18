import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingStars({ rating, max = 5, size = 'md', className }: RatingStarsProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <Star
            key={i}
            className={cn(s, filled || partial ? 'text-amber-400' : 'text-gray-600', filled && 'fill-amber-400')}
          />
        );
      })}
    </div>
  );
}

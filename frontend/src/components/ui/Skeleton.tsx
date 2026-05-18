import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-16 mt-2" />
      </div>
    </div>
  );
}

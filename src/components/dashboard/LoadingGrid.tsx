import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  rows?: number;
  className?: string;
  height?: string;
}

const LoadingGrid = ({ rows = 3, className = 'space-y-2', height = 'h-20' }: Props) => (
  <div className={className}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className={`${height} w-full`} />
    ))}
  </div>
);

export default LoadingGrid;

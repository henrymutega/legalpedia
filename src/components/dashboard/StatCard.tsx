import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'slate';
  hint?: string;
  className?: string;
}

const TONES: Record<NonNullable<Props['tone']>, string> = {
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  rose: 'bg-rose-100 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
};

const StatCard = ({ label, value, icon: Icon, tone = 'blue', hint, className }: Props) => (
  <div className={cn('bg-card border border-border rounded-lg p-5 transition-shadow hover:shadow-soft', className)}>
    <div className="flex items-center gap-3">
      <div className={cn('p-2.5 rounded-lg shrink-0', TONES[tone])}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  </div>
);

export default StatCard;

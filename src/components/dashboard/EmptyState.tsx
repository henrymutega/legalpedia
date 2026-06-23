import { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon = Inbox, title, description, action }: Props) => (
  <div className="text-center py-12 px-4 bg-card border border-dashed border-border rounded-lg">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground mb-3">
      <Icon size={22} />
    </div>
    <p className="font-medium text-foreground">{title}</p>
    {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-4 inline-flex">{action}</div>}
  </div>
);

export default EmptyState;

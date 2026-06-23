import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, User, Calendar } from 'lucide-react';
import { TaskRow } from '@/hooks/useTasks';
import {
  STATUS_BADGE,
  STATUS_LABEL,
  PRIORITY_BADGE,
  CATEGORY_LABEL,
  labelize,
} from '@/lib/taskConstants';

interface Props {
  task: TaskRow;
  assigneeName?: string | null;
  showAssignee?: boolean;
}

const TaskCard = ({ task, assigneeName, showAssignee = true }: Props) => {
  const overdue =
    task.due_date &&
    new Date(task.due_date).getTime() < Date.now() &&
    task.status !== 'completed';
  return (
    <Link
      to={`/dashboard/tasks/${task.id}`}
      className="block bg-card border border-border rounded-lg p-4 hover:border-gold transition-colors hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{task.title}</h3>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGE[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
      )}
      <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
        <span className={`px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE[task.status]}`}>
          {STATUS_LABEL[task.status]}
        </span>
        <span className="text-muted-foreground/80">
          · {CATEGORY_LABEL[task.category] || labelize(task.category)}
        </span>
        {showAssignee && (
          <span className="inline-flex items-center gap-1 ml-auto">
            <User size={12} />
            {task.assigned_to ? (assigneeName || 'Assigned') : 'Unassigned'}
          </span>
        )}
      </div>
      {(task.due_date || overdue) && (
        <div
          className={`mt-2 inline-flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}
        >
          {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
          Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
        </div>
      )}
      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
        <Clock size={11} /> {new Date(task.updated_at).toLocaleString()}
      </div>
    </Link>
  );
};

export default TaskCard;

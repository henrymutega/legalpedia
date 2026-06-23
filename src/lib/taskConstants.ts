export const TASK_STATUSES = ['open', 'assigned', 'in_progress', 'under_review', 'completed'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export const TASK_CATEGORIES = [
  'corporate',
  'family',
  'real_estate',
  'employment',
  'litigation',
  'ip',
] as const;

export const STATUS_LABEL: Record<TaskStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  completed: 'Completed',
};

export const STATUS_BADGE: Record<TaskStatus, string> = {
  open: 'bg-slate-100 text-slate-700 border-slate-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  under_review: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-sky-100 text-sky-700 border-sky-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export const CATEGORY_LABEL: Record<string, string> = {
  corporate: 'Corporate Law',
  family: 'Family Law',
  real_estate: 'Real Estate',
  employment: 'Employment',
  litigation: 'Litigation',
  ip: 'Intellectual Property',
};

export const labelize = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

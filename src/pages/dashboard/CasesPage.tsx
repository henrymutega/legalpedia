import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useStaffCases, CASE_STATUSES, STATUS_TONE } from '@/hooks/useStaffCases';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingGrid from '@/components/dashboard/LoadingGrid';
import { TASK_CATEGORIES, CATEGORY_LABEL } from '@/lib/taskConstants';
import { Briefcase, Plus, Search } from 'lucide-react';

const CasesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isStaff } = useUserRole();
  const { cases, loading } = useStaffCases();
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const nameOf = (id: string | null) => {
    if (!id) return String(t('dashboard.unassigned', 'Unassigned'));
    const m = staff.find(s => s.user_id === id);
    return m?.display_name || m?.email || String(t('roles.staff'));
  };

  const visible = useMemo(() => {
    return cases
      .filter(c => isStaff || c.client_id === user?.id)
      .filter(c => !status || c.status === status)
      .filter(c => !category || c.category === category)
      .filter(c => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return c.title.toLowerCase().includes(s) || (c.description?.toLowerCase().includes(s) ?? false);
      });
  }, [cases, status, category, q, isStaff, user]);

  return (
    <DashboardLayout
      title={String(t('cases.cases', 'Cases'))}
      subtitle={String(t('dashboard.operations_subtitle', 'Real-time view of cases'))}
      actions={
        <Link to="/dashboard/new" className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors text-sm">
          <Plus size={16} /> {String(t('dashboard.new_case', 'New Case'))}
        </Link>
      }
    >
      <div className="bg-card border border-border rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={String(t('dashboard.search_cases'))}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="">{String(t('dashboard.all_statuses', 'All statuses'))}</option>
          {CASE_STATUSES.map(s => <option key={s} value={s}>{String(t(`case_status.${s}`, s))}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-md text-sm">
          <option value="">{String(t('dashboard.all_categories', 'All categories'))}</option>
          {TASK_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingGrid rows={5} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={String(t('dashboard.no_cases', 'No cases yet.'))}
          description={String(t('dashboard.upload_document_desc', 'Start a new legal case submission'))}
          action={
            <Link to="/dashboard/new" className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark text-sm">
              <Plus size={16} /> {String(t('dashboard.new_case', 'New Case'))}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(c => (
            <Link key={c.id} to={`/dashboard/cases/${c.id}`} className="block bg-card border border-border rounded-lg p-4 hover:border-gold transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground line-clamp-2">{c.title}</h3>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_TONE[c.status] || 'bg-muted'}`}>
                  {String(t(`case_status.${c.status}`, c.status))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {String(t(`category.${c.category}`, c.category))} · {new Date(c.created_at).toLocaleDateString()}
              </p>
              {isStaff && (
                <p className="text-[11px] text-muted-foreground/80 mt-2 truncate">
                  {String(t('dashboard.lawyer', 'Lawyer'))}: {nameOf(c.assigned_lawyer_id)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CasesPage;

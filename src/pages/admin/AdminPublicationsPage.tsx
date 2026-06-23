import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import {
  Plus, Pencil, Trash2, Eye, ExternalLink, Search, Loader2, FileText, Newspaper,
  CheckCircle2, Circle, Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLegalDocuments, useLegalCategories } from '@/hooks/cms/useLegalDocs';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-700',
    draft: 'bg-muted text-muted-foreground',
    unpublished: 'bg-amber-500/10 text-amber-700',
  };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${map[status] || map.draft}`}>{status}</span>;
};

const TypeBadge = ({ type }: { type: string }) => {
  const isNews = type === 'news';
  const Icon = isNews ? Newspaper : FileText;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium ${isNews ? 'text-rose-600' : 'text-gold'}`}>
      <Icon size={11} /> {isNews ? 'News' : 'Legal Doc'}
    </span>
  );
};

const AdminPublicationsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as any) || 'all';
  const [type, setType] = useState<'all' | 'news' | 'legal_document'>(
    ['all', 'news', 'legal_document'].includes(initialType) ? initialType : 'all',
  );
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'unpublished'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (type === 'all') next.delete('type'); else next.set('type', type);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const { data: categories = [] } = useLegalCategories();
  const { data: items = [], isLoading } = useLegalDocuments({
    type: type === 'all' ? undefined : type,
    search,
    publishedOnly: false,
  });

  const filtered = useMemo(
    () => (status === 'all' ? items : items.filter((d: any) => d.status === status)),
    [items, status],
  );
  const total = filtered.length;
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const catById = useMemo(() => Object.fromEntries(categories.map((c: any) => [c.id, c])), [categories]);

  const togglePublish = async (d: any) => {
    const newStatus = d.status === 'published' ? 'unpublished' : 'published';
    const { error } = await supabase.from('legal_documents').update({ status: newStatus } as any).eq('id', d.id);
    if (error) return toast.error(error.message);
    toast.success(newStatus === 'published' ? 'Published live' : 'Moved to unpublished');
    qc.invalidateQueries({ queryKey: ['legal_documents'] });
  };

  const remove = async (d: any) => {
    if (!confirm(`Delete "${d.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('legal_documents').delete().eq('id', d.id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    qc.invalidateQueries({ queryKey: ['legal_documents'] });
  };

  const previewUrl = (d: any) =>
    d.type === 'news' ? `/news-research/${d.slug}` : `/legal-documents/${d.id}`;

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Publications</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage all news, research, and legal documents from one place.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/legal-categories" className="inline-flex items-center gap-2 px-3 py-2 border border-border text-sm rounded-md hover:bg-muted transition-colors">Categories</Link>
          <button
            onClick={() => navigate('/admin/publications/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-sm font-semibold rounded-md hover:bg-gold-dark transition-colors"
          >
            <Plus size={16} /> New Publication
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg p-3 mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search title…"
            className="pl-9 h-9"
          />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v as any); setPage(0); }}>
          <SelectTrigger className="w-full md:w-44 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="news">News & Research</SelectItem>
            <SelectItem value="legal_document">Legal Documents</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(0); }}>
          <SelectTrigger className="w-full md:w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Price</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Downloads</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((d: any) => {
                  const cat = catById[d.category_id];
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {d.featured && <Star size={12} className="text-gold fill-gold shrink-0" />}
                          <button onClick={() => navigate(`/admin/publications/${d.id}`)} className="font-medium text-foreground hover:text-gold text-left">
                            {d.title || <span className="italic text-muted-foreground">Untitled</span>}
                          </button>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-xs">/{d.slug}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><TypeBadge type={d.type} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{cat?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {d.type === 'news' ? '—' : (d.is_free || d.price_cents === 0 ? 'Free' : `${(d.price_cents / 100).toFixed(2)} ${d.currency?.toUpperCase()}`)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{d.download_count || 0}</td>
                      <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">{new Date(d.updated_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => togglePublish(d)} title={d.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-muted-foreground hover:text-emerald-600 transition-colors">
                            {d.status === 'published' ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                          </button>
                          <a href={previewUrl(d)} target="_blank" rel="noopener noreferrer" title="Preview" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><ExternalLink size={15} /></a>
                          <button onClick={() => navigate(`/admin/publications/${d.id}`)} title="Edit" className="p-1.5 text-muted-foreground hover:text-gold transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => remove(d)} title="Delete" className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No publications match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-border rounded disabled:opacity-40">Prev</button>
              <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-border rounded disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPublicationsPage;

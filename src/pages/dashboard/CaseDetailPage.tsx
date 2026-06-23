import { useEffect, useMemo, useRef, useState, DragEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useStaffDirectory } from '@/hooks/useStaffDirectory';
import Layout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { downloadFile as downloadFileToDevice } from '@/lib/download-file';
import {
  ArrowLeft, Download, Paperclip, Send, MessageSquare, FileText, FileSignature,
  FileCheck2, RefreshCw, X, Search, Hand, UserCog, Menu, Info, Plus, Upload,
} from 'lucide-react';

const STATUSES = ['uploaded', 'under_review', 'reviewed', 'completed'];
const KINDS = ['original', 'reviewed', 'signed'] as const;

const STATUS_TONE: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700 border-blue-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ROLE_TONE: Record<string, string> = {
  client: 'bg-slate-100 text-slate-700 border-slate-200',
  lawyer: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  admin: 'bg-rose-100 text-rose-700 border-rose-200',
  super_admin: 'bg-rose-200 text-rose-800 border-rose-300',
};

type Profile = { user_id: string; display_name: string | null; email: string | null; avatar_url: string | null };
type RoleByUser = Record<string, 'client' | 'lawyer' | 'admin' | 'super_admin'>;

interface FileItem { kind: 'file'; id: string; case_id: string; uploaded_by: string; filename: string; storage_path: string; size_bytes: number | null; mime_type: string | null; file_kind: string; created_at: string }
interface MsgItem { kind: 'message'; id: string; case_id: string; author_id: string; content: string; created_at: string }
type EventItem = FileItem | MsgItem;
interface TimelineGroup { key: string; author_id: string; created_at: string; items: EventItem[] }

const formatBytes = (b: number | null) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const initials = (name?: string | null, email?: string | null) => {
  const s = (name || email || '?').trim();
  const parts = s.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || s[0]?.toUpperCase() || '?';
};

const fileIcon = (k: string) => {
  if (k === 'signed') return <FileSignature size={14} className="text-emerald-600" />;
  if (k === 'reviewed') return <FileCheck2 size={14} className="text-purple-600" />;
  return <FileText size={14} className="text-blue-600" />;
};

const CaseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isStaff, isAdmin, isLawyer, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const { staff } = useStaffDirectory(['lawyer', 'admin', 'super_admin']);

  const [caseData, setCaseData] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [messages, setMessages] = useState<MsgItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rolesByUser, setRolesByUser] = useState<RoleByUser>({});
  const [allCases, setAllCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // composer state
  const [message, setMessage] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadKind, setUploadKind] = useState<typeof KINDS[number]>('reviewed');
  const [posting, setPosting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // sidebar state
  const [caseSearch, setCaseSearch] = useState('');
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const lawyers = staff.filter(s => s.role === 'lawyer');

  const loadProfiles = async (ids: string[]) => {
    const need = ids.filter(i => i && !profiles[i]);
    if (need.length === 0) return;
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, email, avatar_url').in('user_id', need),
      supabase.from('user_roles').select('user_id, role').in('user_id', need),
    ]);
    setProfiles(prev => {
      const next = { ...prev };
      (profs || []).forEach((p: any) => { next[p.user_id] = p; });
      return next;
    });
    setRolesByUser(prev => {
      const next = { ...prev };
      // Pick highest-priority role
      const order = ['super_admin', 'admin', 'lawyer', 'client'];
      const grouped: Record<string, string[]> = {};
      (roles || []).forEach((r: any) => {
        grouped[r.user_id] = grouped[r.user_id] || [];
        grouped[r.user_id].push(r.role);
      });
      need.forEach(uid => {
        const list = grouped[uid] || [];
        const top = order.find(o => list.includes(o)) as any;
        next[uid] = top || 'client';
      });
      return next;
    });
  };

  const load = async () => {
    if (!id) return;
    const [{ data: c }, { data: f }, { data: m }] = await Promise.all([
      supabase.from('cases').select('*').eq('id', id).maybeSingle(),
      supabase.from('case_files').select('*').eq('case_id', id).order('created_at', { ascending: false }),
      supabase.from('case_comments').select('*').eq('case_id', id).order('created_at', { ascending: false }),
    ]);
    setCaseData(c);
    setFiles((f || []).map((x: any) => ({ ...x, kind: 'file' as const, file_kind: x.kind })));
    setMessages((m || []).map((x: any) => ({ ...x, kind: 'message' as const })));
    setLoading(false);

    const ids = new Set<string>();
    if (c?.client_id) ids.add(c.client_id);
    if (c?.assigned_lawyer_id) ids.add(c.assigned_lawyer_id);
    (f || []).forEach((x: any) => x.uploaded_by && ids.add(x.uploaded_by));
    (m || []).forEach((x: any) => x.author_id && ids.add(x.author_id));
    loadProfiles(Array.from(ids));
  };

  const loadAllCases = async () => {
    const { data } = await supabase
      .from('cases').select('id, title, status, category, updated_at, assigned_lawyer_id, client_id')
      .order('updated_at', { ascending: false });
    setAllCases(data || []);
  };

  useEffect(() => {
    if (authLoading || roleLoading || !user || !id) return;
    load();
    loadAllCases();
    const ch = supabase
      .channel(`case-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases', filter: `id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_files', filter: `case_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_comments', filter: `case_id=eq.${id}` }, load)
      .subscribe();
    const ch2 = supabase
      .channel('case-list-side')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, loadAllCases)
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(ch2); };
  }, [user, id, authLoading, roleLoading]);

  // Build a unified timeline: messages + files merged, grouped by author within 90s windows
  const timeline: TimelineGroup[] = useMemo(() => {
    const events: EventItem[] = [
      ...messages,
      ...files,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const groups: TimelineGroup[] = [];
    const WINDOW = 90_000; // 90s
    for (const ev of events) {
      const author = (ev as any).author_id || (ev as any).uploaded_by;
      const t = new Date(ev.created_at).getTime();
      const last = groups[groups.length - 1];
      if (
        last &&
        last.author_id === author &&
        Math.abs(new Date(last.created_at).getTime() - t) <= WINDOW
      ) {
        last.items.push(ev);
      } else {
        groups.push({ key: ev.kind + ev.id, author_id: author, created_at: ev.created_at, items: [ev] });
      }
    }
    return groups;
  }, [messages, files]);

  const filteredCases = useMemo(() => {
    const q = caseSearch.trim().toLowerCase();
    if (!q) return allCases;
    return allCases.filter(c => c.title.toLowerCase().includes(q));
  }, [allCases, caseSearch]);

  const profileFor = (uid?: string | null): Profile | null =>
    (uid && profiles[uid]) ? profiles[uid] : null;

  const roleFor = (uid?: string | null): string => {
    if (!uid) return 'client';
    if (caseData?.client_id === uid && !rolesByUser[uid]) return 'client';
    return rolesByUser[uid] || 'client';
  };

  const labelOf = (uid?: string | null) => {
    if (!uid) return t('cases.unknown');
    if (uid === user?.id) return t('cases.you');
    const p = profileFor(uid);
    return p?.display_name || p?.email || t('cases.user');
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const downloadFile = async (path: string, filename: string, id?: string) => {
    setDownloadingId(id || path);
    try {
      await downloadFileToDevice(path, filename, 'case-files');
    } catch {
      toast({ title: t('cases.download_failed'), variant: 'destructive' });
    } finally {
      setDownloadingId(null);
    }
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    setPendingFiles(prev => [...prev, ...Array.from(list)]);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    onPickFiles(e.dataTransfer.files);
  };

  const removePending = (idx: number) =>
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSend = async () => {
    const text = message.trim();
    if (!caseData) return;
    if (!text && pendingFiles.length === 0) return;
    setPosting(true);
    try {
      // Upload files first
      const kind = isStaff ? uploadKind : 'original';
      for (const file of pendingFiles) {
        const path = `${caseData.id}/${kind}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('case-files').upload(path, file);
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from('case_files').insert({
          case_id: caseData.id, uploaded_by: user!.id, kind,
          filename: file.name, storage_path: path,
          size_bytes: file.size, mime_type: file.type,
        });
        if (insErr) throw insErr;
      }
      if (text) {
        const { error: cErr } = await supabase.from('case_comments').insert({
          case_id: caseData.id, author_id: user!.id, content: text,
        });
        if (cErr) throw cErr;
      }
      setMessage('');
      setPendingFiles([]);
    } catch (e: any) {
      toast({ title: t('cases.send_failed'), description: e.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!caseData) return;
    const { error } = await supabase.from('cases').update({ status }).eq('id', caseData.id);
    if (error) toast({ title: t('dashboard.update_failed'), description: error.message, variant: 'destructive' });
    else toast({ title: t('dashboard.status_updated') });
  };

  const assignLawyer = async (lawyerId: string) => {
    if (!caseData) return;
    const payload: any = lawyerId
      ? { assigned_lawyer_id: lawyerId, assigned_at: new Date().toISOString() }
      : { assigned_lawyer_id: null, assigned_at: null };
    const { error } = await supabase.from('cases').update(payload).eq('id', caseData.id);
    if (error) toast({ title: t('dashboard.assign_failed'), description: error.message, variant: 'destructive' });
    else toast({ title: lawyerId ? t('dashboard.lawyer_assigned') : t('dashboard.lawyer_unassigned') });
  };

  const claim = async () => {
    if (!user || !caseData) return;
    const { data, error } = await supabase.from('cases')
      .update({ assigned_lawyer_id: user.id, assigned_at: new Date().toISOString(), status: 'under_review' })
      .eq('id', caseData.id).is('assigned_lawyer_id', null).select().maybeSingle();
    if (error) toast({ title: t('dashboard.could_not_claim'), description: error.message, variant: 'destructive' });
    else if (!data) toast({ title: t('dashboard.already_claimed'), variant: 'destructive' });
    else toast({ title: t('dashboard.case_claimed') });
  };

  const release = async () => {
    if (!caseData) return;
    await supabase.from('cases').update({ assigned_lawyer_id: null, assigned_at: null }).eq('id', caseData.id);
    toast({ title: t('dashboard.released') });
  };

  if (loading || !caseData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 text-muted-foreground">
          {loading ? t('cases.loading_case') : t('cases.case_not_found')}
        </div>
      </Layout>
    );
  }

  // ============ Sidebar pieces ============
  const LeftSidebar = (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-sm font-semibold">{t('cases.cases')}</h2>
          <Link to="/dashboard/new" className="text-gold hover:text-gold-dark"><Plus size={16} /></Link>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={caseSearch} onChange={e => setCaseSearch(e.target.value)}
            placeholder={t('cases.search_cases')} className="pl-7 h-8 text-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredCases.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center px-4 py-6">{t('cases.no_cases_found')}</p>
        ) : filteredCases.map(c => {
          const active = c.id === id;
          const recent = (Date.now() - new Date(c.updated_at).getTime()) < 1000 * 60 * 60 * 24;
          return (
            <button
              key={c.id}
              onClick={() => { navigate(`/dashboard/cases/${c.id}`); setShowLeft(false); }}
              className={`w-full text-left px-3 py-2.5 border-b border-border/60 hover:bg-muted/50 transition-colors ${active ? 'bg-muted/70' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
                {recent && !active && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_TONE[c.status] || 'bg-muted'}`}>
                  {String(t(`case_status.${c.status}`, { defaultValue: c.status.replace('_', ' ') }))}
                </span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );

  const RightSidebar = (
    <aside className="w-80 shrink-0 border-l border-border bg-card h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2">
          <Info size={14} /> {t('cases.case_details')}
        </h2>
        <p className="font-semibold text-foreground text-base leading-snug mb-1">{caseData.title}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {String(t(`category.${caseData.category}`, { defaultValue: caseData.category.replace('_', ' ') }))} · {new Date(caseData.created_at).toLocaleDateString()}
        </p>
        {caseData.description && (
          <p className="text-xs text-foreground/80 mt-3 whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
        )}
      </div>

      <div className="p-4 border-b border-border space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{t('cases.status')}</p>
          {isStaff ? (
            <select value={caseData.status} onChange={e => updateStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-sm capitalize">
              {STATUSES.map(s => <option key={s} value={s}>{String(t(`case_status.${s}`, { defaultValue: s.replace('_', ' ') }))}</option>)}
            </select>
          ) : (
            <Badge variant="outline" className={`capitalize ${STATUS_TONE[caseData.status] || ''}`}>
              {String(t(`case_status.${caseData.status}`, { defaultValue: caseData.status.replace('_', ' ') }))}
            </Badge>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{t('dashboard.client')}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profileFor(caseData.client_id)?.avatar_url || ''} />
              <AvatarFallback className="text-[10px]">
                {initials(profileFor(caseData.client_id)?.display_name, profileFor(caseData.client_id)?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{labelOf(caseData.client_id)}</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{t('cases.assigned_lawyer')}</p>
          {isAdmin ? (
            <select
              value={caseData.assigned_lawyer_id || ''}
              onChange={e => assignLawyer(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-sm"
            >
              <option value="">{t('cases.unassigned_option')}</option>
              {lawyers.map(l => (
                <option key={l.user_id} value={l.user_id}>
                  {l.display_name || l.email || l.user_id.slice(0, 8)}
                </option>
              ))}
            </select>
          ) : caseData.assigned_lawyer_id ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={profileFor(caseData.assigned_lawyer_id)?.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">
                  {initials(profileFor(caseData.assigned_lawyer_id)?.display_name, profileFor(caseData.assigned_lawyer_id)?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{labelOf(caseData.assigned_lawyer_id)}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t('cases.no_assigned_lawyer')}</p>
          )}
        </div>
      </div>

      {isStaff && (
        <div className="p-4 border-b border-border">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{t('cases.quick_actions')}</p>
          <div className="flex flex-col gap-2">
            {isLawyer && !caseData.assigned_lawyer_id && (
              <button onClick={claim}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark text-sm">
                <Hand size={14} /> {t('dashboard.claim_case')}
              </button>
            )}
            {isLawyer && caseData.assigned_lawyer_id === user?.id && (
              <button onClick={release}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted text-sm">
                {t('dashboard.release')}
              </button>
            )}
            {isAdmin && caseData.assigned_lawyer_id && (
              <button onClick={() => assignLawyer('')}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted text-sm">
                <UserCog size={14} /> {t('dashboard.unassign')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">{t('cases.activity_summary')}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Card className="p-3"><p className="text-xs text-muted-foreground">{t('dashboard.messages')}</p><p className="font-semibold">{messages.length}</p></Card>
          <Card className="p-3"><p className="text-xs text-muted-foreground">{t('dashboard.files')}</p><p className="font-semibold">{files.length}</p></Card>
        </div>
      </div>
    </aside>
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* Mobile drawer left */}
        {showLeft && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeft(false)} />
            <div className="absolute left-0 top-0 h-full">{LeftSidebar}</div>
          </div>
        )}
        <div className="hidden lg:block">{LeftSidebar}</div>

        {/* Center */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowLeft(true)} className="lg:hidden p-1.5 hover:bg-muted rounded">
              <Menu size={18} />
            </button>
            <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-base sm:text-lg font-semibold text-foreground line-clamp-1">{caseData.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{caseData.category.replace('_', ' ')}</span>
                <span>·</span>
                <Badge variant="outline" className={`capitalize text-[10px] ${STATUS_TONE[caseData.status] || ''}`}>
                  {caseData.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <button onClick={() => setShowRight(true)} className="lg:hidden p-1.5 hover:bg-muted rounded">
              <Info size={18} />
            </button>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
            {timeline.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="mx-auto text-muted-foreground/60 mb-3" size={40} />
                <p className="text-sm text-muted-foreground">
                  {t('cases.no_activity_long')}
                </p>
              </div>
            ) : timeline.map(group => {
              const author = group.author_id;
              const p = profileFor(author);
              const r = roleFor(author);
              const isMine = author === user?.id;
              const msgs = group.items.filter(i => i.kind === 'message') as MsgItem[];
              const fls = group.items.filter(i => i.kind === 'file') as FileItem[];
              const hasReviewed = fls.some(f => f.file_kind === 'reviewed');
              const hasSigned = fls.some(f => f.file_kind === 'signed');
              return (
                <Card key={group.key} className={`p-4 transition-shadow hover:shadow-md ${isMine ? 'border-gold/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={p?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">{initials(p?.display_name, p?.email)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-foreground">{labelOf(author)}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${ROLE_TONE[r] || ''}`}>
                          {r.replace('_', ' ')}
                        </Badge>
                        {hasSigned && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">✍️ Signed</Badge>}
                        {hasReviewed && !hasSigned && <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">📝 Reviewed</Badge>}
                        <span className="text-[11px] text-muted-foreground ml-auto">
                          {new Date(group.created_at).toLocaleString()}
                        </span>
                      </div>
                      {msgs.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {msgs.map(m => (
                            <p key={m.id} className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{m.content}</p>
                          ))}
                        </div>
                      )}
                      {fls.length > 0 && (
                        <div className="space-y-1.5">
                          {fls.map(f => (
                            <div key={f.id} className="flex items-center justify-between gap-3 p-2.5 bg-muted/40 rounded-md border border-border/60 hover:border-gold/50 transition-colors">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {fileIcon(f.file_kind)}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{f.filename}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    <span className="capitalize">{f.file_kind}</span>
                                    {f.size_bytes ? ` · ${formatBytes(f.size_bytes)}` : ''}
                                    {f.mime_type ? ` · ${f.mime_type.split('/')[1] || f.mime_type}` : ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadFile(f.storage_path, f.filename, f.id)}
                                disabled={downloadingId === f.id}
                                className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-dark shrink-0 disabled:opacity-50">
                                <Download size={13} />
                                {downloadingId === f.id ? t('cases.downloading', 'Downloading...') : 'Download'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Composer */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-t border-border bg-card p-3 sm:p-4 ${dragOver ? 'ring-2 ring-gold ring-inset' : ''}`}
          >
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="inline-flex items-center gap-2 bg-muted px-2.5 py-1 rounded-full text-xs">
                    <Paperclip size={12} />
                    <span className="max-w-[180px] truncate">{f.name}</span>
                    <span className="text-muted-foreground">{formatBytes(f.size)}</span>
                    <button onClick={() => removePending(i)} className="text-muted-foreground hover:text-foreground">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('cases.composer_placeholder')}
              className="min-h-[60px] resize-none mb-2"
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSend(); }
              }}
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => onPickFiles(e.target.files)} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs hover:bg-muted">
                  <Paperclip size={13} /> {t('cases.attach')}
                </button>
                {isStaff && pendingFiles.length > 0 && (
                  <select value={uploadKind} onChange={e => setUploadKind(e.target.value as any)}
                    className="px-2 py-1.5 bg-background border border-border rounded-md text-xs">
                    {KINDS.map(k => <option key={k} value={k}>{String(t(`file_kind.${k}`, { defaultValue: k }))}</option>)}
                  </select>
                )}
                {dragOver && <span className="text-xs text-gold inline-flex items-center gap-1"><Upload size={12} /> {t('cases.drop_to_attach')}</span>}
              </div>
              <button onClick={handleSend}
                disabled={posting || (!message.trim() && pendingFiles.length === 0)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50 text-sm">
                {posting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {t('cases.send')}
              </button>
            </div>
          </div>
        </main>

        {/* Mobile drawer right */}
        {showRight && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowRight(false)} />
            <div className="absolute right-0 top-0 h-full">{RightSidebar}</div>
          </div>
        )}
        <div className="hidden lg:block">{RightSidebar}</div>
      </div>
    </Layout>
  );
};

export default CaseDetailPage;

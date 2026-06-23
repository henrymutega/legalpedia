import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface Row {
  id: string;
  content: string;
  created_at: string;
  case_id: string;
  case_title?: string | null;
  author_name?: string | null;
}

const MessagesPage = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('case_comments')
        .select('id, content, created_at, case_id, author_id')
        .order('created_at', { ascending: false })
        .limit(100);
      const base = (data || []) as any[];
      const caseIds = Array.from(new Set(base.map(r => r.case_id).filter(Boolean)));
      const authorIds = Array.from(new Set(base.map(r => r.author_id).filter(Boolean)));
      const [casesRes, profsRes] = await Promise.all([
        caseIds.length ? supabase.from('cases').select('id, title').in('id', caseIds) : Promise.resolve({ data: [] as any[] }),
        authorIds.length ? supabase.from('profiles').select('user_id, display_name, email').in('user_id', authorIds) : Promise.resolve({ data: [] as any[] }),
      ]);
      const titleById = Object.fromEntries(((casesRes as any).data || []).map((c: any) => [c.id, c.title]));
      const nameById = Object.fromEntries(((profsRes as any).data || []).map((p: any) => [p.user_id, p.display_name || p.email || String(t('messages_page.user', 'User'))]));
      setRows(base.map((r: any) => ({
        id: r.id,
        content: r.content,
        created_at: r.created_at,
        case_id: r.case_id,
        case_title: titleById[r.case_id] ?? null,
        author_name: nameById[r.author_id] ?? null,
      })));
      setLoading(false);
    })();
  }, []);



  return (
    <DashboardLayout title={String(t('messages_page.title', 'Messages'))} subtitle={String(t('messages_page.subtitle', 'Recent conversations across your cases.'))}>
      {loading ? (
        <p className="text-muted-foreground text-sm">{String(t('common.loading', 'Loading…'))}</p>
      ) : rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">{String(t('messages_page.empty', 'No messages yet.'))}</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {rows.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{r.content}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {r.author_name && <span>{r.author_name} · </span>}
                    <Link to={`/dashboard/cases/${r.case_id}`} className="hover:underline">
                      {r.case_title || String(t('messages_page.case', 'Case'))}
                    </Link>
                    {' · '}{new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MessagesPage;

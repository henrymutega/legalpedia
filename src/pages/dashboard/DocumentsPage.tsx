import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { downloadFile } from '@/lib/download-file';
import { useToast } from '@/hooks/use-toast';

interface Row {
  id: string;
  filename: string;
  kind: string;
  created_at: string;
  storage_path: string;
  case_id: string;
  case_title?: string | null;
}

const DocumentsPage = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('case_files')
        .select('id, filename, kind, created_at, storage_path, case_id')
        .order('created_at', { ascending: false })
        .limit(200);
      const base = (data || []) as any[];
      const caseIds = Array.from(new Set(base.map(r => r.case_id).filter(Boolean)));
      let titleById: Record<string, string> = {};
      if (caseIds.length) {
        const { data: cs } = await supabase.from('cases').select('id, title').in('id', caseIds);
        titleById = Object.fromEntries((cs || []).map((c: any) => [c.id, c.title]));
      }
      setRows(base.map((r: any) => ({ ...r, case_title: titleById[r.case_id] ?? null })));
      setLoading(false);
    })();
  }, []);


  const handleDownload = async (r: Row) => {
    try {
      const { data, error } = await supabase.storage.from('case-files').createSignedUrl(r.storage_path, 60);
      if (error || !data?.signedUrl) throw error;
      await downloadFile(data.signedUrl, r.filename);
    } catch (e: any) {
      toast({ title: String(t('documents_page.download_failed', 'Download failed')), description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title={String(t('documents_page.title', 'Documents'))} subtitle={String(t('documents_page.subtitle', 'Files attached to your cases.'))}>
      {loading ? (
        <p className="text-muted-foreground text-sm">{String(t('common.loading', 'Loading…'))}</p>
      ) : rows.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">{String(t('documents_page.empty', 'No documents yet.'))}</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {rows.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.filename}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    <Link to={`/dashboard/cases/${r.case_id}`} className="hover:underline">
                      {r.case_title || String(t('documents_page.case', 'Case'))}
                    </Link>
                    {' · '}{new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize hidden sm:inline-flex">{r.kind}</Badge>
                <Button size="sm" variant="outline" onClick={() => handleDownload(r)}>
                  <Download className="h-4 w-4 mr-1.5" /> {String(t('documents_page.download', 'Download'))}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DocumentsPage;

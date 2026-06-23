import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Row {
  id: string;
  user_id: string;
  document_id: string;
  status: string;
  confirmation_code: string | null;
  amount_cents: number;
  currency: string;
  email: string | null;
  created_at: string;
  doc_title?: string | null;
}

const formatPrice = (cents: number, currency: string) => {
  if (!cents) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};

const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' =>
  s === 'paid' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

const AdminDocumentPaymentsPage = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRows = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('legal_doc_purchases')
      .select('id, user_id, document_id, status, confirmation_code, amount_cents, currency, email, created_at')
      .order('created_at', { ascending: false });
    const base = (data || []) as any[];
    const docIds = Array.from(new Set(base.map((r) => r.document_id).filter(Boolean)));
    let titleById: Record<string, string> = {};
    if (docIds.length) {
      const { data: docs } = await supabase.from('legal_documents').select('id, title, title_en').in('id', docIds);
      titleById = Object.fromEntries((docs || []).map((d: any) => [d.id, d.title_en || d.title]));
    }
    setRows(base.map((r) => ({ ...r, doc_title: titleById[r.document_id] ?? null })));
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const updateStatus = async (row: Row, status: 'paid' | 'rejected') => {
    setBusyId(row.id);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('legal_doc_purchases')
      .update({ status, reviewed_by: userRes?.user?.id ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', row.id);
    setBusyId(null);
    if (error) {
      toast({ title: t('admin.payments.update_failed'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: status === 'paid' ? t('admin.payments.authorized') : t('admin.payments.declined') });
    fetchRows();
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-1">{t('admin.payments.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t('admin.payments.subtitle')}</p>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.payments.document')}</TableHead>
              <TableHead>{t('admin.payments.customer')}</TableHead>
              <TableHead>{t('admin.payments.confirmation_code')}</TableHead>
              <TableHead>{t('admin.payments.amount')}</TableHead>
              <TableHead>{t('admin.common.status')}</TableHead>
              <TableHead>{t('admin.common.date')}</TableHead>
              <TableHead className="text-right">{t('admin.payments.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="mx-auto animate-spin text-muted-foreground" /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('admin.payments.none')}</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{r.doc_title || r.document_id}</TableCell>
                <TableCell className="text-sm">{r.email || '—'}</TableCell>
                <TableCell className="font-mono text-sm">{r.confirmation_code || '—'}</TableCell>
                <TableCell className="text-sm">{formatPrice(r.amount_cents, r.currency)}</TableCell>
                <TableCell><Badge variant={statusVariant(r.status)} className="capitalize">{t(`legal_docs.status.${r.status}`, r.status)}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    {r.status !== 'paid' && (
                      <Button size="sm" disabled={busyId === r.id} onClick={() => updateStatus(r, 'paid')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} className="mr-1" /> {t('admin.payments.authorize')}</>}
                      </Button>
                    )}
                    {r.status === 'pending' && (
                      <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => updateStatus(r, 'rejected')}>
                        <X size={14} className="mr-1" /> {t('admin.payments.decline')}
                      </Button>
                    )}
                    {r.status === 'rejected' && (
                      <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => updateStatus(r, 'paid')}>
                        <RotateCcw size={14} className="mr-1" /> {t('admin.payments.authorize')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminDocumentPaymentsPage;

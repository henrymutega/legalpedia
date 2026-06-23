import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminShell from '@/components/admin/AdminShell';
import LocaleTabs, { Locale } from '@/components/admin/LocaleTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Faq = {
  id: string;
  question: string;
  question_en: string | null; question_zh: string | null; question_mn: string | null;
  answer: string;
  answer_en: string | null; answer_zh: string | null; answer_mn: string | null;
  category: string;
  display_order: number;
  published: boolean;
};

const emptyFaq: Partial<Faq> = {
  question: '', answer: '', category: 'general',
  display_order: 0, published: true,
};

const AdminFaqsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rows, setRows] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Faq>>(emptyFaq);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('faqs')
      .select('*').order('category').order('display_order').order('created_at');
    if (error) toast({ title: t('admin.common.failed_load'), description: error.message, variant: 'destructive' });
    setRows((data as Faq[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...emptyFaq }); setOpen(true); };
  const openEdit = (f: Faq) => { setEditing({ ...f }); setOpen(true); };

  const save = async () => {
    if (!editing.question?.trim() || !editing.answer?.trim()) {
      toast({ title: t('admin.faqs.qa_required'), variant: 'destructive' }); return;
    }
    const payload: any = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from('faqs').update(payload).eq('id', editing.id)
      : await supabase.from('faqs').insert(payload);
    if (error) { toast({ title: t('admin.common.save_failed'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? t('admin.common.updated') : t('admin.common.created') });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm(t('admin.faqs.confirm_delete'))) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) { toast({ title: t('admin.common.delete_failed'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: t('admin.common.deleted') }); load();
  };

  const setField = (k: keyof Faq, v: any) => setEditing(prev => ({ ...prev, [k]: v }));

  return (
    <AdminShell
      subtitle={t('admin.faqs.subtitle')}
      actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> {t('admin.faqs.add')}</Button>}
    >
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">{t('admin.common.loading')}</div>
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">{t('admin.faqs.none')}</p>
              <Button onClick={openNew} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1.5" /> {t('admin.faqs.add_first')}</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.faqs.question')}</TableHead>
                  <TableHead className="w-32 hidden md:table-cell">{t('admin.common.category')}</TableHead>
                  <TableHead className="w-20">{t('admin.common.order')}</TableHead>
                  <TableHead className="w-24">{t('admin.common.status')}</TableHead>
                  <TableHead className="w-24 text-right">{t('admin.common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="max-w-md">
                      <div className="font-medium truncate">{f.question_en || f.question}</div>
                      <div className="text-xs text-muted-foreground truncate">{f.answer_en || f.answer}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline">{f.category}</Badge></TableCell>
                    <TableCell>{f.display_order}</TableCell>
                    <TableCell>{f.published ? <Badge>{t('admin.common.live')}</Badge> : <Badge variant="outline">{t('admin.common.hidden')}</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? t('admin.faqs.edit') : t('admin.faqs.new')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>{t('admin.common.category')}</Label><Input value={editing.category || ''} onChange={e => setField('category', e.target.value)} placeholder="general" /></div>
              <div><Label>{t('admin.common.display_order')}</Label><Input type="number" value={editing.display_order ?? 0} onChange={e => setField('display_order', parseInt(e.target.value || '0'))} /></div>
              <div className="flex items-end"><div className="flex items-center gap-2"><Switch checked={!!editing.published} onCheckedChange={v => setField('published', v)} /><Label className="cursor-pointer">{t('admin.common.published')}</Label></div></div>
            </div>
            <div><Label>{t('admin.faqs.question')} *</Label><Input value={editing.question || ''} onChange={e => setField('question', e.target.value)} /></div>
            <div><Label>{t('admin.faqs.answer')} *</Label><Textarea rows={3} value={editing.answer || ''} onChange={e => setField('answer', e.target.value)} /></div>

            <LocaleTabs render={(locale: Locale) => (
              <>
                <div><Label>{t('admin.faqs.question_locale', { locale: locale.toUpperCase() })}</Label>
                  <Input value={(editing[`question_${locale}` as keyof Faq] as string) || ''}
                    onChange={e => setField(`question_${locale}` as keyof Faq, e.target.value)} /></div>
                <div><Label>{t('admin.faqs.answer_locale', { locale: locale.toUpperCase() })}</Label>
                  <Textarea rows={5} value={(editing[`answer_${locale}` as keyof Faq] as string) || ''}
                    onChange={e => setField(`answer_${locale}` as keyof Faq, e.target.value)} /></div>
              </>
            )} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('admin.common.cancel')}</Button>
            <Button onClick={save}>{editing.id ? t('admin.common.save_changes') : t('admin.common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default AdminFaqsPage;

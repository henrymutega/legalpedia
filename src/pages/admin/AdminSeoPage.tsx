import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminShell from '@/components/admin/AdminShell';
import LocaleTabs, { Locale } from '@/components/admin/LocaleTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Seo = {
  id: string;
  page_key: string;
  title: string | null;
  title_en: string | null; title_zh: string | null; title_mn: string | null;
  description: string | null;
  description_en: string | null; description_zh: string | null; description_mn: string | null;
  keywords: string | null;
  keywords_en: string | null; keywords_zh: string | null; keywords_mn: string | null;
  og_image: string | null;
  canonical_url: string | null;
};

const empty: Partial<Seo> = { page_key: '', title: '', description: '', keywords: '', og_image: '', canonical_url: '' };
const SEEDS = ['home', 'about', 'services', 'publications', 'contact', 'ai-assistant'];

const AdminSeoPage = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Seo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Seo>>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('seo_settings').select('*').order('page_key');
    if (error) toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    setRows((data as Seo[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = (key?: string) => { setEditing({ ...empty, page_key: key || '' }); setOpen(true); };
  const openEdit = (s: Seo) => { setEditing({ ...s }); setOpen(true); };

  const save = async () => {
    if (!editing.page_key?.trim()) { toast({ title: 'Page key is required', variant: 'destructive' }); return; }
    const payload: any = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from('seo_settings').update(payload).eq('id', editing.id)
      : await supabase.from('seo_settings').insert(payload);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Created' });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete SEO record?')) return;
    const { error } = await supabase.from('seo_settings').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' }); load();
  };

  const setField = (k: keyof Seo, v: any) => setEditing(p => ({ ...p, [k]: v }));
  const existing = new Set(rows.map(r => r.page_key));
  const missing = SEEDS.filter(k => !existing.has(k));

  return (
    <AdminShell
      subtitle="Page titles, descriptions and keywords per locale."
      actions={<Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-1.5" /> New entry</Button>}
    >
      {missing.length > 0 && (
        <Card className="mb-4">
          <CardContent className="py-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Add standard entries:</p>
            <div className="flex flex-wrap gap-2">
              {missing.map(k => <Button key={k} size="sm" variant="outline" onClick={() => openNew(k)}>+ {k}</Button>)}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center"><Search className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground">No SEO entries yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead><TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><code className="text-xs">{s.page_key}</code></TableCell>
                    <TableCell className="max-w-xs truncate">{s.title_en || s.title || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-md truncate text-muted-foreground text-sm">{s.description_en || s.description || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing.id ? `Edit SEO: ${editing.page_key}` : 'New SEO entry'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label>Page key *</Label><Input value={editing.page_key || ''} onChange={e => setField('page_key', e.target.value)} disabled={!!editing.id} /></div>
              <div><Label>Canonical URL</Label><Input value={editing.canonical_url || ''} onChange={e => setField('canonical_url', e.target.value)} placeholder="/about" /></div>
              <div className="md:col-span-2"><Label>OG image URL</Label><Input value={editing.og_image || ''} onChange={e => setField('og_image', e.target.value)} /></div>
            </div>
            <div><Label>Default title</Label><Input value={editing.title || ''} onChange={e => setField('title', e.target.value)} /></div>
            <div><Label>Default description</Label><Textarea rows={2} value={editing.description || ''} onChange={e => setField('description', e.target.value)} /></div>
            <div><Label>Default keywords</Label><Input value={editing.keywords || ''} onChange={e => setField('keywords', e.target.value)} placeholder="comma, separated" /></div>

            <LocaleTabs render={(locale: Locale) => (
              <>
                <div><Label>Title ({locale.toUpperCase()})</Label>
                  <Input value={(editing[`title_${locale}` as keyof Seo] as string) || ''}
                    onChange={e => setField(`title_${locale}` as keyof Seo, e.target.value)} /></div>
                <div><Label>Description ({locale.toUpperCase()})</Label>
                  <Textarea rows={2} value={(editing[`description_${locale}` as keyof Seo] as string) || ''}
                    onChange={e => setField(`description_${locale}` as keyof Seo, e.target.value)} /></div>
                <div><Label>Keywords ({locale.toUpperCase()})</Label>
                  <Input value={(editing[`keywords_${locale}` as keyof Seo] as string) || ''}
                    onChange={e => setField(`keywords_${locale}` as keyof Seo, e.target.value)} /></div>
              </>
            )} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing.id ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default AdminSeoPage;

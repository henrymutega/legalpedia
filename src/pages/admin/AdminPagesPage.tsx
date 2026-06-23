import { useEffect, useState } from 'react';
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
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SitePage = {
  id: string;
  page_key: string;
  title: string | null;
  title_en: string | null; title_zh: string | null; title_mn: string | null;
  content: any;
  content_en: any; content_zh: any; content_mn: any;
  published: boolean;
};

const SEED_PAGES = ['home', 'about', 'services', 'contact', 'ai-assistant'];
const emptyPage: Partial<SitePage> = {
  page_key: '', title: '', content: {}, content_en: {}, content_zh: {}, content_mn: {}, published: true,
};

const stringify = (v: any) => { try { return JSON.stringify(v || {}, null, 2); } catch { return '{}'; } };

const AdminPagesPage = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<SitePage>>(emptyPage);
  const [contentJson, setContentJson] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_pages').select('*').order('page_key');
    if (error) toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    setRows((data as SitePage[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p: SitePage) => {
    setEditing({ ...p });
    setContentJson({
      base: stringify(p.content),
      en: stringify(p.content_en), zh: stringify(p.content_zh), mn: stringify(p.content_mn),
    });
    setOpen(true);
  };
  const openNew = (key?: string) => {
    setEditing({ ...emptyPage, page_key: key || '' });
    setContentJson({ base: '{}', en: '{}', zh: '{}', mn: '{}' });
    setOpen(true);
  };

  const save = async () => {
    if (!editing.page_key?.trim()) { toast({ title: 'Page key is required', variant: 'destructive' }); return; }
    const parse = (s: string, label: string) => {
      try { return JSON.parse(s || '{}'); }
      catch { throw new Error(`Invalid JSON in ${label}`); }
    };
    let payload: any;
    try {
      payload = {
        ...editing,
        content: parse(contentJson.base, 'base content'),
        content_en: parse(contentJson.en, 'English content'),
        content_zh: parse(contentJson.zh, 'Chinese content'),
        content_mn: parse(contentJson.mn, 'Mongolian content'),
      };
    } catch (e: any) { toast({ title: 'Invalid JSON', description: e.message, variant: 'destructive' }); return; }
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from('site_pages').update(payload).eq('id', editing.id)
      : await supabase.from('site_pages').insert(payload);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Created' });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this page record?')) return;
    const { error } = await supabase.from('site_pages').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' }); load();
  };

  const existingKeys = new Set(rows.map(r => r.page_key));
  const missingSeeds = SEED_PAGES.filter(k => !existingKeys.has(k));

  return (
    <AdminShell
      subtitle="Manage editable copy for each public page."
      actions={<Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-1.5" /> New page</Button>}
    >
      {missingSeeds.length > 0 && (
        <Card className="mb-4">
          <CardContent className="py-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Quick add standard pages:</p>
            <div className="flex flex-wrap gap-2">
              {missingSeeds.map(k => (
                <Button key={k} size="sm" variant="outline" onClick={() => openNew(k)}>+ {k}</Button>
              ))}
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
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">No page records yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(p => (
                  <TableRow key={p.id}>
                    <TableCell><code className="text-xs">{p.page_key}</code></TableCell>
                    <TableCell>{p.title_en || p.title || '—'}</TableCell>
                    <TableCell>{p.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? `Edit page: ${editing.page_key}` : 'New page'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>Page key *</Label><Input value={editing.page_key || ''} onChange={e => setEditing(p => ({ ...p, page_key: e.target.value }))} placeholder="home" disabled={!!editing.id} /></div>
              <div><Label>Base title</Label><Input value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="flex items-end"><div className="flex items-center gap-2"><Switch checked={!!editing.published} onCheckedChange={v => setEditing(p => ({ ...p, published: v }))} /><Label className="cursor-pointer">Published</Label></div></div>
            </div>
            <div><Label>Base content (JSON)</Label>
              <Textarea rows={5} className="font-mono text-xs" value={contentJson.base || ''} onChange={e => setContentJson(c => ({ ...c, base: e.target.value }))} /></div>

            <LocaleTabs render={(locale: Locale) => (
              <>
                <div><Label>Title ({locale.toUpperCase()})</Label>
                  <Input value={(editing[`title_${locale}` as keyof SitePage] as string) || ''}
                    onChange={e => setEditing(p => ({ ...p, [`title_${locale}`]: e.target.value }))} /></div>
                <div><Label>Content ({locale.toUpperCase()}) (JSON)</Label>
                  <Textarea rows={8} className="font-mono text-xs"
                    value={contentJson[locale] || ''}
                    onChange={e => setContentJson(c => ({ ...c, [locale]: e.target.value }))} /></div>
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

export default AdminPagesPage;

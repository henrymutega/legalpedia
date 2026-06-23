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
import { Plus, Pencil, Trash2, Quote, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  role_en: string | null; role_zh: string | null; role_mn: string | null;
  quote: string;
  quote_en: string | null; quote_zh: string | null; quote_mn: string | null;
  rating: number;
  avatar_url: string | null;
  display_order: number;
  published: boolean;
};

const empty: Partial<Testimonial> = {
  name: '', role: '', role_en: '', role_zh: '', role_mn: '',
  quote: '', quote_en: '', quote_zh: '', quote_mn: '',
  rating: 5, avatar_url: '', display_order: 0, published: true,
};

const AdminTestimonialsPage = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Testimonial>>(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('testimonials').select('*').order('display_order');
    if (error) toast({ title: 'Failed to load', description: error.message, variant: 'destructive' });
    setRows((data as Testimonial[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...empty, display_order: rows.length }); setOpen(true); };
  const openEdit = (r: Testimonial) => { setEditing({ ...r }); setOpen(true); };

  const save = async () => {
    if (!editing.name?.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    if (!(editing.quote_en || editing.quote)?.trim()) { toast({ title: 'Quote is required', variant: 'destructive' }); return; }
    const payload: any = {
      name: editing.name,
      role: editing.role_en || editing.role || null,
      role_en: editing.role_en || null, role_zh: editing.role_zh || null, role_mn: editing.role_mn || null,
      quote: editing.quote_en || editing.quote || '',
      quote_en: editing.quote_en || null, quote_zh: editing.quote_zh || null, quote_mn: editing.quote_mn || null,
      rating: Number(editing.rating) || 5,
      avatar_url: editing.avatar_url || null,
      display_order: Number(editing.display_order) || 0,
      published: !!editing.published,
    };
    const { error } = editing.id
      ? await supabase.from('testimonials').update(payload).eq('id', editing.id)
      : await supabase.from('testimonials').insert(payload);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Created' });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' }); load();
  };

  return (
    <AdminShell
      subtitle="Client testimonials shown on the homepage."
      actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> New testimonial</Button>}
    >
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                <Quote className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">No testimonials yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="w-20">Rating</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{r.role_en || r.role || '—'}</TableCell>
                    <TableCell><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{r.rating}</span></TableCell>
                    <TableCell>{r.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing.id ? 'Edit testimonial' : 'New testimonial'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>Name *</Label><Input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating ?? 5} onChange={e => setEditing(p => ({ ...p, rating: Number(e.target.value) }))} /></div>
              <div><Label>Display order</Label><Input type="number" value={editing.display_order ?? 0} onChange={e => setEditing(p => ({ ...p, display_order: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Avatar URL</Label><Input value={editing.avatar_url || ''} onChange={e => setEditing(p => ({ ...p, avatar_url: e.target.value }))} placeholder="Optional" /></div>

            <LocaleTabs render={(locale: Locale) => (
              <>
                <div><Label>Role / title ({locale.toUpperCase()})</Label>
                  <Input value={(editing[`role_${locale}` as keyof Testimonial] as string) || ''}
                    onChange={e => setEditing(p => ({ ...p, [`role_${locale}`]: e.target.value }))} /></div>
                <div><Label>Quote ({locale.toUpperCase()})</Label>
                  <Textarea rows={4} value={(editing[`quote_${locale}` as keyof Testimonial] as string) || ''}
                    onChange={e => setEditing(p => ({ ...p, [`quote_${locale}`]: e.target.value }))} /></div>
              </>
            )} />

            <div className="flex items-center gap-2">
              <Switch checked={!!editing.published} onCheckedChange={v => setEditing(p => ({ ...p, published: v }))} />
              <Label className="cursor-pointer">Published</Label>
            </div>
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

export default AdminTestimonialsPage;

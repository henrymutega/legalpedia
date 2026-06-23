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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Member = {
  id: string;
  name: string;
  role: string | null;
  role_en: string | null; role_zh: string | null; role_mn: string | null;
  specialty: string | null;
  specialty_en: string | null; specialty_zh: string | null; specialty_mn: string | null;
  bio: string | null;
  bio_en: string | null; bio_zh: string | null; bio_mn: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
};

const emptyMember: Partial<Member> = {
  name: '', photo_url: '', email: '', linkedin_url: '',
  featured: false, display_order: 0, published: true,
};

const AdminTeamPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Member>>(emptyMember);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('team_members')
      .select('*').order('display_order', { ascending: true }).order('created_at');
    if (error) toast({ title: t('admin.common.failed_load'), description: error.message, variant: 'destructive' });
    setRows((data as Member[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...emptyMember }); setOpen(true); };
  const openEdit = (m: Member) => { setEditing({ ...m }); setOpen(true); };

  const save = async () => {
    if (!editing.name?.trim()) {
      toast({ title: t('admin.team.name_required'), variant: 'destructive' }); return;
    }
    const payload: any = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from('team_members').update(payload).eq('id', editing.id)
      : await supabase.from('team_members').insert(payload);
    if (error) { toast({ title: t('admin.common.save_failed'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? t('admin.common.updated') : t('admin.common.created') });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm(t('admin.team.confirm_delete'))) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) { toast({ title: t('admin.common.delete_failed'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: t('admin.common.deleted') }); load();
  };

  const setField = (k: keyof Member, v: any) => setEditing(prev => ({ ...prev, [k]: v }));
  const localeField = (locale: Locale, field: 'role' | 'specialty' | 'bio') =>
    `${field}_${locale}` as keyof Member;

  return (
    <AdminShell
      subtitle={t('admin.team.subtitle')}
      actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> {t('admin.team.add')}</Button>}
    >
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">{t('admin.common.loading')}</div>
          ) : rows.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">{t('admin.team.none')}</p>
              <Button onClick={openNew} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1.5" /> {t('admin.team.add_first')}</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.team.member')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.common.role')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('admin.team.specialty')}</TableHead>
                  <TableHead className="w-20">{t('admin.common.order')}</TableHead>
                  <TableHead className="w-24">{t('admin.common.status')}</TableHead>
                  <TableHead className="w-24 text-right">{t('admin.common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {m.photo_url && <AvatarImage src={m.photo_url} alt={m.name} />}
                          <AvatarFallback>{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{m.name}</div>
                          {m.email && <div className="text-xs text-muted-foreground truncate">{m.email}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{m.role_en || m.role || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{m.specialty_en || m.specialty || '—'}</TableCell>
                    <TableCell>{m.display_order}</TableCell>
                    <TableCell>
                      {m.featured && <Badge variant="secondary" className="mr-1">{t('admin.team.featured')}</Badge>}
                      {m.published ? <Badge>{t('admin.common.live')}</Badge> : <Badge variant="outline">{t('admin.common.hidden')}</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing.id ? t('admin.team.edit') : t('admin.team.new')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><Label>{t('admin.common.name')} *</Label><Input value={editing.name || ''} onChange={e => setField('name', e.target.value)} /></div>
              <div><Label>{t('admin.common.email')}</Label><Input type="email" value={editing.email || ''} onChange={e => setField('email', e.target.value)} /></div>
              <div><Label>{t('admin.team.photo_url')}</Label><Input value={editing.photo_url || ''} onChange={e => setField('photo_url', e.target.value)} placeholder="https://…" /></div>
              <div><Label>{t('admin.team.linkedin_url')}</Label><Input value={editing.linkedin_url || ''} onChange={e => setField('linkedin_url', e.target.value)} /></div>
              <div><Label>{t('admin.common.display_order')}</Label><Input type="number" value={editing.display_order ?? 0} onChange={e => setField('display_order', parseInt(e.target.value || '0'))} /></div>
              <div className="flex items-end gap-6">
                <div className="flex items-center gap-2"><Switch checked={!!editing.published} onCheckedChange={v => setField('published', v)} /><Label className="cursor-pointer">{t('admin.common.published')}</Label></div>
                <div className="flex items-center gap-2"><Switch checked={!!editing.featured} onCheckedChange={v => setField('featured', v)} /><Label className="cursor-pointer">{t('admin.team.featured')}</Label></div>
              </div>
            </div>

            <LocaleTabs render={(locale) => (
              <>
                <div><Label>{t('admin.team.role_locale', { locale: locale.toUpperCase() })}</Label>
                  <Input value={(editing[localeField(locale, 'role')] as string) || ''}
                    onChange={e => setField(localeField(locale, 'role'), e.target.value)} /></div>
                <div><Label>{t('admin.team.specialty_locale', { locale: locale.toUpperCase() })}</Label>
                  <Input value={(editing[localeField(locale, 'specialty')] as string) || ''}
                    onChange={e => setField(localeField(locale, 'specialty'), e.target.value)} /></div>
                <div><Label>{t('admin.team.bio_locale', { locale: locale.toUpperCase() })}</Label>
                  <Textarea rows={4} value={(editing[localeField(locale, 'bio')] as string) || ''}
                    onChange={e => setField(localeField(locale, 'bio'), e.target.value)} /></div>
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

export default AdminTeamPage;

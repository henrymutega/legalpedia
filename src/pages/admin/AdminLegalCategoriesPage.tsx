import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Category {
  id: string;
  key: string;
  name: string;
  name_en?: string | null; name_zh?: string | null; name_mn?: string | null;
  icon?: string | null;
  display_order: number;
  published: boolean;
}

const empty: Partial<Category> = { key: '', name: '', icon: 'FileText', display_order: 0, published: true };

const AdminLegalCategoriesPage = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('legal_doc_categories').select('*').order('display_order');
    setItems((data || []) as any);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty, display_order: items.length + 1 }); setShow(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ ...c }); setShow(true); };

  const save = async () => {
    const payload: any = {
      key: form.key, name: form.name,
      name_en: form.name_en || null, name_zh: form.name_zh || null, name_mn: form.name_mn || null,
      icon: form.icon || null, display_order: Number(form.display_order) || 0, published: !!form.published,
    };
    if (editing) await supabase.from('legal_doc_categories').update(payload).eq('id', editing.id);
    else await supabase.from('legal_doc_categories').insert(payload);
    setShow(false); load();
  };

  const del = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('legal_doc_categories').delete().eq('id', id); load(); };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Legal Document Categories</h2>
          <p className="text-xs text-muted-foreground mt-1">Organize the marketplace into practice areas.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-sm font-semibold rounded-md hover:bg-gold-dark transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Key</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Order</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Published</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{c.key}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.display_order}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.published ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{c.published ? 'Live' : 'Draft'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-gold"><Pencil size={16} /></button>
                    <button onClick={() => del(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg shadow-card w-full max-w-lg p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-semibold">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs mb-1">Key</label><Input value={form.key || ''} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div>
              <div><label className="block text-xs mb-1">Icon (lucide name)</label><Input value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="block text-xs mb-1">Name (default)</label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              {(['en', 'zh', 'mn'] as const).map((l) => (
                <div key={l}><label className="block text-xs mb-1">Name ({l.toUpperCase()})</label><Input value={(form as any)[`name_${l}`] || ''} onChange={(e) => setForm({ ...form, [`name_${l}`]: e.target.value } as any)} /></div>
              ))}
              <div><label className="block text-xs mb-1">Order</label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={!!form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><span className="text-sm">Published</span></div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="outline" onClick={() => setShow(false)} className="flex-1">Cancel</Button>
              <Button onClick={save} disabled={!form.name || !form.key} className="flex-1 bg-gold hover:bg-gold-dark text-accent-foreground">Save</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLegalCategoriesPage;

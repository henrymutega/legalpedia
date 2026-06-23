import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import LocaleTabs, { Locale } from '@/components/admin/LocaleTabs';

interface Post {
  id: string;
  title: string;
  title_en: string | null;
  title_zh: string | null;
  title_mn: string | null;
  content: string | null;
  content_en: string | null;
  content_zh: string | null;
  content_mn: string | null;
  published: boolean;
  created_at: string;
}

const emptyForm = {
  title_en: '', title_zh: '', title_mn: '',
  content_en: '', content_zh: '', content_mn: '',
  published: false,
};

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data as any);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title_en: p.title_en || p.title || '',
      title_zh: p.title_zh || '',
      title_mn: p.title_mn || '',
      content_en: p.content_en || p.content || '',
      content_zh: p.content_zh || '',
      content_mn: p.content_mn || '',
      published: p.published,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload: any = {
      title: form.title_en || form.title_zh || form.title_mn,
      title_en: form.title_en || null,
      title_zh: form.title_zh || null,
      title_mn: form.title_mn || null,
      content: form.content_en || form.content_zh || form.content_mn || null,
      content_en: form.content_en || null,
      content_zh: form.content_zh || null,
      content_mn: form.content_mn || null,
      published: form.published,
    };
    if (editing) {
      await supabase.from('posts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('posts').insert(payload);
    }
    setShowModal(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  };

  const inputCls = 'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">Blog / News</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-sm font-semibold rounded-md hover:bg-gold-dark transition-colors">
          <Plus size={16} /> Add Post
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground font-medium">{p.title_en || p.title}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-gold transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors ml-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg shadow-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">{editing ? 'Edit Post' : 'Add Post'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <LocaleTabs
                render={(l: Locale) => {
                  const tKey = `title_${l}` as 'title_en' | 'title_zh' | 'title_mn';
                  const cKey = `content_${l}` as 'content_en' | 'content_zh' | 'content_mn';
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                        <input value={form[tKey]} onChange={e => setForm({ ...form, [tKey]: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Content</label>
                        <textarea value={form[cKey]} onChange={e => setForm({ ...form, [cKey]: e.target.value })} rows={8} className={`${inputCls} resize-none`} />
                      </div>
                    </>
                  );
                }}
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="rounded border-border" />
                <label htmlFor="published" className="text-sm text-foreground">Published</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-border rounded-md text-foreground text-sm hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={!form.title_en && !form.title_zh && !form.title_mn} className="flex-1 py-2 bg-gold text-accent-foreground font-semibold text-sm rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPostsPage;

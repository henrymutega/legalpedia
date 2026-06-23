import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import LocaleTabs, { Locale } from '@/components/admin/LocaleTabs';

interface ProcessStep { title: string; desc: string }

interface Service {
  id: string;
  title: string;
  title_en: string | null;
  title_zh: string | null;
  title_mn: string | null;
  description: string | null;
  description_en: string | null;
  description_zh: string | null;
  description_mn: string | null;
  full_en: string | null;
  full_zh: string | null;
  full_mn: string | null;
  benefits_en: string[] | null;
  benefits_zh: string[] | null;
  benefits_mn: string[] | null;
  detail_intro_en: string | null;
  detail_intro_zh: string | null;
  detail_intro_mn: string | null;
  detail_overview_en: string | null;
  detail_overview_zh: string | null;
  detail_overview_mn: string | null;
  detail_why_en: string | null;
  detail_why_zh: string | null;
  detail_why_mn: string | null;
  detail_included_en: string[] | null;
  detail_included_zh: string[] | null;
  detail_included_mn: string[] | null;
  detail_process_en: ProcessStep[] | null;
  detail_process_zh: ProcessStep[] | null;
  detail_process_mn: ProcessStep[] | null;
  image_url: string | null;
  key: string | null;
  display_order: number | null;
  published: boolean | null;
  created_at: string;
}

const emptyForm = {
  title: '', title_en: '', title_zh: '', title_mn: '',
  description: '', description_en: '', description_zh: '', description_mn: '',
  full_en: '', full_zh: '', full_mn: '',
  benefits_en: '', benefits_zh: '', benefits_mn: '',
  detail_intro_en: '', detail_intro_zh: '', detail_intro_mn: '',
  detail_overview_en: '', detail_overview_zh: '', detail_overview_mn: '',
  detail_why_en: '', detail_why_zh: '', detail_why_mn: '',
  detail_included_en: '', detail_included_zh: '', detail_included_mn: '',
  detail_process_en: '', detail_process_zh: '', detail_process_mn: '',
  image_url: '', key: '', display_order: 0, published: true,
};

const toLines = (arr: string[] | null | undefined) => (arr || []).join('\n');
const fromLines = (s: string): string[] =>
  s.split('\n').map(l => l.trim()).filter(Boolean);

// Process steps are stored as "Title | Description" per line in the editor.
const processToLines = (arr: ProcessStep[] | null | undefined) =>
  (arr || []).map(s => `${s.title || ''} | ${s.desc || ''}`).join('\n');
const processFromLines = (s: string): ProcessStep[] =>
  s.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [title, ...rest] = l.split('|');
    return { title: (title || '').trim(), desc: rest.join('|').trim() };
  });

const AdminServicesPage = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (data) setServices(data as any);
  };

  useEffect(() => { fetchServices(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title || '',
      title_en: s.title_en || '', title_zh: s.title_zh || '', title_mn: s.title_mn || '',
      description: s.description || '',
      description_en: s.description_en || '', description_zh: s.description_zh || '', description_mn: s.description_mn || '',
      full_en: s.full_en || '', full_zh: s.full_zh || '', full_mn: s.full_mn || '',
      benefits_en: toLines(s.benefits_en), benefits_zh: toLines(s.benefits_zh), benefits_mn: toLines(s.benefits_mn),
      detail_intro_en: s.detail_intro_en || '', detail_intro_zh: s.detail_intro_zh || '', detail_intro_mn: s.detail_intro_mn || '',
      detail_overview_en: s.detail_overview_en || '', detail_overview_zh: s.detail_overview_zh || '', detail_overview_mn: s.detail_overview_mn || '',
      detail_why_en: s.detail_why_en || '', detail_why_zh: s.detail_why_zh || '', detail_why_mn: s.detail_why_mn || '',
      detail_included_en: toLines(s.detail_included_en), detail_included_zh: toLines(s.detail_included_zh), detail_included_mn: toLines(s.detail_included_mn),
      detail_process_en: processToLines(s.detail_process_en), detail_process_zh: processToLines(s.detail_process_zh), detail_process_mn: processToLines(s.detail_process_mn),
      image_url: s.image_url || '',
      key: s.key || '', display_order: s.display_order ?? 0, published: s.published ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload: any = {
      title: form.title_en || form.title,
      title_en: form.title_en || null,
      title_zh: form.title_zh || null,
      title_mn: form.title_mn || null,
      description: form.description_en || form.description || null,
      description_en: form.description_en || null,
      description_zh: form.description_zh || null,
      description_mn: form.description_mn || null,
      full_en: form.full_en || null,
      full_zh: form.full_zh || null,
      full_mn: form.full_mn || null,
      benefits_en: fromLines(form.benefits_en),
      benefits_zh: fromLines(form.benefits_zh),
      benefits_mn: fromLines(form.benefits_mn),
      detail_intro_en: form.detail_intro_en || null,
      detail_intro_zh: form.detail_intro_zh || null,
      detail_intro_mn: form.detail_intro_mn || null,
      detail_overview_en: form.detail_overview_en || null,
      detail_overview_zh: form.detail_overview_zh || null,
      detail_overview_mn: form.detail_overview_mn || null,
      detail_why_en: form.detail_why_en || null,
      detail_why_zh: form.detail_why_zh || null,
      detail_why_mn: form.detail_why_mn || null,
      detail_included_en: fromLines(form.detail_included_en),
      detail_included_zh: fromLines(form.detail_included_zh),
      detail_included_mn: fromLines(form.detail_included_mn),
      detail_process_en: processFromLines(form.detail_process_en),
      detail_process_zh: processFromLines(form.detail_process_zh),
      detail_process_mn: processFromLines(form.detail_process_mn),
      image_url: form.image_url || null,
      key: form.key?.trim() || null,
      display_order: Number(form.display_order) || 0,
      published: !!form.published,
    };
    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('services').insert(payload);
    }
    setShowModal(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.services.confirm_delete'))) return;
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  };

  const localizedField = (
    l: Locale,
    field: 'title' | 'description' | 'full' | 'benefits' | 'detail_intro' | 'detail_overview' | 'detail_why' | 'detail_included' | 'detail_process',
    placeholder?: string,
  ) => {
    const key = `${field}_${l}` as keyof typeof form;
    const isTextarea = field !== 'title';
    const common = 'w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50';
    const rows = field === 'description' ? 3 : field === 'detail_process' ? 6 : 5;
    return isTextarea ? (
      <textarea
        rows={rows}
        value={form[key] as string}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className={`${common} resize-none`}
        placeholder={placeholder ?? (field === 'benefits' ? t('admin.services.benefits_hint', 'One benefit per line') : undefined)}
      />
    ) : (
      <input
        value={form[key] as string}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className={common}
      />
    );
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-foreground">{t('admin.services.title')}</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-accent-foreground text-sm font-semibold rounded-md hover:bg-gold-dark transition-colors">
          <Plus size={16} /> {t('admin.services.add')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('admin.common.title')}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t('admin.common.description')}</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t('admin.common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground font-medium">{s.title_en || s.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-xs">{s.description_en || s.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-muted-foreground hover:text-gold transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors ml-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">{t('admin.services.none')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg shadow-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">{editing ? t('admin.services.edit') : t('admin.services.add')}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <LocaleTabs
                render={(l) => (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.common.title')}</label>
                      {localizedField(l, 'title')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.common.description')}</label>
                      {localizedField(l, 'description')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.full_desc', 'Full description')}</label>
                      {localizedField(l, 'full')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.benefits', 'Benefits / sub-services (one per line)')}</label>
                      {localizedField(l, 'benefits')}
                    </div>

                    <div className="pt-2 mt-2 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('admin.services.detail_section', 'Detailed page content')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.detail_intro', 'Intro paragraph')}</label>
                      {localizedField(l, 'detail_intro')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.detail_overview', 'What this service covers')}</label>
                      {localizedField(l, 'detail_overview')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.detail_included', "What's included (one per line)")}</label>
                      {localizedField(l, 'detail_included', t('admin.services.detail_included_hint', 'One item per line'))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.detail_process', 'How we work (one step per line: Title | Description)')}</label>
                      {localizedField(l, 'detail_process', 'Consultation | We listen to your situation...')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.detail_why', 'Why it matters')}</label>
                      {localizedField(l, 'detail_why')}
                    </div>

                  </>
                )}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.image_url')}</label>
                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('admin.services.key_hint')}</label>
                  <input value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} placeholder="corporate" className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('admin.common.display_order')}</label>
                  <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
                {t('admin.services.published_visible')}
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-border rounded-md text-foreground text-sm hover:bg-muted transition-colors">{t('admin.common.cancel')}</button>
                <button onClick={handleSave} disabled={!form.title_en && !form.title_zh && !form.title_mn} className="flex-1 py-2 bg-gold text-accent-foreground font-semibold text-sm rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50">{t('admin.common.save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServicesPage;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import {
  ArrowLeft, Save, Upload, Loader2, Image as ImageIcon, FileText, ExternalLink, Trash2,
  Newspaper, Globe, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useLegalCategories } from '@/hooks/cms/useLegalDocs';
import { toSlug } from '@/lib/slug';
import { toast } from 'sonner';

type Locale = 'en' | 'zh' | 'mn';
const LOCALES: Locale[] = ['en', 'zh', 'mn'];
const LOCALE_LABELS: Record<Locale, string> = { en: 'English', zh: '中文', mn: 'Монгол' };

const emptyForm: any = {
  type: 'legal_document',
  status: 'draft',
  title: '',
  slug: '',
  summary: '',
  summary_en: '', summary_zh: '', summary_mn: '',
  title_en: '', title_zh: '', title_mn: '',
  description: '',
  content_en: null, content_zh: null, content_mn: null,
  category_id: '',
  thumbnail_url: '',
  file_path: '', file_type: '', file_size_bytes: 0,
  is_free: true,
  price_cents: 0,
  currency: 'usd',
  languages: ['en'],
  featured: false,
  trending: false,
  meta_title: '',
  meta_description: '',
  keywords: [] as string[],
};

const AdminPublicationEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { data: categories = [] } = useLegalCategories();

  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from('legal_documents').select('*').eq('id', id!).maybeSingle();
      if (error) { toast.error(error.message); navigate('/admin/publications'); return; }
      if (!data) { toast.error('Not found'); navigate('/admin/publications'); return; }
      setForm({ ...emptyForm, ...data, languages: data.languages || ['en'], keywords: data.keywords || [] });
      setSlugTouched(true);
      setLoading(false);
    })();
  }, [id, isNew, navigate]);

  // Auto-slug from title until user edits it
  useEffect(() => {
    if (!slugTouched && form.title) setForm((f: any) => ({ ...f, slug: toSlug(f.title) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  const update = (patch: any) => setForm((f: any) => ({ ...f, ...patch }));

  const toggleLang = (l: Locale) => {
    const langs = new Set<string>(form.languages || []);
    if (langs.has(l)) langs.delete(l); else langs.add(l);
    update({ languages: Array.from(langs) });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingFile(true);
    try {
      const path = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, '_')}`;
      const { error } = await supabase.storage.from('legal-documents').upload(path, file, { upsert: false });
      if (error) throw error;
      update({ file_path: path, file_type: file.name.split('.').pop()?.toLowerCase() || 'pdf', file_size_bytes: file.size });
      toast.success('File uploaded');
    } catch (e: any) { toast.error('Upload failed: ' + e.message); }
    finally { setUploadingFile(false); }
  };

  const removeFile = () => update({ file_path: '', file_type: '', file_size_bytes: 0 });

  const handleThumb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingThumb(true);
    try {
      const path = `${Date.now()}_${file.name.replace(/[^\w.\-]+/g, '_')}`;
      const { error } = await supabase.storage.from('legal-doc-thumbnails').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('legal-doc-thumbnails').getPublicUrl(path);
      update({ thumbnail_url: data.publicUrl });
    } catch (e: any) { toast.error('Upload failed: ' + e.message); }
    finally { setUploadingThumb(false); }
  };

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (!k) return;
    if (!form.keywords.includes(k)) update({ keywords: [...form.keywords, k] });
    setKeywordInput('');
  };
  const removeKeyword = (k: string) => update({ keywords: form.keywords.filter((x: string) => x !== k) });

  const buildPayload = (status?: string) => ({
    type: form.type,
    status: status || form.status,
    title: form.title,
    slug: form.slug || toSlug(form.title) || `pub-${Date.now()}`,
    summary: form.summary || null,
    summary_en: form.summary_en || null, summary_zh: form.summary_zh || null, summary_mn: form.summary_mn || null,
    title_en: form.title_en || null, title_zh: form.title_zh || null, title_mn: form.title_mn || null,
    description: form.description || null,
    content_en: form.content_en, content_zh: form.content_zh, content_mn: form.content_mn,
    category_id: form.category_id || null,
    thumbnail_url: form.thumbnail_url || null,
    file_path: form.file_path || null,
    file_type: form.file_type || null,
    file_size_bytes: form.file_size_bytes || null,
    is_free: !!form.is_free,
    price_cents: form.is_free ? 0 : Number(form.price_cents) || 0,
    currency: (form.currency || 'usd').toLowerCase(),
    languages: form.languages?.length ? form.languages : ['en'],
    featured: !!form.featured,
    trending: !!form.trending,
    meta_title: form.meta_title || null,
    meta_description: form.meta_description || null,
    keywords: form.keywords || [],
  });

  const save = async (publishStatus?: string) => {
    if (!form.title) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = buildPayload(publishStatus);
      if (isNew) {
        const { data, error } = await supabase.from('legal_documents').insert(payload as any).select().maybeSingle();
        if (error) throw error;
        toast.success(publishStatus === 'published' ? 'Published' : 'Draft saved');
        navigate(`/admin/publications/${data!.id}`, { replace: true });
      } else {
        const { error } = await supabase.from('legal_documents').update(payload as any).eq('id', id!);
        if (error) throw error;
        update({ status: payload.status });
        toast.success(publishStatus === 'published' ? 'Published' : publishStatus === 'unpublished' ? 'Unpublished' : 'Saved');
      }
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = useMemo(() => {
    if (!form.slug) return '';
    return form.type === 'news' ? `/news-research/${form.slug}` : isNew ? '' : `/legal-documents/${id}`;
  }, [form.slug, form.type, id, isNew]);

  if (loading) {
    return <AdminLayout><div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      {/* Sticky save bar */}
      <div className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-background/95 backdrop-blur border-b border-border mb-6 flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/admin/publications')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">{isNew ? 'New publication' : `Editing · ${form.status}`}</div>
          <div className="font-medium text-sm text-foreground truncate">{form.title || 'Untitled'}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {previewUrl && form.status === 'published' && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-md hover:bg-muted">
              <ExternalLink size={13} /> Preview
            </a>
          )}
          <Button variant="outline" onClick={() => save('draft')} disabled={saving} size="sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={13} className="mr-1.5" />Save draft</>}
          </Button>
          {form.status === 'published' ? (
            <Button onClick={() => save('unpublished')} disabled={saving} size="sm" variant="secondary">Unpublish</Button>
          ) : (
            <Button onClick={() => save('published')} disabled={saving} size="sm" className="bg-gold hover:bg-gold-dark text-accent-foreground">
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Section title="Basic information" description="Core details visible across the site.">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Employment Contract Template" />
            </Field>
            <Field label="Slug" hint="Used in the public URL. Auto-generated from title.">
              <Input
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); update({ slug: toSlug(e.target.value)}); }}
                placeholder="employment-contract-template"
              />
            </Field>
            <Field label="Short summary" hint="Appears in cards and previews.">
              <Textarea rows={2} value={form.summary} onChange={(e) => update({ summary: e.target.value })} />
            </Field>
            <Field label="Description" hint="Plain-text description used for SEO fallback.">
              <Textarea rows={3} value={form.description} onChange={(e) => update({ description: e.target.value })} />
            </Field>
          </Section>

          {/* Multilingual content */}
          <Section title="Multilingual content" description="Localized title, summary, and rich-text body per language.">
            <Tabs defaultValue="en">
              <TabsList>
                {LOCALES.map((l) => <TabsTrigger key={l} value={l}>{LOCALE_LABELS[l]}</TabsTrigger>)}
              </TabsList>
              {LOCALES.map((l) => (
                <TabsContent key={l} value={l} className="space-y-3 mt-4">
                  <Field label={`Title (${LOCALE_LABELS[l]})`}>
                    <Input value={form[`title_${l}`] || ''} onChange={(e) => update({ [`title_${l}`]: e.target.value })} />
                  </Field>
                  <Field label={`Summary (${LOCALE_LABELS[l]})`}>
                    <Textarea rows={2} value={form[`summary_${l}`] || ''} onChange={(e) => update({ [`summary_${l}`]: e.target.value })} />
                  </Field>
                  <Field label={`Body (${LOCALE_LABELS[l]})`}>
                    <RichTextEditor
                      value={form[`content_${l}`]}
                      onChange={(v) => update({ [`content_${l}`]: v })}
                      placeholder={`Write the ${LOCALE_LABELS[l]} article body…`}
                    />
                  </Field>
                </TabsContent>
              ))}
            </Tabs>
          </Section>

          {/* SEO */}
          <Section title="SEO & discovery" description="How this appears in search and social.">
            <Field label="Meta title"><Input value={form.meta_title} onChange={(e) => update({ meta_title: e.target.value })} placeholder="Defaults to title" /></Field>
            <Field label="Meta description"><Textarea rows={2} value={form.meta_description} onChange={(e) => update({ meta_description: e.target.value })} placeholder="Defaults to summary" /></Field>
            <Field label="Keywords" hint="Press Enter to add. Used for site search and SEO.">
              <div className="flex flex-wrap gap-2 mb-2">
                {form.keywords.map((k: string) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-xs rounded-full">
                    {k}
                    <button onClick={() => removeKeyword(k)} className="text-muted-foreground hover:text-destructive"><X size={11} /></button>
                  </span>
                ))}
              </div>
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                placeholder="Add keyword and press Enter"
              />
            </Field>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!form.featured} onCheckedChange={(v) => update({ featured: v })} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!form.trending} onCheckedChange={(v) => update({ trending: v })} /> Trending
              </label>
            </div>
          </Section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Type */}
          <Section title="Publication type">
            <div className="grid grid-cols-2 gap-2">
              <TypeCard
                active={form.type === 'news'}
                onClick={() => update({ type: 'news' })}
                icon={<Newspaper size={18} />}
                label="News & Research"
              />
              <TypeCard
                active={form.type === 'legal_document'}
                onClick={() => update({ type: 'legal_document' })}
                icon={<FileText size={18} />}
                label="Legal Document"
              />
            </div>
          </Section>

          {/* Category */}
          <Section title="Category">
            <Select value={form.category_id || ''} onValueChange={(v) => update({ category_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name_en || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Section>

          {/* Thumbnail */}
          <Section title="Thumbnail">
            {form.thumbnail_url ? (
              <div className="relative group">
                <img src={form.thumbnail_url} alt="" className="w-full aspect-[16/9] object-cover rounded-md" />
                <button onClick={() => update({ thumbnail_url: '' })} className="absolute top-2 right-2 bg-background/90 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 aspect-[16/9] border-2 border-dashed border-border rounded-md cursor-pointer hover:border-gold hover:bg-muted/30 transition-colors">
                {uploadingThumb ? <Loader2 className="animate-spin text-gold" /> : <><ImageIcon size={24} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Click to upload</span></>}
                <input type="file" accept="image/*" onChange={handleThumb} className="hidden" />
              </label>
            )}
          </Section>

          {/* File management (Legal docs only) */}
          {form.type === 'legal_document' && (
            <Section title="Document file">
              {form.file_path ? (
                <div className="border border-border rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center shrink-0"><FileText size={18} className="text-gold" /></div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-medium text-foreground truncate">{form.file_path.split('/').pop()}</div>
                      <div className="text-muted-foreground mt-0.5">{(form.file_type || '').toUpperCase()} · {((form.file_size_bytes || 0) / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button onClick={removeFile} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                  <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-gold cursor-pointer hover:underline">
                    <Upload size={12} /> Replace
                    <input type="file" accept=".pdf,.doc,.docx,.zip" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-gold hover:bg-muted/30 transition-colors">
                  {uploadingFile ? <Loader2 className="animate-spin text-gold" /> : <><Upload size={22} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload PDF / DOC / DOCX</span></>}
                  <input type="file" accept=".pdf,.doc,.docx,.zip" onChange={handleFile} className="hidden" />
                </label>
              )}
            </Section>
          )}

          {/* Pricing (Legal docs only) */}
          {form.type === 'legal_document' && (
            <Section title="Pricing & access">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!form.is_free} onCheckedChange={(v) => update({ is_free: v })} /> Free download
              </label>
              {!form.is_free && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price (cents)">
                    <Input type="number" min={0} value={form.price_cents} onChange={(e) => update({ price_cents: Number(e.target.value) })} />
                  </Field>
                  <Field label="Currency">
                    <Input value={form.currency} onChange={(e) => update({ currency: e.target.value })} maxLength={3} />
                  </Field>
                </div>
              )}
            </Section>
          )}

          {/* Languages */}
          <Section title="Available languages">
            <div className="flex gap-2">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLang(l)}
                  className={`px-3 py-1.5 rounded-md text-xs border inline-flex items-center gap-1.5 transition-colors ${
                    form.languages?.includes(l)
                      ? 'bg-gold/15 border-gold text-gold-dark'
                      : 'border-border text-muted-foreground hover:border-gold/40'
                  }`}
                >
                  <Globe size={11} /> {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </AdminLayout>
  );
};

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-lg p-5 space-y-4">
    <div>
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const TypeCard = ({ active, onClick, icon, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-md border-2 transition-all ${
      active ? 'border-gold bg-gold/5 text-foreground' : 'border-border text-muted-foreground hover:border-gold/40'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default AdminPublicationEditor;

import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, ArrowLeft, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['corporate', 'family', 'real_estate', 'employment', 'litigation', 'ip'];

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(['corporate', 'family', 'real_estate', 'employment', 'litigation', 'ip']),
});

const NewCasePage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('corporate');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const arr = Array.from(list).filter(f => f.size <= 25 * 1024 * 1024);
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ title, description, category });
    if (!parsed.success) {
      toast({ title: t('cases.invalid_input'), description: parsed.error.issues[0].message, variant: 'destructive' });
      return;
    }
    if (!parsed.data.description && files.length === 0) {
      toast({
        title: String(t('cases.need_details', 'Add a few details')),
        description: String(t('cases.need_details_desc', 'Please provide a short description or attach at least one document so a lawyer can help you.')),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { data: caseRow, error } = await supabase.from('cases').insert({
      client_id: user!.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
    }).select().single();

    if (error || !caseRow) {
      toast({ title: t('cases.error'), description: error?.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    for (const file of files) {
      const path = `${caseRow.id}/original/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('case-files').upload(path, file);
      if (upErr) {
        toast({ title: t('cases.upload_failed'), description: upErr.message, variant: 'destructive' });
        continue;
      }
      await supabase.from('case_files').insert({
        case_id: caseRow.id,
        uploaded_by: user!.id,
        kind: 'original',
        filename: file.name,
        storage_path: path,
        size_bytes: file.size,
        mime_type: file.type,
      });
    }

    toast({ title: t('cases.case_created'), description: String(t('cases.case_created_desc', 'A lawyer will review your request shortly.')) });
    navigate(`/dashboard/cases/${caseRow.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-4">
          <ArrowLeft size={16} /> {String(t('tasks.back', 'Back'))}
        </button>

        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">{t('cases.new_case_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {String(t('cases.new_case_helper', 'Tell us briefly what you need help with. A lawyer will reach out to you shortly.'))}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('cases.title_label')} <span className="text-destructive">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder={String(t('cases.title_placeholder', 'e.g. Review of employment contract'))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('cases.category')} <span className="text-destructive">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {String(t(`category.${c}`, { defaultValue: c.replace('_', ' ') }))}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('cases.description')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={String(t('cases.description_placeholder', 'Describe your situation in your own words. Add any deadlines or specific questions.'))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/2000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('cases.document_optional')}</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/60 hover:bg-muted/30'
              }`}
            >
              <Upload className="mx-auto mb-2 text-muted-foreground" size={22} />
              <p className="text-sm font-medium">
                {String(t('cases.drop_files', 'Drop files here or click to browse'))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {String(t('cases.drop_files_hint', 'PDF, Word, images — up to 25MB each'))}
              </p>
              <input
                ref={fileInput}
                type="file"
                multiple
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2 text-sm">
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeFile(i); }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
            <CheckCircle2 size={14} className="text-gold mt-0.5 shrink-0" />
            <span>
              {String(t('cases.submit_hint', 'Add a short description OR attach a document. Both are even better.'))}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-accent-foreground font-semibold rounded-md hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            <Upload size={16} /> {submitting ? t('cases.creating') : t('cases.create_case')}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default NewCasePage;

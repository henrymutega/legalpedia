import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Globe, Loader2, ShieldCheck, Star, TrendingUp, CheckCircle2, Clock, Landmark, XCircle, Send } from 'lucide-react';
import Layout from '@/components/Layout';
import SeoHead from '@/components/cms/SeoHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useLegalDocument, useLegalCategories, useMyPurchases } from '@/hooks/cms/useLegalDocs';
import { useLocaleField, useLocale } from '@/hooks/cms/useLocaleField';
import { useAuth } from '@/contexts/AuthContext';
import { downloadFile } from '@/lib/download-file';
import { toast } from 'sonner';

const formatPrice = (cents: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
};

const LegalDocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: doc, isLoading } = useLegalDocument(id);
  const { data: categories = [] } = useLegalCategories();
  const { data: purchases = [] } = useMyPurchases();

  const [busy, setBusy] = useState<'submit' | 'download' | null>(null);
  const [code, setCode] = useState('');

  const title = useLocaleField(doc, 'title', doc?.title || '');
  const description = useLocaleField(doc, 'description', doc?.description || '');
  const preview = useLocaleField(doc, 'preview', doc?.preview || '');
  const category = doc ? categories.find((c: any) => c.id === doc.category_id) : null;
  const owned = !!doc && (doc.is_free || purchases.some((p: any) => p.document_id === doc.id));

  // Current user's payment request for this document (any status)
  const { data: myRequest, refetch: refetchRequest } = useQuery({
    queryKey: ['my_doc_payment_request', doc?.id, user?.id],
    enabled: !!doc && !!user && !doc?.is_free,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_doc_purchases')
        .select('id, status, confirmation_code')
        .eq('document_id', doc!.id)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const pending = myRequest?.status === 'pending';
  const rejected = myRequest?.status === 'rejected';

  const handleSubmitCode = async () => {
    if (!user) { navigate('/login'); return; }
    if (!doc) return;
    if (!code.trim()) { toast.error(t('legal_docs.code_required')); return; }
    setBusy('submit');
    try {
      const { error } = await supabase.from('legal_doc_purchases').insert({
        user_id: user.id,
        document_id: doc.id,
        status: 'pending',
        payment_method: 'manual',
        confirmation_code: code.trim(),
        amount_cents: doc.price_cents || 0,
        currency: doc.currency || 'mnt',
        email: user.email,
      });
      if (error) throw error;
      setCode('');
      await refetchRequest();
      toast.success(t('legal_docs.request_submitted'));
    } catch (e: any) {
      toast.error(e?.message || t('legal_docs.submit_error'));
    } finally {
      setBusy(null);
    }
  };


  const handleDownload = async () => {
    if (!user) { navigate('/login'); return; }
    if (!doc) return;
    setBusy('download');
    try {
      const { data, error } = await supabase.functions.invoke('download-document', {
        body: { documentId: doc.id },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      if (data?.url) {
        const ext = (doc.file_type || 'pdf').toLowerCase();
        const safe = (doc.title || 'document').replace(/[^\w.\-]+/g, '_');
        await downloadFile(data.url, `${safe}.${ext}`);
        toast.success(t('legal_docs.download_started'));
      }
    } catch (e: any) {
      toast.error(e?.message || t('legal_docs.download_error'));
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return <Layout><div className="container mx-auto px-4 py-20"><Loader2 className="mx-auto animate-spin text-gold" /></div></Layout>;
  }
  if (!doc) {
    return <Layout><div className="container mx-auto px-4 py-20 text-center"><p>{t('legal_docs.not_found')}</p><Link to="/legal-documents" className="text-gold underline mt-3 inline-block">{t('legal_docs.back')}</Link></div></Layout>;
  }

  const isFree = doc.is_free || doc.price_cents === 0;

  return (
    <Layout>
      <SeoHead pageKey={`legal-document-${doc.id}`} fallbackTitle={title} fallbackDescription={description.slice(0, 160)} canonical={`/legal-documents/${doc.id}`} />
      <div className="bg-gradient-to-b from-primary/5 to-background py-10 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <button onClick={() => navigate('/legal-documents')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6 transition-colors">
            <ArrowLeft size={16} /> {t('legal_docs.back')}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-gold/10 mb-6 shadow-soft">
                {doc.thumbnail_url ? (
                  <img src={doc.thumbnail_url} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText size={80} className="text-gold/40" /></div>
                )}
              </div>

              {category && (
                <span className="text-xs uppercase tracking-wider text-gold font-semibold">
                  {category[`name_${locale}`] || category.name_en || category.name}
                </span>
              )}
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mt-2">{title}</h1>
              {description && <p className="text-muted-foreground mt-3 leading-relaxed">{description}</p>}

              {preview && (
                <div className="mt-8 p-5 bg-muted/50 border border-border rounded-lg">
                  <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t('legal_docs.preview_title')}</h2>
                  <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{preview}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-muted-foreground">
                {doc.file_type && <span className="inline-flex items-center gap-1.5"><FileText size={13} /> {doc.file_type.toUpperCase()}</span>}
                {doc.file_size_bytes && <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>}
                {doc.languages?.length > 0 && <span className="inline-flex items-center gap-1.5"><Globe size={13} /> {doc.languages.join(', ').toUpperCase()}</span>}
                {doc.download_count > 0 && <span className="inline-flex items-center gap-1.5"><TrendingUp size={13} /> {doc.download_count} {t('legal_docs.downloads')}</span>}
                {doc.featured && <span className="inline-flex items-center gap-1.5 text-gold"><Star size={13} /> {t('legal_docs.featured')}</span>}
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:sticky lg:top-24 self-start">
              <div className="bg-card border border-border rounded-xl shadow-card p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold text-foreground">
                    {isFree ? t('legal_docs.free') : formatPrice(doc.price_cents, doc.currency)}
                  </span>
                  {!isFree && <span className="text-xs uppercase text-muted-foreground">{doc.currency}</span>}
                </div>

                {owned ? (
                  <>
                    <div className="mt-4 p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs rounded-md inline-flex items-center gap-2">
                      <CheckCircle2 size={14} /> {t('legal_docs.owned')}
                    </div>
                    <Button onClick={handleDownload} disabled={busy === 'download'} className="w-full mt-4 bg-gold hover:bg-gold-dark text-accent-foreground">
                      {busy === 'download' ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} className="mr-2" /> {t('legal_docs.download')}</>}
                    </Button>
                  </>
                ) : isFree ? (
                  <Button onClick={handleDownload} disabled={busy === 'download'} className="w-full mt-5 bg-gold hover:bg-gold-dark text-accent-foreground">
                    {busy === 'download' ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} className="mr-2" /> {t('legal_docs.get_free')}</>}
                  </Button>
                ) : pending ? (
                  <div className="mt-4 p-3 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs rounded-md flex items-start gap-2">
                    <Clock size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{t('legal_docs.request_pending')}</p>
                      <p className="mt-1 opacity-80">{t('legal_docs.request_pending_help')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {rejected && (
                      <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md inline-flex items-center gap-2">
                        <XCircle size={14} /> {t('legal_docs.request_rejected')}
                      </div>
                    )}
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <h3 className="font-heading text-sm font-semibold text-foreground inline-flex items-center gap-2">
                        <Landmark size={15} className="text-gold" /> {t('legal_docs.pay_how_title')}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t('legal_docs.pay_instructions')}</p>
                      <pre className="text-xs text-foreground/90 mt-3 whitespace-pre-wrap font-sans bg-background/60 border border-border rounded-md p-3">{t('legal_docs.pay_account')}</pre>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground">{t('legal_docs.code_label')}</label>
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={t('legal_docs.code_placeholder')}
                        className="mt-1.5"
                        disabled={!user}
                      />
                    </div>
                    <Button onClick={handleSubmitCode} disabled={busy === 'submit' || !user} className="w-full bg-gold hover:bg-gold-dark text-accent-foreground">
                      {busy === 'submit' ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} className="mr-2" /> {t('legal_docs.submit_request')}</>}
                    </Button>
                  </div>
                )}

                <div className="mt-5 space-y-2.5 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2"><ShieldCheck size={13} className="text-gold" /> {t('legal_docs.editable_format')}</div>
                  <div className="inline-flex items-center gap-2"><Download size={13} className="text-gold" /> {t('legal_docs.instant_download')}</div>
                </div>


                {!user && (
                  <p className="text-[11px] text-muted-foreground mt-5">
                    {t('legal_docs.login_required')} <Link to="/login" className="text-gold underline">{t('legal_docs.sign_in')}</Link>
                  </p>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalDocumentDetailPage;

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Briefcase, Clock, CheckCircle2, AlertCircle, Bell,
  FileText, Upload, FolderOpen, ShieldCheck, BarChart3, MessageSquare,
} from 'lucide-react';

const ClientPortalShowcase = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: FolderOpen,
      title: t('home.portal.f1_title', 'Track Every Case'),
      desc: t('home.portal.f1_desc', 'Follow the real-time status of all your matters in one secure place.'),
    },
    {
      icon: Upload,
      title: t('home.portal.f2_title', 'Share Documents'),
      desc: t('home.portal.f2_desc', 'Upload and exchange files safely with your legal team anytime.'),
    },
    {
      icon: MessageSquare,
      title: t('home.portal.f3_title', 'Stay in Touch'),
      desc: t('home.portal.f3_desc', 'Message your lawyer and receive instant notifications on updates.'),
    },
    {
      icon: BarChart3,
      title: t('home.portal.f4_title', 'Personal Analytics'),
      desc: t('home.portal.f4_desc', 'Visualize your cases, activity and progress with clear insights.'),
    },
  ];

  const stats = [
    { label: t('dashboard.active_cases', 'Active Cases'), value: '4', icon: Briefcase, tone: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('dashboard.under_review', 'Under Review'), value: '2', icon: Clock, tone: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('dashboard.pending_action', 'Pending'), value: '1', icon: AlertCircle, tone: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('dashboard.completed', 'Completed'), value: '7', icon: CheckCircle2, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <section className="relative py-16 lg:py-24 bg-background overflow-hidden">
      {/* ambient glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-navy-light/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-[11px] font-semibold tracking-[0.18em] uppercase mb-5">
            <ShieldCheck size={13} />
            {t('home.portal.badge', 'LegalPedia Client Portal')}
          </span>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            {t('home.portal.title', 'Your Legal World, In One Dashboard')}
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
            {t('home.portal.subtitle', 'Manage your cases, documents and communication with your legal team from a single, secure client portal — built for clarity and peace of mind.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-gold/20 to-navy-light/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground font-medium">{t('home.portal.window', 'LegalPedia · My Dashboard')}</span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-heading font-bold text-foreground">{t('dashboard.welcome', 'Welcome back')}</p>
                    <p className="text-[11px] text-muted-foreground">{t('dashboard.subtitle', 'Here is an overview of your cases')}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md bg-gold text-accent-foreground">
                    <Bell size={12} /> 3
                  </span>
                </div>

                {/* stat cards */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  {stats.map((s) => (
                    <div key={String(s.label)} className="rounded-lg border border-border p-2.5">
                      <div className={`w-7 h-7 rounded-md ${s.bg} ${s.tone} flex items-center justify-center mb-2`}>
                        <s.icon size={15} />
                      </div>
                      <p className="font-heading text-lg font-bold text-foreground leading-none">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 truncate">{String(s.label)}</p>
                    </div>
                  ))}
                </div>

                {/* case rows */}
                <div className="space-y-2">
                  {[
                    { name: t('home.portal.case1', 'Contract Review — Acme Ltd'), status: t('case_status.under_review', 'Under Review'), cls: 'bg-amber-100 text-amber-700' },
                    { name: t('home.portal.case2', 'Property Dispute Filing'), status: t('case_status.reviewed', 'Reviewed'), cls: 'bg-purple-100 text-purple-700' },
                    { name: t('home.portal.case3', 'Employment Agreement'), status: t('case_status.completed', 'Completed'), cls: 'bg-emerald-100 text-emerald-700' },
                  ].map((c) => (
                    <div key={String(c.name)} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </span>
                        <p className="text-xs font-medium text-foreground truncate">{String(c.name)}</p>
                      </div>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${c.cls} shrink-0`}>{String(c.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature list */}
          <div>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-3 group-hover:bg-gold group-hover:text-accent-foreground transition-colors">
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1.5">{String(f.title)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{String(f.desc)}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold"
              >
                {t('home.portal.cta', 'Access Client Portal')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-border text-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:border-gold transition-colors"
              >
                {t('home.portal.cta2', 'Sign In')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientPortalShowcase;

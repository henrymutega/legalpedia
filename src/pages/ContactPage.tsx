import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, MapPin, Phone, Mail, Clock, Bot } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import headerImage from '@/assets/header-contact.jpg';

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! (Demo)');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Layout>
      <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} image={headerImage} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.form_name')}</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.form_email')}</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.form_subject')}</label>
                  <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('contact.form_message')}</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition resize-none" />
                </div>
                <button type="submit" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-semibold text-sm uppercase tracking-wider rounded-sm hover:bg-gold-dark transition-colors shadow-gold">
                  <Send size={16} /> {t('contact.form_submit')}
                </button>
              </form>
            </div>

            <div className="space-y-8 animate-fade-in-up animation-delay-200">
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-4">{t('contact.office_title')}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-foreground"><MapPin size={18} className="text-gold mt-0.5 shrink-0" /><span className="text-sm">{t('contact.address')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Phone size={18} className="text-gold shrink-0" /><span className="text-sm">{t('contact.phone')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Mail size={18} className="text-gold shrink-0" /><span className="text-sm">{t('contact.email')}</span></li>
                  <li className="flex items-center gap-3 text-foreground"><Clock size={18} className="text-gold shrink-0" /><span className="text-sm">{t('contact.hours')}</span></li>
                </ul>
              </div>
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border border-border">
                <span className="text-muted-foreground text-sm">📍 Map Placeholder</span>
              </div>
              <div className="border-2 border-dashed border-gold/30 rounded-lg p-6 bg-gold/5">
                <div className="flex items-center gap-3 mb-3">
                  <Bot size={24} className="text-gold" />
                  <h3 className="font-heading text-lg font-semibold text-foreground">{t('contact.chatbot_title')}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{t('contact.chatbot_placeholder')}</p>
                <div className="mt-4 bg-card border border-border rounded-lg p-4 h-32 flex items-center justify-center">
                  <span className="text-muted-foreground/50 text-xs uppercase tracking-wider">Chatbot Integration Area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;

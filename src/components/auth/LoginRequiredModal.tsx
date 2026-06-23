import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, MessageSquare, Upload, Calendar, ShieldCheck, Infinity as InfinityIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginRequiredModal = ({ open, onOpenChange }: LoginRequiredModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const benefits = [
    { icon: InfinityIcon, label: t('login_modal.benefit_unlimited', 'Unlimited AI conversations') },
    { icon: MessageSquare, label: t('login_modal.benefit_history', 'Save chat history') },
    { icon: Upload, label: t('login_modal.benefit_upload', 'Upload legal documents') },
    { icon: Calendar, label: t('login_modal.benefit_book', 'Book consultations') },
    { icon: ShieldCheck, label: t('login_modal.benefit_portal', 'Secure client portal') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-2">
            <Sparkles className="text-gold" size={22} />
          </div>
          <DialogTitle className="text-center">
            {t('login_modal.title', 'Continue Your Legal Consultation')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('login_modal.description', 'You have used your free questions. Sign in or create an account to save your conversation history and continue receiving personalized legal assistance.')}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-2">
          {benefits.map(b => (
            <li key={b.label} className="flex items-center gap-2.5 text-sm text-foreground">
              <span className="w-7 h-7 rounded-md bg-gold/10 flex items-center justify-center flex-shrink-0">
                <b.icon size={14} className="text-gold" />
              </span>
              {b.label}
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={() => go('/login?mode=signup')} className="w-full bg-gold hover:bg-gold-dark text-accent-foreground">
            {t('login_modal.create_account', 'Create Account')}
          </Button>
          <Button onClick={() => go('/login')} variant="outline" className="w-full">
            {t('login_modal.sign_in', 'Sign In')}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="w-full">
            {t('login_modal.cancel', 'Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRequiredModal;

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { X, Loader2, LogIn, Maximize2, Sparkles, Calendar, ArrowRight, Scale, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStream } from './chatbot/useChatStream';
import { getGreeting } from './chatbot/utils';
import ChatMessage from './chatbot/ChatMessage';
import ChatInput from './chatbot/ChatInput';
import LoginRequiredModal from './auth/LoginRequiredModal';
import { useGuestLimit } from '@/hooks/useGuestLimit';

type View = 'welcome' | 'chat';

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const currentLang = i18n.language?.slice(0, 2) || 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('welcome');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef(currentLang);
  const autoTriggered = useRef(false);

  const userContext = user ? { name: profile?.display_name, email: profile?.email } : undefined;
  const initialGreeting = [{ id: '0', role: 'assistant' as const, content: getGreeting(currentLang, profile?.display_name) }];
  const guest = useGuestLimit();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { messages, isLoading, sendMessage, resetMessages } = useChatStream(
    initialGreeting,
    currentLang,
    userContext,
    {
      canSend: () => {
        if (guest.limitReached) { setLoginModalOpen(true); return false; }
        return true;
      },
      onUserMessage: () => { guest.recordQuestion(); },
    },
  );

  // Rotating multilingual speech bubble messages
  const bubbleMessages: string[] = (() => {
    const all = t('chatbot.bubble_messages', { returnObjects: true, defaultValue: [] }) as unknown;
    if (Array.isArray(all) && all.length) return all as string[];
    return [
      t('chatbot.bubble_default_1', 'Need legal help? Chat with us.'),
      t('chatbot.bubble_default_2', 'Speak with our AI Legal Assistant.'),
    ];
  })();

  // Show bubble once per session, rotate every 4s while visible
  useEffect(() => {
    const shown = sessionStorage.getItem('chatbot_bubble_dismissed');
    if (shown) return;
    const timer = setTimeout(() => setBubbleVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!bubbleVisible || bubbleMessages.length <= 1) return;
    const id = setInterval(() => setBubbleIndex(i => (i + 1) % bubbleMessages.length), 4000);
    return () => clearInterval(id);
  }, [bubbleVisible, bubbleMessages.length]);

  useEffect(() => {
    if (autoTriggered.current) return;
    const triggered = sessionStorage.getItem('chatbot_triggered');
    if (triggered) { autoTriggered.current = true; return; }
    const timer = setTimeout(() => {
      if (!autoTriggered.current) {
        setIsOpen(true);
        autoTriggered.current = true;
        sessionStorage.setItem('chatbot_triggered', 'true');
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (prevLangRef.current !== currentLang) {
      prevLangRef.current = currentLang;
      resetMessages([{ id: '0', role: 'assistant', content: getGreeting(currentLang, profile?.display_name) }]);
    }
  }, [currentLang, profile?.display_name, resetMessages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '0') {
      resetMessages([{ id: '0', role: 'assistant', content: getGreeting(currentLang, profile?.display_name) }]);
    }
  }, [profile?.display_name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const dismissBubble = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBubbleVisible(false);
    sessionStorage.setItem('chatbot_bubble_dismissed', '1');
  };

  const handleToggle = () => {
    setIsOpen(o => !o);
    if (bubbleVisible) dismissBubble();
  };

  const quickActions = [
    { label: t('chatbot.action_services', '📋 View Services'), message: t('chatbot.action_services_msg', 'What legal services do you offer?') },
    { label: t('chatbot.action_documents', '📄 Download Documents'), message: t('chatbot.action_documents_msg', 'How can I access your legal publications and documents?') },
    { label: t('chatbot.action_contact', '📞 Contact a Lawyer'), message: t('chatbot.action_contact_msg', 'I would like to speak with a lawyer about my case.') },
  ];

  const openFullPage = () => {
    setIsOpen(false);
    navigate('/ai-assistant');
  };

  return (
    <>
      {/* Floating speech bubble */}
      {!isOpen && bubbleVisible && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[260px] animate-fade-in-up">
          <div className="relative bg-card border border-gold/30 shadow-lg rounded-xl px-3 py-2 pr-7">
            <p className="text-xs text-foreground leading-relaxed">{bubbleMessages[bubbleIndex]}</p>
            <button
              onClick={dismissBubble}
              aria-label="Dismiss"
              className="absolute top-1 right-1 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X size={12} />
            </button>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-card border-r border-b border-gold/30 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating launcher button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* pulse rings */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping opacity-75" aria-hidden />
            <span className="absolute inset-[-4px] rounded-full ring-2 ring-gold/40 animate-pulse" aria-hidden />
          </>
        )}
        <button
          onClick={handleToggle}
          className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark text-accent-foreground shadow-gold flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'rotate-90' : ''}`}
          aria-label={String(t('chatbot.toggle', 'Open AI Legal Assistant'))}
        >
          {isOpen ? <X size={24} /> : <Scale size={24} strokeWidth={2.2} />}
        </button>
      </div>

      {/* Popup */}
      <div
        className={`fixed z-50 bg-card border border-border rounded-xl shadow-card flex flex-col overflow-hidden transition-all duration-300
          right-3 left-3 bottom-24
          sm:left-auto sm:right-6 sm:w-[380px]
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: 'min(80vh, 600px)', maxHeight: 'calc(100vh - 7rem)' }}
      >
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <Sparkles size={16} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary-foreground text-sm font-semibold truncate">{t('chatbot.title', 'AI Legal Assistant')}</p>
            <p className="text-primary-foreground/50 text-xs">
              {view === 'chat' ? (isLoading ? t('chatbot.typing', 'Typing...') : t('chatbot.online', 'Online')) : t('chatbot.welcome_subtitle', 'How would you like to chat?')}
            </p>
          </div>
          {view === 'chat' && (
            <button
              onClick={openFullPage}
              title={String(t('chatbot.expand', 'Open full page'))}
              className="text-primary-foreground/70 hover:text-gold transition-colors p-1"
            >
              <Maximize2 size={16} />
            </button>
          )}
          {!user && (
            <Link to="/login" className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
              <LogIn size={14} />
              {t('auth.login', 'Sign In')}
            </Link>
          )}
        </div>

        {view === 'welcome' ? (
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
            <div className="text-center pt-2 pb-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-3">
                <Sparkles className="text-gold" size={26} />
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground">{t('chatbot.welcome_title', 'Welcome to LegalPedia AI')}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('chatbot.welcome_desc', 'Get instant legal guidance. Choose how you would like to chat.')}
              </p>
            </div>

            <button
              onClick={() => setView('chat')}
              className="w-full group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="text-gold" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t('chatbot.option_quick', 'Quick Chat')}</p>
                <p className="text-xs text-muted-foreground">{t('chatbot.option_quick_desc', 'Fast answers in this popup.')}</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-gold transition-colors" />
            </button>

            <button
              onClick={openFullPage}
              className="w-full group flex items-center gap-3 p-3 rounded-lg border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent hover:border-gold hover:bg-gold/10 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-gold" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t('chatbot.option_full', 'Open Full AI Assistant')}</p>
                <p className="text-xs text-muted-foreground">{t('chatbot.option_full_desc', 'Immersive page with history & tools.')}</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-gold transition-colors" />
            </button>

            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="text-foreground" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t('chatbot.option_book', 'Book a Consultation')}</p>
                <p className="text-xs text-muted-foreground">{t('chatbot.option_book_desc', 'Speak with a licensed attorney.')}</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-gold transition-colors" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg rounded-bl-none px-3 py-2">
                    <Loader2 size={16} className="animate-spin text-gold" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {messages.length > 2 && (
              <div className="px-4 pb-2 flex-shrink-0">
                <button
                  onClick={openFullPage}
                  className="block w-full text-center text-xs py-2 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  {t('chatbot.continue_full', '✨ Continue in full AI Assistant page')}
                </button>
              </div>
            )}

            <div className="flex-shrink-0">
              <ChatInput isLoading={isLoading} onSend={sendMessage} />
            </div>
          </>
        )}
      </div>

      <LoginRequiredModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
};

export default Chatbot;

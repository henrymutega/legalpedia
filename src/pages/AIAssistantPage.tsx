import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Plus, MessageSquare, Trash2, Loader2, Copy, RefreshCw,
  ThumbsUp, ThumbsDown, Printer, Scale, Briefcase, Home as HomeIcon,
  Users, FileText, Phone, Upload, LayoutDashboard, ShieldCheck, Menu, X, Pencil,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStream } from '@/components/chatbot/useChatStream';
import { getGreeting, trackChatAnalytics } from '@/components/chatbot/utils';
import ChatMessage from '@/components/chatbot/ChatMessage';
import type { Message } from '@/components/chatbot/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuestLimit } from '@/hooks/useGuestLimit';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import SeoHead from '@/components/cms/SeoHead';

interface StoredConversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_KEY = 'legalpedia_ai_conversations';
const ACTIVE_KEY = 'legalpedia_ai_active';

function loadConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveConversations(list: StoredConversation[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50))); } catch { /* ignore */ }
}

const AIAssistantPage = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const currentLang = i18n.language?.slice(0, 2) || 'en';
  const isAuth = !!user;
  const guest = useGuestLimit();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillSent = useRef(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [conversations, setConversations] = useState<StoredConversation[]>(() => (isAuth ? [] : loadConversations()));
  const [activeId, setActiveId] = useState<string>(() => (isAuth ? '' : localStorage.getItem(ACTIVE_KEY) || ''));
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastScrollTsRef = useRef(0);
  const prevMsgCountRef = useRef(0);
  const sessionStart = useRef<number>(Date.now());
  const activeIdRef = useRef<string>('');
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const userContext = user ? { name: profile?.display_name, email: profile?.email } : undefined;
  const greeting: Message = { id: '0', role: 'assistant', content: getGreeting(currentLang, profile?.display_name) };

  const activeConv = conversations.find(c => c.id === activeId);
  const initialMessages = activeConv?.messages?.length ? activeConv.messages : [greeting];

  // --- DB helpers (authenticated users) ---
  const ensureConversation = useCallback(async (firstUserText?: string): Promise<string | null> => {
    if (!user) return null;
    if (activeIdRef.current) return activeIdRef.current;
    const title = (firstUserText || t('ai_assistant.new_chat', 'New chat')).slice(0, 60);
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, title, language: currentLang })
      .select('id, title, updated_at')
      .single();
    if (error || !data) return null;
    const conv: StoredConversation = { id: data.id, title: data.title, updatedAt: new Date(data.updated_at).getTime(), messages: [greeting] };
    setConversations(prev => [conv, ...prev]);
    setActiveId(data.id);
    activeIdRef.current = data.id;
    return data.id;
  }, [user, currentLang, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const persistMessage = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({
      conversation_id: convId,
      user_id: user.id,
      role,
      content,
      language: currentLang,
    });
  }, [user, currentLang]);

  const { messages, isLoading, sendMessage, resetMessages } = useChatStream(
    initialMessages,
    currentLang,
    userContext,
    {
      canSend: () => {
        if (!isAuth && guest.limitReached) { setLoginModalOpen(true); return false; }
        return true;
      },
      onUserMessage: async (text) => {
        if (!isAuth) { guest.recordQuestion(); return; }
        const convId = await ensureConversation(text);
        if (convId) await persistMessage(convId, 'user', text);
        // Update title if still default
        setConversations(prev => prev.map(c =>
          c.id === (convId || activeIdRef.current) && (c.title === t('ai_assistant.new_chat', 'New chat') || !c.title)
            ? { ...c, title: text.slice(0, 60) }
            : c
        ));
        if (convId) {
          await supabase.from('chat_conversations').update({ title: text.slice(0, 60) }).eq('id', convId).eq('title', t('ai_assistant.new_chat', 'New chat'));
        }
      },
      onAssistantMessage: async (content) => {
        if (!isAuth) return;
        const convId = activeIdRef.current;
        if (convId) await persistMessage(convId, 'assistant', content);
      },
    },
  );

  // Load conversations from DB when authenticated
  useEffect(() => {
    if (!isAuth || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('chat_conversations')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (cancelled || !data) return;
      const list: StoredConversation[] = data.map(c => ({
        id: c.id, title: c.title, updatedAt: new Date(c.updated_at).getTime(), messages: [],
      }));
      setConversations(list);
      if (list.length) {
        setActiveId(list[0].id);
        // Load messages for the first
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', list[0].id)
          .order('created_at', { ascending: true });
        if (msgs && msgs.length) {
          const loaded: Message[] = msgs.map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content }));
          setConversations(prev => prev.map(c => c.id === list[0].id ? { ...c, messages: loaded } : c));
          resetMessages([greeting, ...loaded]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isAuth, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bootstrap first conversation (guest only)
  useEffect(() => {
    if (isAuth) return;
    if (typeof window === 'undefined') return;
    if (conversations.length === 0) {
      const id = crypto.randomUUID();
      const initial: StoredConversation = { id, title: t('ai_assistant.new_chat', 'New chat'), updatedAt: Date.now(), messages: [greeting] };
      const list = [initial];
      setConversations(list);
      setActiveId(id);
      saveConversations(list);
      localStorage.setItem(ACTIVE_KEY, id);
    } else if (!activeId) {
      setActiveId(conversations[0].id);
      localStorage.setItem(ACTIVE_KEY, conversations[0].id);
    }
  }, [isAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist messages locally (guest only)
  useEffect(() => {
    if (isAuth) return;
    if (!activeId || messages.length === 0) return;
    setConversations(prev => {
      const updated = prev.map(c => c.id === activeId ? {
        ...c,
        messages,
        updatedAt: Date.now(),
        title: c.title === t('ai_assistant.new_chat', 'New chat') && messages.find(m => m.role === 'user')
          ? (messages.find(m => m.role === 'user')!.content.slice(0, 48))
          : c.title,
      } : c);
      saveConversations(updated);
      return updated;
    });
  }, [messages, activeId, t, isAuth]);


  // Smart auto-scroll: only stick to bottom when user is already near it
  const isNearBottom = (el: HTMLElement, threshold = 120) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    lastScrollTsRef.current = Date.now();
  }, []);

  // Track user intent via scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      shouldAutoScrollRef.current = isNearBottom(el);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll on new message; throttle during streaming
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const countChanged = messages.length !== prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;

    if (countChanged) {
      // New message added — scroll if user is near bottom (or sent the message themselves)
      const lastIsUser = messages[messages.length - 1]?.role === 'user';
      if (lastIsUser || shouldAutoScrollRef.current) {
        requestAnimationFrame(() => scrollToBottom('smooth'));
      }
      return;
    }

    // Streaming chunk update — only if near bottom, throttled
    if (shouldAutoScrollRef.current && isLoading) {
      const now = Date.now();
      if (now - lastScrollTsRef.current > 700) {
        scrollToBottom('auto');
      }
    }
  }, [messages, isLoading, scrollToBottom]);

  // Final scroll after streaming completes
  useEffect(() => {
    if (!isLoading && shouldAutoScrollRef.current) {
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }
  }, [isLoading, scrollToBottom]);

  // Analytics on unmount
  useEffect(() => {
    return () => {
      const duration = Math.round((Date.now() - sessionStart.current) / 1000);
      trackChatAnalytics(`[full_page_session:${duration}s]`, 0, true, currentLang, user?.id);
    };
  }, [currentLang, user?.id]);

  const handleSend = useCallback((text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    sendMessage(value);
    setInput('');
  }, [input, isLoading, sendMessage]);

  // Auto-send a prefilled question coming from FAQ "Ask AI" links (?q=...)
  useEffect(() => {
    if (prefillSent.current) return;
    const q = searchParams.get('q');
    if (!q) return;
    prefillSent.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
    setTimeout(() => sendMessage(q), 300);
  }, [searchParams, setSearchParams, sendMessage]);

  const handleNewChat = () => {
    // For authed users, the conversation row is created lazily on first message.
    if (isAuth) {
      setActiveId('');
      activeIdRef.current = '';
      resetMessages([greeting]);
      setSidebarOpen(false);
      return;
    }
    const id = crypto.randomUUID();
    const conv: StoredConversation = { id, title: t('ai_assistant.new_chat', 'New chat'), updatedAt: Date.now(), messages: [greeting] };
    const list = [conv, ...conversations];
    setConversations(list);
    setActiveId(id);
    saveConversations(list);
    localStorage.setItem(ACTIVE_KEY, id);
    resetMessages([greeting]);
    setSidebarOpen(false);
  };

  const handleSelectConv = async (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setActiveId(id);
    activeIdRef.current = id;
    if (!isAuth) localStorage.setItem(ACTIVE_KEY, id);
    setSidebarOpen(false);

    if (isAuth && conv.messages.length === 0) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      const loaded: Message[] = (msgs || []).map(m => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content }));
      setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: loaded } : c));
      resetMessages([greeting, ...loaded]);
    } else {
      resetMessages(conv.messages.length ? conv.messages : [greeting]);
    }
  };

  const handleDeleteConv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuth) {
      await supabase.from('chat_conversations').delete().eq('id', id);
    }
    const list = conversations.filter(c => c.id !== id);
    setConversations(list);
    if (!isAuth) saveConversations(list);
    if (id === activeId) {
      if (list.length) handleSelectConv(list[0].id);
      else handleNewChat();
    }
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const commitRename = async (id: string) => {
    const title = renameValue.trim() || t('ai_assistant.new_chat', 'New chat');
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    setRenamingId(null);
    if (isAuth) {
      await supabase.from('chat_conversations').update({ title }).eq('id', id);
    } else {
      saveConversations(conversations.map(c => c.id === id ? { ...c, title } : c));
    }
  };

  const handleClearChat = () => {
    resetMessages([greeting]);
    if (!isAuth && activeId) {
      setConversations(prev => {
        const updated = prev.map(c => c.id === activeId ? { ...c, messages: [greeting], updatedAt: Date.now() } : c);
        saveConversations(updated);
        return updated;
      });
    }
  };


  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: t('ai_assistant.copied', 'Copied to clipboard') });
    } catch { /* ignore */ }
  };

  const regenerateLast = () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    sendMessage(lastUser.content);
  };

  const sendFeedback = (good: boolean) => {
    toast({ title: good ? t('ai_assistant.fb_thanks', 'Thanks for the feedback!') : t('ai_assistant.fb_noted', 'Noted — we will improve.') });
  };

  const starters = [
    { icon: Briefcase, label: t('ai_assistant.starter_company', 'How do I register a company in Mongolia?') },
    { icon: FileText, label: t('ai_assistant.starter_lease', 'Review a lease agreement') },
    { icon: Scale, label: t('ai_assistant.starter_employment', 'Employment contract guidance') },
    { icon: Users, label: t('ai_assistant.starter_family', 'Family law consultation') },
  ];

  const topics = [
    { icon: Briefcase, label: t('ai_assistant.topic_corporate', 'Corporate Law') },
    { icon: HomeIcon, label: t('ai_assistant.topic_real_estate', 'Real Estate') },
    { icon: Users, label: t('ai_assistant.topic_family', 'Family Law') },
    { icon: Scale, label: t('ai_assistant.topic_litigation', 'Litigation') },
  ];

  const hasUserMessage = messages.some(m => m.role === 'user');

  return (
    <Layout>
      <SeoHead pageKey="ai-assistant" fallbackTitle={t('ai_assistant.title', 'AI Legal Assistant')} canonical="/ai-assistant" />
      <div className="bg-background min-h-[calc(100vh-5rem)]">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-gold/5">
          <div className="container mx-auto px-4 py-8 lg:py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center">
                <Sparkles className="text-gold" size={22} />
              </div>
              <div>
                <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
                  {t('ai_assistant.hero_title', 'LegalPedia AI Legal Assistant')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('ai_assistant.hero_subtitle', 'Ask legal questions in English, Chinese, or Mongolian and receive professional legal guidance.')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <ShieldCheck size={12} className="text-gold" /> {t('ai_assistant.badge_confidential', 'Confidential')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <Scale size={12} className="text-gold" /> {t('ai_assistant.badge_licensed', 'Backed by licensed attorneys')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                🌐 {t('ai_assistant.badge_multi', 'EN · 中文 · Монгол')}
              </span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-0 lg:gap-4 min-h-[calc(100vh-18rem)]">
            {/* LEFT SIDEBAR */}
            <aside
              className={`${sidebarOpen ? 'fixed inset-0 z-40 bg-background p-4 overflow-auto' : 'hidden'} lg:static lg:block lg:p-0 lg:bg-transparent`}
            >
              <div className="lg:sticky lg:top-24 bg-card border border-border rounded-xl p-3 space-y-4">
                <div className="flex items-center justify-between lg:hidden">
                  <h3 className="font-semibold text-sm">{t('ai_assistant.menu', 'Menu')}</h3>
                  <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
                </div>

                <Button onClick={handleNewChat} className="w-full justify-start gap-2" size="sm">
                  <Plus size={16} /> {t('ai_assistant.new_chat', 'New chat')}
                </Button>

                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {t('ai_assistant.history', 'History')}
                    </p>
                    {!isAuth && (
                      <span className="text-[10px] text-gold">
                        {t('ai_assistant.guest_remaining', '{{n}} free left', { n: guest.remaining })}
                      </span>
                    )}
                  </div>
                  {conversations.length > 3 && (
                    <Input
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      placeholder={t('ai_assistant.search_history', 'Search…')}
                      className="h-7 text-xs mb-2"
                    />
                  )}
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1 pr-2">
                      {conversations.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-3">{t('ai_assistant.no_history', 'No conversations yet.')}</p>
                      )}
                      {conversations
                        .filter(c => !historySearch.trim() || (c.title || '').toLowerCase().includes(historySearch.toLowerCase()))
                        .map(c => (
                        <div
                          key={c.id}
                          onClick={() => renamingId === c.id ? null : handleSelectConv(c.id)}
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                            c.id === activeId ? 'bg-muted text-foreground' : 'hover:bg-muted/60 text-muted-foreground'
                          }`}
                        >
                          <MessageSquare size={12} className="flex-shrink-0" />
                          {renamingId === c.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onBlur={() => commitRename(c.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitRename(c.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 bg-background border border-border rounded px-1 py-0.5 text-xs"
                            />
                          ) : (
                            <span className="truncate flex-1">{c.title || t('ai_assistant.new_chat', 'New chat')}</span>
                          )}
                          <button
                            onClick={(e) => startRename(c.id, c.title, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                            aria-label={String(t('ai_assistant.rename', 'Rename'))}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConv(c.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            aria-label={String(t('ai_assistant.delete', 'Delete'))}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>


                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                    {t('ai_assistant.suggested_topics', 'Suggested Topics')}
                  </p>
                  <div className="space-y-1">
                    {topics.map(topic => (
                      <button
                        key={topic.label}
                        onClick={() => handleSend(topic.label)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                      >
                        <topic.icon size={12} className="text-gold" />
                        <span className="truncate">{topic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleClearChat}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} /> {t('ai_assistant.clear_chat', 'Clear current chat')}
                </button>
              </div>
            </aside>

            {/* CENTER */}
            <section className="flex flex-col bg-card lg:border lg:border-border lg:rounded-xl overflow-hidden">
              {/* Mobile sidebar trigger */}
              <div className="lg:hidden border-b border-border p-2 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted-foreground"><Menu size={18} /></button>
                <p className="text-xs font-semibold truncate">{activeConv?.title || t('ai_assistant.new_chat', 'New chat')}</p>
                <button onClick={handleNewChat} className="p-2 text-gold"><Plus size={18} /></button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 min-h-[400px]">
                {!hasUserMessage && (
                  <div className="max-w-2xl mx-auto text-center pt-4 pb-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
                      <Sparkles className="text-gold" size={28} />
                    </div>
                    <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {t('ai_assistant.empty_title', 'How can I help with your legal needs?')}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('ai_assistant.empty_desc', 'Pick a starter or type your own question below.')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {starters.map(s => (
                        <button
                          key={s.label}
                          onClick={() => handleSend(s.label)}
                          className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-gold/50 hover:bg-gold/5 transition-all text-left"
                        >
                          <s.icon className="text-gold flex-shrink-0 mt-0.5" size={16} />
                          <span className="text-sm text-foreground">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((msg, idx) => {
                    const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && idx > 0;
                    return (
                      <div key={msg.id}>
                        <ChatMessage message={msg} />
                        {msg.role === 'assistant' && msg.content && idx > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-60 hover:opacity-100 transition-opacity">
                            <button onClick={() => copyMessage(msg.content)} title={t('ai_assistant.copy', 'Copy')} className="p-1 text-muted-foreground hover:text-foreground">
                              <Copy size={12} />
                            </button>
                            {isLastAssistant && (
                              <button onClick={regenerateLast} title={t('ai_assistant.regenerate', 'Regenerate')} className="p-1 text-muted-foreground hover:text-foreground">
                                <RefreshCw size={12} />
                              </button>
                            )}
                            <button onClick={() => sendFeedback(true)} title={t('ai_assistant.good', 'Good response')} aria-label={t('ai_assistant.good', 'Good response')} className="p-1 text-muted-foreground hover:text-foreground">
                              <ThumbsUp size={12} />
                            </button>
                            <button onClick={() => sendFeedback(false)} title={t('ai_assistant.bad', 'Bad response')} aria-label={t('ai_assistant.bad', 'Bad response')} className="p-1 text-muted-foreground hover:text-foreground">
                              <ThumbsDown size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-lg rounded-bl-none px-3 py-2">
                        <Loader2 size={16} className="animate-spin text-gold" />
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-border bg-card p-3 lg:p-4 sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                  <div className="relative flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:border-gold/50 transition-colors">
                    <Textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={t('ai_assistant.placeholder', 'Ask a legal question…')}
                      rows={1}
                      className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      size="sm"
                      className="bg-gold hover:bg-gold-dark text-accent-foreground"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : t('ai_assistant.send', 'Send')}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-[11px] text-muted-foreground">
                      {t('ai_assistant.disclaimer', 'AI provides general information. For official advice, consult a lawyer.')}
                    </p>
                    <button onClick={() => window.print()} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Printer size={11} /> {t('ai_assistant.print', 'Print')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-4">
                  <h3 className="font-heading font-semibold text-sm text-foreground mb-1">
                    {t('ai_assistant.cta_title', 'Need a real lawyer?')}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('ai_assistant.cta_desc', 'Book a confidential consultation with our team.')}
                  </p>
                  <Link to="/contact">
                    <Button size="sm" className="w-full bg-gold hover:bg-gold-dark text-accent-foreground">
                      <Phone size={14} className="mr-1.5" /> {t('ai_assistant.cta_book', 'Book Consultation')}
                    </Button>
                  </Link>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {t('ai_assistant.related', 'Related')}
                  </h3>
                  <Link to="/services" className="flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors py-1.5">
                    <Briefcase size={14} className="text-gold" /> {t('ai_assistant.related_services', 'Our Services')}
                  </Link>
                  <Link to="/publications" className="flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors py-1.5">
                    <FileText size={14} className="text-gold" /> {t('ai_assistant.related_docs', 'Legal Publications')}
                  </Link>
                  {user ? (
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors py-1.5">
                      <LayoutDashboard size={14} className="text-gold" /> {t('ai_assistant.related_portal', 'Client Portal')}
                    </Link>
                  ) : (
                    <Link to="/login" className="flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors py-1.5">
                      <LayoutDashboard size={14} className="text-gold" /> {t('ai_assistant.related_signin', 'Sign in to portal')}
                    </Link>
                  )}
                  <Link to={user ? '/dashboard/new' : '/login'} className="flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors py-1.5">
                    <Upload size={14} className="text-gold" /> {t('ai_assistant.related_upload', 'Upload Documents')}
                  </Link>
                </div>

                <div className="bg-muted/40 border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {t('ai_assistant.faq', 'FAQ')}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('ai_assistant.faq_text', 'Conversations are private. AI replies are general information only. For binding legal advice, contact a licensed attorney.')}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <LoginRequiredModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </Layout>
  );
};

export default AIAssistantPage;

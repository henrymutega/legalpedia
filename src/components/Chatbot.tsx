// import { useState, useRef, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom';
// import { MessageCircle, X, Loader2, LogIn } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useChatStream } from './chatbot/useChatStream';
// import { getGreeting } from './chatbot/utils';
// import ChatMessage from './chatbot/ChatMessage';
// import ChatInput from './chatbot/ChatInput';

// const Chatbot = () => {
//   const { t, i18n } = useTranslation();
//   const { user, profile } = useAuth();
//   const currentLang = i18n.language?.slice(0, 2) || 'en';
//   const [isOpen, setIsOpen] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const prevLangRef = useRef(currentLang);
//   const autoTriggered = useRef(false);

//   const userContext = user ? { name: profile?.display_name, email: profile?.email } : undefined;
//   const initialGreeting = [{ id: '0', role: 'assistant' as const, content: getGreeting(currentLang, profile?.display_name) }];
//   const { messages, isLoading, sendMessage, resetMessages } = useChatStream(initialGreeting, currentLang, userContext);

//   // Auto-trigger after 7 seconds (once per session)
//   useEffect(() => {
//     if (autoTriggered.current) return;
//     const triggered = sessionStorage.getItem('chatbot_triggered');
//     if (triggered) { autoTriggered.current = true; return; }
//     const timer = setTimeout(() => {
//       if (!autoTriggered.current) {
//         setIsOpen(true);
//         autoTriggered.current = true;
//         sessionStorage.setItem('chatbot_triggered', 'true');
//       }
//     }, 7000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Update greeting when language changes
//   useEffect(() => {
//     if (prevLangRef.current !== currentLang) {
//       prevLangRef.current = currentLang;
//       resetMessages([{ id: '0', role: 'assistant', content: getGreeting(currentLang, profile?.display_name) }]);
//     }
//   }, [currentLang, profile?.display_name, resetMessages]);

//   // Update greeting when user logs in (only if at initial state)
//   useEffect(() => {
//     if (messages.length === 1 && messages[0].id === '0') {
//       resetMessages([{ id: '0', role: 'assistant', content: getGreeting(currentLang, profile?.display_name) }]);
//     }
//   }, [profile?.display_name]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const quickActions = [
//     { label: t('chatbot.action_services', '📋 View Services'), message: t('chatbot.action_services_msg', 'What legal services do you offer?') },
//     { label: t('chatbot.action_documents', '📄 Download Documents'), message: t('chatbot.action_documents_msg', 'How can I access your legal publications and documents?') },
//     { label: t('chatbot.action_contact', '📞 Contact a Lawyer'), message: t('chatbot.action_contact_msg', 'I would like to speak with a lawyer about my case.') },
//   ];

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-accent-foreground shadow-gold flex items-center justify-center transition-transform duration-300 hover:scale-110 ${isOpen ? 'rotate-90' : ''}`}
//         aria-label="Toggle chat"
//       >
//         {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
//       </button>

//       <div
//         className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-card flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
//         style={{ height: '520px' }}
//       >
//         {/* Header */}
//         <div className="bg-primary px-4 py-3 flex items-center gap-3">
//           <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
//             <MessageCircle size={16} className="text-gold" />
//           </div>
//           <div className="flex-1">
//             <p className="text-primary-foreground text-sm font-semibold">{t('chatbot.title', 'AI Legal Assistant')}</p>
//             <p className="text-primary-foreground/50 text-xs">
//               {isLoading ? t('chatbot.typing', 'Typing...') : t('chatbot.online', 'Online')}
//             </p>
//           </div>
//           {!user && (
//             <Link to="/login" className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
//               <LogIn size={14} />
//               {t('auth.login', 'Sign In')}
//             </Link>
//           )}
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {messages.map(msg => (
//             <ChatMessage key={msg.id} message={msg} />
//           ))}
//           {isLoading && messages[messages.length - 1]?.role === 'user' && (
//             <div className="flex justify-start">
//               <div className="bg-muted text-foreground rounded-lg rounded-bl-none px-3 py-2">
//                 <Loader2 size={16} className="animate-spin text-gold" />
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Quick Actions */}
//         {messages.length <= 1 && (
//           <div className="px-4 pb-2 flex flex-wrap gap-1.5">
//             {quickActions.map(action => (
//               <button
//                 key={action.label}
//                 onClick={() => sendMessage(action.message)}
//                 className="text-xs px-3 py-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
//               >
//                 {action.label}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Login Prompt */}
//         {!user && messages.length > 2 && (
//           <div className="px-4 pb-2">
//             <Link
//               to="/login"
//               className="block text-center text-xs py-2 rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
//             >
//               {t('chatbot.login_prompt', '🔐 Sign in for a personalized legal experience')}
//             </Link>
//           </div>
//         )}

//         <ChatInput isLoading={isLoading} onSend={sendMessage} />
//       </div>
//     </>
//   );
// };

// export default Chatbot;

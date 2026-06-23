import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from './types';
import { cleanContent, extractAndSaveLead, trackChatAnalytics } from './utils';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const MAX_CONTEXT_MESSAGES = 8;

interface UserContext {
  name?: string | null;
  email?: string | null;
}

interface ChatStreamOptions {
  /** Return false to block the send (e.g. guest limit reached). */
  canSend?: (text: string) => boolean;
  /** Fired after a user message is appended to the local state. */
  onUserMessage?: (text: string) => void | Promise<void>;
  /** Fired after the assistant stream completes with the cleaned final content. */
  onAssistantMessage?: (content: string) => void | Promise<void>;
}

export function useChatStream(
  initialMessages: Message[],
  currentLang: string,
  userContext?: UserContext,
  options?: ChatStreamOptions,
) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const resetMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  const saveMessage = useCallback(async (content: string, role: 'user' | 'assistant') => {
    if (!user) return;
    try {
      await supabase.from('messages').insert({ user_id: user.id, content, role });
    } catch { /* non-critical */ }
  }, [user]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (options?.canSend && !options.canSend(text)) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    saveMessage(text, 'user');
    options?.onUserMessage?.(text);


    const contextMessages = updatedMessages
      .slice(-MAX_CONTEXT_MESSAGES)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: contextMessages,
          language: currentLang,
          userContext: userContext?.name ? { name: userContext.name, email: userContext.email } : undefined,
        }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const status = resp.status;
        let errorMsg = "I'm having trouble connecting right now. Please try again or contact us directly.";
        if (status === 429) errorMsg = "I'm receiving too many requests right now. Please wait a moment and try again.";
        if (status === 402) errorMsg = "The service is temporarily unavailable. Please try again later.";
        trackChatAnalytics(text, 0, false, currentLang, user?.id);
        throw new Error(errorMsg);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const display = cleanContent(assistantContent);
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: display } : m)
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      const finalContent = cleanContent(assistantContent);
      extractAndSaveLead(assistantContent);
      saveMessage(finalContent, 'assistant');
      options?.onAssistantMessage?.(finalContent);
      trackChatAnalytics(text, assistantContent.length, true, currentLang, user?.id);

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const fallback = (err as Error).message || "I'm having trouble connecting right now. Please try again or contact us directly.";
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 2).toString(), role: 'assistant', content: fallback },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentLang, saveMessage, user?.id, userContext, options]);

  return { messages, isLoading, sendMessage, resetMessages };
}

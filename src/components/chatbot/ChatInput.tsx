import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';

interface ChatInputProps {
  isLoading: boolean;
  onSend: (text: string) => void;
}

const ChatInput = ({ isLoading, onSend }: ChatInputProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setInput(val), 30);
    // Immediate visual update
    setInput(val);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2">
      <input
        value={input}
        onChange={handleChange}
        placeholder={t('chatbot.placeholder', 'Type a message...')}
        disabled={isLoading}
        className="flex-1 bg-muted border-none rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="p-2 rounded-lg bg-gold text-accent-foreground disabled:opacity-40 hover:bg-gold-dark transition-colors"
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default ChatInput;

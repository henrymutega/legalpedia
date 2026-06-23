import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = memo(({ message }: ChatMessageProps) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
        message.role === 'user'
          ? 'bg-gold text-accent-foreground rounded-br-none'
          : 'bg-muted text-foreground rounded-bl-none'
      }`}
    >
      {message.role === 'assistant' ? (
        <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:my-1 [&>ol]:my-1">
          <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
        </div>
      ) : (
        message.content
      )}
    </div>
  </div>
));

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;

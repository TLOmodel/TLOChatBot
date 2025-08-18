'use client';

import * as React from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-0">
      <div className="relative rounded-2xl border bg-background shadow-lg">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message or type / for commands..."
          className="min-h-[52px] w-full resize-none border-0 bg-transparent py-4 pl-12 pr-28 shadow-none focus-visible:ring-0"
          rows={1}
        />
        <div className="absolute bottom-3 left-4">
          <Button variant="ghost" size="icon" aria-label="Attach file">
            <Paperclip className="size-5" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Use microphone">
            <Mic className="size-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Send message"
            className='rounded-full'
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

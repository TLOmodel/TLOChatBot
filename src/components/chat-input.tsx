'use client';

import * as React from 'react';
import { Paperclip, Mic, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string, attachment?: { name: string; type: string; data: string }) => void;
  isSending?: boolean;
}

export default function ChatInput({ onSend, isSending = false }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
  
  const handleAttachment = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onSend(
          message || `Attached file: ${file.name}`, 
          { name: file.name, type: file.type, data: dataUrl }
        );
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          disabled={isSending}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <div className="absolute bottom-3 left-4">
          <Button variant="ghost" size="icon" aria-label="Attach file" onClick={handleAttachment} disabled={isSending}>
            <Paperclip className="size-5" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Use microphone" disabled={isSending}>
            <Mic className="size-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            aria-label="Send message"
            className='rounded-full'
          >
            {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

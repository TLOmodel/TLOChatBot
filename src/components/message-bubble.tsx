'use client';

import * as React from 'react';
import { Copy, RefreshCw, Bot, User, Loader2, Paperclip, Download } from 'lucide-react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import FormattedContent from '@/components/formatted-content';
import { useToast } from '@/hooks/use-toast';
import { TloLogo } from './tlo-logo';

interface MessageBubbleProps {
  message: Message;
  onRegenerate: (messageId: string) => void;
  isPending?: boolean;
}

function AttachmentPill({ attachment }: { attachment: NonNullable<Message['attachment']> }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border bg-background/50 p-2 text-sm">
      <Paperclip className="size-4" />
      <span className="flex-1 truncate">{attachment.name}</span>
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleDownload}>
        <Download className="size-4" />
      </Button>
    </div>
  )
}

export default function MessageBubble({ message, onRegenerate, isPending }: MessageBubbleProps) {
  const isUser = message.author === 'user';
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      description: 'Message copied to clipboard.',
    });
  };

  if (isPending && !isUser && !message.content) {
    return (
        <div className="group relative flex w-full animate-bubble-in items-start gap-4 justify-start">
             <div className="flex-shrink-0 rounded-full border bg-card p-2">
                <TloLogo className="size-5 text-primary" />
            </div>
            <div className={cn('max-w-xl rounded-2xl p-4 rounded-tl-none bg-card border')}>
                <Loader2 className="size-5 animate-spin text-primary" />
            </div>
        </div>
    )
  }


  return (
    <div
      className={cn(
        'group relative flex w-full animate-bubble-in items-start gap-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 rounded-full border bg-card p-2">
          <TloLogo className="size-5 text-primary" />
        </div>
      )}

      <div
        className={cn('max-w-xl rounded-2xl p-4', {
          'bg-gradient-to-br from-primary/90 to-primary text-primary-foreground': isUser,
          'rounded-tl-none bg-card border': !isUser,
        })}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-current">
          <FormattedContent content={message.content} />
          {message.attachment && <AttachmentPill attachment={message.attachment} />}
        </div>
        {message.timestamp && <div className="mt-2 text-xs opacity-70">{message.timestamp}</div>}
      </div>

      {isUser && (
        <div className="flex-shrink-0 rounded-full border bg-card p-2">
          <User className="size-5 text-foreground" />
        </div>
      )}

      {!isUser && message.userPrompt && (
        <div className="absolute -bottom-4 right-1/2 flex translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
           <div className="flex items-center gap-1 rounded-full border bg-card p-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
            >
                <Copy className="size-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRegenerate(message.id)}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            </Button>
           </div>
        </div>
      )}
    </div>
  );
}

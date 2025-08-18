'use client';

import * as React from 'react';
import { Copy, RefreshCw, Bot, User, Loader2 } from 'lucide-react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import FormattedContent from '@/components/formatted-content';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
  onRegenerate: (messageId: string) => void;
  isPending: boolean;
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

  return (
    <div
      className={cn(
        'group relative flex w-full animate-bubble-in items-start gap-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 rounded-full border bg-card p-2">
          <Bot className="size-5 text-primary" />
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
        </div>
        <div className="mt-2 text-xs opacity-70">{message.timestamp}</div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 rounded-full border bg-card p-2">
          <User className="size-5 text-foreground" />
        </div>
      )}

      {!isUser && (
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

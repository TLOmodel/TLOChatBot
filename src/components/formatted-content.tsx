'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FormattedContentProps {
  content: string;
}

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ description: 'Code copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg bg-muted p-4 font-code">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7"
        onClick={onCopy}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const InlineFormattedText = ({ text }: { text: string }) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  
    return (
      <p>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={i} className="font-code bg-muted px-1.5 py-1 rounded text-sm">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        })}
      </p>
    );
  };
  

export default function FormattedContent({ content }: FormattedContentProps) {
  const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
  const parts = content.split(codeBlockRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a code block
          return <CodeBlock key={index} code={part.trim()} />;
        } else {
          // This is regular text
          const lines = part.split('\n').filter(line => line.trim() !== '');
          return (
            <div key={index} className="space-y-4">
              {lines.map((line, lineIndex) => (
                <InlineFormattedText key={lineIndex} text={line} />
              ))}
            </div>
          );
        }
      })}
    </>
  );
}

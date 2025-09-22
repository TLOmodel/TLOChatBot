'use client';

import * as React from 'react';
import { Paperclip, Mic, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, attachment?: { name: string; type: string; data: string }) => void;
  isSending?: boolean;
}

export default function ChatInput({ onSend, isSending = false }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const [stagedAttachment, setStagedAttachment] = React.useState<{ name: string; type: string; data: string } | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [isRecording, setIsRecording] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    if (message.trim() || stagedAttachment) {
      onSend(message, stagedAttachment as any);
      setMessage('');
      setStagedAttachment(null);
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
        setStagedAttachment({ name: file.name, type: file.type, data: dataUrl });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAttachment = () => {
    setStagedAttachment(null);
  }

  const handleVoiceClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
          setIsRecording(true);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setMessage(message + finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognition.start();
      } else {
        alert("Sorry, your browser doesn't support speech recognition.");
      }
    }
  };


  return (
    <div className="container mx-auto max-w-4xl p-0">
      <div className="relative rounded-2xl border bg-background shadow-lg">
        {stagedAttachment && (
            <div className="flex items-center gap-2 p-2 mx-4 mt-2 rounded-lg border bg-background/50 text-sm">
                <Paperclip className="size-4" />
                <span className="flex-1 truncate">{stagedAttachment.name}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={clearAttachment}>
                    <X className="size-4" />
                </Button>
            </div>
        )}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message or type / for commands..."
          className={cn("min-h-[52px] w-full resize-none border-0 bg-transparent py-4 pl-12 pr-28 shadow-none focus-visible:ring-0",
             stagedAttachment ? 'pl-4' : 'pl-12'
          )}
          rows={1}
          disabled={isSending}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {!stagedAttachment && (
          <div className="absolute bottom-0 left-3 top-0 flex items-center">
            <Button variant="ghost" size="icon" aria-label="Attach file" onClick={handleAttachment} disabled={isSending}>
              <Paperclip className="size-5" />
            </Button>
          </div>
        )}
        <div className="absolute bottom-0 right-4 top-0 flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Use microphone" onClick={handleVoiceClick} disabled={isSending} className={cn(isRecording && "bg-destructive text-destructive-foreground")}>
            <Mic className="size-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!message.trim() && !stagedAttachment) || isSending}
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

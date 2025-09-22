

'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  ChevronsRight,
  Plus,
  Search,
  Database,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Conversation, Message } from '@/lib/types';
import ChatHeader from '@/components/chat-header';
import MessageBubble from '@/components/message-bubble';
import ChatInput from '@/components/chat-input';
import { handleRegenerate, handleChat } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function ChatInterface() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeConversation = React.useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  
  const filteredConversations = React.useMemo(() => 
    conversations.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
  , [conversations, searchTerm]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const createNewChat = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      preview: 'Start a new conversation',
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newId);
  };

  const handleSendMessage = (content: string, attachment?: { name: string; type: string; data: string }) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      id: uuidv4(),
      author: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment,
    };

    const optimisticConversations = conversations.map((conv) =>
      conv.id === activeConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: conv.title === 'New Chat' ? content.substring(0, 30) : conv.title,
            preview: `You: ${content.substring(0,30)}...`
          }
        : conv
    );
    setConversations(optimisticConversations);
    
    startTransition(async () => {
      const history = (activeConversation?.messages ?? []).map(m => ({
          role: m.author === 'user' ? 'user' : 'model' as const,
          content: [{text: m.content}]
      }))
      
      const chatInput = { 
        message: content, 
        history,
        attachment: attachment ? {
            dataUri: attachment.data,
            contentType: attachment.type
        } : undefined
      };

      const result = await handleChat(chatInput);
      
      const convsWithUserMessage = conversations.map(c => 
        c.id === activeConversationId
        ? {
            ...c,
            messages: [...c.messages, userMessage],
          }
        : c
        );

      const resultConvs = convsWithUserMessage.map((conv) => {
        if (conv.id === activeConversationId) {
          const aiMessage: Message = {
            id: uuidv4(),
            author: 'ai',
            content: result.success ? result.response! : `Sorry, something went wrong. ${result.error}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userPrompt: content,
          };
          return {
            ...conv,
            messages: [...conv.messages, aiMessage],
            title: conv.title === 'New Chat' ? content.substring(0, 30) : conv.title,
            preview: `AI: ${result.success ? result.response!.substring(0,30) : '...'}...`
          };
        }
        return conv;
      })

      setConversations(resultConvs);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'AI Response Error',
          description: result.error,
        });
      }
    });
  };

  const onRegenerate = (messageId: string) => {
    if (!activeConversation) return;

    const messageIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || !activeConversation.messages[messageIndex].userPrompt) return;

    const messageToRegenerate = activeConversation.messages[messageIndex];
    
    // Find the original user message that prompted this AI response.
    let userPromptMessage: Message | undefined;
    for (let i = messageIndex -1; i >= 0; i--) {
        if(activeConversation.messages[i].author === 'user') {
            userPromptMessage = activeConversation.messages[i];
            break;
        }
    }

    startTransition(async () => {
      const optimisticConversations = conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === messageId ? { ...m, isRegenerating: true } : m
            ),
          };
        }
        return conv;
      });
      setConversations(optimisticConversations);

      const result = await handleRegenerate({
        previousResponse: messageToRegenerate.content,
        userPrompt: messageToRegenerate.userPrompt!,
      });

      const finalConversations = conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((m) => {
              if (m.id === messageId) {
                const updatedMessage = { ...m, isRegenerating: false };
                if (result.success) {
                  updatedMessage.content = result.newResponse!;
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Regeneration Failed',
                        description: result.message || result.error,
                    });
                }
                return updatedMessage;
              }
              return m;
            }),
          };
        }
        return conv;
      });
      setConversations(finalConversations);
    });
  };
  
  const handleClearConversation = () => {
    if (!activeConversationId) return;
    const updatedConversations = conversations.map(c => 
        c.id === activeConversationId ? {...c, messages: [], preview: 'Conversation cleared'} : c
    );
    setConversations(updatedConversations);
  }

  const handleDownloadConversation = () => {
    if (!activeConversation) return;
    const content = activeConversation.messages.map(m => `[${m.timestamp}] ${m.author.toUpperCase()}: ${m.content}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleEditTitle = (newTitle: string) => {
    if (!activeConversationId) return;
    const updatedConversations = conversations.map(c => 
        c.id === activeConversationId ? {...c, title: newTitle} : c
    );
    setConversations(updatedConversations);
  };


  // Effect to create a new chat on initial load if none exist
  React.useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-sidebar">
        <Sidebar className="group transition-all duration-300 ease-in-out" collapsible="icon">
          <SidebarHeader className="h-16 items-center">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Image src="/tlo_logo.jpg" alt="TLO Logo" width={32} height={32} className="rounded-md" />
                <h1 className="text-xl font-semibold text-foreground">
                    TLO
                </h1>
            </div>
            <div className="flex w-full items-center justify-end group-data-[collapsible=icon]:justify-center">
               <SidebarTrigger className="flex md:hidden" />
               <ChevronsRight className="hidden size-4 cursor-pointer text-muted-foreground transition hover:text-foreground group-data-[collapsible=icon]:block" />
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search conversations..." 
                        className="rounded-lg pl-8 group-data-[collapsible=icon]:hidden"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={createNewChat} className="w-full justify-start gap-2 rounded-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:aspect-square">
                    <Plus className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
                </Button>
            </div>
            
            <SidebarMenu className="mt-4">
              {filteredConversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveConversationId(conv.id)}
                    isActive={activeConversationId === conv.id}
                    className="group/btn h-auto flex-col items-start gap-0.5 whitespace-normal py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:py-2"
                    tooltip={{children: conv.title, side: "right"}}
                  >
                    <span className="font-semibold">{conv.title}</span>
                    <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                      {conv.preview}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <ThemeToggle />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/knowledge-base" className="w-full">
                    <SidebarMenuButton tooltip={{children: "Knowledge Base", side:"right"}} className="w-full">
                        <Database className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Knowledge Base</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
            <ChatHeader 
                title={activeConversation?.title ?? 'New Chat'} 
                onClear={handleClearConversation}
                onDownload={handleDownloadConversation}
                onEditTitle={handleEditTitle}
            />
            <ScrollArea className="flex-1">
                <div className="container mx-auto max-w-4xl p-4 space-y-8">
                    {activeConversation?.messages.map((message) => (
                        <MessageBubble 
                            key={message.id} 
                            message={message} 
                            onRegenerate={onRegenerate}
                            isPending={isPending && message.isRegenerating}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <div className="sticky bottom-0 bg-background/80 pb-4 pt-2 backdrop-blur-sm">
                 <ChatInput onSend={handleSendMessage} isSending={isPending} />
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

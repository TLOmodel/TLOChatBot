'use client';

import * as React from 'react';
import {
  ChevronsRight,
  Download,
  Edit,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockConversations } from '@/lib/data';
import type { Conversation, Message } from '@/lib/types';
import ChatHeader from '@/components/chat-header';
import MessageBubble from '@/components/message-bubble';
import ChatInput from '@/components/chat-input';
import { handleRegenerate } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ChatInterface() {
  const [conversations, setConversations] = React.useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = React.useState<string>('conv1');
  const [isPending, startTransition] = React.useTransition();

  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeConversation = React.useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const addMessage = (content: string) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      author: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConversationId
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    );
    setConversations(updatedConversations);
  };
  
  const onRegenerate = (messageId: string) => {
    if (!activeConversation) return;

    const messageIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1 || !activeConversation.messages[messageIndex].userPrompt) return;

    const messageToRegenerate = activeConversation.messages[messageIndex];

    startTransition(async () => {
      // Set regenerating state
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

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-sidebar">
        <Sidebar className="group transition-all duration-300 ease-in-out" collapsible="icon">
          <SidebarHeader className="h-16 items-center">
            <h1 className="text-xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
              Chatterbox Clone
            </h1>
            <div className="flex w-full items-center justify-end group-data-[collapsible=icon]:justify-center">
               <SidebarTrigger className="flex md:hidden" />
               <ChevronsRight className="hidden size-4 cursor-pointer text-muted-foreground transition hover:text-foreground group-data-[collapsible=icon]:block" />
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="rounded-lg pl-8 group-data-[collapsible=icon]:hidden" />
                </div>
                <Button className="w-full justify-start gap-2 rounded-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:aspect-square">
                    <Plus className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
                </Button>
            </div>
            
            <SidebarMenu className="mt-4">
              {conversations.map((conv) => (
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
                    <SidebarMenuButton tooltip={{children: "Settings", side:"right"}}>
                        <Settings className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: "Profile", side:"right"}}>
                        <User className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
            <ChatHeader title={activeConversation?.title ?? 'New Chat'} />
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
                 <ChatInput onSend={addMessage} />
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Download, Edit, Trash2 } from 'lucide-react';
import * as React from 'react';

interface ChatHeaderProps {
  title: string;
}

export default function ChatHeader({ title }: ChatHeaderProps) {
    const { isMobile } = useSidebar();
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Edit title">
          <Edit className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Export chat">
          <Download className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Clear chat">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </header>
  );
}

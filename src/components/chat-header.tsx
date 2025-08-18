'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Download, Edit, Trash2 } from 'lucide-react';
import * as React from 'react';

interface ChatHeaderProps {
  title: string;
  onClear: () => void;
  onDownload: () => void;
  onEditTitle: (newTitle: string) => void;
}

export default function ChatHeader({ title, onClear, onDownload, onEditTitle }: ChatHeaderProps) {
  const { isMobile } = useSidebar();
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentTitle, setCurrentTitle] = React.useState(title);

  React.useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    onEditTitle(currentTitle);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        {isEditing ? (
          <input
            type="text"
            value={currentTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-lg font-bold tracking-tight bg-transparent border-none focus:ring-0"
          />
        ) : (
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Edit title" onClick={handleEditClick}>
          <Edit className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Export chat" onClick={onDownload}>
          <Download className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Clear chat" onClick={onClear}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </header>
  );
}

export interface Message {
  id: string;
  author: 'user' | 'ai';
  content: string;
  timestamp: string;
  userPrompt?: string;
  isRegenerating?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  preview: string;
}

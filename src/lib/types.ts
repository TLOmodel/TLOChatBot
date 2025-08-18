export interface Message {
  id: string;
  author: 'user' | 'ai';
  content: string;
  timestamp: string;
  userPrompt?: string;
  isRegenerating?: boolean;
  attachment?: {
    name: string;
    type: string;
    data: string;
  };
}

export interface Conversation {
  id:string;
  title: string;
  messages: Message[];
  preview: string;
}


export type Role = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}

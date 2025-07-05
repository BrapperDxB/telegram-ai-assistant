export enum View {
  Dashboard = 'dashboard',
  Keywords = 'keywords',
  Chats = 'chats',
  Settings = 'settings',
}

export interface Match {
  id: string;
  author: string;
  chatName: string;
  chatLink: string;
  message: string;
  timestamp: string;
  keyword: string; // The keyword that was matched
}

export interface Stats {
    keywords: number;
    chats: number;
    matches: number;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'uninstantiated';
// File: src/types/index.ts
// Common Types
export interface NavItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  color?: string;
  onClick?: () => void;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  verified?: boolean;
  color: string;
}

export interface PinnedChat {
  id: string;
  title: string;
  preview: string;
  date: string;
  icon: 'sheet' | 'doc' | 'form' | 'slide' | 'folder';
  color: string;
}

export interface SavedTopic {
  id: string;
  title: string;
  timestamp: string;
  isStarred: boolean;
  tags?: string[];
}

export interface RecentChat {
  id: string;
  title: string;
  timestamp: string;
  preview?: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  description?: string;
  onClick?: () => void;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size?: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
}

export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoSave: boolean;
  modelPreference: string;
}
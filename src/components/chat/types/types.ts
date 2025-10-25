export interface User {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  status: 'online' | 'away' | 'offline';
  email: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'channel';
  unread?: number;
  memberCount: number;
  isPrivate: boolean;
}

export interface DirectMessage {
  id: string;
  name: string;
  type: 'dm';
  userId: string;
  avatar: string;
  initials: string;
  status: 'online' | 'away' | 'offline';
  unread?: number;
}

export interface Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  timestamp: string;
  read: boolean;
  reactions?: Reaction[];
  replyTo?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
  phone?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  groupId: number;
  createdAt: string;
  author?: User;
}

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  groupId: number;
}

export interface Group {
  id: number;
  name: string;
  kindergartenName: string;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  sender?: User;
  recipient?: User;
}

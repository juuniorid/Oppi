export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
  phone?: string;
}

export interface Post {
  id: number;
  groupId: number;
  createdByUserId: number;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
}

export interface Group {
  id: number;
  name?: string | null;
  description?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
}

export interface Message {
  id: number;
  senderUserId: number;
  recipientUserId: number;
  subject?: string | null;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

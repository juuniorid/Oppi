import { AttendanceStatus, EventType, UserRole } from '@/types/enums';

export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  phone?: string;
  groupIds?: number[];
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
  groupId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
}

export type CreateChildPayload = {
  firstName: string;
  lastName: string;
  groupId?: number;
  dateOfBirth: string;
  notes?: string;
};

export type UpdateChildPayload = Partial<CreateChildPayload>;

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
export type UpdateEventPayload = CreateEventPayload;

export type AbsenceEntry = {
  id: number;
  childId: number;
  firstName?: string;
  lastName?: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  userId: number;
};

export type CreateAbsencePayload = {
  childId: number;
  from: string;
  to: string;
  status: AttendanceStatus;
  note?: string;
};

export type EventEntry = {
  id: number;
  name: string;
  time: string;
  description: string;
  date: string;
  type: EventType;
};

export type CreateEventPayload = {
  groupId: number;
  from: string;
  to: string;
  timeFrom: string;
  timeTo: string;
  name: string;
  description?: string;
  type: EventType;
};

import { NewMessage } from 'database/schema';

export class CreateMessageDto implements Omit<
  NewMessage,
  'id' | 'senderUserId' | 'readAt' | 'deletedAt' | 'createdAt' | 'updatedAt'
> {
  recipientUserId: number;
  subject?: string;
  body?: string;

  constructor(recipientUserId: number, subject?: string, body?: string) {
    this.recipientUserId = recipientUserId;
    this.subject = subject;
    this.body = body;
  }
}

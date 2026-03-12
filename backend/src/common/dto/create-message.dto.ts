import { NewMessage } from 'database/schema';

export class CreateMessageDto implements Omit<
  NewMessage,
  'id' | 'senderUserId' | 'readAt' | 'createdAt' | 'updatedAt'
> {
  recipientUserId: number;
  subject?: string;
  body?: string;

  constructor(recipientUserId: number, body?: string, subject?: string) {
    this.recipientUserId = recipientUserId;
    this.body = body;
    this.subject = subject;
  }
}

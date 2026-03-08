import { NewMessage } from 'database/schema';

export class CreateMessageDto implements Omit<NewMessage, 'id' | 'senderId' | 'timestamp'> {
  recipientId: number;
  content: string;

  constructor(recipientId: number, content: string) {
    this.recipientId = recipientId;
    this.content = content;
  }
}

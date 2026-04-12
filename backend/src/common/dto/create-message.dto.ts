import { NewMessage } from 'database/schema';

export class CreateMessageDto implements Omit<NewMessage, 'id' | 'timestamp'> {
  userId: number;
  title: string;
  message: string;

  constructor(userId: number, title: string, message: string) {
    this.userId = userId;
    this.title = title;
    this.message = message;
  }
}

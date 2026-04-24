import { NewNotification } from 'database/schema';

export class CreateNotificationDto implements Partial<NewNotification> {
  userId: number;
  subject: string;
  body: string;

  constructor(userId: number, subject: string, body: string) {
    this.userId = userId;
    this.subject = subject;
    this.body = body;
  }
}

export class CreateMessageDto {
  recipientUserId: number;
  subject?: string;
  body?: string;

  constructor(recipientUserId: number, subject?: string, body?: string) {
    this.recipientUserId = recipientUserId;
    this.subject = subject;
    this.body = body;
  }
}

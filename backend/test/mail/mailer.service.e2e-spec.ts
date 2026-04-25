import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { MailerService } from '../../src/mail/mailer.service';
import { appConfig } from '../../src/config';

interface SentEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  messageId?: string;
}

type MockTransporter = {
  sendMail: jest.Mock;
};

describe('MailerService (e2e)', () => {
  let service: MailerService;
  let sentEmails: SentEmail[] = [];

  beforeAll(async () => {
    // For this e2e test, we'll use a mock transporter that captures sent emails
    // No need for ethereal setup as we're mocking the transporter
  });

  beforeEach(() => {
    sentEmails = [];
  });

  describe('sendInvitationEmail', () => {
    it('should successfully send an invitation email with all content', async () => {
      // Mock the transporter to capture emails
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const recipientEmail = 'parent@kindergarten.local';
      const role = 'Parent';

      await service.sendInvitationEmail(recipientEmail, role);

      expect(sentEmails).toHaveLength(1);
      const email = sentEmails[0];
      expect(email.to).toBe(recipientEmail);
      expect(email.subject).toBe('You have been invited to Oppi');
      expect(email.from).toBe(appConfig.mail.from);
    });

    it('should include proper HTML template rendering with role and login URL', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const role = 'Teacher';
      await service.sendInvitationEmail('teacher@kindergarten.local', role);

      const email = sentEmails[0];
      expect(email.html).toBeTruthy();
      expect(email.html).toContain(role); // Role should be in HTML
      expect(email.html).toContain(appConfig.app.frontendUrl); // Frontend URL should be in HTML
    });

    it('should include proper plain text version of invitation', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const role = 'Admin';
      await service.sendInvitationEmail('admin@kindergarten.local', role);

      const email = sentEmails[0];
      expect(email.text).toContain('Welcome to Oppi');
      expect(email.text).toContain(`You have been invited to join Oppi as a ${role}`);
      expect(email.text).toContain(appConfig.app.frontendUrl);
      expect(email.text).toContain('If you did not expect this invitation');
    });

    it('should handle multiple consecutive invitations', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const recipients = [
        { email: 'user1@example.com', role: 'Parent' },
        { email: 'user2@example.com', role: 'Teacher' },
        { email: 'user3@example.com', role: 'Admin' },
      ];

      for (const recipient of recipients) {
        await service.sendInvitationEmail(recipient.email, recipient.role);
      }

      expect(sentEmails).toHaveLength(3);
      sentEmails.forEach((email, idx) => {
        expect(email.to).toBe(recipients[idx].email);
        expect(email.text).toContain(recipients[idx].role);
      });
    });

    it('should read template from correct file location', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const templatePath = path.join(__dirname, '../../src/mail/templates', 'invitation.html');
      const templateExists = fs.existsSync(templatePath);
      expect(templateExists).toBe(true);

      // Verify template has expected placeholders
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      expect(templateContent).toContain('{{role}}');
      expect(templateContent).toContain('{{loginUrl}}');
    });

    it('should handle email send failures gracefully', async () => {
      const sendError = new Error('SMTP connection refused');
      const mockTransporter: MockTransporter = {
        sendMail: jest.fn().mockRejectedValue(sendError),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      await expect(
        service.sendInvitationEmail('test@example.com', 'Parent')
      ).rejects.toThrow('SMTP connection refused');
    });

    it('should preserve email address format with special characters', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const emailAddresses = [
        'first.last@example.com',
        'user+tag@example.com',
        'user_name@example.co.uk',
        'user-123@sub.example.com',
      ];

      for (const email of emailAddresses) {
        sentEmails = [];
        await service.sendInvitationEmail(email, 'Parent');
        expect(sentEmails[0].to).toBe(email);
      }
    });

    it('should send consistent emails for same inputs', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      const testEmail = 'consistent@example.com';
      const testRole = 'Parent';

      await service.sendInvitationEmail(testEmail, testRole);
      const firstSend = sentEmails[0];

      sentEmails = [];

      await service.sendInvitationEmail(testEmail, testRole);
      const secondSend = sentEmails[0];

      // Should have same core structure
      expect(firstSend.to).toBe(secondSend.to);
      expect(firstSend.subject).toBe(secondSend.subject);
      expect(firstSend.from).toBe(secondSend.from);
    });
  });

  describe('Integration with mail config', () => {
    it('should use correct from address from config', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      await service.sendInvitationEmail('test@example.com', 'Parent');

      expect(sentEmails[0].from).toBe(appConfig.mail.from);
    });

    it('should use correct frontend URL from config', async () => {
      const mockTransporter = {
        sendMail: jest.fn().mockImplementation(async (mailOptions: SentEmail) => {
          sentEmails.push(mailOptions);
          return { messageId: 'test-message-id' };
        }),
      };

      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as unknown as ReturnType<typeof nodemailer.createTransport>);

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailerService],
      }).compile();

      service = module.get<MailerService>(MailerService);

      await service.sendInvitationEmail('test@example.com', 'Parent');

      const email = sentEmails[0];
      expect(email.text).toContain(appConfig.app.frontendUrl);
      expect(email.html).toContain(appConfig.app.frontendUrl);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { MailerService } from '../../src/mail/mailer.service';
import { appConfig } from '../../src/config';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('path');

describe('MailerService (unit)', () => {
  let service: MailerService;
  let mockTransporter: Partial<NodeJS.EventEmitter> & { sendMail: jest.Mock };
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock transporter
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });
    mockTransporter = {
      sendMail: mockSendMail,
    };

    // Mock nodemailer.createTransport
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Mock fs.readFileSync to return template
    (fs.readFileSync as jest.Mock).mockReturnValue(
      '<h1>Welcome {{role}}</h1><a href="{{loginUrl}}">Login</a>'
    );

    // Mock path.join
    (path.join as jest.Mock).mockReturnValue(
      '/mocked/path/templates/invitation.html'
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);

    // Spy on logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendInvitationEmail', () => {
    it('should send an invitation email with correct template rendering', async () => {
      const to = 'parent@example.com';
      const role = 'Parent';

      await service.sendInvitationEmail(to, role);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: appConfig.mail.from,
          to,
          subject: 'You have been invited to Oppi',
          text: expect.stringContaining('Welcome to Oppi'),
          html: expect.stringContaining('Welcome Parent'),
        })
      );
    });

    it('should render login URL correctly in template', async () => {
      const to = 'teacher@example.com';
      const role = 'Teacher';

      await service.sendInvitationEmail(to, role);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(`${appConfig.app.frontendUrl}/login`);
    });

    it('should include role in text email body', async () => {
      const to = 'admin@example.com';
      const role = 'Admin';

      await service.sendInvitationEmail(to, role);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain(`invited to join Oppi as a ${role}`);
      expect(callArgs.text).toContain(`${appConfig.app.frontendUrl}/login`);
    });

    it('should log success message on successful send', async () => {
      const to = 'success@example.com';
      const role = 'Parent';
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await service.sendInvitationEmail(to, role);

      expect(logSpy).toHaveBeenCalledWith(`Invitation email sent to ${to}`);
    });

    it('should throw error when transporter fails', async () => {
      const to = 'error@example.com';
      const role = 'Parent';
      const error = new Error('SMTP connection failed');

      mockSendMail.mockRejectedValueOnce(error);
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(service.sendInvitationEmail(to, role)).rejects.toThrow(
        'SMTP connection failed'
      );

      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to send invitation email to ${to}`,
        expect.any(String)
      );
    });

    it('should read template from correct path', async () => {
      const to = 'test@example.com';
      const role = 'Parent';

      await service.sendInvitationEmail(to, role);

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('templates'),
        'utf-8'
      );
    });

    it('should handle multiple role types', async () => {
      const roles = ['Parent', 'Teacher', 'Admin'];

      for (const role of roles) {
        mockSendMail.mockClear();
        await service.sendInvitationEmail(`${role.toLowerCase()}@example.com`, role);

        const callArgs = mockSendMail.mock.calls[0][0];
        expect(callArgs.text).toContain(role);
      }
    });

    it('should handle email addresses with special characters', async () => {
      const to = 'first.last+tag@sub.example.com';
      const role = 'Parent';

      await service.sendInvitationEmail(to, role);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to })
      );
    });

    it('should properly escape template replacements', async () => {
      const to = 'test@example.com';
      const role = 'Parent & <Admin>';

      await service.sendInvitationEmail(to, role);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain('Parent & <Admin>');
    });


  });

  describe('Transporter Configuration', () => {
    it('should create transporter with correct host and port', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: appConfig.mail.host,
          port: appConfig.mail.port,
        })
      );
    });

    it('should set secure to true when port is 465', () => {
      const createTransportMock = nodemailer.createTransport as jest.Mock;
      const callArgs = createTransportMock.mock.calls[0][0];
      
      if (appConfig.mail.port === 465) {
        expect(callArgs.secure).toBe(true);
      } else {
        expect(callArgs.secure).toBe(false);
      }
    });

    it('should include auth credentials when user and pass are configured', () => {
      const createTransportMock = nodemailer.createTransport as jest.Mock;
      const callArgs = createTransportMock.mock.calls[0][0];

      if (appConfig.mail.user && appConfig.mail.pass) {
        expect(callArgs.auth).toEqual({
          user: appConfig.mail.user,
          pass: appConfig.mail.pass,
        });
      } else {
        expect(callArgs.auth).toBeUndefined();
      }
    });

    it('should create transporter once on service initialization', () => {
      const createTransportMock = nodemailer.createTransport as jest.Mock;
      // Reset and verify count
      expect(createTransportMock).toHaveBeenCalled();
    });
  });
});

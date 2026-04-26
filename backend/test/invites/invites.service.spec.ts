import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { InvitesService } from '../../src/invites/invites.service';
import { MailerService } from '../../src/mail/mailer.service';
import { User } from 'database/schema';

// Mock the database module
jest.mock('database/db', () => {
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockLimit = jest.fn();
  const mockValues = jest.fn();
  const mockReturning = jest.fn();

  return {
    db: {
      select: mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      }),
      insert: mockInsert.mockReturnValue({
        values: mockValues.mockReturnValue({
          returning: mockReturning,
        }),
      }),
    },
    __mocks: { mockSelect, mockInsert, mockFrom, mockWhere, mockLimit, mockValues, mockReturning },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __mocks } = require('database/db');

describe('InvitesService', () => {
  let service: InvitesService;
  let mailerService: MailerService;

  const mockCreatedUser: User = {
    id: 10,
    email: 'teacher@example.com',
    firstName: null,
    lastName: null,
    googleId: null,
    role: 'TEACHER',
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegisteredUser: User = {
    ...mockCreatedUser,
    googleId: 'google-123',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        {
          provide: MailerService,
          useValue: {
            sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<InvitesService>(InvitesService);
    mailerService = module.get<MailerService>(MailerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvite', () => {
    it('should create a user and send an invitation email', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([]);
      __mocks.mockReturning.mockResolvedValueOnce([mockCreatedUser]);

      const dto = { email: 'teacher@example.com', role: 'TEACHER' as const };
      const result = await service.createInvite(dto);

      expect(result).toEqual(mockCreatedUser);
      expect(mailerService.sendInvitationEmail).toHaveBeenCalledWith('teacher@example.com', 'TEACHER');
    });

    it('should throw ConflictException if email is already fully registered', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([mockRegisteredUser]);

      const dto = { email: 'teacher@example.com', role: 'TEACHER' as const };

      await expect(service.createInvite(dto)).rejects.toThrow(ConflictException);
      expect(mailerService.sendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should resend invitation if user was invited but has not logged in yet', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([mockCreatedUser]); // existing, googleId is null

      const dto = { email: 'teacher@example.com', role: 'TEACHER' as const };
      const result = await service.createInvite(dto);

      expect(result).toEqual(mockCreatedUser);
      expect(mailerService.sendInvitationEmail).toHaveBeenCalledWith('teacher@example.com', 'TEACHER');
      // Should NOT have tried to insert a new user
      expect(__mocks.mockInsert).not.toHaveBeenCalled();
    });

    it('should retry email sending on failure and succeed', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([]);
      __mocks.mockReturning.mockResolvedValueOnce([mockCreatedUser]);

      jest.spyOn(mailerService, 'sendInvitationEmail')
        .mockRejectedValueOnce(new Error('SMTP timeout'))
        .mockResolvedValueOnce(undefined);

      const dto = { email: 'teacher@example.com', role: 'TEACHER' as const };
      const result = await service.createInvite(dto);

      expect(result).toEqual(mockCreatedUser);
      expect(mailerService.sendInvitationEmail).toHaveBeenCalledTimes(2);
    });

    it('should succeed even after all email retries are exhausted (email failure is non-fatal)', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([]);
      __mocks.mockReturning.mockResolvedValueOnce([mockCreatedUser]);

      const smtpError = new Error('SMTP connection refused');
      jest.spyOn(mailerService, 'sendInvitationEmail')
        .mockRejectedValue(smtpError);

      const dto = { email: 'teacher@example.com', role: 'TEACHER' as const };

      const result = await service.createInvite(dto);
      expect(result).toEqual(mockCreatedUser);
      expect(mailerService.sendInvitationEmail).toHaveBeenCalledTimes(3);
    });
  });
});

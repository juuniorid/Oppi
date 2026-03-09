import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import * as database from 'database/db';
import { User } from 'database/schema';

jest.mock('database/db');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockDb: { select: jest.Mock; insert: jest.Mock; update: jest.Mock };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google_123',
    role: 'PARENT',
    phone: null,
  };

 beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      }),
    };
    // This cast is safer than 'any'
    (database as unknown as Record<string, unknown>).db = mockDb;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked_jwt_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthLogin', () => {
    it('should return existing user if already registered with googleId', async () => {
      const oauthUser = {
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google_123',
      };
      const result = await service.validateOAuthLogin(oauthUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
    it('should throw UnauthorizedException if email is not invited', async () => {
      // Simulate empty database hit (no user with this email)
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);
      const strangersOauthUser = {
        email: 'stranger@example.com',
        name: 'Stranger',
        googleId: 'google_789',
      };
      await expect(service.validateOAuthLogin(strangersOauthUser)).rejects.toThrow(
        'You are not invited to this platform. Please contact an administrator.'
      );
    });
    it('should link googleId and return user if email is invited but googleId is missing', async () => {
      // User exists in DB but googleId is null
      const invitedUser = { ...mockUser, googleId: null };
      mockDb.select().from().where().limit.mockResolvedValueOnce([invitedUser]);
      
      mockDb.update.mockReturnValueOnce({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ ...mockUser, googleId: 'google_123' }]),
      }),
    }),
  });
  const oauthUser = {
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google_123',
  };
  const result = await service.validateOAuthLogin(oauthUser);
  expect(mockDb.update).toHaveBeenCalled();
  expect(result.googleId).toBe('google_123');
});
  });
  
  describe('login', () => {
    it('should return a jwt token', async () => {
      const token = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(token).toBe('mocked_jwt_token');
    });
  });
});

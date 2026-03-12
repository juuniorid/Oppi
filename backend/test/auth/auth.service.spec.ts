import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import * as database from 'database/db';
import { User } from 'database/schema';

jest.mock('database/db');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockDb: { select: jest.Mock; insert: jest.Mock };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    googleId: 'google_123',
    role: 'PARENT',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    };

    (
      database as unknown as { db: { select: jest.Mock; insert: jest.Mock } }
    ).db = mockDb;

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
    it('should return existing user if already registered', async () => {
      const oauthUser = {
        email: 'test@example.com',
        googleId: 'google_123',
      };

      const result = await service.validateOAuthLogin(oauthUser);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should create and return new user if not registered', async () => {
      mockDb.select().from().where().limit.mockResolvedValueOnce([]);

      const newOauthUser = {
        email: 'newuser@example.com',
        googleId: 'google_456',
      };

      const result = await service.validateOAuthLogin(newOauthUser);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
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

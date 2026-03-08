import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { User } from 'database/schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google_123',
    role: 'PARENT',
    phone: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue('mocked_jwt_token'),
            validateOAuthLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user from request', async () => {
      const mockRequest = { user: mockUser } as any;

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});

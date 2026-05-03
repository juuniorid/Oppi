import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { ROLE, User } from 'database/schema';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    googleId: 'google_123',
    role: ROLE.Parent,
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthProfile = {
    ...mockUser,
    groupIds: [1, 2],
  };

  const authServiceMock = {
    login: jest.fn().mockResolvedValue('mocked_jwt_token'),
    validateOAuthLogin: jest.fn(),
    validateRefreshToken: jest.fn().mockResolvedValue(mockUser),
    getProfile: jest.fn().mockResolvedValue(mockAuthProfile),
    updateProfile: jest.fn().mockResolvedValue(mockAuthProfile),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return auth profile from auth service', async () => {
      const mockRequest = { user: mockUser } as unknown as Request;
      const mockResponse = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.getProfile(mockRequest, mockResponse);

      expect(authServiceMock.login).toHaveBeenCalledWith(mockUser);
      expect(authServiceMock.getProfile).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthProfile);
    });
  });

  describe('refresh', () => {
    it('should rotate jwt cookie using existing token', async () => {
      const mockRequest = { cookies: { jwt: 'current_token' } } as unknown as Request;
      const mockResponse = {
        clearCookie: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(authServiceMock.validateRefreshToken).toHaveBeenCalledWith('current_token');
      expect(authServiceMock.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { ROLE, User } from 'database/schema';
import { Request } from 'express';
import { UpdateProfileDto } from '../../src/common/dto/update-profile.dto';

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

      const result = await controller.getProfile(mockRequest);

      expect(authServiceMock.getProfile).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update and return auth profile from auth service', async () => {
      const mockRequest = { user: mockUser } as unknown as Request;
      const payload: UpdateProfileDto = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+3725555555',
      };

      const result = await controller.updateProfile(mockRequest, payload);

      expect(authServiceMock.updateProfile).toHaveBeenCalledWith(
        mockUser,
        payload
      );
      expect(result).toEqual(mockAuthProfile);
    });
  });
});

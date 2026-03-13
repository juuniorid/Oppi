import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { createTestUser } from '../helpers/create-users';

describe('AuthService (e2e)', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt_token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateOAuthLogin', () => {
    it('should return existing user if already registered with googleId', async () => {
      const user = await createTestUser('teacher@test.com', 'TEACHER');

      const result = await service.validateOAuthLogin({
        email: user.email,
        name: user.name,
        googleId: user.googleId!,
      });

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('should throw UnauthorizedException if email is not in whitelist', async () => {
      await expect(
        service.validateOAuthLogin({
          email: 'stranger@test.com',
          name: 'Stranger',
          googleId: 'google-stranger',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should link googleId and return user if email is invited but googleId is missing', async () => {
      const { testDb } = await import('../helpers/test-db');
      const { users } = await import('../../src/database/schema');
      await testDb
        .insert(users)
        .values({
          email: 'invited@test.com',
          name: 'Invited User',
          googleId: null,
          role: 'PARENT',
          phone: null,
        });

      const result = await service.validateOAuthLogin({
        email: 'invited@test.com',
        name: 'Invited User',
        googleId: 'google-new',
      });

      expect(result.googleId).toBe('google-new');
    });

    it('should throw UnauthorizedException if googleId belongs to a different account', async () => {
      const user = await createTestUser('parent@test.com', 'PARENT');

      await expect(
        service.validateOAuthLogin({
          email: user.email,
          name: user.name,
          googleId: 'google-different',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should sign a JWT with correct payload', async () => {
      const user = await createTestUser('teacher2@test.com', 'TEACHER');
      const jwtService = service['jwtService'] as JwtService;

      await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
    });
  });
});

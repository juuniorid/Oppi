import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { ROLE } from '../../src/database/schema';
import { createTestGroup } from '../helpers/create-groups';
import { createTestGroupUser } from '../helpers/create-group-users';
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
        firstName: user.firstName,
        lastName: user.lastName,
        googleId: user.googleId!,
      });

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('should throw UnauthorizedException if email is not in whitelist', async () => {
      await expect(
        service.validateOAuthLogin({
          email: 'stranger@test.com',
          firstName: 'Stranger',
          lastName: 'User',
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
          firstName: 'Invited',
          lastName: 'User',
          googleId: null,
          role: 'PARENT',
          phone: null,
        });

      const result = await service.validateOAuthLogin({
        email: 'invited@test.com',
        firstName: 'Invited',
        lastName: 'User',
        googleId: 'google-new',
      });

      expect(result.googleId).toBe('google-new');
    });

    it('should throw UnauthorizedException if googleId belongs to a different account', async () => {
      const user = await createTestUser('parent@test.com', 'PARENT');

      await expect(
        service.validateOAuthLogin({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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

    it('should include correct role for TEACHER in JWT payload', async () => {
      const user = await createTestUser('teacher3@test.com', 'TEACHER');
      const jwtService = service['jwtService'] as JwtService;

      await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'TEACHER' }),
      );
    });
  });

  describe('updateProfile', () => {
    it('should persist firstName, lastName, and phone and return auth profile with groupIds', async () => {
      const user = await createTestUser(
        'profile-update-full@test.com',
        ROLE.Teacher,
        {
          firstName: 'Old',
          lastName: 'Name',
          phone: null,
        },
      );
      const group = await createTestGroup('Profile Update Group');
      await createTestGroupUser(group.id, user.id);

      const profile = await service.updateProfile(user, {
        firstName: 'New',
        lastName: 'Person',
        phone: '+3725551111',
      });

      expect(profile.firstName).toBe('New');
      expect(profile.lastName).toBe('Person');
      expect(profile.phone).toBe('+3725551111');
      expect(profile.groupIds).toContain(group.id);
      expect(profile.email).toBe(user.email);
    });

    it('should return current profile without updating the row when payload is empty', async () => {
      const user = await createTestUser('profile-update-noop@test.com', ROLE.Parent);
      const beforeUpdatedAt = user.updatedAt.getTime();

      const profile = await service.updateProfile(user, {});

      expect(profile.firstName).toBe(user.firstName);
      expect(profile.lastName).toBe(user.lastName);
      expect(profile.updatedAt.getTime()).toBe(beforeUpdatedAt);
    });

    it('should trim strings and store null for blank firstName, lastName, and phone', async () => {
      const user = await createTestUser(
        'profile-update-trim@test.com',
        ROLE.Parent,
        {
          firstName: 'Keep',
          lastName: 'Me',
          phone: '+111',
        },
      );

      const profile = await service.updateProfile(user, {
        firstName: '   ',
        lastName: '  Trimmed  ',
        phone: ' ',
      });

      expect(profile.firstName).toBeNull();
      expect(profile.lastName).toBe('Trimmed');
      expect(profile.phone).toBeNull();
    });

    it('should update only fields present in the payload', async () => {
      const user = await createTestUser(
        'profile-update-partial@test.com',
        ROLE.Parent,
        {
          firstName: 'A',
          lastName: 'B',
          phone: '+222',
        },
      );

      const profile = await service.updateProfile(user, {
        firstName: 'OnlyFirst',
      });

      expect(profile.firstName).toBe('OnlyFirst');
      expect(profile.lastName).toBe('B');
      expect(profile.phone).toBe('+222');
    });
  });
});

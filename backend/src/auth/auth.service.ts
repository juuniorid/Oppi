import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from 'database/db';
import { groupUsers, users, User } from 'database/schema';
import { JwtPayload } from 'src/common/dto/jwt.payload';
import { appConfig } from 'src/config';
import { UpdateProfileDto } from 'src/common/dto/update-profile.dto';

export type AuthProfile = User & {
  groupIds: number[];
};

interface OAuthUser {
  email: string;
  googleId: string;
  firstName: string | null;
  lastName: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async validateOAuthLogin(user: OAuthUser): Promise<User> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!existingUser) {
      this.logger.warn(
        `Login rejected: email not in whitelist (${user.email})`
      );
      throw new UnauthorizedException(
        'You are not invited to this platform. Please contact an administrator.'
      );
    }

    if (existingUser.deletedAt) {
      this.logger.warn(`Login rejected: access revoked (${user.email})`);
      throw new UnauthorizedException(
        'Your access has been revoked. Please contact an administrator.'
      );
    }

    if (!existingUser.googleId) {
      this.logger.log(
        `Linking Google account for invited user (${user.email})`
      );
      const [updatedUser] = await db
        .update(users)
        .set({
          googleId: user.googleId,
          firstName: user.firstName,
          lastName: user.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    }

    if (existingUser.googleId !== user.googleId) {
      this.logger.warn(
        `Login rejected: googleId mismatch for email (${user.email})`
      );
      throw new UnauthorizedException(
        'This email is already linked to a different Google account.'
      );
    }

    // Keep name fields in sync with Google profile on subsequent logins.
    if (
      existingUser.firstName !== user.firstName ||
      existingUser.lastName !== user.lastName
    ) {
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: user.firstName,
          lastName: user.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      this.logger.log(`User authenticated and profile synced (${user.email})`);
      return updatedUser;
    }

    this.logger.log(`User authenticated (${user.email})`);
    return existingUser;
  }

  async login(user: User): Promise<string> {
    this.logger.log(`Issuing JWT for user id=${user.id} role=${user.role}`);
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async validateRefreshToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify<JwtPayload & { exp?: number }>(token, {
        secret: appConfig.jwt.secret,
        ignoreExpiration: true,
      });

      if (payload.exp) {
        const maxStalenessSeconds = 7 * 24 * 60 * 60;
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (nowSeconds - payload.exp > maxStalenessSeconds) {
          throw new UnauthorizedException('Refresh token expired');
        }
      }

      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
        .limit(1);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(user: User): Promise<AuthProfile> {
    try {
      const groupLinks = await db
        .select({ groupId: groupUsers.groupId })
        .from(groupUsers)
        .where(eq(groupUsers.userId, user.id));

      return {
        ...user,
        groupIds: groupLinks.map((link) => link.groupId),
      };
    } catch (error) {
      this.logger.error(
        `Failed to load group links for user id=${user.id}. Returning empty groupIds.`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        ...user,
        groupIds: [],
      };
    }
  }

  async updateProfile(user: User, payload: UpdateProfileDto): Promise<AuthProfile> {
    const patch: Partial<{
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    }> = {};

    if (payload.firstName !== undefined) {
      const trimmed = payload.firstName.trim();
      patch.firstName = trimmed === '' ? null : trimmed;
    }
    if (payload.lastName !== undefined) {
      const trimmed = payload.lastName.trim();
      patch.lastName = trimmed === '' ? null : trimmed;
    }
    if (payload.phone !== undefined) {
      patch.phone = payload.phone.trim() === '' ? null : payload.phone;
    }

    if (Object.keys(patch).length === 0) {
      this.logger.log(`Profile update noop (empty payload after normalize) user id=${user.id}`);
      return this.getProfile(user);
    }

    const [updated] = await db
      .update(users)
      .set({
        ...patch,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    if (!updated) {
      this.logger.warn(`Profile update failed: user id=${user.id} not found`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(
      `Profile updated user id=${user.id} fields=${Object.keys(patch).join(',')}`
    );
    return this.getProfile(updated);
  }
}

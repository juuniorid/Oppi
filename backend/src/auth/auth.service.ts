import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { db } from 'database/db';
import { users, User } from 'database/schema';
import { JwtPayload } from '../common/dto/jwt.payload';

interface OAuthUser {
  email: string;
  googleId: string;
  firstName: string | null;
  lastName: string | null;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateOAuthLogin(user: OAuthUser): Promise<User> {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.googleId, user.googleId))
      .limit(1);
    if (existingUser.length === 0) {
      // For demo, assign role based on email or something, but here default to PARENT
      const newUser = await db
        .insert(users)
        .values({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          googleId: user.googleId,
          role: 'PARENT', // TODO: determine role
        })
        .returning();
      return newUser[0];
    }

    const found = existingUser[0];
    // If a user was soft-deleted, "log in" should restore them rather than creating duplicates.
    if (found.deletedAt) {
      const restored = await db
        .update(users)
        .set({
          deletedAt: null,
          email: user.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, found.id))
        .returning();
      return restored[0];
    }

    // Keep email in sync with Google profile (can change).
    if (found.email !== user.email) {
      const updated = await db
        .update(users)
        .set({ email: user.email, updatedAt: new Date() })
        .where(eq(users.id, found.id))
        .returning();
      return updated[0];
    }

    return found;
  }

  async login(user: User): Promise<string> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}

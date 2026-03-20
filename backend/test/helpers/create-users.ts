import { testDb } from './test-db';
import { users } from '../../src/database/schema';
import type { User } from '../../src/database/schema';
import type { roleEnum } from '../../src/database/schema';

type Role = typeof roleEnum.enumValues[number];

type UserOverrides = Partial<Omit<typeof users.$inferInsert, 'email' | 'role'>>;

export async function createTestUser(
  email: string,
  role: Role,
  overrides: UserOverrides = {},
): Promise<User> {
  const [user] = await testDb
    .insert(users)
    .values({
      email,
      name: overrides.name ?? 'Test User',
      googleId: overrides.googleId ?? `google-${email}`,
      role,
      phone: overrides.phone ?? null,
    })
    .returning();
  return user;
}

export async function createTestUsers(
  entries: Array<{ email: string; role: Role } & UserOverrides>,
): Promise<User[]> {
  return testDb
    .insert(users)
    .values(
      entries.map(({ email, role, ...overrides }) => ({
        email,
        name: overrides.name ?? 'Test User',
        googleId: overrides.googleId ?? `google-${email}`,
        role,
        phone: overrides.phone ?? null,
      })),
    )
    .returning();
}

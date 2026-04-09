import { testDb } from './test-db';
import { children } from '../../src/database/schema';
import type { Child } from '../../src/database/schema';

export async function createTestChild(
  firstName: string,
  lastName: string,
  dateOfBirth = new Date('2020-01-01'),
): Promise<Child> {
  const [child] = await testDb
    .insert(children)
    .values({
      firstName,
      lastName,
      dateOfBirth
    })
    .returning();
  return child;
}

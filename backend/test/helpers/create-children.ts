import { testDb } from './test-db';
import { children, enrollments } from '../../src/database/schema';
import type { Child } from '../../src/database/schema';

export async function createTestChild(
  firstName: string,
  lastName: string,
  groupId: number,
): Promise<Child> {
  const [child] = await testDb
    .insert(children)
    .values({
      firstName,
      lastName,
      dateOfBirth: new Date('2020-01-01'),
    })
    .returning();

  await testDb.insert(enrollments).values({
    childId: child.id,
    groupId,
  });

  return child;
}

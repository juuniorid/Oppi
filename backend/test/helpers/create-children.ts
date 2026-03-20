import { testDb } from './test-db';
import { children } from '../../src/database/schema';
import type { Child } from '../../src/database/schema';

export async function createTestChild(
  firstName: string,
  lastName: string,
  groupId: number,
): Promise<Child> {
  const [child] = await testDb
    .insert(children)
    .values({ firstName, lastName, groupId })
    .returning();
  return child;
}

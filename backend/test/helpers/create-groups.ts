import { testDb } from './test-db';
import { groups } from '../../src/database/schema';
import type { Group } from '../../src/database/schema';

export async function createTestGroup(
  name: string,
  kindergartenName = 'Test Kindergarten',
): Promise<Group> {
  const [group] = await testDb
    .insert(groups)
    .values({ name, kindergartenName })
    .returning();
  return group;
}

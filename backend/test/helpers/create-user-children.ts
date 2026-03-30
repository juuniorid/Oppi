import { testDb } from './test-db';
import { userChildren, RELATIONSHIP_ENUM } from '../../src/database/schema';
import type { ChildUser, RelationshipEnum } from '../../src/database/schema';

export async function createTestUserChild(
  userId: number,
  childId: number,
  relationship: RelationshipEnum = RELATIONSHIP_ENUM.Guardian,
  isPrimary = true,
): Promise<ChildUser> {
  const [userChild] = await testDb
    .insert(userChildren)
    .values({ userId, childId, relationship, isPrimary })
    .returning();

  return userChild;
}

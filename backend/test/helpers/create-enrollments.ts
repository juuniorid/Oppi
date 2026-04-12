import { testDb } from './test-db';
import { enrollments } from '../../src/database/schema';
import type { Enrollment } from '../../src/database/schema';

export async function createTestEnrollment(
  childId: number,
  groupId: number,
  startDate = new Date('2024-09-01'),
): Promise<Enrollment> {
  const [enrollment] = await testDb
    .insert(enrollments)
    .values({ childId, groupId, startDate })
    .returning();

  return enrollment;
}
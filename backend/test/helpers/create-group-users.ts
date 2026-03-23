import { testDb } from './test-db';
import { groupUsers, TEACHER_ROLE } from '../../src/database/schema';
import type { GroupUser, TeacherRoleType } from '../../src/database/schema';

export async function createTestGroupUser(
  groupId: number,
  userId: number,
  role: TeacherRoleType = TEACHER_ROLE.Main,
): Promise<GroupUser> {
  const [groupUser] = await testDb
    .insert(groupUsers)
    .values({ groupId, userId, role })
    .returning();

  return groupUser;
}

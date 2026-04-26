import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { children, enrollments, Child } from 'database/schema';
import { and, desc, eq, getTableColumns, isNull } from 'drizzle-orm';
import { userChildren } from 'database/schema';

export type ChildWithGroup = Child & { groupId: number | null };

@Injectable()
export class ChildrenService {
  async findForParent(userId: number): Promise<ChildWithGroup[]> {
    const rows = await db
      .select({
        ...getTableColumns(children),
        groupId: enrollments.groupId,
      })
      .from(userChildren)
      .innerJoin(
        children,
        and(eq(userChildren.childId, children.id), isNull(children.deletedAt))
      )
      .leftJoin(
        enrollments,
        and(eq(enrollments.childId, children.id), isNull(enrollments.deletedAt))
      )
      .where(eq(userChildren.userId, userId))
      .orderBy(desc(enrollments.updatedAt), desc(enrollments.id));

    const uniqueChildren = new Map<number, ChildWithGroup>();

    for (const row of rows) {
      if (!uniqueChildren.has(row.id)) {
        uniqueChildren.set(row.id, row);
      }
    }

    return Array.from(uniqueChildren.values());
  }

  async findByGroup(groupId: number): Promise<Child[]> {
    return await db
      .select(getTableColumns(children))
      .from(children)
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(enrollments.groupId, groupId));
  }
}

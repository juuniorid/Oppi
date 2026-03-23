import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { children, enrollments, Child } from 'database/schema';
import { eq, getTableColumns } from 'drizzle-orm';

@Injectable()
export class ChildrenService {
  async findByGroup(groupId: number): Promise<Child[]> {
    return await db
      .select(getTableColumns(children))
      .from(children)
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(enrollments.groupId, groupId));
  }
}

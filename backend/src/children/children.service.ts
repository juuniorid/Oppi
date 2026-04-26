import { Injectable, Logger } from '@nestjs/common';
import { db } from 'database/db';
import { children, enrollments, userChildren, Child } from 'database/schema';
import { eq, getTableColumns } from 'drizzle-orm';

export type ChildWithGroup = Child & { groupId: number };

@Injectable()
export class ChildrenService {
  private readonly logger = new Logger(ChildrenService.name);

  async findByGroup(groupId: number): Promise<Child[]> {
    this.logger.verbose(`Fetching children for group ${groupId}`);
    return await db
      .select(getTableColumns(children))
      .from(children)
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(enrollments.groupId, groupId));
  }

  async findByParent(parentId: number): Promise<ChildWithGroup[]> {
    this.logger.verbose(`Fetching children for parent ${parentId}`);
    return await db
      .select({ ...getTableColumns(children), groupId: enrollments.groupId })
      .from(children)
      .innerJoin(userChildren, eq(userChildren.childId, children.id))
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(userChildren.userId, parentId));
  }
}

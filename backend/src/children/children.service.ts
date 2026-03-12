import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { children, enrollments, Child } from 'database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ChildrenService {
  async findByGroup(groupId: number): Promise<Child[]> {
    return await db
      .select({
        id: children.id,
        firstName: children.firstName,
        lastName: children.lastName,
        dateOfBirth: children.dateOfBirth,
        notes: children.notes,
        createdAt: children.createdAt,
        updatedAt: children.updatedAt,
      })
      .from(children)
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(eq(enrollments.groupId, groupId));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from 'database/db';
import {
  children,
  enrollments,
  groups,
  Child,
  NewChild,
} from 'database/schema';
import { and, desc, eq, getTableColumns, isNull } from 'drizzle-orm';
import { userChildren } from 'database/schema';
import { CreateChildDto } from '../common/dto/create-child.dto';
import { UpdateChildDto } from '../common/dto/update-child.dto';

export type ChildWithGroup = Child & {
  groupId: number | null;
  groupName: string | null;
};

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

@Injectable()
export class ChildrenService {
  async findForParent(userId: number): Promise<ChildWithGroup[]> {
    const rows = await db
      .select({
        ...getTableColumns(children),
        groupId: enrollments.groupId,
        groupName: groups.name,
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
      .leftJoin(groups, eq(groups.id, enrollments.groupId))
      .where(eq(userChildren.userId, userId))
      .orderBy(desc(enrollments.updatedAt), desc(enrollments.id));

    return this.dedupeChildren(rows);
  }

  async findAll(): Promise<ChildWithGroup[]> {
    const rows = await db
      .select({
        ...getTableColumns(children),
        groupId: enrollments.groupId,
        groupName: groups.name,
      })
      .from(children)
      .leftJoin(
        enrollments,
        and(eq(enrollments.childId, children.id), isNull(enrollments.deletedAt))
      )
      .leftJoin(groups, eq(groups.id, enrollments.groupId))
      .where(isNull(children.deletedAt))
      .orderBy(desc(enrollments.updatedAt), desc(enrollments.id));

    return this.dedupeChildren(rows);
  }

  async findByGroup(groupId: number): Promise<ChildWithGroup[]> {
    await this.assertGroupExists(groupId);

    const rows = await db
      .select({
        ...getTableColumns(children),
        groupId: enrollments.groupId,
        groupName: groups.name,
      })
      .from(children)
      .innerJoin(
        enrollments,
        and(eq(enrollments.childId, children.id), isNull(enrollments.deletedAt))
      )
      .leftJoin(groups, eq(groups.id, enrollments.groupId))
      .where(and(eq(enrollments.groupId, groupId), isNull(children.deletedAt)))
      .orderBy(desc(enrollments.updatedAt), desc(enrollments.id));

    return this.dedupeChildren(rows);
  }

  async create(createChildDto: CreateChildDto): Promise<ChildWithGroup> {
    if (createChildDto.groupId !== undefined) {
      await this.assertGroupExists(createChildDto.groupId);
    }

    const createdChildId = await db.transaction(async (tx) => {
      const [createdChild] = await tx
        .insert(children)
        .values({
          firstName: createChildDto.firstName.trim(),
          lastName: createChildDto.lastName.trim(),
          dateOfBirth: toDateOnly(createChildDto.dateOfBirth),
          notes: createChildDto.notes?.trim() || null,
        })
        .returning({ id: children.id });

      if (createChildDto.groupId !== undefined) {
        await tx.insert(enrollments).values({
          childId: createdChild.id,
          groupId: createChildDto.groupId,
          startDate: new Date(),
        });
      }

      return createdChild.id;
    });

    return this.getChildWithGroupOrThrow(createdChildId);
  }

  async update(
    id: number,
    updateChildDto: UpdateChildDto
  ): Promise<ChildWithGroup> {
    await this.assertChildExists(id);

    if (updateChildDto.groupId !== undefined) {
      await this.assertGroupExists(updateChildDto.groupId);
    }

    await db.transaction(async (tx) => {
      const updateData: Partial<NewChild> = {};

      if (updateChildDto.firstName !== undefined) {
        updateData.firstName = updateChildDto.firstName.trim();
      }
      if (updateChildDto.lastName !== undefined) {
        updateData.lastName = updateChildDto.lastName.trim();
      }
      if (updateChildDto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = toDateOnly(updateChildDto.dateOfBirth);
      }
      if (updateChildDto.notes !== undefined) {
        updateData.notes = updateChildDto.notes.trim() || null;
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date();
        await tx.update(children).set(updateData).where(eq(children.id, id));
      }

      if (updateChildDto.groupId !== undefined) {
        const [latestEnrollment] = await tx
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(
            and(eq(enrollments.childId, id), isNull(enrollments.deletedAt))
          )
          .orderBy(desc(enrollments.updatedAt), desc(enrollments.id))
          .limit(1);

        if (latestEnrollment) {
          await tx
            .update(enrollments)
            .set({
              groupId: updateChildDto.groupId,
              updatedAt: new Date(),
            })
            .where(eq(enrollments.id, latestEnrollment.id));
        } else {
          await tx.insert(enrollments).values({
            childId: id,
            groupId: updateChildDto.groupId,
            startDate: new Date(),
          });
        }
      }
    });

    return this.getChildWithGroupOrThrow(id);
  }

  async delete(id: number): Promise<void> {
    await this.assertChildExists(id);

    await db
      .update(children)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(children.id, id));
  }

  private async getChildWithGroupOrThrow(
    childId: number
  ): Promise<ChildWithGroup> {
    const rows = await db
      .select({
        ...getTableColumns(children),
        groupId: enrollments.groupId,
        groupName: groups.name,
      })
      .from(children)
      .leftJoin(
        enrollments,
        and(eq(enrollments.childId, children.id), isNull(enrollments.deletedAt))
      )
      .leftJoin(groups, eq(groups.id, enrollments.groupId))
      .where(and(eq(children.id, childId), isNull(children.deletedAt)))
      .orderBy(desc(enrollments.updatedAt), desc(enrollments.id));

    const [child] = this.dedupeChildren(rows);
    if (!child) {
      throw new NotFoundException(`Child ${childId} not found`);
    }

    return child;
  }

  private dedupeChildren(rows: ChildWithGroup[]): ChildWithGroup[] {
    const uniqueChildren = new Map<number, ChildWithGroup>();

    for (const row of rows) {
      if (!uniqueChildren.has(row.id)) {
        uniqueChildren.set(row.id, row);
      }
    }

    return Array.from(uniqueChildren.values());
  }

  private async assertGroupExists(groupId: number): Promise<void> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
  }

  private async assertChildExists(childId: number): Promise<void> {
    const child = await db.query.children.findFirst({
      where: and(eq(children.id, childId), isNull(children.deletedAt)),
    });

    if (!child) {
      throw new NotFoundException(`Child ${childId} not found`);
    }
  }
}

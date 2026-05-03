import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from 'database/db';
import {
  Group,
  groups,
  enrollments,
  groupUsers,
  users,
  ROLE,
  TEACHER_ROLE,
  TeacherRoleType,
  User,
} from 'database/schema';
import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from 'drizzle-orm';
import { CreateGroupDto } from '../common/dto/create-group.dto';
import { UpdateGroupDto } from '../common/dto/update-group.dto';

export type GroupTeacher = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
};

export type TeacherUser = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export type GroupWithDetails = Group & {
  childrenCount: number;
  teachers: GroupTeacher[];
};

@Injectable()
export class GroupsService {
  async findAll(user: User): Promise<GroupWithDetails[]> {
    const allGroups =
      user.role === ROLE.Teacher
        ? await db
            .selectDistinct(getTableColumns(groups))
            .from(groups)
            .innerJoin(
              groupUsers,
              and(
                eq(groupUsers.groupId, groups.id),
                eq(groupUsers.userId, user.id)
              )
            )
            .where(isNull(groups.deletedAt))
            .orderBy(asc(groups.name))
        : await db
            .select(getTableColumns(groups))
            .from(groups)
            .where(isNull(groups.deletedAt))
            .orderBy(asc(groups.name));

    if (allGroups.length === 0) {
      return [];
    }

    const groupIds = allGroups.map((g) => g.id);

    const childCounts = await db
      .select({
        groupId: enrollments.groupId,
        count: count(enrollments.childId),
      })
      .from(enrollments)
      .where(isNull(enrollments.deletedAt))
      .groupBy(enrollments.groupId);

    const childCountMap = new Map<number, number>(
      childCounts.map((row) => [row.groupId, Number(row.count)])
    );

    const teacherRows = await db
      .select({
        groupId: groupUsers.groupId,
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: groupUsers.role,
      })
      .from(groupUsers)
      .innerJoin(users, eq(groupUsers.userId, users.id))
      .where(
        sql`${groupUsers.groupId} = ANY(ARRAY[${sql.join(
          groupIds.map((id) => sql`${id}`),
          sql`, `
        )}]::int[])`
      );

    const teacherMap = new Map<number, GroupTeacher[]>();
    for (const row of teacherRows) {
      const list = teacherMap.get(row.groupId) ?? [];
      list.push({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        role: row.role,
      });
      teacherMap.set(row.groupId, list);
    }

    return allGroups.map((group) => ({
      ...group,
      childrenCount: childCountMap.get(group.id) ?? 0,
      teachers: teacherMap.get(group.id) ?? [],
    }));
  }

  async findTeachers(): Promise<TeacherUser[]> {
    return db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(and(eq(users.role, ROLE.Teacher), isNull(users.deletedAt)))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async create(dto: CreateGroupDto): Promise<GroupWithDetails> {
    if (dto.teacherIds?.length) {
      await this.assertUsersAreTeachers(dto.teacherIds);
    }

    const [created] = await db
      .insert(groups)
      .values({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        ageMin: dto.ageMin ?? null,
        ageMax: dto.ageMax ?? null,
        kindergartenName: dto.kindergartenName?.trim() ?? null,
      })
      .returning(getTableColumns(groups));

    if (dto.teacherIds?.length) {
      await db.insert(groupUsers).values(
        dto.teacherIds.map((userId) => ({
          groupId: created.id,
          userId,
          role: TEACHER_ROLE.General as TeacherRoleType,
        }))
      );
    }

    const teachers = dto.teacherIds?.length
      ? await this.getTeachersForGroup(created.id)
      : [];

    return { ...created, childrenCount: 0, teachers };
  }

  async update(id: number, dto: UpdateGroupDto): Promise<GroupWithDetails> {
    await this.assertGroupExists(id);

    if (dto.teacherIds !== undefined && dto.teacherIds.length > 0) {
      await this.assertUsersAreTeachers(dto.teacherIds);
    }

    const updateData: Partial<Group> = {};

    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.description !== undefined)
      updateData.description = dto.description.trim() || null;
    if (dto.ageMin !== undefined) updateData.ageMin = dto.ageMin;
    if (dto.ageMax !== undefined) updateData.ageMax = dto.ageMax;
    if (dto.kindergartenName !== undefined)
      updateData.kindergartenName = dto.kindergartenName.trim() || null;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await db.update(groups).set(updateData).where(eq(groups.id, id));
    }

    if (dto.teacherIds !== undefined) {
      await db.delete(groupUsers).where(eq(groupUsers.groupId, id));

      if (dto.teacherIds.length > 0) {
        await db.insert(groupUsers).values(
          dto.teacherIds.map((userId) => ({
            groupId: id,
            userId,
            role: TEACHER_ROLE.General as TeacherRoleType,
          }))
        );
      }
    }

    const [updated] = await db
      .select(getTableColumns(groups))
      .from(groups)
      .where(eq(groups.id, id));

    const [childCountRow] = await db
      .select({ count: count(enrollments.childId) })
      .from(enrollments)
      .where(and(eq(enrollments.groupId, id), isNull(enrollments.deletedAt)));

    const teachers = await this.getTeachersForGroup(id);

    return {
      ...updated,
      childrenCount: Number(childCountRow?.count ?? 0),
      teachers,
    };
  }

  private async getTeachersForGroup(groupId: number): Promise<GroupTeacher[]> {
    const rows = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: groupUsers.role,
      })
      .from(groupUsers)
      .innerJoin(users, eq(groupUsers.userId, users.id))
      .where(eq(groupUsers.groupId, groupId));

    return rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      role: r.role,
    }));
  }

  private async assertUsersAreTeachers(userIds: number[]): Promise<void> {
    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          inArray(users.id, userIds),
          eq(users.role, ROLE.Teacher),
          isNull(users.deletedAt)
        )
      );

    if (found.length !== userIds.length) {
      const foundIds = new Set(found.map((u) => u.id));
      const invalid = userIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `User IDs are not valid teachers: ${invalid.join(', ')}`
      );
    }
  }

  private async assertGroupExists(id: number): Promise<void> {
    const [group] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(eq(groups.id, id), isNull(groups.deletedAt)));

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }
  }
}

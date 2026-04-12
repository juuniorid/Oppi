import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from 'database/db';
import {
  absences,
  children,
  groups,
  enrollments,
  groupUsers,
  userChildren,
  ROLE,
  ABSENCE_ENUM,
  type Child,
  type Absence,
  type NewAbsence,
  type User,
} from 'database/schema';
import { CreateAbsencesDto } from '../common/dto/create-attendance.dto';

@Injectable()
export class AbsencesService {
  async create(createDto: CreateAbsencesDto, user: User): Promise<Absence[]> {
    const fromDate = this.parseAndValidateDate(createDto.from, 'from');
    const toDate = this.parseAndValidateDate(createDto.to, 'to');
    this.validateDateRange(fromDate, toDate);

    const child = await db.query.children.findFirst({
      where: and(
        eq(children.id, createDto.childId),
        isNull(children.deletedAt),
      ),
    });
    if (!child) {
      throw new NotFoundException(`Child ${createDto.childId} not found`);
    }
    const groupEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.childId, createDto.childId),
        isNull(enrollments.deletedAt),
      ),
    });
    if (!groupEnrollment) {
      throw new NotFoundException(`Child ${createDto.childId} is not enrolled in any group`);
    }

    await this.assertCanAccessChildAttendance(user, child, groupEnrollment.groupId);

    if (createDto.status === ABSENCE_ENUM.Present) {
      await db
        .delete(absences)
        .where(
          and(
            eq(absences.childId, createDto.childId),
            gte(absences.date, fromDate),
            lte(absences.date, toDate),
          ),
        );
      return [];
    }

    return db
      .insert(absences)
      .values(this.buildAbsenceRows(createDto, user.id, fromDate, toDate))
      .onConflictDoUpdate({
        target: [absences.childId, absences.date],
        set: {
          userId: sql`excluded.user_id`,
          status: sql`excluded.status`,
          note: sql`excluded.note`,
          deletedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();
  }

  async findByGroupAndDateRange(
    groupId: number,
    from: string,
    to: string,
  ): Promise<Absence[]> {
    const fromDate = this.parseAndValidateDate(from, 'from');
    const toDate = this.parseAndValidateDate(to, 'to');
    this.validateDateRange(fromDate, toDate);

    const group = await db.query.groups.findFirst({
      where: and(
        eq(groups.id, groupId),
        isNull(groups.deletedAt),
      ),
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }

    return db
      .select()
      .from(absences)
      .innerJoin(enrollments, eq(enrollments.childId, absences.childId))
      .where(
        and(
          eq(enrollments.groupId, groupId),
          gte(absences.date, fromDate),
          lte(absences.date, toDate),
          isNull(enrollments.deletedAt),
        ),
      )
      .then((rows) => rows.map((row) => row.absences));
  }

  async findByChildAndDateRange(
    childId: number,
    from: string,
    to: string,
    user: User,
  ): Promise<Absence[]> {
    const fromDate = this.parseAndValidateDate(from, 'from');
    const toDate = this.parseAndValidateDate(to, 'to');
    this.validateDateRange(fromDate, toDate);

    const child = await db.query.children.findFirst({
      where: and(
        eq(children.id, childId),
        isNull(children.deletedAt),
      ),
    });
    if (!child) {
      throw new NotFoundException(`Child ${childId} not found`);
    }

    const groupEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.childId, childId),
        isNull(enrollments.deletedAt),
      ),
    });
    if (!groupEnrollment) {
      throw new NotFoundException(`Child ${childId} is not enrolled in any group`);
    }

    await this.assertCanAccessChildAttendance(user, child, groupEnrollment.groupId);

    return db
      .select()
      .from(absences)
      .where(
        and(
          eq(absences.childId, childId),
          gte(absences.date, fromDate),
          lte(absences.date, toDate),
        ),
      );
  }

  private parseAndValidateDate(value: string, fieldName: string): Date {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new BadRequestException(`${fieldName} must be in YYYY-MM-DD format`);
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return parsed;
  }

  private validateDateRange(fromDate: Date, toDate: Date): void {
    if (fromDate > toDate) {
      throw new BadRequestException('fromDate must be before or equal to toDate');
    }

    const now = new Date();
    const min = new Date(now);
    min.setUTCDate(min.getUTCDate() - 365);
    const max = new Date(now);
    max.setUTCDate(max.getUTCDate() + 365);

    if (fromDate < min || toDate > max) {
      throw new BadRequestException('Date range is out of allowed bounds');
    }
  }

  private async assertCanAccessChildAttendance(
    user: User,
    child: Child,
    groupId: number,
  ): Promise<void> {
    const childEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.childId, child.id),
        eq(enrollments.groupId, groupId),
        isNull(enrollments.deletedAt),
      ),
    });
    if (!childEnrollment) {
      throw new ForbiddenException('Child does not belong to the provided group');
    }

    if (user.role === ROLE.Parent) {
      const relation = await db.query.userChildren.findFirst({
        where: and(
          eq(userChildren.userId, user.id),
          eq(userChildren.childId, child.id),
        ),
      });
      if (!relation) {
        throw new ForbiddenException('You can only report absence for your own child');
      }

      return;
    }

    if (user.role === ROLE.Teacher) {
      const teacherMembership = await db.query.groupUsers.findFirst({
        where: and(
          eq(groupUsers.userId, user.id),
          eq(groupUsers.groupId, groupId),
        ),
      });

      if (!teacherMembership) {
        throw new ForbiddenException('Teacher can only report absence for children in their group');
      }

      return;
    }

    throw new ForbiddenException('Only PARENT, TEACHER can report absences');
  }

  private buildAbsenceRows(
    createDto: CreateAbsencesDto,
    userId: number,
    fromDate: Date,
    toDate: Date,
  ): NewAbsence[] {
    const rows: NewAbsence[] = [];
    const current = new Date(fromDate);

    while (current <= toDate) {
      rows.push({
        childId: createDto.childId,
        userId,
        date: new Date(current),
        status: createDto.status,
        note: createDto.note ?? null,
      });

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return rows;
  }
}

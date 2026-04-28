import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gte, inArray, isNull, lte, or } from 'drizzle-orm';
import { db } from 'database/db';
import {
  children,
  enrollments,
  events,
  groups,
  groupUsers,
  ROLE,
  userChildren,
  type Child,
  type User,
} from 'database/schema';
import { CreateEventDto, UpdateEventDto } from '../common/dto/event.dto';

export type CalendarEventView = {
  id: number;
  name: string;
  time: string;
  description: string;
  date: string;
  type: 'GROUP' | 'KINDERGARTEN';
};

@Injectable()
export class EventsService {
  async findEventsByDateRange(
    from: string,
    to: string,
    user: User,
  ): Promise<CalendarEventView[]> {
    const fromDate = this.parseAndValidateDate(from, 'from');
    const toDate = this.parseAndValidateDate(to, 'to');
    this.validateDateRange(fromDate, toDate);

    let allowedGroupIds: number[] | null = null;
    if (user.role === ROLE.Teacher) {
      const teacherGroups = await db
        .select({ groupId: groupUsers.groupId })
        .from(groupUsers)
        .where(eq(groupUsers.userId, user.id));
      allowedGroupIds = [...new Set(teacherGroups.map((x) => x.groupId))];
    } else if (user.role === ROLE.Parent) {
      const rows = await db
        .select({ groupId: enrollments.groupId })
        .from(userChildren)
        .innerJoin(enrollments, eq(enrollments.childId, userChildren.childId))
        .where(and(eq(userChildren.userId, user.id), isNull(enrollments.deletedAt)));
      allowedGroupIds = [...new Set(rows.map((x) => x.groupId))];
    }

    if (allowedGroupIds && allowedGroupIds.length === 0) {
      return [];
    }

    const rows = await db
      .select()
      .from(events)
      .where(
        and(
          isNull(events.deletedAt),
          lte(events.startAt, new Date(`${to}T23:59:59.999Z`)),
          gte(events.endAt, fromDate),
          allowedGroupIds
            ? or(inArray(events.groupId, allowedGroupIds), isNull(events.groupId))
            : undefined,
        ),
      );

    return rows.map((event) => this.toCalendarEventView(event));
  }

  async findEventsByChildAndDateRange(
    childId: number,
    from: string,
    to: string,
    user: User,
  ): Promise<CalendarEventView[]> {
    const fromDate = this.parseAndValidateDate(from, 'from');
    const toDate = this.parseAndValidateDate(to, 'to');
    this.validateDateRange(fromDate, toDate);

    const child = await db.query.children.findFirst({
      where: and(eq(children.id, childId), isNull(children.deletedAt)),
    });
    if (!child) {
      throw new NotFoundException(`Child ${childId} not found`);
    }

    const groupEnrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.childId, childId), isNull(enrollments.deletedAt)),
    });
    if (!groupEnrollment) {
      throw new NotFoundException(`Child ${childId} is not enrolled in any group`);
    }

    await this.assertCanAccessChildEvents(user, child, groupEnrollment.groupId);

    const rows = await db
      .select()
      .from(events)
      .where(
        and(
          or(eq(events.groupId, groupEnrollment.groupId), isNull(events.groupId)),
          isNull(events.deletedAt),
          lte(events.startAt, new Date(`${to}T23:59:59.999Z`)),
          gte(events.endAt, fromDate),
        ),
      );

    return rows.map((event) => this.toCalendarEventView(event));
  }

  async createEvent(dto: CreateEventDto, user: User): Promise<CalendarEventView> {
    const groupId = await this.resolveGroupIdForCreate(dto, user);
    if (groupId !== null) {
      await this.assertGroupExists(groupId);
    }

    const startAt = this.parseEventDateTime(dto.from, dto.timeFrom, 'from/timeFrom');
    const endAt = this.parseEventDateTime(dto.to, dto.timeTo, 'to/timeTo');
    if (startAt > endAt) {
      throw new BadRequestException('Event start time must be before or equal to end time');
    }

    const [created] = await db
      .insert(events)
      .values({
        groupId,
        userId: user.id,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        startAt,
        endAt,
      })
      .returning();

    return this.toCalendarEventView(created, dto.type);
  }

  async updateEvent(eventId: number, dto: UpdateEventDto, user: User): Promise<CalendarEventView> {
    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), isNull(events.deletedAt)));
    if (!existing) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    await this.assertCanManageEvent(user, existing.groupId);

    const nextGroupId = await this.resolveGroupIdForUpdate(dto, existing.groupId, user);
    if (nextGroupId !== null) {
      await this.assertGroupExists(nextGroupId);
    }

    const startDate = dto.from ?? existing.startAt.toISOString().slice(0, 10);
    const endDate = dto.to ?? existing.endAt.toISOString().slice(0, 10);
    const startTime = dto.timeFrom ?? existing.startAt.toISOString().slice(11, 16);
    const endTime = dto.timeTo ?? existing.endAt.toISOString().slice(11, 16);
    const startAt = this.parseEventDateTime(startDate, startTime, 'from/timeFrom');
    const endAt = this.parseEventDateTime(endDate, endTime, 'to/timeTo');
    if (startAt > endAt) {
      throw new BadRequestException('Event start time must be before or equal to end time');
    }

    const [updated] = await db
      .update(events)
      .set({
        groupId: nextGroupId,
        name: dto.name?.trim() ?? existing.name,
        description: dto.description?.trim() ?? existing.description,
        startAt,
        endAt,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();

    return this.toCalendarEventView(updated, dto.type);
  }

  async deleteEvent(eventId: number, user: User): Promise<void> {
    const [existing] = await db
      .select({ id: events.id, groupId: events.groupId })
      .from(events)
      .where(and(eq(events.id, eventId), isNull(events.deletedAt)));
    if (!existing) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    await this.assertCanManageEvent(user, existing.groupId);

    await db
      .update(events)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, eventId));
  }

  private async resolveGroupIdForCreate(dto: CreateEventDto, user: User): Promise<number | null> {
    if (user.role === ROLE.Admin) {
      if (dto.type === 'KINDERGARTEN') {
        return null;
      }

      if (!dto.groupId) {
        throw new BadRequestException('groupId is required for admin event creation');
      }
      return dto.groupId;
    }

    if (user.role !== ROLE.Teacher) {
      throw new ForbiddenException('Only TEACHER or ADMIN can manage events');
    }

    const membership = await db.query.groupUsers.findFirst({
      where: eq(groupUsers.userId, user.id),
    });
    if (!membership) {
      throw new ForbiddenException('Teacher does not belong to any group');
    }

    return membership.groupId;
  }

  private async resolveGroupIdForUpdate(
    dto: UpdateEventDto,
    existingGroupId: number | null,
    user: User,
  ): Promise<number | null> {
    if (user.role !== ROLE.Admin) {
      return existingGroupId;
    }

    if (dto.type === 'KINDERGARTEN') {
      return null;
    }

    if (dto.groupId !== undefined) {
      return dto.groupId;
    }

    if (dto.type === 'GROUP' && existingGroupId === null) {
      throw new BadRequestException('groupId is required for admin group event updates');
    }

    return existingGroupId;
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

  private parseEventDateTime(date: string, time: string, fieldName: string): Date {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    const parsed = new Date(`${date}T${time}:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return parsed;
  }

  private async assertGroupExists(groupId: number): Promise<void> {
    const group = await db.query.groups.findFirst({
      where: and(eq(groups.id, groupId), isNull(groups.deletedAt)),
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
  }

  private async assertCanManageEvent(user: User, groupId: number | null): Promise<void> {
    if (groupId === null) {
      if (user.role === ROLE.Admin) {
        return;
      }

      throw new ForbiddenException('Only ADMIN can manage kindergarten events');
    }

    await this.assertCanManageGroupEvents(user, groupId);
  }

  private async assertCanAccessChildEvents(
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
        where: and(eq(userChildren.userId, user.id), eq(userChildren.childId, child.id)),
      });
      if (!relation) {
        throw new ForbiddenException('You can only access events for your own child');
      }
      return;
    }

    if (user.role === ROLE.Teacher) {
      await this.assertCanManageGroupEvents(user, groupId);
      return;
    }

    if (user.role !== ROLE.Admin) {
      throw new ForbiddenException('Only PARENT, TEACHER, ADMIN can access events');
    }
  }

  private async assertCanManageGroupEvents(user: User, groupId: number): Promise<void> {
    if (user.role === ROLE.Admin) {
      return;
    }

    if (user.role !== ROLE.Teacher) {
      throw new ForbiddenException('Only TEACHER or ADMIN can manage events');
    }

    const membership = await db.query.groupUsers.findFirst({
      where: and(eq(groupUsers.userId, user.id), eq(groupUsers.groupId, groupId)),
    });
    if (!membership) {
      throw new ForbiddenException('Teacher can only manage events for own group');
    }
  }

  private toCalendarEventView(
    event: { id: number; name: string; description: string | null; startAt: Date; groupId?: number | null },
    type?: string,
  ): CalendarEventView {
    return {
      id: event.id,
      name: event.name,
      time: event.startAt.toISOString().slice(11, 16),
      description: event.description ?? '',
      date: event.startAt.toISOString().slice(0, 10),
      type: type === 'KINDERGARTEN' || event.groupId == null ? 'KINDERGARTEN' : 'GROUP',
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { EventsService } from '../../src/events/events.service';
import { createTestGroup } from '../helpers/create-groups';
import { createTestUser } from '../helpers/create-users';
import { createTestGroupUser } from '../helpers/create-group-users';
import { testDb } from '../helpers/test-db';
import { events, ROLE } from '../../src/database/schema';

describe('EventsService (e2e)', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('admin can create event for selected groupId', async () => {
    const group = await createTestGroup('Admin Group');
    const admin = await createTestUser('events-admin@test.com', ROLE.Admin);

    await service.createEvent(
      {
        groupId: group.id,
        from: '2026-04-28',
        to: '2026-04-28',
        timeFrom: '10:00',
        timeTo: '11:00',
        name: 'Admin Event',
        description: 'Admin created event',
        type: 'GROUP',
      },
      admin,
    );

    const [created] = await testDb
      .select()
      .from(events)
      .where(eq(events.name, 'Admin Event'));

    expect(created).toBeDefined();
    expect(created.groupId).toBe(group.id);
  });

  it('admin can create kindergarten event without groupId', async () => {
    const admin = await createTestUser('events-admin-kindergarten@test.com', ROLE.Admin);

    await service.createEvent(
      {
        from: '2026-04-28',
        to: '2026-04-28',
        timeFrom: '09:00',
        timeTo: '10:00',
        name: 'Kindergarten Assembly',
        description: 'Whole kindergarten event',
        type: 'KINDERGARTEN',
      },
      admin,
    );

    const [created] = await testDb
      .select()
      .from(events)
      .where(eq(events.name, 'Kindergarten Assembly'));

    expect(created).toBeDefined();
    expect(created.groupId).toBeNull();
  });

  it('teacher groupId is auto-resolved from groupUsers and ignores payload groupId', async () => {
    const teachersGroup = await createTestGroup('Teachers Group');
    const otherGroup = await createTestGroup('Other Group');
    const teacher = await createTestUser('events-teacher@test.com', ROLE.Teacher);
    await createTestGroupUser(teachersGroup.id, teacher.id);

    await service.createEvent(
      {
        groupId: otherGroup.id,
        from: '2026-04-28',
        to: '2026-04-28',
        timeFrom: '12:00',
        timeTo: '13:00',
        name: 'Teacher Event',
        description: 'Teacher created event',
        type: 'GROUP',
      },
      teacher,
    );

    const [created] = await testDb
      .select()
      .from(events)
      .where(eq(events.name, 'Teacher Event'));

    expect(created).toBeDefined();
    expect(created.groupId).toBe(teachersGroup.id);
    expect(created.groupId).not.toBe(otherGroup.id);
  });

  it('teacher without group membership cannot create event', async () => {
    const teacher = await createTestUser('events-teacher-nogroup@test.com', ROLE.Teacher);

    await expect(
      service.createEvent(
        {
          from: '2026-04-28',
          to: '2026-04-28',
          timeFrom: '12:00',
          timeTo: '13:00',
          name: 'No Group Event',
          description: 'Should fail',
          type: 'GROUP',
        },
        teacher,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});

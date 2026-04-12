import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ABSENCE_ENUM,
  ROLE,
  RELATIONSHIP_ENUM,
} from 'database/schema';
import { AbsencesService } from '../../src/absences/absences.service';
import { CreateAbsencesDto } from '../../src/common/dto/create-attendance.dto';
import { createTestChild } from '../helpers/create-children';
import { createTestEnrollment } from '../helpers/create-enrollments';
import { createTestGroup } from '../helpers/create-groups';
import { createTestGroupUser } from '../helpers/create-group-users';
import { createTestUser, createTestUsers } from '../helpers/create-users';
import { createTestUserChild } from '../helpers/create-user-children';

describe('AbsenceService (e2e)', () => {
  let service: AbsencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbsencesService],
    }).compile();

    service = module.get<AbsencesService>(AbsencesService);
  });

  describe('create', () => {
    it('should create one attendance row per date in range for a parent linked to the child', async () => {
      const group = await createTestGroup('Bumblebees');
      const parent = await createTestUser('parent-absences@test.com', ROLE.Parent);
      const child = await createTestChild('Emma', 'Doe');
      await createTestEnrollment(child.id, group.id);
      await createTestUserChild(parent.id, child.id, RELATIONSHIP_ENUM.Mother);

      const result = await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-03-10',
          to: '2026-03-12',
          status: ABSENCE_ENUM.Absent,
          note: 'Flu',
        }),
        parent,
      );

      expect(result).toHaveLength(3);
      expect(result.every((entry) => entry.childId === child.id)).toBe(true);
      expect(result.every((entry) => entry.userId === parent.id)).toBe(true);
    });

    it('should allow a teacher assigned to the child group to create attendance rows', async () => {
      const group = await createTestGroup('Butterflies');
      const teacher = await createTestUser('teacher-absences@test.com', ROLE.Teacher);
      const child = await createTestChild('Oliver', 'Smith');
      await createTestEnrollment(child.id, group.id);
      await createTestGroupUser(group.id, teacher.id);

      const result = await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-03-14',
          to: '2026-03-15',
          status: ABSENCE_ENUM.Absent,
        }),
        teacher,
      );

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(teacher.id);
    });

    it('should reject a parent who is not linked to the child', async () => {
      const group = await createTestGroup('Ladybugs');
      const parent = await createTestUser('other-parent@test.com', ROLE.Parent);
      const child = await createTestChild('Ava', 'Johnson');
      await createTestEnrollment(child.id, group.id);

      await expect(
        service.create(
          new CreateAbsencesDto({
            childId: child.id,
            from: '2026-03-10',
            to: '2026-03-10',
            status: ABSENCE_ENUM.Absent,
          }),
          parent,
        ),
      ).rejects.toThrow(new ForbiddenException('You can only report absence for your own child'));
    });

    it('should reject a teacher who is not assigned to the child group', async () => {
      const [childGroup, teacherGroup] = await Promise.all([
        createTestGroup('Child Group'),
        createTestGroup('Teacher Group'),
      ]);
      const teacher = await createTestUser('teacher-outside-group@test.com', ROLE.Teacher);
      const child = await createTestChild('Mia', 'Stone');
      await createTestEnrollment(child.id, childGroup.id);
      await createTestGroupUser(teacherGroup.id, teacher.id);

      await expect(
        service.create(
          new CreateAbsencesDto({
            childId: child.id,
            from: '2026-03-10',
            to: '2026-03-10',
            status: ABSENCE_ENUM.Absent,
          }),
          teacher,
        ),
      ).rejects.toThrow(new ForbiddenException('Teacher can only report absence for children in their group'));
    });

    it('should delete absence rows when status is PRESENT', async () => {
      const group = await createTestGroup('Present Group');
      const teacher = await createTestUser('teacher-present@test.com', ROLE.Teacher);
      const child = await createTestChild('Tom', 'Present');
      await createTestEnrollment(child.id, group.id);
      await createTestGroupUser(group.id, teacher.id);

      await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-04-07',
          to: '2026-04-09',
          status: ABSENCE_ENUM.Absent,
        }),
        teacher,
      );

      const result = await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-04-07',
          to: '2026-04-09',
          status: ABSENCE_ENUM.Present,
        }),
        teacher,
      );

      expect(result).toHaveLength(0);

      const remaining = await service.findByChildAndDateRange(
        child.id,
        '2026-04-07',
        '2026-04-09',
        teacher,
      );
      expect(remaining).toHaveLength(0);
    });

    it('should update note and status when the same child and date is submitted again', async () => {
      const group = await createTestGroup('Upsert Group');
      const teacher = await createTestUser('teacher-upsert@test.com', ROLE.Teacher);
      const child = await createTestChild('Sam', 'Upsert');
      await createTestEnrollment(child.id, group.id);
      await createTestGroupUser(group.id, teacher.id);

      await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-04-01',
          to: '2026-04-01',
          status: ABSENCE_ENUM.Absent,
          note: 'Initial note',
        }),
        teacher,
      );

      const result = await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-04-01',
          to: '2026-04-01',
          status: ABSENCE_ENUM.Absent,
          note: 'Updated note',
        }),
        teacher,
      );

      expect(result).toHaveLength(1);
      expect(result[0].childId).toBe(child.id);
      expect(result[0].note).toBe('Updated note');
    });
  });

  describe('findByGroupAndDateRange', () => {
    it('should return only attendance rows for the target group and date range', async () => {
      const [groupOne, groupTwo] = await Promise.all([
        createTestGroup('Group One'),
        createTestGroup('Group Two'),
      ]);

      const [teacherOne, teacherTwo] = await createTestUsers([
        { email: 'teacher-one@test.com', role: ROLE.Teacher },
        { email: 'teacher-two@test.com', role: ROLE.Teacher },
      ]);

      const [childOne, childTwo] = await Promise.all([
        createTestChild('Leo', 'North'),
        createTestChild('Nora', 'South'),
      ]);

      await Promise.all([
        createTestEnrollment(childOne.id, groupOne.id),
        createTestEnrollment(childTwo.id, groupTwo.id),
        createTestGroupUser(groupOne.id, teacherOne.id),
        createTestGroupUser(groupTwo.id, teacherTwo.id),
      ]);

      await service.create(
        new CreateAbsencesDto({
          childId: childOne.id,
          from: '2026-03-05',
          to: '2026-03-07',
          status: ABSENCE_ENUM.Absent,
        }),
        teacherOne,
      );
      await service.create(
        new CreateAbsencesDto({
          childId: childTwo.id,
          from: '2026-03-06',
          to: '2026-03-06',
          status: ABSENCE_ENUM.Absent,
        }),
        teacherTwo,
      );

      const result = await service.findByGroupAndDateRange(
        groupOne.id,
        '2026-03-06',
        '2026-03-07',
      );

      expect(result).toHaveLength(2);
      expect(result.every((entry) => entry.childId === childOne.id)).toBe(true);
      expect(result.map((entry) => entry.date)).toEqual([
        new Date('2026-03-06'),
        new Date('2026-03-07'),
      ]);
    });
  });

  describe('findByChildAndDateRange', () => {
    it('should return a child attendance range for the linked parent', async () => {
      const group = await createTestGroup('Child View Group');
      const parent = await createTestUser('linked-parent@test.com', ROLE.Parent);
      const child = await createTestChild('Ella', 'Ray');
      await createTestEnrollment(child.id, group.id);
      await createTestUserChild(parent.id, child.id, RELATIONSHIP_ENUM.Guardian);

      const teacher = await createTestUser('group-teacher@test.com', ROLE.Teacher);
      await createTestGroupUser(group.id, teacher.id);
      await service.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: '2026-03-20',
          to: '2026-03-22',
          status: ABSENCE_ENUM.Absent,
          note: 'Family trip',
        }),
        teacher,
      );

      const result = await service.findByChildAndDateRange(
        child.id,
        '2026-03-21',
        '2026-03-22',
        parent,
      );

      expect(result).toHaveLength(2);
      expect(result.every((entry) => entry.childId === child.id)).toBe(true);
      expect(result.map((entry) => entry.date)).toEqual([
        new Date('2026-03-21'),
        new Date('2026-03-22'),
      ]);
    });

    it('should reject a parent who tries to access another child attendance range', async () => {
      const group = await createTestGroup('Parent Access Group');
      const parent = await createTestUser('blocked-parent@test.com', ROLE.Parent);
      const child = await createTestChild('Theo', 'Hall');
      await createTestEnrollment(child.id, group.id);

      await expect(
        service.findByChildAndDateRange(child.id, '2026-03-01', '2026-03-02', parent),
      ).rejects.toThrow(new ForbiddenException('You can only report absence for your own child'));
    });
  });
});

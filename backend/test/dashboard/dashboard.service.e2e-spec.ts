import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ABSENCE_ENUM, RELATIONSHIP_ENUM, ROLE, posts } from 'database/schema';
import { AbsencesService } from '../../src/absences/absences.service';
import { DashboardService } from '../../src/dashboard/dashboard.service';
import { PostsService } from '../../src/posts/posts.service';
import { CreateAbsencesDto } from '../../src/common/dto/create-attendance.dto';
import { createTestChild } from '../helpers/create-children';
import { createTestEnrollment } from '../helpers/create-enrollments';
import { createTestGroup } from '../helpers/create-groups';
import { createTestGroupUser } from '../helpers/create-group-users';
import { createTestUser } from '../helpers/create-users';
import { createTestUserChild } from '../helpers/create-user-children';
import { testDb } from '../helpers/test-db';

describe('DashboardService (e2e)', () => {
  let service: DashboardService;
  let absencesService: AbsencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, PostsService, AbsencesService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    absencesService = module.get<AbsencesService>(AbsencesService);
  });

  describe('getFeed', () => {
    it('should combine group posts with child attendance for a parent', async () => {
      const group = await createTestGroup('Bumblebees');
      const teacher = await createTestUser(
        'dashboard-teacher@test.com',
        ROLE.Teacher
      );
      const parent = await createTestUser(
        'dashboard-parent@test.com',
        ROLE.Parent
      );
      const child = await createTestChild('Emma', 'Doe');

      await createTestUserChild(parent.id, child.id, RELATIONSHIP_ENUM.Mother);
      await createTestEnrollment(child.id, group.id);
      await createTestGroupUser(group.id, teacher.id);

      const allPosts = await testDb
        .insert(posts)
        .values([
          {
            groupId: group.id,
            userId: teacher.id,
            title: 'Daily description - Bumblebees',
            message: 'Outdoor play and reading corner.',
            createdAt: new Date('2026-04-05T10:00:00.000Z'),
            updatedAt: new Date('2026-04-05T10:00:00.000Z'),
          },
          {
            groupId: group.id,
            userId: teacher.id,
            title: 'Daily description - Bumblebees',
            message: 'Painting and quiet play.',
            createdAt: new Date('2026-04-04T10:00:00.000Z'),
            updatedAt: new Date('2026-04-04T10:00:00.000Z'),
          },
        ])
        .returning();

      await absencesService.create(
        new CreateAbsencesDto({
          childId: child.id,
          from: allPosts[0].createdAt.toISOString().slice(0, 10),
          to: allPosts[0].createdAt.toISOString().slice(0, 10),
          status: ABSENCE_ENUM.Absent,
          note: 'Sick',
        }),
        parent
      );

      const oldestPostDate = allPosts[1].createdAt.toISOString().slice(0, 10);
      const newestPostDate = allPosts[0].createdAt.toISOString().slice(0, 10);

      const result = await service.getFeed(
        parent,
        oldestPostDate,
        newestPostDate
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(allPosts[0].id);
      expect(result[0].status).toBe(ABSENCE_ENUM.Absent);
      expect(result[1].id).toBe(allPosts[1].id);
      expect(result[1].status).toBe(ABSENCE_ENUM.Present);
      expect(result[0].description).toBe(allPosts[0].message);
    });

    it('should filter posts outside the requested date range', async () => {
      const group = await createTestGroup('Range Group');
      const teacher = await createTestUser(
        'range-teacher@test.com',
        ROLE.Teacher
      );
      const parent = await createTestUser('range-parent@test.com', ROLE.Parent);
      const child = await createTestChild('Nora', 'Range');

      await createTestUserChild(
        parent.id,
        child.id,
        RELATIONSHIP_ENUM.Guardian
      );
      await createTestEnrollment(child.id, group.id);
      await createTestGroupUser(group.id, teacher.id);

      await testDb.insert(posts).values([
        {
          groupId: group.id,
          userId: teacher.id,
          title: 'First',
          message: 'One',
          createdAt: new Date('2026-04-05T10:00:00.000Z'),
          updatedAt: new Date('2026-04-05T10:00:00.000Z'),
        },
        {
          groupId: group.id,
          userId: teacher.id,
          title: 'Second',
          message: 'Two',
          createdAt: new Date('2026-04-02T10:00:00.000Z'),
          updatedAt: new Date('2026-04-02T10:00:00.000Z'),
        },
      ]);

      const targetDate = '2026-04-05';

      const result = await service.getFeed(parent, targetDate, targetDate);

      expect(result).toHaveLength(1);
      expect(result.every((item) => item.date === targetDate)).toBe(true);
    });

    it('should throw NotFoundException when the parent has no enrolled child', async () => {
      const parent = await createTestUser(
        'no-child-parent@test.com',
        ROLE.Parent
      );

      await expect(
        service.getFeed(parent, '2026-04-01', '2026-04-05')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when parent has multiple children and no childId', async () => {
      const parent = await createTestUser('multi-parent@test.com', ROLE.Parent);
      const [groupOne, groupTwo] = await Promise.all([
        createTestGroup('Group One'),
        createTestGroup('Group Two'),
      ]);
      const [childOne, childTwo] = await Promise.all([
        createTestChild('Child', 'One'),
        createTestChild('Child', 'Two'),
      ]);

      await Promise.all([
        createTestUserChild(parent.id, childOne.id, RELATIONSHIP_ENUM.Mother),
        createTestUserChild(parent.id, childTwo.id, RELATIONSHIP_ENUM.Mother),
        createTestEnrollment(childOne.id, groupOne.id),
        createTestEnrollment(childTwo.id, groupTwo.id),
      ]);

      await expect(
        service.getFeed(parent, '2026-04-01', '2026-04-05')
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow selecting a specific child when the parent has multiple children', async () => {
      const teacher = await createTestUser(
        'specific-child-teacher@test.com',
        ROLE.Teacher
      );
      const parent = await createTestUser(
        'specific-child-parent@test.com',
        ROLE.Parent
      );
      const [groupOne, groupTwo] = await Promise.all([
        createTestGroup('Specific One'),
        createTestGroup('Specific Two'),
      ]);
      const [childOne, childTwo] = await Promise.all([
        createTestChild('Lia', 'One'),
        createTestChild('Lia', 'Two'),
      ]);

      await Promise.all([
        createTestUserChild(parent.id, childOne.id, RELATIONSHIP_ENUM.Father),
        createTestUserChild(parent.id, childTwo.id, RELATIONSHIP_ENUM.Father),
        createTestEnrollment(childOne.id, groupOne.id),
        createTestEnrollment(childTwo.id, groupTwo.id),
        createTestGroupUser(groupTwo.id, teacher.id),
      ]);

      await testDb.insert(posts).values({
        groupId: groupTwo.id,
        userId: teacher.id,
        title: 'Chosen child post',
        message: 'Only for child two group',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-03T10:00:00.000Z'),
      });

      const postDate = '2026-04-03';

      const result = await service.getFeed(
        parent,
        postDate,
        postDate,
        childTwo.id
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Chosen child post');
    });
  });
});

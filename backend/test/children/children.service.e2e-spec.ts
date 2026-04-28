import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChildrenService } from '../../src/children/children.service';
import { createTestUser } from '../helpers/create-users';
import { createTestGroup } from '../helpers/create-groups';
import { createTestChild } from '../helpers/create-children';
import { createTestEnrollment } from '../helpers/create-enrollments';
import { ROLE } from '../../src/database/schema';
describe('ChildrenService (e2e)', () => {
  let service: ChildrenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildrenService],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
  });

  describe('findAll', () => {
    it('should return all non-deleted children with their latest group ids', async () => {
      const currentGroup = await createTestGroup('Current Group');
      const previousGroup = await createTestGroup('Previous Group');
      const enrolledChild = await createTestChild('Elliot', 'River');
      const ungroupedChild = await createTestChild('Una', 'Solo');
      const deletedChild = await createTestChild('Derek', 'Gone');

      await createTestEnrollment(enrolledChild.id, previousGroup.id);
      await createTestEnrollment(enrolledChild.id, currentGroup.id);

      await service.delete(deletedChild.id);

      const result = await service.findAll();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: enrolledChild.id,
            firstName: 'Elliot',
            lastName: 'River',
            groupId: currentGroup.id,
          }),
          expect.objectContaining({
            id: ungroupedChild.id,
            firstName: 'Una',
            lastName: 'Solo',
            groupId: null,
          }),
        ]),
      );
      expect(result.some((child) => child.id === deletedChild.id)).toBe(false);
      expect(result.filter((child) => child.id === enrolledChild.id)).toHaveLength(1);
    });
  });

  describe('findByGroup', () => {
    it('should return children for a group', async () => {
      const group = await createTestGroup('Bumblebees');
      const emma = await createTestChild('Emma', 'Doe');
      const oliver = await createTestChild('Oliver', 'Smith');
      await createTestEnrollment(emma.id, group.id);
      await createTestEnrollment(oliver.id, group.id);

      const result = await service.findByGroup(group.id);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.firstName).sort()).toEqual(['Emma', 'Oliver']);
    });

    it('should return empty array when group has no children', async () => {
      const group = await createTestGroup('Empty Group');

      const result = await service.findByGroup(group.id);

      expect(result).toEqual([]);
    });

    it('should not return children from other groups', async () => {
      const group1 = await createTestGroup('Group One');
      const group2 = await createTestGroup('Group Two');
      await createTestUser('teacher@test.com', ROLE.Teacher);
      const ava = await createTestChild('Ava', 'Johnson');
      await createTestEnrollment(ava.id, group1.id);

      const result = await service.findByGroup(group2.id);

      expect(result).toEqual([]);
    });
  });

  describe('findForParent', () => {
    it('should return parent children with group ids', async () => {
      const group = await createTestGroup('Foxes');
      const parent = await createTestUser('parent@test.com', ROLE.Parent);
      const child = await createTestChild('Mia', 'Doe');
      await createTestEnrollment(child.id, group.id);

      const { db } = await import('../../src/database/db');
      const { userChildren } = await import('../../src/database/schema');

      await db
        .insert(userChildren)
        .values({ userId: parent.id, childId: child.id });

      const result = await service.findForParent(parent.id);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: child.id,
        firstName: 'Mia',
        groupId: group.id,
      });
    });
  });

  describe('create', () => {
    it('should create a child and active enrollment', async () => {
      const group = await createTestGroup('Otters');

      const result = await service.create({
        firstName: 'Nora',
        lastName: 'Lane',
        groupId: group.id,
        dateOfBirth: '2021-05-07',
        notes: 'Loves music',
      });

      expect(result).toMatchObject({
        firstName: 'Nora',
        lastName: 'Lane',
        groupId: group.id,
        notes: 'Loves music',
      });
      expect(result.dateOfBirth).toEqual(new Date('2021-05-07T00:00:00.000Z'));

      const byGroup = await service.findByGroup(group.id);
      expect(byGroup.some((child) => child.id === result.id)).toBe(true);
    });

    it('should throw NotFoundException when target group does not exist', async () => {
      await expect(
        service.create({
          firstName: 'Nora',
          lastName: 'Lane',
          groupId: 99999,
          dateOfBirth: '2021-05-07',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a child without enrollment when group is not provided', async () => {
      const result = await service.create({
        firstName: 'Solo',
        lastName: 'Kid',
        dateOfBirth: '2021-10-15',
      });

      expect(result).toMatchObject({
        firstName: 'Solo',
        lastName: 'Kid',
        groupId: null,
      });
      expect(result.dateOfBirth).toEqual(new Date('2021-10-15T00:00:00.000Z'));
    });
  });

  describe('update', () => {
    it('should update child fields and move active group', async () => {
      const sourceGroup = await createTestGroup('Owls');
      const targetGroup = await createTestGroup('Swans');
      const child = await createTestChild('Liam', 'West');
      await createTestEnrollment(child.id, sourceGroup.id);

      const result = await service.update(child.id, {
        firstName: 'Leo',
        lastName: 'North',
        groupId: targetGroup.id,
        dateOfBirth: '2020-08-12',
        notes: 'Updated note',
      });

      expect(result).toMatchObject({
        id: child.id,
        firstName: 'Leo',
        lastName: 'North',
        groupId: targetGroup.id,
        notes: 'Updated note',
      });
      expect(result.dateOfBirth).toEqual(new Date('2020-08-12T00:00:00.000Z'));
    });

    it('should throw NotFoundException when child does not exist', async () => {
      await expect(service.update(99999, { firstName: 'Ghost' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException when new group does not exist', async () => {
      const group = await createTestGroup('Penguins');
      const child = await createTestChild('Ivy', 'Jones');
      await createTestEnrollment(child.id, group.id);

      await expect(service.update(child.id, { groupId: 99999 })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should create an enrollment if missing during update', async () => {
      const group = await createTestGroup('Hedgehogs');
      const child = await createTestChild('Elsa', 'Moon');

      const result = await service.update(child.id, { groupId: group.id });

      expect(result.groupId).toBe(group.id);
    });
  });

  describe('delete', () => {
    it('should soft delete a child and make it unavailable in reads', async () => {
      const group = await createTestGroup('Seals');
      const child = await createTestChild('Dora', 'Vale');
      await createTestEnrollment(child.id, group.id);

      await service.delete(child.id);

      await expect(service.update(child.id, { firstName: 'Still here?' })).rejects.toThrow(
        NotFoundException
      );

      const inGroup = await service.findByGroup(group.id);
      expect(inGroup.some((row) => row.id === child.id)).toBe(false);
    });

    it('should throw NotFoundException when deleting missing child', async () => {
      await expect(service.delete(99999)).rejects.toThrow(NotFoundException);
    });
  });
});

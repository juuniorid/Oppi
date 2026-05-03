import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GroupsService } from '../../src/groups/groups.service';
import { createTestGroup } from '../helpers/create-groups';
import { createTestUser } from '../helpers/create-users';
import { createTestGroupUser } from '../helpers/create-group-users';
import { createTestChild } from '../helpers/create-children';
import { createTestEnrollment } from '../helpers/create-enrollments';
import { ROLE, TEACHER_ROLE } from '../../src/database/schema';

describe('GroupsService (e2e)', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  describe('findAll', () => {
    it('should return an empty array when there are no groups', async () => {
      const admin = await createTestUser(
        'findall-empty-admin@test.com',
        ROLE.Admin
      );
      const result = await service.findAll(admin);

      expect(result).toEqual([]);
    });

    it('should return groups ordered by name ascending', async () => {
      const admin = await createTestUser(
        'findall-order-admin@test.com',
        ROLE.Admin
      );
      await createTestGroup('Zebras');
      await createTestGroup('Ants');
      await createTestGroup('Bumblebees');

      const result = await service.findAll(admin);

      expect(result.map((group) => group.name)).toEqual([
        'Ants',
        'Bumblebees',
        'Zebras',
      ]);
    });

    it('should include childrenCount for enrolled children', async () => {
      const admin = await createTestUser(
        'findall-children-admin@test.com',
        ROLE.Admin
      );
      const group = await createTestGroup('Otters');
      const child1 = await createTestChild('Alice', 'Smith');
      const child2 = await createTestChild('Bob', 'Jones');
      await createTestEnrollment(child1.id, group.id);
      await createTestEnrollment(child2.id, group.id);

      const result = await service.findAll(admin);
      const found = result.find((g) => g.id === group.id);

      expect(found).toBeDefined();
      expect(found!.childrenCount).toBe(2);
    });

    it('should include teachers list for assigned teachers', async () => {
      const admin = await createTestUser(
        'findall-teachers-admin@test.com',
        ROLE.Admin
      );
      const group = await createTestGroup('Wolves');
      const teacher = await createTestUser('teacher@wolves.com', ROLE.Teacher, {
        firstName: 'Kati',
        lastName: 'Kool',
      });
      await createTestGroupUser(group.id, teacher.id, TEACHER_ROLE.Head);

      const result = await service.findAll(admin);
      const found = result.find((g) => g.id === group.id);

      expect(found).toBeDefined();
      expect(found!.teachers).toHaveLength(1);
      expect(found!.teachers[0]).toMatchObject({
        id: teacher.id,
        firstName: 'Kati',
        lastName: 'Kool',
        role: TEACHER_ROLE.Head,
      });
    });

    it('should return childrenCount 0 and empty teachers for group with no members', async () => {
      const admin = await createTestUser(
        'findall-members-admin@test.com',
        ROLE.Admin
      );
      const group = await createTestGroup('Empty Group');

      const result = await service.findAll(admin);
      const found = result.find((g) => g.id === group.id);

      expect(found).toBeDefined();
      expect(found!.childrenCount).toBe(0);
      expect(found!.teachers).toEqual([]);
    });

    it('should return only assigned groups for a teacher', async () => {
      const teacher = await createTestUser(
        'assigned-teacher@test.com',
        ROLE.Teacher
      );
      const assignedGroup = await createTestGroup('Assigned Group');
      await createTestGroup('Other Group');
      await createTestGroupUser(
        assignedGroup.id,
        teacher.id,
        TEACHER_ROLE.General
      );

      const result = await service.findAll(teacher);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(assignedGroup.id);
    });
  });

  describe('create', () => {
    it('should create a group with required fields', async () => {
      const result = await service.create({ name: 'New Group' });

      expect(result).toMatchObject({
        name: 'New Group',
        childrenCount: 0,
        teachers: [],
      });
      expect(result.id).toBeDefined();
    });

    it('should create a group with all fields', async () => {
      const result = await service.create({
        name: 'Full Group',
        description: 'A fully specified group',
        ageMin: '3',
        ageMax: '5',
        kindergartenName: 'Test Kindergarten',
      });

      expect(result).toMatchObject({
        name: 'Full Group',
        description: 'A fully specified group',
        ageMin: '3',
        ageMax: '5',
        kindergartenName: 'Test Kindergarten',
      });
    });
  });

  describe('update', () => {
    it('should update group name', async () => {
      const group = await createTestGroup('Old Name');

      const result = await service.update(group.id, { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.id).toBe(group.id);
    });

    it('should update ageMin and ageMax', async () => {
      const group = await createTestGroup('Age Group');

      const result = await service.update(group.id, {
        ageMin: '2',
        ageMax: '4',
      });

      expect(result.ageMin).toBe('2');
      expect(result.ageMax).toBe('4');
    });

    it('should throw NotFoundException when group does not exist', async () => {
      await expect(service.update(99999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include childrenCount and teachers in update result', async () => {
      const group = await createTestGroup('Update Test');
      const child = await createTestChild('Tina', 'Doe');
      await createTestEnrollment(child.id, group.id);

      const result = await service.update(group.id, {
        description: 'Updated desc',
      });

      expect(result.childrenCount).toBe(1);
      expect(result.teachers).toEqual([]);
    });

    it('should assign teachers when teacherIds is provided', async () => {
      const group = await createTestGroup('Teacher Assignment');
      const teacher = await createTestUser('assign@teacher.com', ROLE.Teacher, {
        firstName: 'Assign',
        lastName: 'Teacher',
      });

      const result = await service.update(group.id, {
        teacherIds: [teacher.id],
      });

      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0]).toMatchObject({
        id: teacher.id,
        firstName: 'Assign',
        lastName: 'Teacher',
      });
    });

    it('should replace existing teachers when teacherIds is provided', async () => {
      const group = await createTestGroup('Replace Teachers');
      const oldTeacher = await createTestUser('old@teacher.com', ROLE.Teacher);
      const newTeacher = await createTestUser('new@teacher.com', ROLE.Teacher, {
        firstName: 'New',
        lastName: 'One',
      });
      await createTestGroupUser(group.id, oldTeacher.id, TEACHER_ROLE.General);

      const result = await service.update(group.id, {
        teacherIds: [newTeacher.id],
      });

      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0].id).toBe(newTeacher.id);
    });

    it('should remove all teachers when teacherIds is empty array', async () => {
      const group = await createTestGroup('Remove Teachers');
      const teacher = await createTestUser('remove@teacher.com', ROLE.Teacher);
      await createTestGroupUser(group.id, teacher.id, TEACHER_ROLE.General);

      const result = await service.update(group.id, { teacherIds: [] });

      expect(result.teachers).toEqual([]);
    });

    it('should not change teachers when teacherIds is omitted', async () => {
      const group = await createTestGroup('Keep Teachers');
      const teacher = await createTestUser('keep@teacher.com', ROLE.Teacher, {
        firstName: 'Keep',
        lastName: 'Me',
      });
      await createTestGroupUser(group.id, teacher.id, TEACHER_ROLE.General);

      const result = await service.update(group.id, {
        name: 'Keep Teachers Renamed',
      });

      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0].id).toBe(teacher.id);
    });

    it('should throw BadRequestException when a teacherId is not a teacher', async () => {
      const group = await createTestGroup('Bad Teacher');
      const adminUser = await createTestUser('admin@test.com', ROLE.Admin);

      await expect(
        service.update(group.id, { teacherIds: [adminUser.id] })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create with teachers', () => {
    it('should create a group and assign teachers', async () => {
      const teacher = await createTestUser(
        'create-assign@teacher.com',
        ROLE.Teacher,
        {
          firstName: 'Kati',
          lastName: 'Lepp',
        }
      );

      const result = await service.create({
        name: 'With Teachers',
        teacherIds: [teacher.id],
      });

      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0]).toMatchObject({
        id: teacher.id,
        firstName: 'Kati',
        lastName: 'Lepp',
      });
    });

    it('should throw BadRequestException when a teacherId in create is not a teacher', async () => {
      const parent = await createTestUser('parent@test.com', ROLE.Parent);

      await expect(
        service.create({ name: 'Bad Create', teacherIds: [parent.id] })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findTeachers', () => {
    it('should return all users with TEACHER role', async () => {
      const teacher1 = await createTestUser('t1@test.com', ROLE.Teacher, {
        firstName: 'Alpha',
        lastName: 'T',
      });
      const teacher2 = await createTestUser('t2@test.com', ROLE.Teacher, {
        firstName: 'Beta',
        lastName: 'T',
      });
      await createTestUser('admin@findtest.com', ROLE.Admin);

      const result = await service.findTeachers();

      const ids = result.map((t) => t.id);
      expect(ids).toContain(teacher1.id);
      expect(ids).toContain(teacher2.id);
      expect(result.every((t) => 'email' in t)).toBe(true);
    });

    it('should return an empty array when no teachers exist', async () => {
      const result = await service.findTeachers();
      expect(result).toEqual([]);
    });
  });
});

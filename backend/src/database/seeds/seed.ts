import { db, client } from '../db';
import {
  users,
  groups,
  children,
  childUsers,
  enrollments,
  groupUsers,
  posts,
} from '../schema';

async function seed(): Promise<void> {
  try {
    console.warn('🌱 Starting database seed...');

    // Insert groups
    const insertedGroups = await db
      .insert(groups)
      .values([
        {
          name: 'Bumblebees',
          description: 'Group for 4–5 year olds',
          ageMin: 4,
          ageMax: 5,
        },
        {
          name: 'Butterflies',
          description: 'Group for 5–6 year olds',
          ageMin: 5,
          ageMax: 6,
        },
      ])
      .returning();

    console.warn(`✅ Inserted ${insertedGroups.length} groups`);

    // Insert users (teachers and parents)
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          email: 'teacher1@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          googleId: 'google-teacher-1',
          role: 'TEACHER',
          phone: '+372 5123 4567',
        },
        {
          email: 'parent1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          googleId: 'google-parent-1',
          role: 'PARENT',
          phone: '+372 5123 4568',
        },
        {
          email: 'parent2@example.com',
          firstName: 'Sarah',
          lastName: 'Doe',
          googleId: 'google-parent-2',
          role: 'PARENT',
          phone: '+372 5123 4569',
        },
      ])
      .returning();

    console.warn(`✅ Inserted ${insertedUsers.length} users`);

    // Insert children
    const insertedChildren = await db
      .insert(children)
      .values([
        {
          firstName: 'Emma',
          lastName: 'Doe',
          dateOfBirth: new Date('2020-05-14'),
          notes: 'Allergic to strawberries',
        },
        {
          firstName: 'Oliver',
          lastName: 'Smith',
          dateOfBirth: new Date('2020-01-22'),
        },
        {
          firstName: 'Ava',
          lastName: 'Johnson',
          dateOfBirth: new Date('2019-10-03'),
        },
      ])
      .returning();

    console.warn(`✅ Inserted ${insertedChildren.length} children`);

    // Enroll children into groups
    await db.insert(enrollments).values([
      {
        childId: insertedChildren[0]!.id,
        groupId: insertedGroups[0]!.id,
        startDate: new Date('2024-09-01'),
      },
      {
        childId: insertedChildren[1]!.id,
        groupId: insertedGroups[0]!.id,
        startDate: new Date('2024-09-01'),
      },
      {
        childId: insertedChildren[2]!.id,
        groupId: insertedGroups[1]!.id,
        startDate: new Date('2024-09-01'),
      },
    ]);

    console.warn('✅ Created enrollments');

    // Link parents to children
    await db.insert(childUsers).values([
      {
        userId: insertedUsers[1]!.id,
        childId: insertedChildren[0]!.id,
        relationship: 'parent',
        isPrimary: true,
      },
      {
        userId: insertedUsers[2]!.id,
        childId: insertedChildren[0]!.id,
        relationship: 'parent',
        isPrimary: false,
      },
    ]);

    console.warn('✅ Linked parents to children');

    // Link teacher to group
    await db.insert(groupUsers).values([
      {
        userId: insertedUsers[0]!.id,
        groupId: insertedGroups[0]!.id,
        role: 'PEA',
      },
    ]);

    console.warn('✅ Linked teacher to group');

    // Create a sample announcement
    await db.insert(posts).values([
      {
        groupId: insertedGroups[0]!.id,
        createdByUserId: insertedUsers[0]!.id,
        title: 'New semester info',
        message: 'Welcome to the new semester! Please remember indoor shoes.',
      },
    ]);

    console.warn('✅ Created sample group post');
    console.warn('🌱 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

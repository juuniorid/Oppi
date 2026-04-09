import { db, client } from '../db';
import {
  users,
  groups,
  children,
  userChildren,
  enrollments,
  absences,
  posts,
  ROLE,
  RELATIONSHIP_ENUM,
  ABSENCE_ENUM,
} from '../schema';
import { inArray } from 'drizzle-orm';

async function seed(): Promise<void> {
  try {
    console.warn('🌱 Starting database seed...');

    // Base entities: groups
    // Note: If your schema doesn't have a unique constraint on 'name',
    // it's safer to check first to avoid duplicates.
    let allGroups = await db.select().from(groups);
    if (allGroups.length === 0) {
      allGroups = await db
        .insert(groups)
        .values([
          { name: 'Bumblebees', kindergartenName: 'Sunshine Kindergarten' },
          { name: 'Butterflies', kindergartenName: 'Sunshine Kindergarten' },
        ])
        .returning();
      console.warn(`✅ Inserted ${allGroups.length} groups`);
    } else {
      console.warn('ℹ️ Groups already exist, skipping group insert');
    }

    // Base entities: users
    // We use onConflictDoNothing on the email column
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          email: 'teacher1@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          googleId: 'google-teacher-1',
          role: ROLE.Teacher,
          phone: '+372 5123 4567',
        },
        {
          email: 'parent1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          googleId: 'google-parent-1',
          role: ROLE.Parent,
          phone: '+372 5123 4568',
        },
        {
          email: 'parent2@example.com',
          firstName: 'Sarah',
          lastName: 'Doe',
          googleId: 'google-parent-2',
          role: ROLE.Parent,
          phone: '+372 5123 4569',
        },
      ])
      .onConflictDoNothing({ target: users.email })
      .returning();

    // FALLBACK: If insertedUsers is empty, fetch them from the DB so we have the IDs
    const allUsers =
      insertedUsers.length === 3
        ? insertedUsers
        : await db
            .select()
            .from(users)
            .where(
              inArray(users.email, [
                'teacher1@example.com',
                'parent1@example.com',
                'parent2@example.com',
              ])
            );

    console.warn(`✅ Users ready (Total: ${allUsers.length})`);

    // Base entities: children
    await db
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

      .onConflictDoNothing()
      .returning();

    const allChildren = await db.select().from(children);

    console.warn(`✅ Children ready (Total: ${allChildren.length})`);

    // Resolve the seeded records needed for links and dashboard data
    const parent1 = allUsers.find((u) => u.email === 'parent1@example.com');
    const parent2 = allUsers.find((u) => u.email === 'parent2@example.com');
    const teacher1 = allUsers.find((u) => u.email === 'teacher1@example.com');
    const emma = allChildren.find((c) => c.firstName === 'Emma');
    const bumblebees = allGroups.find((g) => g.name === 'Bumblebees');
    const butterflies = allGroups.find((g) => g.name === 'Butterflies');

    // Dashboard access: link Emma to both parents
    if (parent1 && parent2 && emma) {
      await db
        .insert(userChildren)
        .values([
          {
            userId: parent1.id,
            childId: emma.id,
            relationship: RELATIONSHIP_ENUM.Father,
            isPrimary: true,
          },
          {
            userId: parent2.id,
            childId: emma.id,
            relationship: RELATIONSHIP_ENUM.Mother,
            isPrimary: false,
          },
        ])
        .onConflictDoNothing();
      console.warn('✅ Linked parents to children');
    }

    // Dashboard access: enroll Emma into Bumblebees
    if (emma && bumblebees) {
      await db
        .insert(enrollments)
        .values({
          childId: emma.id,
          groupId: bumblebees.id,
          startDate: new Date('2025-09-01'),
        })
        .onConflictDoNothing();
      console.warn('✅ Linked child to group');
    }

    // Dashboard day data: attendance for each post day
    if (parent1 && emma) {
      await db
        .insert(absences)
        .values([
          {
            childId: emma.id,
            userId: parent1.id,
            date: new Date('2026-04-05'),
            status: ABSENCE_ENUM.Present,
            note: 'Emma arrived on time and joined all group activities.',
          },
          {
            childId: emma.id,
            userId: parent1.id,
            date: new Date('2026-04-04'),
            status: ABSENCE_ENUM.Absent,
            note: 'Stayed home with a mild fever.',
          },
          {
            childId: emma.id,
            userId: parent1.id,
            date: new Date('2026-04-03'),
            status: ABSENCE_ENUM.Present,
            note: 'Emma participated in the full day program.',
          },
        ])
        .onConflictDoNothing({ target: [absences.childId, absences.date] });
      console.warn('✅ Inserted absences for dashboard view');
    }

    // Dashboard day data: group posts shown in the feed
    const postValues = [];

    if (teacher1 && bumblebees) {
      postValues.push({
        groupId: bumblebees.id,
        userId: teacher1.id,
        title: 'Daily description - Bumblebees',
        message:
          'Today we played outside, practiced colors, and spent time in the reading corner.',
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        updatedAt: new Date('2026-04-05T10:00:00.000Z'),
      });

      postValues.push({
        groupId: bumblebees.id,
        userId: teacher1.id,
        title: 'Daily description - Bumblebees',
        message:
          'The group painted spring flowers, sang songs together, and had a calm afternoon nap.',
        createdAt: new Date('2026-04-04T10:00:00.000Z'),
        updatedAt: new Date('2026-04-04T10:00:00.000Z'),
      });

      postValues.push({
        groupId: bumblebees.id,
        userId: teacher1.id,
        title: 'Daily description - Bumblebees',
        message:
          'We built towers with blocks, practiced counting to ten, and ended the day with a music circle.',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-03T10:00:00.000Z'),
      });
    }

    // Add one post for the second sample group as well
    if (teacher1 && butterflies) {
      postValues.push({
        groupId: butterflies.id,
        userId: teacher1.id,
        title: 'Daily description - Butterflies',
        message:
          'We practiced counting, built with blocks, and listened to a story about forest animals.',
        createdAt: new Date('2026-04-03T10:00:00.000Z'),
        updatedAt: new Date('2026-04-03T10:00:00.000Z'),
      });
    }

    // Insert the prepared dashboard posts
    if (postValues.length > 0) {
      const insertedPosts = await db
        .insert(posts)
        .values(postValues)
        .returning();
      console.warn(`✅ Inserted ${insertedPosts.length} posts`);
    }

    console.warn('🌱 Seed process finished!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error('Seed execution failed:', error);
  process.exit(1);
});

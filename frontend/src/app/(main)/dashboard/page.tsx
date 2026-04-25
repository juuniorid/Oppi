'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardFeedCard } from '@/app/(main)/dashboard/DashboardFeedCard';
import { PageTitle } from '@/components/PageTitle';
import { showErrorToast } from '@/components/ErrorToast';
import authService from '@/services/auth.service';
import { useChildSelection } from '@/context/ChildSelectionContext';
import { useUserRole } from '@/context/UserRoleContext';
import calendarService from '@/services/calendar.service';
import groupService from '@/services/group.service';
import postService from '@/services/post.service';
import type { AbsenceEntry, Group, Post } from '@/types';
import { ATTENDANCE_STATUS, USER_ROLE } from '@/types/enums';
import dayjs from 'dayjs';

import type { DashboardFeedItem } from './dashboard.types';

function mapAbsencesToDashboardItems(
  absences: AbsenceEntry[],
  groupName?: string | null
): DashboardFeedItem[] {
  return [...absences]
    .sort(
      (left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf()
    )
    .slice(0, 5)
    .map((entry) => {
      const name = [entry.firstName, entry.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      return {
        id: entry.id,
        date: entry.date,
        title: `Summary - ${name || 'Attendance'}`,
        description:
          entry.note?.trim() ||
          (entry.status === ATTENDANCE_STATUS.ABSENT
            ? 'Puudumise märge puudub.'
            : 'Kohaloleku märge puudub.'),
        groupName: groupName ?? 'Bumblebees',
        childId: entry.childId,
        status: entry.status,
      };
    });
}

function mapPostsToDashboardItems(
  posts: Post[],
  groupById: Record<number, Group>
): DashboardFeedItem[] {
  return [...posts]
    .sort(
      (left, right) =>
        dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf()
    )
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      date: post.createdAt,
      title: post.title,
      description: post.message,
      groupName: groupById[post.groupId]?.name ?? 'Bumblebees',
    }));
}

export default function DashboardPage() {
  // const { role, loading: roleLoading } = useUserRole();
  // const { selectedChildId, selectedGroupId, loading: childLoading } = useChildSelection();
  const { loading: roleLoading } = useUserRole(); // Used only for demo
  const { loading: childLoading } = useChildSelection(); // Used only for demo
  const role = USER_ROLE.PARENT; // Used only for demo
  const selectedChildId = 1; // Used only for demo
  const selectedGroupId = 1; // Used only for demo
  const [dashboardFeedItems, setDashboardFeedItems] = useState<
    DashboardFeedItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!role) {
      setDashboardFeedItems([]);
      return;
    }

    const from = dayjs().startOf('month').format('YYYY-MM-DD');
    const to = dayjs().endOf('month').format('YYYY-MM-DD');

    setIsLoading(true);

    try {
      const groups = await groupService.getGroups();
      const groupById = Object.fromEntries(
        groups.map((group) => [group.id, group])
      ) as Record<number, Group>;

      if (role === USER_ROLE.PARENT) {
        const absenceEntries = selectedChildId
          ? await calendarService.getAbsencesByChild({
              childId: selectedChildId,
              from,
              to,
            })
          : [];

        setDashboardFeedItems(
          mapAbsencesToDashboardItems(
            Array.isArray(absenceEntries) ? absenceEntries : [],
            groupById[selectedGroupId]?.name
          )
        );
        return;
      }

      if (role === USER_ROLE.TEACHER) {
        const profile = await authService.getProfile();
        // const teacherGroupId = profile.groupIds?.[0] ?? null;
        const teacherGroupId = 1;

        if (!teacherGroupId) {
          setDashboardFeedItems([]);
          return;
        }

        const posts = await postService.getPostsByGroup(teacherGroupId);
        setDashboardFeedItems(
          mapPostsToDashboardItems(Array.isArray(posts) ? posts : [], groupById)
        );
        return;
      }

      setDashboardFeedItems([]);
    } catch {
      setDashboardFeedItems([]);
      showErrorToast('Avalehe andmete laadimine ebaõnnestus.');
    } finally {
      setIsLoading(false);
    }
  }, [role, selectedChildId, selectedGroupId]);

  useEffect(() => {
    if (roleLoading) {
      return;
    }

    if (role === USER_ROLE.PARENT && childLoading) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [childLoading, loadDashboardData, role, roleLoading]);

  return (
    <div className="space-y-8">
      <PageTitle>Avaleht</PageTitle>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-ink">Päevakokkuvõtted</h2>
          <p className="text-sm text-mediumInk">
            Kohaloleku ja puudumiste viimased sissekanded kuvatakse siin.
          </p>
        </div>
        {isLoading ? (
          <p className="text-sm text-mediumInk">Laadin avalehe andmeid...</p>
        ) : dashboardFeedItems.length === 0 ? (
          <p className="text-sm text-mediumInk">Päevakokkuvõtteid ei leitud.</p>
        ) : (
          <div className="space-y-6">
            {dashboardFeedItems.map((item) => (
              <DashboardFeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

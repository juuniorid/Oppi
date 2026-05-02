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
import { USER_ROLE } from '@/types/enums';
import dayjs from 'dayjs';

import type { DashboardFeedItem } from './dashboard.types';

const DASHBOARD_ITEMS_DISPLAYED = 10;

function toDateKey(value: string): string {
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : dayjs(value).format('YYYY-MM-DD');
}

function getRecentPosts(posts: Post[]): Post[] {
  return posts.slice(0, DASHBOARD_ITEMS_DISPLAYED);
}

function mapPostsToDashboardItems(
  posts: Post[],
  options?: {
    childId?: number;
    statusByDate?: Record<string, DashboardFeedItem['status']>;
  }
): DashboardFeedItem[] {
  return getRecentPosts(posts).map((post) => ({
    id: post.id,
    date: post.createdAt,
    title: post.title,
    description: post.message,
    childId: options?.childId,
    status: options?.statusByDate?.[toDateKey(post.createdAt)],
  }));
}

function mapAbsenceStatusByDate(
  absences: AbsenceEntry[]
): Record<string, DashboardFeedItem['status']> {
  return Object.fromEntries(
    absences.map((entry) => [toDateKey(entry.date), entry.status])
  );
}

export default function DashboardPage() {
  const { role, loading: roleLoading } = useUserRole();
  const {
    children,
    selectedChildId,
    loading: childLoading,
  } = useChildSelection();
  const [dashboardFeedItems, setDashboardFeedItems] = useState<
    DashboardFeedItem[]
  >([]);
  const [dashboardGroupName, setDashboardGroupName] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!role) {
      setDashboardFeedItems([]);
      setDashboardGroupName(null);
      return;
    }

    setIsLoading(true);

    try {
      if (role === USER_ROLE.PARENT) {
        const selectedChild = children.find(
          (child) => child.id === selectedChildId
        );
        const selectedGroupId = selectedChild?.groupId ?? null;
        const selectedGroupName = selectedChild?.groupName ?? null;

        if (!selectedChild || !selectedGroupId) {
          setDashboardFeedItems([]);
          setDashboardGroupName(selectedGroupName);
          return;
        }

        const posts = await postService.getPostsByGroup(selectedGroupId);
        const recentPosts = getRecentPosts(Array.isArray(posts) ? posts : []);
        const absenceFrom =
          recentPosts.length > 0
            ? dayjs(recentPosts[recentPosts.length - 1].createdAt).format(
                'YYYY-MM-DD'
              )
            : dayjs()
                .subtract(DASHBOARD_ITEMS_DISPLAYED, 'day')
                .format('YYYY-MM-DD');
        const absenceTo =
          recentPosts.length > 0
            ? dayjs(recentPosts[0].createdAt).format('YYYY-MM-DD')
            : dayjs().format('YYYY-MM-DD');
        const absences = await calendarService.getAbsencesByChild({
          childId: selectedChild.id,
          from: absenceFrom,
          to: absenceTo,
        });

        setDashboardGroupName(selectedGroupName);
        setDashboardFeedItems(
          mapPostsToDashboardItems(recentPosts, {
            childId: selectedChild.id,
            statusByDate: mapAbsenceStatusByDate(
              Array.isArray(absences) ? absences : []
            ),
          })
        );
        return;
      }

      if (role === USER_ROLE.TEACHER) {
        const groups = await groupService.getGroups();
        const groupById = Object.fromEntries(
          groups.map((group) => [group.id, group])
        ) as Record<number, Group>;
        const profile = await authService.getProfile();
        const teacherGroupId = profile.groupIds?.[0] ?? null;

        if (!teacherGroupId) {
          setDashboardFeedItems([]);
          setDashboardGroupName(null);
          return;
        }

        const posts = await postService.getPostsByGroup(teacherGroupId);
        setDashboardGroupName(groupById[teacherGroupId]?.name ?? null);
        setDashboardFeedItems(
          mapPostsToDashboardItems(Array.isArray(posts) ? posts : [], {})
        );
        return;
      }

      setDashboardFeedItems([]);
      setDashboardGroupName(null);
    } catch {
      setDashboardFeedItems([]);
      setDashboardGroupName(null);
      showErrorToast('Avalehe andmete laadimine ebaõnnestus.');
    } finally {
      setIsLoading(false);
    }
  }, [children, role, selectedChildId]);

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
          <h2 className="text-lg font-semibold text-ink">
            {dashboardGroupName
              ? `Päevakokkuvõtted - ${dashboardGroupName}`
              : 'Päevakokkuvõtted'}
          </h2>
          <p className="text-sm text-mediumInk">
            Rühma viimased teated kuvatakse siin.
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

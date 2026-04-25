'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardFeedCard } from '@/app/(main)/dashboard/DashboardFeedCard';
import { PageTitle } from '@/components/PageTitle';
import { showErrorToast } from '@/components/ErrorToast';
import { useChildSelection } from '@/context/ChildSelectionContext';
import { useUserRole } from '@/context/UserRoleContext';
import calendarService from '@/services/calendar.service';
import type { AbsenceEntry } from '@/types';
import { ATTENDANCE_STATUS, USER_ROLE } from '@/types/enums';
import dayjs from 'dayjs';

import type { DashboardFeedItem } from './dashboard.types';

export default function DashboardPage() {
  const { role, loading: roleLoading } = useUserRole();
  const {
    selectedChildId,
    selectedGroupId,
    loading: childLoading,
  } = useChildSelection();
  const [absences, setAbsences] = useState<AbsenceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!role) {
      setAbsences([]);
      return;
    }

    const from = dayjs().startOf('month').format('YYYY-MM-DD');
    const to = dayjs().endOf('month').format('YYYY-MM-DD');
    const groupId = selectedGroupId ?? 1;

    setIsLoading(true);

    try {
      const absenceEntries =
        role === USER_ROLE.PARENT
          ? selectedChildId
            ? await calendarService.getAbsencesByChild({
                childId: selectedChildId,
                from,
                to,
              })
            : []
          : await calendarService.getAbsencesByGroup({ groupId, from, to });

      setAbsences(Array.isArray(absenceEntries) ? absenceEntries : []);
    } catch {
      setAbsences([]);
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

  const dashboardFeedItems = useMemo<DashboardFeedItem[]>(() => {
    return [...absences]
      .sort(
        (left, right) =>
          dayjs(right.date).valueOf() - dayjs(left.date).valueOf()
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
          childId: entry.childId,
          status: entry.status,
        };
      });
  }, [absences]);

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

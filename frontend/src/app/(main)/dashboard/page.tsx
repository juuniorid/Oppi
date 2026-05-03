'use client';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useCallback, useEffect, useState } from 'react';
import { CreatePostDialog } from '@/components/dashboard/CreatePostDialog';
import { DashboardFeedCard } from '@/app/(main)/dashboard/DashboardFeedCard';
import { PageTitle } from '@/components/PageTitle';
import { showErrorToast } from '@/components/ErrorToast';
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
    defaultStatus?: DashboardFeedItem['status'];
  }
): DashboardFeedItem[] {
  const defaultStatus = options?.defaultStatus ?? 'PRESENT';

  return getRecentPosts(posts).map((post) => ({
    id: post.id,
    date: post.createdAt,
    title: post.title,
    description: post.message,
    childId: options?.childId,
    status: options?.statusByDate?.[toDateKey(post.createdAt)] ?? defaultStatus,
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
  const canManage = role === USER_ROLE.TEACHER || role === USER_ROLE.ADMIN;
  const [dashboardFeedItems, setDashboardFeedItems] = useState<
    DashboardFeedItem[]
  >([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [dashboardGroupId, setDashboardGroupId] = useState<number | null>(null);
  const [dashboardGroupName, setDashboardGroupName] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedManagedGroupId, setSelectedManagedGroupId] = useState<
    number | null
  >(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [postDialogMode, setPostDialogMode] = useState<'create' | 'edit'>(
    'create'
  );
  const [editingPost, setEditingPost] = useState<DashboardFeedItem | null>(
    null
  );
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!role) {
      setDashboardFeedItems([]);
      setAvailableGroups([]);
      setDashboardGroupId(null);
      setDashboardGroupName(null);
      return;
    }

    setIsLoading(true);

    try {
      if (role === USER_ROLE.PARENT) {
        setAvailableGroups([]);
        const selectedChild = children.find(
          (child) => child.id === selectedChildId
        );
        const selectedGroupId = selectedChild?.groupId ?? null;
        const selectedGroupName = selectedChild?.groupName ?? null;

        if (!selectedChild || !selectedGroupId) {
          setDashboardFeedItems([]);
          setDashboardGroupId(null);
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
        setDashboardGroupId(null);
        setDashboardFeedItems(
          mapPostsToDashboardItems(recentPosts, {
            childId: selectedChild.id,
            defaultStatus: 'PRESENT',
            statusByDate: mapAbsenceStatusByDate(
              Array.isArray(absences) ? absences : []
            ),
          })
        );
        return;
      }

      if (canManage) {
        const groups = await groupService.getGroups();
        // Keep the current group if it is still available; otherwise fall back to the first available group.
        const activeGroupId =
          selectedManagedGroupId &&
          groups.some((group) => group.id === selectedManagedGroupId)
            ? selectedManagedGroupId
            : (groups[0]?.id ?? null);
        const activeGroup =
          groups.find((group) => group.id === activeGroupId) ?? null;

        setAvailableGroups(groups);

        if (activeGroupId !== selectedManagedGroupId) {
          setSelectedManagedGroupId(activeGroupId);
        }

        if (!activeGroupId) {
          setDashboardFeedItems([]);
          setDashboardGroupId(null);
          setDashboardGroupName(null);
          return;
        }

        const posts = await postService.getPostsByGroup(activeGroupId);
        setDashboardGroupId(activeGroupId);
        setDashboardGroupName(activeGroup?.name ?? null);
        setDashboardFeedItems(
          mapPostsToDashboardItems(Array.isArray(posts) ? posts : [], {})
        );
        return;
      }

      setDashboardFeedItems([]);
      setDashboardGroupId(null);
      setDashboardGroupName(null);
    } catch {
      setDashboardFeedItems([]);
      setDashboardGroupId(null);
      setDashboardGroupName(null);
      showErrorToast('Avalehe andmete laadimine ebaõnnestus.');
    } finally {
      setIsLoading(false);
    }
  }, [canManage, children, role, selectedChildId, selectedManagedGroupId]);

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

  const handleManagedGroupChange = (event: SelectChangeEvent<string>) => {
    const nextGroupId = Number(event.target.value);
    setSelectedManagedGroupId(Number.isNaN(nextGroupId) ? null : nextGroupId);
  };

  const openPostDialog = () => {
    setPostDialogMode('create');
    setEditingPost(null);
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (item: DashboardFeedItem) => {
    setPostDialogMode('edit');
    setEditingPost(item);
    setIsPostDialogOpen(true);
  };

  const closePostDialog = () => {
    setIsPostDialogOpen(false);
    setPostDialogMode('create');
    setEditingPost(null);
  };

  const handleDeletePost = async (item: DashboardFeedItem) => {
    const shouldDelete = window.confirm(`Kustuta postitus "${item.title}"?`);
    if (!shouldDelete) {
      return;
    }

    setDeletingPostId(item.id);
    try {
      await postService.deletePost(item.id);
      await loadDashboardData();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Postituse kustutamine ebaõnnestus.');
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 pb-5 mt-2 ml-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-ink">
              {dashboardGroupName
                ? `Päevakokkuvõtted - ${dashboardGroupName}`
                : 'Päevakokkuvõtted'}
            </h2>
            <p className="text-sm text-mediumInk">
              {canManage
                ? 'Vali rühm ja halda selle postitusi.'
                : 'Rühma viimased postitused kuvatakse siin.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {role === USER_ROLE.ADMIN ||
            (role === USER_ROLE.TEACHER && availableGroups.length > 1) ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="dashboard-group-select-label">Rühm</InputLabel>
                <Select
                  labelId="dashboard-group-select-label"
                  value={
                    selectedManagedGroupId != null
                      ? String(selectedManagedGroupId)
                      : ''
                  }
                  label="Rühm"
                  onChange={handleManagedGroupChange}
                  disabled={availableGroups.length === 0}
                >
                  {availableGroups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>
                      {group.name || `Rühm ${group.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            {canManage ? (
              <Button variant="neutral" onClick={openPostDialog}>
                Lisa uus
              </Button>
            ) : null}
          </div>
        </div>
        {isLoading ? (
          <p className="text-sm text-mediumInk">Laadin avalehe andmeid...</p>
        ) : dashboardFeedItems.length === 0 ? (
          <p className="text-sm text-mediumInk">
            {canManage && availableGroups.length === 0
              ? 'Rühmi ei leitud.'
              : 'Päevakokkuvõtteid ei leitud.'}
          </p>
        ) : (
          <div className="space-y-6">
            {dashboardFeedItems.map((item) => (
              <DashboardFeedCard
                key={item.id}
                item={item}
                canManage={canManage}
                isDeleting={deletingPostId === item.id}
                onEdit={openEditPostDialog}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}

        <CreatePostDialog
          open={isPostDialogOpen}
          mode={postDialogMode}
          groupId={dashboardGroupId}
          postId={editingPost?.id ?? null}
          initialTitle={editingPost?.title ?? ''}
          initialMessage={editingPost?.description ?? ''}
          onClose={closePostDialog}
          onCreated={loadDashboardData}
        />
      </section>
    </div>
  );
}

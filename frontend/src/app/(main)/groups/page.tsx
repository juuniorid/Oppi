'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GroupDialog } from '@/components/groups/GroupDialog';
import { GroupsTable } from '@/components/groups/GroupsTable';
import { showErrorToast } from '@/components/ErrorToast';
import { useUserRole } from '@/context/UserRoleContext';
import groupService from '@/services/group.service';
import type { Group } from '@/types';
import { USER_ROLE } from '@/types/enums';

type GroupDialogState = 'none' | 'create' | 'edit';

export default function GroupsPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useUserRole();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<GroupDialogState>('none');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const isAdmin = role === USER_ROLE.ADMIN;

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleLoading) {
      return;
    }

    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, roleLoading, router]);

  useEffect(() => {
    if (roleLoading || !role) {
      return;
    }

    if (!isAdmin) {
      return;
    }

    void loadGroups();
  }, [isAdmin, loadGroups, role, roleLoading]);

  const handleAddGroup = () => {
    if (!isAdmin) return;
    setEditingGroup(null);
    setDialogState('create');
  };

  const handleEditGroup = (group: Group) => {
    if (!isAdmin) return;
    setEditingGroup(group);
    setDialogState('edit');
  };

  const handleCloseDialog = () => {
    setDialogState('none');
    setEditingGroup(null);
  };

  if (roleLoading || !isAdmin) {
    return null;
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Rühmad
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hallake rühmade andmeid ja uuendage teavet.
          </Typography>
        </Box>

        <Button variant="info" onClick={handleAddGroup}>
          Lisa rühm
        </Button>
      </Stack>

      <GroupsTable
        rows={groups}
        loading={loading || roleLoading}
        canManage={isAdmin}
        onEdit={handleEditGroup}
      />

      <GroupDialog
        open={dialogState === 'create' || dialogState === 'edit'}
        mode={dialogState === 'edit' ? 'edit' : 'create'}
        group={editingGroup}
        onClose={handleCloseDialog}
        onSaved={loadGroups}
      />
    </Box>
  );
}

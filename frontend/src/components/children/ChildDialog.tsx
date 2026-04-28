'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import childService from '@/services/child.service';
import groupService from '@/services/group.service';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import type { Child, CreateChildPayload, UpdateChildPayload, Group } from '@/types';

type ChildDialogMode = 'create' | 'edit';

type ChildDialogProps = {
  open: boolean;
  mode: ChildDialogMode;
  child: Child | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

function getInitialValues(child: Child | null, mode: ChildDialogMode) {
  return {
    firstName: child?.firstName || '',
    lastName: child?.lastName || '',
    groupId: mode === 'edit' ? String(child?.groupId) : (child?.groupId ? String(child.groupId) : ''),
    dateOfBirth: child?.dateOfBirth ? dayjs(child.dateOfBirth).format('YYYY-MM-DD') : '',
    notes: child?.notes || '',
  };
}

export function ChildDialog({
  open,
  mode,
  child,
  onClose,
  onSaved,
}: ChildDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const fetchedGroups = await groupService.getGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = getInitialValues(child, mode);
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setGroupId(values.groupId);
    setDateOfBirth(values.dateOfBirth);
    setNotes(values.notes);
    
    loadGroups();
  }, [open, child, mode, loadGroups]);

  const ageLabel = useMemo(() => {
    if (!dateOfBirth) {
      return '-';
    }

    const birthDate = dayjs(dateOfBirth);
    if (!birthDate.isValid()) {
      return '-';
    }

    return String(dayjs().diff(birthDate, 'year'));
  }, [dateOfBirth]);

  const canSubmit = useMemo(() => {
    if (isSubmitting || loadingGroups) {
      return false;
    }

    return Boolean(
      firstName.trim() &&
      lastName.trim() &&
      dateOfBirth,
    );
  }, [dateOfBirth, firstName, isSubmitting, loadingGroups, lastName]);

  const handleSubmit = async () => {
    const parsedGroupId = groupId ? Number(groupId) : undefined;
    if (parsedGroupId !== undefined && (!Number.isInteger(parsedGroupId) || parsedGroupId < 1)) {
      showErrorToast('Valid group selection is required.');
      return;
    }

    const payload: CreateChildPayload | UpdateChildPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      groupId: parsedGroupId,
      dateOfBirth,
      notes: notes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && child) {
        await childService.updateChild(child.id, payload);
        showSuccessToast('Child updated');
      } else {
        await childService.createChild(payload as CreateChildPayload);
        showSuccessToast('Child created');
      }

      await onSaved();
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to save child');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!child) return;
    setIsSubmitting(true);
    try {
      await childService.deleteChild(child.id);
      showSuccessToast('Child deleted');
      await onSaved();
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to delete child');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? 'Muuda' : 'Lisa'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '26px !important' }}>
        {mode === 'edit' && child ? (
          <TextField disabled label="ID" value={child.id} InputProps={{ readOnly: true }} fullWidth />
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Eesnimi"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Perekonnanimi"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <FormControl fullWidth>
            <InputLabel>Rühm</InputLabel>
            <Select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              label="Rühm"
              disabled={loadingGroups}
            >
              {loadingGroups ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </MenuItem>
              ) : (
                [
                  <MenuItem key="__none__" value="">
                    <em>Rühm puudub</em>
                  </MenuItem>,
                  ...groups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>
                      {group.name || `Group ${group.id}`}
                    </MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>
          <TextField
            label="Sünnikuupäev"
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {`Vanus: ${ageLabel}`}
        </Typography>

        <TextField
          label="Märkused"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        {mode === 'edit' && child ? (
          <Button variant="negative" onClick={handleDelete} disabled={isSubmitting} sx={{ mr: 'auto' }}>
            Kustuta
          </Button>
        ) : null}
        <Button variant="neutral" onClick={onClose}>
          Tühista
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? 'Salvestamine...' : mode === 'edit' ? 'Salvesta muudatused' : 'Loo laps'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

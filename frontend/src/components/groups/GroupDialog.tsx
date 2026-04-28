'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import groupService, { TeacherUser } from '@/services/group.service';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import type { Group, CreateGroupPayload, UpdateGroupPayload } from '@/types';

type GroupDialogMode = 'create' | 'edit';

type GroupDialogProps = {
  open: boolean;
  mode: GroupDialogMode;
  group: Group | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

function getInitialValues(group: Group | null) {
  return {
    name: group?.name || '',
    description: group?.description || '',
    ageMin: group?.ageMin || '',
    ageMax: group?.ageMax || '',
    kindergartenName: group?.kindergartenName || '',
    teacherIds: group?.teachers?.map((t) => t.id) ?? [],
  };
}

function formatTeacherName(teacher: TeacherUser): string {
  return [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.email;
}

export function GroupDialog({ open, mode, group, onClose, onSaved }: GroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [kindergartenName, setKindergartenName] = useState('');
  const [teacherIds, setTeacherIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherUser[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = getInitialValues(group);
    setName(values.name);
    setDescription(values.description);
    setAgeMin(values.ageMin);
    setAgeMax(values.ageMax);
    setKindergartenName(values.kindergartenName);
    setTeacherIds(values.teacherIds);

    setLoadingTeachers(true);
    groupService
      .getTeachers()
      .then((data) => setAvailableTeachers(data))
      .catch((err: Error) => showErrorToast(err.message || 'Failed to load teachers'))
      .finally(() => setLoadingTeachers(false));
  }, [open, group]);

  const handleTeacherChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setTeacherIds(typeof value === 'string' ? value.split(',').map(Number) : (value as number[]));
  };

  const canSubmit = useMemo(() => {
    if (isSubmitting || loadingTeachers) return false;
    return Boolean(name.trim());
  }, [isSubmitting, loadingTeachers, name]);

  const handleSubmit = useCallback(async () => {
    const payload: CreateGroupPayload | UpdateGroupPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      ageMin: ageMin.trim() || undefined,
      ageMax: ageMax.trim() || undefined,
      kindergartenName: kindergartenName.trim() || undefined,
      teacherIds,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && group) {
        await groupService.updateGroup(group.id, payload as UpdateGroupPayload);
        showSuccessToast('Group updated');
      } else {
        await groupService.createGroup(payload as CreateGroupPayload);
        showSuccessToast('Group created');
      }

      await onSaved();
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to save group');
    } finally {
      setIsSubmitting(false);
    }
  }, [ageMax, ageMin, description, group, kindergartenName, mode, name, onClose, onSaved, teacherIds]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? 'Muuda rühma' : 'Lisa rühm'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '26px !important' }}>
        {mode === 'edit' && group ? (
          <TextField disabled label="ID" value={group.id} InputProps={{ readOnly: true }} fullWidth />
        ) : null}

        <TextField
          label="Nimi"
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Kirjeldus"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          fullWidth
          multiline
          minRows={2}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Vanus min"
            value={ageMin}
            onChange={(event) => setAgeMin(event.target.value)}
            fullWidth
          />
          <TextField
            label="Vanus max"
            value={ageMax}
            onChange={(event) => setAgeMax(event.target.value)}
            fullWidth
          />
        </Stack>

        <TextField
          label="Lasteaia nimi"
          value={kindergartenName}
          onChange={(event) => setKindergartenName(event.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Õpetajad</InputLabel>
          <Select
            multiple
            value={teacherIds}
            onChange={handleTeacherChange}
            input={<OutlinedInput label="Õpetajad" />}
            disabled={loadingTeachers}
            renderValue={(selected) => {
              if (loadingTeachers) return 'Laadimine...';
              return (selected as number[])
                .map((id) => {
                  const teacher = availableTeachers.find((t) => t.id === id);
                  return teacher ? formatTeacherName(teacher) : String(id);
                })
                .join(', ');
            }}
          >
            {loadingTeachers ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading...
              </MenuItem>
            ) : availableTeachers.length === 0 ? (
              <MenuItem disabled>No teachers available</MenuItem>
            ) : (
              availableTeachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  <Checkbox checked={teacherIds.includes(teacher.id)} />
                  <ListItemText primary={formatTeacherName(teacher)} secondary={teacher.email} />
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="neutral" onClick={onClose}>
          Tühista
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? 'Salvestamine...' : mode === 'edit' ? 'Salvesta muudatused' : 'Loo rühm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

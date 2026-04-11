import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Child } from '@/types';
import { useChildSelection } from '@/context/ChildSelectionContext';
import { useUserRole } from '@/context/UserRoleContext';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import calendarService from '@/services/calendar.service';
import childService from '@/services/child.service';
import {
  ATTENDANCE_STATUS,
  USER_ROLE,
  type AttendanceStatus,
} from '@/types/enums';

type AddAbsenceDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function AddAbsenceDialog({
  open,
  onClose,
  onCreated,
}: AddAbsenceDialogProps) {
  const { role } = useUserRole();
  const { selectedChildId, children: parentChildren } = useChildSelection();
  const selectedParentChildId = selectedChildId != null ? selectedChildId : null;
  const groupId = 1; // TODO: replace with group context when available

  const [childOptions, setChildOptions] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [formChildId, setFormChildId] = useState<number | null>(null);
  const [formFrom, setFormFrom] = useState(dayjs().format('YYYY-MM-DD'));
  const [formTo, setFormTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [formStatus, setFormStatus] = useState<AttendanceStatus>(ATTENDANCE_STATUS.ABSENT);
  const [formNote, setFormNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldShowChildSelect = role === USER_ROLE.TEACHER || role === USER_ROLE.PARENT;

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultDate = dayjs().format('YYYY-MM-DD');
    setFormFrom(defaultDate);
    setFormTo(defaultDate);
    setFormStatus(ATTENDANCE_STATUS.ABSENT);
    setFormNote('');

    let isActive = true;

    const setupChildren = async () => {
      if (role === USER_ROLE.TEACHER) {
        setIsLoadingChildren(true);
        try {
          const children = await childService.getChildrenByGroup(groupId);
          if (!isActive) {
            return;
          }
          setChildOptions(children);
          setFormChildId(children[0]?.id ?? null);
        } catch {
          if (!isActive) {
            return;
          }
          setChildOptions([]);
          setFormChildId(null);
        } finally {
          if (isActive) {
            setIsLoadingChildren(false);
          }
        }
        return;
      }

      if (role === USER_ROLE.PARENT) {
        setIsLoadingChildren(false);
        setChildOptions(parentChildren);
        setFormChildId(selectedParentChildId ?? parentChildren[0]?.id ?? null);
        return;
      }

      setIsLoadingChildren(false);
      setChildOptions([]);
      setFormChildId(null);
    };

    void setupChildren();

    return () => {
      isActive = false;
    };
  }, [open, role, groupId, parentChildren, selectedParentChildId]);

  const canSubmit =
    !isSubmitting &&
    !!formFrom &&
    !!formTo &&
    !!formChildId &&
    (!shouldShowChildSelect || childOptions.length > 0);

  const handleSubmit = async () => {
    if (!formFrom || !formTo) {
      showErrorToast('Please choose both from and to dates.');
      return;
    }

    if (dayjs(formFrom).isAfter(dayjs(formTo), 'day')) {
      showErrorToast('From date must be before or equal to to date.');
      return;
    }

    if (!formChildId) {
      showErrorToast('Please select a child.');
      return;
    }

    setIsSubmitting(true);
    try {
      await calendarService.createAbsence({
        childId: formChildId,
        from: formFrom,
        to: formTo,
        status: formStatus,
        note: formNote.trim() || undefined,
      });
      await onCreated();
      showSuccessToast('Absence saved');
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to create absence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Lisa puudumine</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '26px !important' }}>
        {shouldShowChildSelect ? (
          <FormControl
            fullWidth
            sx={{ mt: 0.5 }}
            disabled={isLoadingChildren || childOptions.length === 0}
          >
            <InputLabel id="absence-child-select-label">Laps</InputLabel>
            <Select
              labelId="absence-child-select-label"
              value={formChildId != null ? String(formChildId) : ''}
              label="Laps"
              onChange={(event: SelectChangeEvent) => {
                const nextId = Number(event.target.value);
                setFormChildId(Number.isNaN(nextId) ? null : nextId);
              }}
            >
              {isLoadingChildren ? <MenuItem value="">Laste laadimine...</MenuItem> : null}
              {!isLoadingChildren && childOptions.length === 0 ? (
                <MenuItem value="">Lapsi ei leitud</MenuItem>
              ) : null}
              {childOptions.map((child) => (
                <MenuItem key={child.id} value={String(child.id)}>
                  {child.firstName?.trim() || `Laps ${child.id}`}
                </MenuItem>
              ))}
            </Select>
            {!isLoadingChildren && childOptions.length === 0 ? (
              <FormHelperText>Puuduvad lapsed selle rolli jaoks.</FormHelperText>
            ) : null}
          </FormControl>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mt: shouldShowChildSelect ? 0 : 0.5,
          }}
        >
          <TextField
            label="Alates"
            type="date"
            value={formFrom}
            onChange={(event) => setFormFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Kuni"
            type="date"
            value={formTo}
            onChange={(event) => setFormTo(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <FormControl fullWidth sx={{ width: '100%' }}>
          <InputLabel id="absence-status-select-label">Kohal</InputLabel>
          <Select
            id="absence-status-select"
            labelId="absence-status-select-label"
            fullWidth
            value={formStatus}
            label="Kohal"
            onChange={(event: SelectChangeEvent<AttendanceStatus>) =>
              setFormStatus(event.target.value as AttendanceStatus)
            }
          >
            <MenuItem value={ATTENDANCE_STATUS.PRESENT}>Kohal</MenuItem>
            <MenuItem value={ATTENDANCE_STATUS.ABSENT}>Puudub</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Märkus"
          value={formNote}
          onChange={(event) => setFormNote(event.target.value)}
          fullWidth
          multiline
          InputLabelProps={{ shrink: true }}
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="neutral" onClick={onClose}>
          Tühista
        </Button>
        <Button
          variant={formStatus === ATTENDANCE_STATUS.PRESENT ? 'success' : 'negative'}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Salvestamine...' : 'Salvesta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import calendarService from '@/services/calendar.service';
import type { CreateEventPayload, EventEntry, UpdateEventPayload } from '@/types';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import { EVENT_TYPE, type EventType } from '@/types/enums';

type EventDialogMode = 'create' | 'edit';

type AddEventDialogProps = {
  open: boolean;
  mode: EventDialogMode;
  groupId: number;
  initialDate: string;
  event: EventEntry | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

function resolveInitialValues(mode: EventDialogMode, event: EventEntry | null, initialDate: string) {
  if (mode === 'edit' && event) {
    return {
      from: dayjs(event.date).format('YYYY-MM-DD'),
      to: dayjs(event.date).format('YYYY-MM-DD'),
      timeFrom: event.time || '09:00',
      timeTo: event.time || '10:00',
      name: event.name || '',
      description: event.description || '',
      type: event.type,
    };
  }

  return {
    from: initialDate,
    to: initialDate,
    timeFrom: '09:00',
    timeTo: '10:00',
    name: '',
    description: '',
    type: EVENT_TYPE.GROUP as EventType,
  };
}

export function AddEventDialog({
  open,
  mode,
  groupId,
  initialDate,
  event,
  onClose,
  onSaved,
}: AddEventDialogProps) {
  const [from, setFrom] = useState(initialDate);
  const [to, setTo] = useState(initialDate);
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('10:00');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>(EVENT_TYPE.GROUP);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = resolveInitialValues(mode, event, initialDate);
    setFrom(values.from);
    setTo(values.to);
    setTimeFrom(values.timeFrom);
    setTimeTo(values.timeTo);
    setName(values.name);
    setDescription(values.description);
    setType(values.type);
  }, [open, mode, event, initialDate]);

  const canSubmit = useMemo(() => {
    if (isSubmitting) {
      return false;
    }

    return Boolean(from && to && timeFrom && timeTo && name.trim());
  }, [from, to, timeFrom, timeTo, name, isSubmitting]);

  const handleSubmit = async () => {
    if (dayjs(from).isAfter(dayjs(to), 'day')) {
      showErrorToast('From date must be before or equal to to date.');
      return;
    }

    if (from === to && timeFrom > timeTo) {
      showErrorToast('From time must be before or equal to to time.');
      return;
    }

    const payload: CreateEventPayload | UpdateEventPayload = {
      groupId,
      from,
      to,
      timeFrom,
      timeTo,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
    };

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && event) {
        await calendarService.updateEvent(event.id, payload);
        showSuccessToast('Event updated');
      } else {
        await calendarService.createEvent(payload);
        showSuccessToast('Event created');
      }

      await onSaved();
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'edit' ? 'Muuda sündmust' : 'Lisa sündmus'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '26px !important' }}>
        <TextField
          label="Sündmuse nimi"
          value={name}
          onChange={(event) => setName(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Kirjeldus"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          multiline
          minRows={3}
        />

        <FormControl fullWidth>
          <InputLabel id="event-type-select-label">Tüüp</InputLabel>
          <Select
            id="event-type-select"
            labelId="event-type-select-label"
            value={type}
            label="Tüüp"
            onChange={(event: SelectChangeEvent<EventType>) =>
              setType(event.target.value as EventType)
            }
          >
            <MenuItem value={EVENT_TYPE.GROUP}>Rühm</MenuItem>
            <MenuItem value={EVENT_TYPE.KINDERGARTEN}>Lasteaed</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            label="Alates kuupäev"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Kuni kuupäev"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <TextField
            label="Kellast"
            type="time"
            value={timeFrom}
            onChange={(event) => setTimeFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            fullWidth
          />

          <TextField
            label="Kuni kell"
            type="time"
            value={timeTo}
            onChange={(event) => setTimeTo(event.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="neutral" onClick={onClose}>
          Tühista
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Salvestamine...' : mode === 'edit' ? 'Uuenda' : 'Loo sündmus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

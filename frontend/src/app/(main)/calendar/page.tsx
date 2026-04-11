"use client";

import * as React from 'react';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers';
import { AttendanceBadge } from '../../../components/calendar/AttendanceBadge';
import { useChildSelection } from '@/context/ChildSelectionContext';
import { useUserRole } from '@/context/UserRoleContext';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import calendarService, {
} from '@/services/calendar.service';
import type { AbsenceEntry, EventEntry } from '@/types';
import {
  ATTENDANCE_STATUS,
  EVENT_TYPE,
  USER_ROLE,
  type AttendanceStatus,
  type EventType,
} from '@/types/enums';
import { AddAbsenceDialog } from '@/components/calendar/AddAbsenceDialog';
import { AddEventDialog } from '@/components/calendar/AddEventDialog';

import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

const initialValue = dayjs();
type CalendarDialogState = 'none' | 'absence' | 'event-create' | 'event-edit';

export default function CalendarPage() {
  const { selectedChildId } = useChildSelection();
  const { role, loading: roleLoading } = useUserRole();
  const childId = selectedChildId != null ? selectedChildId : null;
  const groupId = 1; //  TODO Assume groupId is 1 for demo, add group context

  const requestAbortController = useRef<AbortController | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(initialValue);
  const [currentMonth, setCurrentMonth] = useState(initialValue.startOf('month'));
  const [isLoading, setIsLoading] = useState(false);
  const [absences, setAbsences] = useState<AbsenceEntry[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [dialogState, setDialogState] = useState<CalendarDialogState>('none');
  const [editingEvent, setEditingEvent] = useState<EventEntry | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const canManageEvents = role === USER_ROLE.TEACHER || role === USER_ROLE.ADMIN;

  const fetchHighlightedDays = useCallback(async (date: Dayjs) => {
    const controller = new AbortController();
    requestAbortController.current = controller;

    const from = date.startOf('month').format('YYYY-MM-DD');
    const to = date.endOf('month').format('YYYY-MM-DD');

    
    if (!role) {
      showErrorToast('Unable to determine user role. Please log in again.');
      setAbsences([]); // Show dummy event to indicate error
      setEvents([]); // Show dummy event to indicate error
      setIsLoading(false);
      return;
    }

    if (role === USER_ROLE.PARENT && !childId) {
      showErrorToast('No child selected. Showing group events only.');
      setAbsences([]);
    }

    try {
      const absenceEntries = role === USER_ROLE.PARENT
        ? (childId
            ? await calendarService.getAbsencesByChild({ childId, from, to })
            : [])
        : await calendarService.getAbsencesByGroup({ groupId, from, to });
      setAbsences(absenceEntries);

      const eventEntries = role === USER_ROLE.PARENT && childId
        ? await calendarService.getEventsByChild({ childId, from, to })
        : await calendarService.getEventsByGroup({ from, to });

      setEvents(eventEntries);
    } catch (error) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        showErrorToast(err.message || 'Failed to load absences');
        setAbsences([]);
        setEvents([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [childId, groupId, role]);

  useEffect(() => {
    if (roleLoading) {
      return;
    }
    setIsLoading(true);
    fetchHighlightedDays(currentMonth);
    // abort request on unmount
    return () => requestAbortController.current?.abort();
  }, [currentMonth, fetchHighlightedDays, roleLoading]);

  const handleMonthChange = (date: Dayjs) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setCurrentMonth(date.startOf('month'));
  };

  const dayStatusByDate = useMemo(() => {
    const statusByDate: Record<string, AttendanceStatus> = {};
    const monthStart = currentMonth.startOf('month');
    const monthEnd = currentMonth.endOf('month');
    const today = dayjs().startOf('day');
    const defaultUntil = today.isBefore(monthEnd, 'day') ? today : monthEnd;

    const toDateKey = (value: string) => {
      const match = value.match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : dayjs(value).format('YYYY-MM-DD');
    };

    // Default attendance rule: every past/current day is considered PRESENT unless overridden.
    if (!monthStart.isAfter(defaultUntil, 'day')) {
      let cursor = monthStart;
      while (!cursor.isAfter(defaultUntil, 'day')) {
        statusByDate[cursor.format('YYYY-MM-DD')] = ATTENDANCE_STATUS.PRESENT;
        cursor = cursor.add(1, 'day');
      }
    }

    for (const entry of absences) {
      const key = toDateKey(entry.date);
      if (entry.status === ATTENDANCE_STATUS.ABSENT || !statusByDate[key]) {
        statusByDate[key] = entry.status;
      }
    }

    return statusByDate;
  }, [absences, currentMonth]);

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const selected = selectedDate.format('YYYY-MM-DD');
    return absences.filter((entry) => {
      const match = entry.date.match(/^\d{4}-\d{2}-\d{2}/);
      const key = match ? match[0] : dayjs(entry.date).format('YYYY-MM-DD');
      return key === selected;
    });
  }, [absences, selectedDate]);

  const eventTypeByDate = useMemo(() => {
    const typeByDate: Record<string, EventType> = {};

    const toDateKey = (value: string) => {
      const match = value.match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : dayjs(value).format('YYYY-MM-DD');
    };

    for (const entry of events) {
      const key = toDateKey(entry.date);
      const eventType = entry.type;

      if (eventType === EVENT_TYPE.KINDERGARTEN || !typeByDate[key]) {
        typeByDate[key] = eventType;
      }
    }

    return typeByDate;
  }, [events]);

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const selected = selectedDate.format('YYYY-MM-DD');
    return events.filter((entry) => {
      const match = entry.date.match(/^\d{4}-\d{2}-\d{2}/);
      const key = match ? match[0] : dayjs(entry.date).format('YYYY-MM-DD');
      return key === selected;
    });
  }, [events, selectedDate]);

  const openAddAbsenceModal = () => {
    setDialogState('absence');
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setDialogState('event-create');
  };

  const openEditEventModal = (event: EventEntry) => {
    setEditingEvent(event);
    setDialogState('event-edit');
  };

  const closeDialog = () => {
    setDialogState('none');
    setEditingEvent(null);
  };

  const refreshCalendarData = async () => {
    setIsLoading(true);
    await fetchHighlightedDays(currentMonth);
  };

  const handleDeleteEvent = async (event: EventEntry) => {
    const shouldDelete = window.confirm(`Kustuta sündmus "${event.name}"?`);
    if (!shouldDelete) {
      return;
    }

    setDeletingEventId(event.id);
    try {
      await calendarService.deleteEvent(event.id);
      showSuccessToast('Sündmus kustutatud');
      await refreshCalendarData();
    } catch (error) {
      const err = error as Error;
      showErrorToast(err.message || 'Sündmuse kustutamine ebaõnnestus');
    } finally {
      setDeletingEventId(null);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 0 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            width: '100%',
            minWidth: { md: 500 },
            maxWidth: { md: 560 },
          }}
        >
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            loading={isLoading}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{
              day: AttendanceBadge,
            }}
            slotProps={{
              day: {
                dayStatusByDate,
                eventTypeByDate,
              } as any,
            }}
          />
        </Box>
      </LocalizationProvider>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="neutral"
            onClick={openAddAbsenceModal}
          >
            Lisa puudumine
          </Button>
          {canManageEvents ? (
            <Button variant="info" onClick={openCreateEventModal}>
              Lisa sündmus
            </Button>
          ) : null}
        </Stack>
      </Box>

      <Box>
        {role === USER_ROLE.TEACHER ? (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedDate
                ? `Puudumised kuupäeval ${selectedDate.format('YYYY-MM-DD')}`
                : 'Puudumised valitud kuupäeval'}
            </Typography>

            {entriesForSelectedDate.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {'Ei leitud puudumisi sellel kuupäeval.'}
              </Typography>
            ) : (
              <List dense>
                {entriesForSelectedDate.map((entry) => (
                  <Card
                    key={entry.id}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      p: 1.25,
                      borderLeft: entry.status === ATTENDANCE_STATUS.ABSENT
                        ? '6px solid rgba(220, 38, 38, 0.65)'
                        : '6px solid rgba(22, 163, 74, 0.65)',
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {entry.firstName} {entry.lastName}
                        </Typography>
                        <Chip
                          size="small"
                          label={entry.status === ATTENDANCE_STATUS.ABSENT ? 'Puudu' : 'Kohal'}
                          sx={{
                            fontWeight: 700,
                            backgroundColor: entry.status === ATTENDANCE_STATUS.ABSENT
                              ? 'rgba(220, 38, 38, 0.18)'
                              : 'rgba(22, 163, 74, 0.18)',
                            color: 'text.primary',
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {entry.note || 'Märge puudub'}
                      </Typography>
                    </Stack>
                  </Card>
                ))}
              </List>
            )}
          </>
        ) : null}

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {selectedDate
            ? `Sündmused kuupäeval ${selectedDate.format('YYYY-MM-DD')}`
            : 'Sündmused valitud kuupäeval'}
        </Typography>

        {eventsForSelectedDate.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Ei leitud sündmusi sellel kuupäeval.
          </Typography>
        ) : (
          <List dense>
            {eventsForSelectedDate.map((entry) => (
              <Card
                key={entry.id}
                variant="outlined"
                sx={{
                  mb: 1,
                  p: 1.5,
                  borderLeft: entry.type === EVENT_TYPE.KINDERGARTEN
                    ? '6px solid rgba(178, 226, 226, 0.95)'
                    : '6px solid rgba(247, 211, 114, 0.95)',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {entry.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={entry.type === EVENT_TYPE.KINDERGARTEN ? 'Lasteaed' : 'Rühm'}
                      sx={{
                        width: 'fit-content',
                        fontWeight: 700,
                        backgroundColor: entry.type === EVENT_TYPE.KINDERGARTEN
                          ? 'rgba(178, 226, 226, 0.28)'
                          : 'rgba(247, 211, 114, 0.32)',
                        color: 'text.primary',
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.2} flexWrap="wrap">
                    <Box
                      sx={{
                        px: 1,
                        py: 0.55,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {`Kuupäev: ${entry.date}`}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.55,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {`Kell: ${entry.time || 'Määramata'}`}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {entry.description || 'Kirjeldus puudub'}
                  </Typography>

                  {canManageEvents ? (
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button
                        size="small"
                        variant="negative"
                        onClick={() => handleDeleteEvent(entry)}
                        disabled={deletingEventId === entry.id}
                      >
                        {deletingEventId === entry.id ? 'Kustutan...' : 'Kustuta'}
                      </Button>
                      <Button size="small" variant="neutral" onClick={() => openEditEventModal(entry)}>
                        Muuda
                      </Button>
                    </Stack>
                  ) : null}
                </Stack>
              </Card>
            ))}
          </List>
        )}
      </Box>

      <AddAbsenceDialog
        open={dialogState === 'absence'}
        onClose={closeDialog}
        onCreated={refreshCalendarData}
      />
      <AddEventDialog
        open={dialogState === 'event-create' || dialogState === 'event-edit'}
        mode={dialogState === 'event-edit' ? 'edit' : 'create'}
        groupId={groupId}
        initialDate={selectedDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')}
        event={editingEvent}
        onClose={closeDialog}
        onSaved={refreshCalendarData}
      />
    </Box>
  );
}


function buildDummyAbsences({ childId, from }: { childId: number; from: string }): AbsenceEntry[] {
  const month = from.slice(0, 7);
  const rows: AbsenceEntry[] = [
    {
      id: 1001,
      childId,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-03`,
      status: 'PRESENT',
      note: 'On time',
      userId: 1,
    },
    {
      id: 1002,
      childId,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-08`,
      status: 'ABSENT',
      note: 'Sick leave',
      userId: 1,
    },
    {
      id: 1003,
      childId,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-15`,
      status: 'PRESENT',
      note: null,
      userId: 1,
    },
    {
      id: 1004,
      childId,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-22`,
      status: 'ABSENT',
      note: 'Family trip',
      userId: 1,
    },
  ];

  if (dayjs().format('YYYY-MM') === month) {
    rows.push({
      id: 1099,
      childId,
      firstName: 'Maia',
      lastName: 'Saia',
      date: dayjs().format('YYYY-MM-DD'),
      status: 'ABSENT',
      note: 'Kogu perega gripis',
      userId: 1,
    });
  }

  return rows;
}

function buildDummyGroupAbsences({ from }: { from: string }): AbsenceEntry[] {
  const month = from.slice(0, 7);
  const rows: AbsenceEntry[] = [
    {
      id: 2001,
      childId: 1,
      date: `${month}-04`,
      status: 'ABSENT',
      note: 'Flu',
      userId: 1,
      firstName: 'Maia',
      lastName: 'Saia',
    },
    {
      id: 2002,
      childId: 2,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-04`,
      status: 'PRESENT',
      note: null,
      userId: 1,
    },
    {
      id: 2003,
      childId: 1,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-11`,
      status: 'PRESENT',
      note: null,
      userId: 1,
    },
    {
      id: 2004,
      childId: 2,
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-19`,
      status: 'ABSENT',
      note: 'Doctor appointment',
      userId: 1,
    },
  ];

  if (dayjs().format('YYYY-MM') === month) {
    rows.push({
      id: 2099,
      childId: 1,
      firstName: 'Maia',
      lastName: 'Saia',
      date: dayjs().format('YYYY-MM-DD'),
      status: 'PRESENT',
      note: 'Kogu perega gripis',
      userId: 1,
    });
  }

  return rows;
}

function buildDummyEvents({ from }: { from: string }): EventEntry[] {
  const month = from.slice(0, 7);
  const rows: EventEntry[] = [
    { id: 3001, name: 'Jõuluvana ja päkapikud', time: '16:00', description: 'Laste jõulupidu. Palun tooge kingitsed hommikul', date: `${month}-05`, type: 'GROUP' },
    { id: 3002, name: 'Kevade kuulutamine', time: '10:00', description: 'Kevade kuulutamise pidulik sündmus', date: `${month}-12`, type: 'KINDERGARTEN' },
    { id: 3003, name: 'Spordipäev järve ääres', time: '14:00', description: 'Let´s meet up in the garden to celebrate the start of the spring', date: `${month}-18`, type: 'GROUP' },
    { id: 3004, name: 'Tsirkus ja saiad', time: '09:00', description: 'Teatrietendus tuleb lasteada. Tsirkus, saiakesed ja klounid. pange ennast valmis.', date: `${month}-25`, type: 'KINDERGARTEN' },
  ];

  if (dayjs().format('YYYY-MM') === month) {
    rows.push({
      id: 3099,
      name: 'Today\'s test event',
      time: '11:00',
      description: 'Dummy event for current selected date visibility',
      date: dayjs().format('YYYY-MM-DD'),
      type: 'GROUP',
    });
  }

  return rows;
}

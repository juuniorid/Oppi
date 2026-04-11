import dayjs from 'dayjs';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';
import { AbsenceEntry, CreateAbsencePayload, CreateEventPayload, EventEntry, UpdateEventPayload } from '@/types';

const USE_DUMMY_CALENDAR_DATA = true;

type QueryValue = string | number | boolean | null | undefined;

function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

class CalendarService {
  async getAbsencesByChild({childId, from, to}: {childId: number; from: string; to: string}): Promise<AbsenceEntry[]> {
    if (USE_DUMMY_CALENDAR_DATA) {
      return buildDummyAbsences({ childId, from });
    }

    const response = await fetchWithAuth(
      apiUrl(withQuery(`/absences/child/${childId}`, { from, to })),
    );
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to load absences (${response.status})`));
    }

    return unwrapData<AbsenceEntry[]>(payload, []);
  }

  async getAbsencesByGroup({groupId, from, to}: {groupId: number; from: string; to: string}): Promise<AbsenceEntry[]> {
    if (USE_DUMMY_CALENDAR_DATA) {
      return buildDummyGroupAbsences({ from });
    }

    const response = await fetchWithAuth(
      apiUrl(withQuery(`/absences/group/${groupId}`, { from, to })),
    );
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to load absences (${response.status})`));
    }

    return unwrapData<AbsenceEntry[]>(payload, []);
  }

  async createAbsence(body: CreateAbsencePayload): Promise<AbsenceEntry[] | null> {
    const response = await fetchWithAuth(apiUrl('/absences'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to create absence (${response.status})`));
    }

    return unwrapData<AbsenceEntry[] | null>(payload, null);
  }

  async getEventsByGroup({ from, to}: { from: string; to: string}): Promise<EventEntry[]> {
    if (USE_DUMMY_CALENDAR_DATA) {
      return buildDummyEvents({ from });
    }

    const response = await fetchWithAuth(
      apiUrl(apiPaths.events.listByRange({ from, to })),
    );
    const payload = await parseJson(response);

    if (!response.ok) {
      return [];
    }

    return unwrapData<EventEntry[]>(payload, []);
  }

  async getEventsByChild({childId, from, to}: {childId: number; from: string; to: string}): Promise<EventEntry[]> {
    if (USE_DUMMY_CALENDAR_DATA) {
      return buildDummyEvents({ from });
    }

    const response = await fetchWithAuth(
      apiUrl(apiPaths.events.childByRange({ childId, from, to })),
    );
    const payload = await parseJson(response);

    if (!response.ok) {
      return [];
    }

    return unwrapData<EventEntry[]>(payload, []);
  }

  async createEvent(body: CreateEventPayload): Promise<EventEntry | null> {
    const response = await fetchWithAuth(apiUrl(apiPaths.events.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to create event (${response.status})`));
    }

    return unwrapData<EventEntry | null>(payload, null);
  }

  async updateEvent(eventId: number, body: UpdateEventPayload): Promise<EventEntry | null> {
    const response = await fetchWithAuth(apiUrl(apiPaths.events.update(eventId)), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to update event (${response.status})`));
    }

    return unwrapData<EventEntry | null>(payload, null);
  }

  async deleteEvent(eventId: number): Promise<void> {
    const response = await fetchWithAuth(apiUrl(apiPaths.events.remove(eventId)), {
      method: 'DELETE',
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, `Failed to delete event (${response.status})`));
    }
  }
}

const calendarService = new CalendarService();

export default calendarService;


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
      note: 'Dummy entry for today',
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
      firstName: 'Maia',
      lastName: 'Saia',
      date: `${month}-04`,
      status: 'ABSENT',
      note: 'Flu',
      userId: 1,
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
      note: 'Dummy attendance for today',
      userId: 1,
    });
  }

  return rows;
}

function buildDummyEvents({ from }: { from: string }): EventEntry[] {
  const month = from.slice(0, 7);
  const rows: EventEntry[] = [
    { id: 3001, name: 'Event 1', time: '16:00', description: 'Description 1', date: `${month}-05`, type: 'GROUP' },
    { id: 3002, name: 'Event 2', time: '10:00', description: 'Description of the event and bla bla 2', date: `${month}-12`, type: 'KINDERGARTEN' },
    { id: 3003, name: 'Event 3', time: '14:00', description: 'Let´s meet up in the garden to celebrate the start of the spring', date: `${month}-18`, type: 'GROUP' },
    { id: 3004, name: 'Event 4', time: '09:00', description: 'Description 4', date: `${month}-25`, type: 'KINDERGARTEN' },
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

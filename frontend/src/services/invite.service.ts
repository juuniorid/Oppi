import { apiPaths, apiUrl } from '@/config/api';
import { fetchWithAuth, parseJson, extractErrorMessage } from './http.service';

export interface CreateInvitePayload {
  email: string;
  role: 'TEACHER' | 'PARENT';
}

export interface InviteResult {
  id: number;
  email: string;
  role: string;
}

async function createInvite(payload: CreateInvitePayload): Promise<InviteResult> {
  const response = await fetchWithAuth(apiUrl(apiPaths.invites.create), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await parseJson(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(json, 'Kutse saatmine ebaõnnestus'));
  }

  return json as InviteResult;
}

const inviteService = { createInvite };
export default inviteService;

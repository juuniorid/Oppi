import type { Group, GroupTeacher, CreateGroupPayload, UpdateGroupPayload } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

export type TeacherUser = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

class GroupService {
  async getGroups(): Promise<Group[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.groups.list));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, `Failed to load groups (${response.status})`)
      );
    }

    return unwrapData<Group[]>(data, []);
  }

  async getTeachers(): Promise<TeacherUser[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.groups.teachers));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load teachers (${response.status})`));
    }

    return unwrapData<TeacherUser[]>(data, []);
  }

  async createGroup(body: CreateGroupPayload): Promise<Group> {
    const response = await fetchWithAuth(apiUrl(apiPaths.groups.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to create group (${response.status})`));
    }

    return unwrapData<Group>(data);
  }

  async updateGroup(groupId: number, body: UpdateGroupPayload): Promise<Group> {
    const response = await fetchWithAuth(apiUrl(apiPaths.groups.update(groupId)), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to update group (${response.status})`));
    }

    return unwrapData<Group>(data);
  }
}

const groupService = new GroupService();

export default groupService;

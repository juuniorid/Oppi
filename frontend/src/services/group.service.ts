import type { Group } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

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
}

const groupService = new GroupService();

export default groupService;

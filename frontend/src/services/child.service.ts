import { Child } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

class ChildService {
  async getChildrenList(): Promise<Child[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.list));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load children (${response.status})`));
    }

    return unwrapData<Child[]>(data, []);
  }

  async getChildrenByGroup(groupId: number): Promise<Child[]> {
    const response = await fetchWithAuth(apiUrl(`/children/group/${groupId}`));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load group children (${response.status})`));
    }

    return unwrapData<Child[]>(data, []);
  }
}

const childService = new ChildService();

export default childService;

import { Child, CreateChildPayload, UpdateChildPayload } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

class ChildService {
  async getMyChildrenList(): Promise<Child[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.listMy));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load children (${response.status})`));
    }

    return unwrapData<Child[]>(data, []);
  }

    async getAllChildrenList(): Promise<Child[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.list));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load children (${response.status})`));
    }

    return unwrapData<Child[]>(data, []);
  }

  async getChildrenByGroup(groupId: number): Promise<Child[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.group(groupId)));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load group children (${response.status})`));
    }

    return unwrapData<Child[]>(data, []);
  }

  async createChild(body: CreateChildPayload): Promise<Child> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to create child (${response.status})`));
    }

    return unwrapData<Child>(data);
  }

  async updateChild(childId: number, body: UpdateChildPayload): Promise<Child> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.update(childId)), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to update child (${response.status})`));
    }

    return unwrapData<Child>(data);
  }

  async deleteChild(childId: number): Promise<void> {
    const response = await fetchWithAuth(apiUrl(apiPaths.children.delete(childId)), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await parseJson(response);
      throw new Error(extractErrorMessage(data, `Failed to delete child (${response.status})`));
    }
  }
}

const childService = new ChildService();

export default childService;

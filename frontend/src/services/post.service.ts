import { Post } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import { showErrorToast } from '@/components/ErrorToast';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

class PostService {
  async getPostsByGroup(groupId: number): Promise<Post[]> {
    const response = await fetchWithAuth(apiUrl(apiPaths.posts.group(groupId)));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load posts (${response.status})`));
    }

    return unwrapData<Post[]>(data, []);
  }

  async createPost(title: string, message: string, groupId: number): Promise<Post> {
    const response = await fetchWithAuth(apiUrl(apiPaths.posts.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, groupId }),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to create post (${response.status})`));
    }

    return unwrapData<Post>(data);
  }

  async getPostsByGroupForView(groupId: number): Promise<Post[]> {
    try {
      return await this.getPostsByGroup(groupId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load announcements';
      showErrorToast(message);
      return [];
    }
  }
}

const postService = new PostService();

export default postService;

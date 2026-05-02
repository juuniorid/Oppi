import { Post } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import { showErrorToast } from '@/components/ErrorToast';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

const USE_DUMMY_POST_DATA = false; // Only for demo

class PostService {
  async getPostsByGroup(groupId: number): Promise<Post[]> {
    if (USE_DUMMY_POST_DATA) {
      return buildDummyPosts(groupId);
    }

    const response = await fetchWithAuth(apiUrl(apiPaths.posts.group(groupId)));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, `Failed to load posts (${response.status})`)
      );
    }

    return unwrapData<Post[]>(data, []);
  }

  async createPost(
    title: string,
    message: string,
    groupId: number
  ): Promise<Post> {
    const response = await fetchWithAuth(apiUrl(apiPaths.posts.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, groupId }),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, `Failed to create post (${response.status})`)
      );
    }

    return unwrapData<Post>(data);
  }

  async getPostsByGroupForView(groupId: number): Promise<Post[]> {
    try {
      return await this.getPostsByGroup(groupId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load announcements';
      showErrorToast(message);
      return [];
    }
  }
}

const postService = new PostService();

export default postService;

function buildDummyPosts(groupId: number): Post[] {
  return [
    {
      id: 1,
      groupId,
      createdByUserId: 1,
      title: 'Bumblebees weekly update',
      message:
        'This week we spent more time outside, practiced colors, and started planting seeds for spring.',
      createdAt: '2026-04-05T09:00:00.000Z',
      updatedAt: '2026-04-05T09:00:00.000Z',
    },
    {
      id: 2,
      groupId,
      createdByUserId: 1,
      title: 'Reminder for art supplies',
      message:
        'Please bring a small paint shirt by Friday. We are doing a larger painting activity next week.',
      createdAt: '2026-04-04T13:30:00.000Z',
      updatedAt: '2026-04-04T13:30:00.000Z',
    },
    {
      id: 3,
      groupId,
      createdByUserId: 1,
      title: 'Outdoor day notes',
      message:
        'Children spent the morning outside, practiced counting games, and helped tidy the garden corner after lunch.',
      createdAt: '2026-04-03T15:10:00.000Z',
      updatedAt: '2026-04-03T15:10:00.000Z',
    },
  ];
}

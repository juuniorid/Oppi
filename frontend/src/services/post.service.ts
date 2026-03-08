import { Post } from '@/types';

class PostService {
  async getPostsByGroup(groupId: number): Promise<Post[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts/group/${groupId}`,
      { credentials: 'include' },
    );
    const data = await response.json();
    return data;
  }

  async createPost(
    title: string,
    content: string,
    groupId: number,
  ): Promise<Post> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/posts`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, groupId }),
      },
    );
    const data = await response.json();
    return data;
  }
}

export default new PostService();

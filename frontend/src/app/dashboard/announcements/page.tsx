'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Post {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { apiCall } = useApi();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Assume groupId is 1 for demo
    apiCall<Post[]>('/posts/group/1').then((data) => setPosts(data));
  }, [apiCall]);

  return (
    <div>
      <h1>Announcements</h1>
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-2">
          <h2 className="font-semibold">{post.title}</h2>
          <p>{post.message}</p>
        </div>
      ))}
    </div>
  );
}

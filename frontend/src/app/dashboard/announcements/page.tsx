'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { apiCall } = useApi();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Assume groupId is 1 for demo
    apiCall('/posts/group/1').then((data) => setPosts(data));
  }, [apiCall]);

  return (
    <div>
      <h1>Announcements</h1>
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-2">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

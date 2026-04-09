'use client';

import { useEffect, useState } from 'react';
import postService from '@/services/post.service';

interface Post {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assume groupId is 1 for demo
    postService
      .getPostsByGroupForView(1)
      .then((data) => {
        setPosts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Announcements</h1>
      {loading ? <p>Loading...</p> : null}
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-2">
          <h2 className="font-semibold">{post.title}</h2>
          <p>{post.message}</p>
        </div>
      ))}
    </div>
  );
}

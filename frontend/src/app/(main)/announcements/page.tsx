'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MOCK_PERSONAL_TEATED,
  TeatedFeed,
  type TeatedItem,
} from '@/components/TeatedFeed';
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
    let cancelled = false;
    // Kui backend /posts/group/:id pole veel valmis või server ei käi, jääb voog tööle mock + tühi rühm.
    apiCall<Post[]>('/posts/group/1', { skipErrorToast: true })
      .then((data) => {
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [apiCall]);

  const feedItems = useMemo<TeatedItem[]>(() => {
    const groupItems: TeatedItem[] = posts.map((post) => ({
      kind: 'group' as const,
      id: `g-${post.id}`,
      title: post.title,
      body: post.message,
      at: post.createdAt,
    }));
    return [...groupItems, ...MOCK_PERSONAL_TEATED];
  }, [posts]);

  return <TeatedFeed items={feedItems} />;
}

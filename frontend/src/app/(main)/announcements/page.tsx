'use client';

import { useEffect, useMemo, useState } from 'react';
import { TeatedFeed, type TeatedItem } from '@/components/TeatedFeed';
import postService from '@/services/post.service';
import type { Post } from '@/types';

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    // Kui backend /posts/group/:id pole valmis või server ei käi, jääb voog tühjaks.
    postService
      .getPostsByGroup(1)
      .then((data) => {
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const feedItems = useMemo<TeatedItem[]>(() => {
    const groupItems: TeatedItem[] = posts.map((post) => ({
      kind: 'group' as const,
      id: `g-${post.id}`,
      title: post.title,
      body: post.message,
      at: post.createdAt,
    }));
    return groupItems;
  }, [posts]);

  return <TeatedFeed items={feedItems} />;
}

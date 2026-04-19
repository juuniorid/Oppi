'use client';

import { useEffect, useMemo, useState } from 'react';
import { TeatedFeed, type TeatedItem } from '@/components/TeatedFeed';
import postService from '@/services/post.service';
import type { Post } from '@/types';

/**
 * /announcements: loads group posts from the API and maps them into {@link TeatedItem}
 * for {@link TeatedFeed}. Group id is still a placeholder until the app has a real
 * current-group context.
 */
export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    // If the backend is down or the endpoint fails, we silently show an empty feed.
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

  // Map backend Post shape into feed rows (today: group posts only).
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

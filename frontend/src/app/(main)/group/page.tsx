'use client';

import { useEffect, useState } from 'react';
import childService from '@/services/child.service';
import { Child } from '@/types';

export default function GroupPage() {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    // Assume groupId is 1 for demo
    childService.getChildrenByGroup(1).then((data) => setChildren(data));
  }, []);

  return (
    <div>
      <h1>My Group</h1>
      <ul>
        {children.map((child) => (
          <li key={child.id}>{child.firstName} {child.lastName}</li>
        ))}
      </ul>
    </div>
  );
}

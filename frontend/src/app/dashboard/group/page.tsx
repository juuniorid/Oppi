'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Child {
  id: number;
  firstName: string;
  lastName: string;
}

export default function GroupPage() {
  const { apiCall } = useApi();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    // Assume groupId is 1 for demo
    apiCall('/children/group/1').then((data) => setChildren(data));
  }, [apiCall]);

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

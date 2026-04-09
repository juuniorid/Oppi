'use client';

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import authService from '@/services/auth.service';
import { User } from '@/types';
import { isUserRole, UserRole } from '@/types/enums';

const USER_ROLE_KEY = 'userRole';

interface UserRoleContextType {
  role: UserRole | null;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const cached = window.localStorage.getItem(USER_ROLE_KEY);
    if (cached && isUserRole(cached)) {
      setRole(cached);
    }

    let isActive = true;

    const loadRole = async () => {
      try {
        // /auth/me is validated from JWT cookie; role comes from the same auth source.
        const profile = await authService.getProfile();
        if (!isActive) {
          return;
        }

        setRole(profile.role);
        window.localStorage.setItem(USER_ROLE_KEY, profile.role);
      } catch {
        if (isActive) {
          setRole(null);
          window.localStorage.removeItem(USER_ROLE_KEY);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadRole();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo(() => ({ role, loading }), [role, loading]);

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within UserRoleProvider');
  }
  return context;
}

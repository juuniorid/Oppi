'use client';

import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { User } from '@/types';
import authService from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initUser = async () => {
      await refetchUser();
      if (isActive) {
        setLoading(false);
      }
    };

    // Defer startup fetch so state updates are not synchronous to the effect body.
    const timer = setTimeout(() => {
      void initUser();
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [refetchUser]);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

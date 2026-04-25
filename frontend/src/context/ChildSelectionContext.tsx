'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Child } from '@/types';
import childService from '@/services/child.service';
import { useUserRole } from '@/context/UserRoleContext';
import { USER_ROLE } from '@/types/enums';

const SELECTED_CHILD_ID_KEY = 'selectedChildId';

interface ChildSelectionContextType {
  children: Child[];
  selectedChildId: number | null;
  selectedGroupId: number | null;
  setSelectedChildId: (id: number) => void;
  loading: boolean;
}

const ChildSelectionContext = createContext<
  ChildSelectionContextType | undefined
>(undefined);

const USE_DUMMY_CHILDREN_DATA = true;
export function ChildSelectionProvider({ children }: { children: ReactNode }) {
  const { role, loading: roleLoading } = useUserRole();
  const [availableChildren, setAvailableChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildIdState] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const selectedGroupId = useMemo(
    () =>
      availableChildren.find((child) => child.id === selectedChildId)
        ?.groupId ?? null,
    [availableChildren, selectedChildId]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || roleLoading) {
      return;
    }

    if (role !== USER_ROLE.PARENT) {
      setSelectedChildIdState(null);
      setAvailableChildren([]);
      setLoading(false);
      return;
    }

    const raw = window.localStorage.getItem(SELECTED_CHILD_ID_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (!Number.isNaN(parsed) && parsed > 0) {
      setSelectedChildIdState(parsed);
    }
  }, [role, roleLoading]);

  const setSelectedChildId = useCallback(
    (id: number) => {
      if (role !== USER_ROLE.PARENT) {
        return;
      }

      setSelectedChildIdState(id);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SELECTED_CHILD_ID_KEY, String(id));
      }
    },
    [role]
  );

  useEffect(() => {
    if (roleLoading) {
      return;
    }

    if (role !== USER_ROLE.PARENT) {
      setAvailableChildren([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadChildren = async () => {
      setLoading(true);
      try {
        const list = await childService.getChildrenList();
        if (!isActive) {
          return;
        }

        const childrenList = list ?? [];

        if (USE_DUMMY_CHILDREN_DATA) {
          childrenList.push(
            { id: 1, firstName: 'Elli', groupId: 1 },
            { id: 2, firstName: 'Matti', groupId: 2 }
          );
        }
        setAvailableChildren(childrenList);

        if (childrenList.length === 0) {
          setSelectedChildIdState(null);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(SELECTED_CHILD_ID_KEY);
          }
          return;
        }

        setSelectedChildIdState((prev) => {
          const stillExists =
            prev != null && childrenList.some((child) => child.id === prev);
          if (stillExists) {
            return prev;
          }

          const fallbackId = childrenList[0].id;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              SELECTED_CHILD_ID_KEY,
              String(fallbackId)
            );
          }
          return fallbackId;
        });
      } catch {
        if (isActive) {
          setAvailableChildren([]);
          setSelectedChildIdState(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadChildren();

    return () => {
      isActive = false;
    };
  }, [role, roleLoading]);

  const value = useMemo(
    () => ({
      children: availableChildren,
      selectedChildId,
      selectedGroupId,
      setSelectedChildId,
      loading,
    }),
    [
      availableChildren,
      loading,
      selectedChildId,
      selectedGroupId,
      setSelectedChildId,
    ]
  );

  return (
    <ChildSelectionContext.Provider value={value}>
      {children}
    </ChildSelectionContext.Provider>
  );
}

export function useChildSelection() {
  const context = useContext(ChildSelectionContext);
  if (!context) {
    throw new Error(
      'useChildSelection must be used within ChildSelectionProvider'
    );
  }
  return context;
}

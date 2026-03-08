import { toast } from 'sonner';
import { useCallback } from 'react';

interface RequestOptions extends RequestInit {
  skipErrorToast?: boolean;
}

export function useApi() {
  const apiCall = useCallback(
    async <T = unknown>(
      url: string,
      options?: RequestOptions,
    ): Promise<T> => {
      const { skipErrorToast = false, ...fetchOptions } = options || {};

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...fetchOptions,
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        if (!skipErrorToast) {
          toast.error(data.message || 'An error occurred');
        }
        throw new Error(data.message);
      }

      return data.data || data;
    },
    [],
  );

  return { apiCall };
}

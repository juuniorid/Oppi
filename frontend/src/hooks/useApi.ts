import { useCallback } from 'react';
import { apiUrl } from '@/config/api';
import { showErrorToast } from '@/components/ErrorToast';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

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

      const response = await fetchWithAuth(apiUrl(url), {
        ...fetchOptions,
      });

      const data = await parseJson(response);

      if (!response.ok) {
        const message = extractErrorMessage(data, `Request failed (${response.status})`);
        if (!skipErrorToast) {
          showErrorToast(message);
        }
        throw new Error(message);
      }

      return unwrapData<T>(data);
    },
    [],
  );

  return { apiCall };
}

export async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function unwrapData<T>(payload: unknown, fallback?: T): T {
  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  if (payload == null && fallback !== undefined) {
    return fallback;
  }

  return payload as T;
}

export function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
  const { cache = 'no-store', ...rest } = init ?? {};

  return fetch(url, {
    credentials: 'include',
    cache,
    ...rest,
  });
}

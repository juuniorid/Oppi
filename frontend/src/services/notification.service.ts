import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

/** One notification row as returned by `GET /notifications`. */
export type ApiNotification = {
  id: number;
  subject: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  audience: string;
};

/**
 * Client for notification REST endpoints (list, used by the announcements feed).
 */
class NotificationService {
  async list(limit = 50): Promise<ApiNotification[]> {
    const response = await fetchWithAuth(
      apiUrl(apiPaths.notifications.list(limit))
    );
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(
          data,
          `Failed to load notifications (${response.status})`
        )
      );
    }

    const payload = unwrapData<{ notifications: ApiNotification[] }>(data, {
      notifications: [],
    });

    return Array.isArray(payload.notifications) ? payload.notifications : [];
  }
}

const notificationService = new NotificationService();
export default notificationService;

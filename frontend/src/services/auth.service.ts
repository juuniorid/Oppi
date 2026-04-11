import { User } from '@/types';
import { apiPaths, apiUrl } from '@/config/api';
import {
  extractErrorMessage,
  fetchWithAuth,
  parseJson,
  unwrapData,
} from '@/services/http.service';

class AuthService {
  getGoogleLoginUrl(): string {
    return apiUrl(apiPaths.auth.google);
  }

  async getProfile(): Promise<User> {
    const response = await fetchWithAuth(apiUrl(apiPaths.auth.me));
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load profile (${response.status})`));
    }

    return unwrapData<User>(data);
  }

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(apiUrl(apiPaths.auth.logout), {
        method: 'GET',
      });
    } catch {
      // Clear cookie may still have failed; still leave app
    }
    window.location.assign('/login');
  }
}

const authService = new AuthService();

export default authService;

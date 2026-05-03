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

  private async tryRefreshSession(): Promise<boolean> {
    try {
      const response = await fetchWithAuth(apiUrl(apiPaths.auth.refresh), {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async requestProfile(): Promise<Response> {
    return fetchWithAuth(apiUrl(apiPaths.auth.me));
  }

  async getProfile(): Promise<User> {
    let response = await this.requestProfile();

    if (response.status === 401) {
      const refreshed = await this.tryRefreshSession();
      if (refreshed) {
        response = await this.requestProfile();
      }
    }

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, `Failed to load profile (${response.status})`));
    }

    return unwrapData<User>(data);
  }

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    const response = await fetchWithAuth(apiUrl(apiPaths.auth.updateMe), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(data, `Failed to update profile (${response.status})`)
      );
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

import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class AuthService {
  async getProfile(): Promise<User> {
    const response = await fetch(
      `${API_URL}/auth/me`,
      { credentials: 'include' },
    );
    const data = await response.json();
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Clear cookie may still have failed; still leave app
    }
    window.location.assign('/login');
  }
}

const authService = new AuthService();

export default authService;

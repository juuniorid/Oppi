import { User } from '@/types';

class AuthService {
  async getProfile(): Promise<User> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
      { credentials: 'include' },
    );
    const data = await response.json();
    return data;
  }

  async logout(): Promise<void> {
    // Clear localStorage/cookies on client
    // Server-side session cleanup can be added
  }
}

export default new AuthService();

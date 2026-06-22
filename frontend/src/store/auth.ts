import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { setAccessToken } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import type { User } from '@/types';

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: Status;
  /** Restore a session on app load using the refresh cookie. */
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const { user, accessToken } = await authService.refresh();
      setAccessToken(accessToken);
      set({ user, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    // Drop any socket authenticated as a previous user so the next connection
    // re-handshakes with the new token (otherwise bids go out as the old user).
    disconnectSocket();
    const { user, accessToken } = await authService.login({ email, password });
    setAccessToken(accessToken);
    set({ user, status: 'authenticated' });
    return user;
  },

  register: async (input) => {
    disconnectSocket();
    const { user, accessToken } = await authService.register(input);
    setAccessToken(accessToken);
    set({ user, status: 'authenticated' });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      disconnectSocket();
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser: (user) => set({ user }),
}));

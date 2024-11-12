// src/lib/stores/auth.ts
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import Cookies from 'js-cookie';

interface AuthStore {
  token: string | null;
  user: {
    email: string;
    exp: number;
  } | null;
}

function createAuthStore() {
  const initialToken = browser ? Cookies.get('access_token') : null;
  
  const { subscribe, set, update } = writable<AuthStore>({
    token: initialToken,
    user: null
  });

  return {
    subscribe,
    login: (token: string, user: { email: string; exp: number }) => {
      if (browser) {
        const expiresIn = Math.ceil((user.exp - Date.now() / 1000) / (60 * 60 * 24));
        
        Cookies.set('access_token', token, {
          expires: expiresIn,
          secure: true,
          sameSite: 'strict'
        });
      }
      set({ token, user });
    },
    logout: () => {
      if (browser) {
        Cookies.remove('access_token');
      }
      set({ token: null, user: null });
    },
    initialize: () => {
      if (browser) {
        const token = Cookies.get('access_token');
        if (token) {
          set({ token, user: null });
        }
      }
    },
    isTokenExpired: () => {
			const token = Cookies.get('access_token');
			if (!token) return true;
			return false;
		}
  };
}

export const auth = createAuthStore();
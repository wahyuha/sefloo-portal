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
  const { subscribe, set, update } = writable<AuthStore>({
    token: null,
    user: null
  });

  return {
    subscribe,
    login: (token: string, user: { email: string; exp: number }) => {
      if (browser) {
        // Calculate expiry time in days
        const expiryDate = new Date(user.exp * 1000);
        
        Cookies.set('access_token', token, {
          expires: expiryDate,
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
      if (!browser) return true;
      
      const token = Cookies.get('access_token');
      if (!token) return true;

      try {
        // Decode the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check if token is expired
        if (payload.exp && payload.exp < currentTime) {
          Cookies.remove('access_token');
          return true;
        }
        
        return false;
      } catch (error) {
        // If token is invalid, remove it and return true
        Cookies.remove('access_token');
        return true;
      }
    }
  };
}

export const auth = createAuthStore();
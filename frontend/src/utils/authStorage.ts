/**
 * Centralized token and session storage abstraction for AHRAO.
 * Enforces single-point access to localStorage without scattering throughout components.
 */

const TOKEN_KEY = 'ahrao_token';
const USER_KEY = 'ahrao_current_user';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error('Failed to persist authentication token in storage:', err);
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Failed to remove authentication token from storage:', err);
    }
  },

  getUser: <T = unknown>(): T | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error('Failed to persist user profile in storage:', err);
    }
  },

  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Failed to remove user profile from storage:', err);
    }
  },

  clearAuth: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Failed to clear authentication storage:', err);
    }
  },
};

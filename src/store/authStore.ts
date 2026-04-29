import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  expiresAtUtc: string | null;
  displayName: string | null;
  setSession: (s: {
    accessToken: string;
    expiresAtUtc: string;
    displayName: string;
  }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAtUtc: null,
      displayName: null,
      setSession: ({ accessToken, expiresAtUtc, displayName }) =>
        set({ accessToken, expiresAtUtc, displayName }),
      clear: () =>
        set({ accessToken: null, expiresAtUtc: null, displayName: null }),
    }),
    { name: "glorycafe.auth" },
  ),
);

export function isSessionValid(state: AuthState): boolean {
  if (!state.accessToken || !state.expiresAtUtc) return false;
  return new Date(state.expiresAtUtc).getTime() > Date.now();
}

export function getAccessToken(): string | null {
  const state = useAuthStore.getState();
  if (!isSessionValid(state)) return null;
  return state.accessToken;
}

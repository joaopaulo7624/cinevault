import { create } from 'zustand';
import { User } from '../types';
import { useLibraryStore } from './useLibraryStore';

interface AuthState {
  user: User | null;
  authLoading: boolean;
  login: (email: string, name: string, uid: string) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  authLoading: true,
  login: (email, name, uid) => set({ user: { email, name, uid }, authLoading: false }),
  logout: () => {
    set({ user: null });
    useLibraryStore.getState().clearLibrary();
  },
  setAuthLoading: (loading) => set({ authLoading: loading }),
}));

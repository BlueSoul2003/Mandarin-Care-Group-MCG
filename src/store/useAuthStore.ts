import { create } from 'zustand';

interface User {
  name: string;
  initials: string;
}

interface AuthState {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
}

// Helper to extract first two initials from a name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (name: string) => set({ user: { name, initials: getInitials(name) } }),
  logout: () => set({ user: null }),
}));

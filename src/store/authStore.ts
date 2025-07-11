import { create } from 'zustand';

type User = {
  id: number;
  username: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setDefaultAdmin: () => void;
};

export const useAuthStore = create<AuthState>()(
  // Remove the persist wrapper
  (set) => ({
    user: null,
    isAuthenticated: false,
    
    login: async (username, password) => {
      try {
        const api = (window as any).electronAPI;
        // console.log('Logging in with username:', username, 'and password:', password);
        
        const user = await api.login(username, password);
        // console.log('Login result:', user);
        
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    
    logout: () => {
      set({ user: null, isAuthenticated: false });
    },
    
    setDefaultAdmin: () => {
      set({
        user: { id: 1, username: 'Admin' },
        isAuthenticated: true
      });
    }
  })
);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAccessToken } from '../config/api';
import { refreshToken as refreshSessionRequest } from '../services/auth-service';
import { cacheOfflineAuthSession } from '../services/local-auth-service';
import type { AuthSession, User } from '../types/models';

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrating: boolean;
  signIn: (session: AuthSession, pin?: string | null) => Promise<void>;
  refreshCurrentSession: () => Promise<AuthSession>;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const STORAGE_KEY = 'management_emergency_session';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !active) {
          return;
        }

        const parsed = JSON.parse(raw) as AuthSession;
        setUser(parsed.user);
        setAccessTokenState(parsed.accessToken);
        setRefreshTokenState(parsed.refreshToken);
        setAccessToken(parsed.accessToken);
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const persistSession = async (session: AuthSession | null) => {
    if (session) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(session.user);
      setAccessTokenState(session.accessToken);
      setRefreshTokenState(session.refreshToken);
      setAccessToken(session.accessToken);
      return;
    }

    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setAccessToken(null);
  };

  const signIn = async (session: AuthSession, pin: string | null = null) => {
    await persistSession(session);

    if (pin) {
      await cacheOfflineAuthSession(session, pin).catch(() => {});
    }
  };

  const refreshCurrentSession = async () => {
    if (!refreshToken) {
      throw new Error('Refresh token tidak tersedia.');
    }

    const session = await refreshSessionRequest(refreshToken);
    await persistSession(session);
    return session;
  };

  const signOut = async () => {
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // logout should continue even if backend is unavailable
      }
    }

    await persistSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isHydrating,
        signIn,
        refreshCurrentSession,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}

import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/endpoints/auth';

// Central place the rest of the app asks "who is logged in / what can they
// see". `role` is derived from `user`, never set independently — that's what
// makes ProtectedRoute trustworthy: there is no code path that shows a
// role's dashboard without actually being logged in as that role.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, role) => {
    setLoading(true);
    try {
      const loggedInUser = await authApi.login({ email, role });
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, login, logout, loading, isAuthenticated: !!user }),
    [user, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

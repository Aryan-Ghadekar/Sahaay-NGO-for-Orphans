import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import * as authApi from '../api/endpoints/auth';
import { getAuthToken, setAuthToken } from '../api/client';

// Central place the rest of the app asks "who is logged in / what can they
// see". `role` is derived from `user`, never set independently — that's what
// makes ProtectedRoute trustworthy: there is no code path that shows a
// role's dashboard without actually being logged in as that role.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Separate from `loading` (login/signup in flight): this is only true
  // during the initial token-restore check, so ProtectedRoute can tell
  // "still finding out" apart from "confirmed logged out" and avoid
  // bouncing a valid session on page reload before it's been verified.
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore session on load: a stored token from a previous visit means
  // the person is still logged in as far as the app's concerned, pending
  // the server confirming the token still works.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    authApi
      .getCurrentUser()
      .then((profile) => setUser(profile))
      .catch(() => setAuthToken(null))
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: loggedInUser } = await authApi.login(email, password);
      setAuthToken(token);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ email, password, fullName, role }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.signup({ email, password, fullName, role });
      if (result.token) {
        setAuthToken(result.token);
        setUser(result.user);
      }
      return result; // { message } when email confirmation is required, no token yet
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await authApi.logout().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      login,
      signup,
      logout,
      loading,
      initializing,
      error,
      isAuthenticated: !!user,
    }),
    [user, login, signup, logout, loading, initializing, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

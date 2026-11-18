/**
 * AuthContext — global authentication state.
 *
 * Provides:
 *   user        — current user object (or null when logged-out)
 *   isLoading   — true while the initial "who am I?" check is in-flight
 *   login(data) — stores tokens, sets user
 *   logout()    — clears tokens, resets user
 *
 * Wrap your whole app (or router) with <AuthProvider> once in main.jsx / App.jsx.
 * Consume with the `useAuth` hook anywhere below.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import client from "../api/client";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // start true: check stored token

  /**
   * On first mount: if we have a stored access token try to fetch the current
   * user. If the token is expired the Axios interceptor will attempt a silent
   * refresh automatically. If that also fails the interceptor logs the user out.
   */
  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setIsLoading(false);
      return;
    }

    client
      .get("/users/me/")
      .then(({ data }) => setUser(data?.data || data))   // unwrap envelope
      .catch(() => {
        // Tokens invalid / refresh failed → interceptor already cleared storage.
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Call after a successful login/register API response.
   * `data` must contain { access, refresh, user } or we fetch the user
   * separately via /users/me/.
   */
  const login = useCallback(async (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // The login response may already include user details; if not, fetch them.
    if (data.user) {
      setUser(data.user);
    } else {
      const { data: res } = await client.get("/users/me/");
      setUser(res?.data || res);  // unwrap envelope
    }
  }, []);

  /** Clear everything and go back to the anonymous state. */
  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        // Best-effort: tell the server to blacklist the refresh token.
        await client.post("/users/logout/", { refresh });
      }
    } catch {
      // Ignore errors (e.g. token already invalid).
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

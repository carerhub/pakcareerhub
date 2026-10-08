import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthState {
  isAdmin: boolean;
  isUser: boolean;
  user: { id: number; name: string; email: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isAdmin: false,
  isUser: false,
  user: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
        setIsUser(data.isUser === true);
        setUser(data.isUser ? { id: data.id, name: data.name, email: data.email } : null);
      } else {
        setIsAdmin(false);
        setIsUser(false);
        setUser(null);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.user ? false : true);
        setIsUser(Boolean(data.user));
        setUser(data.user || null);
        return { ok: true };
      }
      const data = await res.json();
      return { ok: false, error: data.error || "Login failed" };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(false);
        setIsUser(true);
        setUser(data.user);
        return { ok: true };
      }
      const data = await res.json();
      return { ok: false, error: data.error || "Registration failed" };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setIsAdmin(false);
      setIsUser(false);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, isUser, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

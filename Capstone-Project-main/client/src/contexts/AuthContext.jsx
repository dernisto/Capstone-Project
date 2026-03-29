import { jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { useLocation } from "wouter";
import { authFetch } from "@/lib/api";
import {
  TOKEN_KEY,
  getStoredUser,
  setStoredUser
} from "@/lib/authStorage";
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUserState] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const setUser = useCallback((u) => {
    setStoredUser(u);
    setUserState(u);
  }, []);
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8e3);
    try {
      const res = await authFetch("/api/auth/me", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const u = {
            id: String(data.user.id ?? data.user._id ?? ""),
            email: data.user.email ?? "",
            name: data.user.name ?? ""
          };
          setUser(u);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } else if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } else {
        const stored = getStoredUser();
        if (stored) setUser(stored);
        else setUser(null);
      }
    } catch {
      clearTimeout(timeoutId);
      const stored = getStoredUser();
      if (stored) setUser(stored);
      else setUser(null);
    }
    setLoading(false);
  }, [setUser]);
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    loadUser();
  }, [loadUser, setUser]);
  const login = useCallback(
    async (email, password) => {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }
      if (!data.token) {
        throw new Error("Invalid response from server.");
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      const id = data.user?.id ?? data.user?._id ?? "";
      const emailVal = data.user?.email ?? email;
      const nameVal = data.user?.name ?? email.split("@")[0] ?? "User";
      setUser({ id: String(id), email: emailVal, name: nameVal });
    },
    [setUser]
  );
  const register = useCallback(
    async (email, password, name) => {
      const res = await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }
      if (data.token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        const u = { id: data.user.id, email: data.user.email, name: data.user.name };
        setUser(u);
      } else if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        await loadUser();
      }
    },
    [loadUser, setUser]
  );
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, [setUser]);
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: { user, loading, login, register, logout },
      children
    }
  );
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
function useRequireAuth(redirectPath = "/login") {
  const auth = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      navigate(redirectPath);
    }
  }, [auth.loading, auth.user, navigate, redirectPath]);
  return auth;
}
export {
  AuthProvider,
  useAuth,
  useRequireAuth
};

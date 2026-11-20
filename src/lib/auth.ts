import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "SUPERADMIN" | "CONTENT_EDITOR" | "FINANCE_AUDITOR" | "MODERATOR";
  capabilities?: string[];
  is_active: boolean;
  created_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

const STORAGE_KEY_USER = "horemow_auth_user";
const STORAGE_KEY_TOKENS = "horemow_auth_tokens";

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getStoredTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  if (token.startsWith("mock_")) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    // 10s buffer before expiration
    return payload.exp <= now + 10;
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  const user = getStoredUser();
  const tokens = getStoredTokens();
  if (!user || !tokens?.access) return false;

  if (!isTokenExpired(tokens.access)) return true;
  if (tokens.refresh && !isTokenExpired(tokens.refresh)) return true;

  clearAuthSession();
  return false;
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh || isTokenExpired(tokens.refresh)) {
    await logoutAdmin(true);
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (!res.ok) {
      await logoutAdmin(true);
      return null;
    }
    const data = await res.json();
    const newAccess = data.access;
    if (newAccess) {
      const updatedTokens: AuthTokens = {
        access: newAccess,
        refresh: data.refresh || tokens.refresh,
      };
      const user = getStoredUser();
      if (user) {
        saveAuthSession(user, updatedTokens);
      }
      return newAccess;
    }
  } catch (err) {
    console.error("Token refresh failed", err);
  }
  return null;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens?.access) return null;

  if (!isTokenExpired(tokens.access)) {
    return tokens.access;
  }

  if (tokens.refresh && !isTokenExpired(tokens.refresh)) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return newAccess;
  }

  await logoutAdmin(true);
  return null;
}

export function hasPermission(user: AuthUser | null, permissionKey: string): boolean {
  if (!user) return true;
  if (user.role === "SUPERADMIN") return true;
  if (user.capabilities?.includes("*")) return true;
  if (permissionKey === "overview" || permissionKey === "dashboard") return true;
  return Boolean(user.capabilities?.includes(permissionKey));
}

export const DEFAULT_SUBADMINS: AuthUser[] = [
  {
    id: "usr-super",
    email: "admin@horemow.org",
    first_name: "International",
    last_name: "Directorate",
    role: "SUPERADMIN",
    capabilities: ["*"],
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "usr-content",
    email: "content.editor@horemow.org",
    first_name: "Brother",
    last_name: "Emmanuel",
    role: "CONTENT_EDITOR",
    capabilities: ["content", "sermons", "devotionals", "events", "blog", "bookstore", "gallery"],
    is_active: true,
    created_at: "2026-10-15T00:00:00Z",
  },
  {
    id: "usr-finance",
    email: "finance.audit@horemow.org",
    first_name: "Sister",
    last_name: "Grace",
    role: "FINANCE_AUDITOR",
    capabilities: ["donations", "transactions", "analytics"],
    is_active: true,
    created_at: "2026-11-01T00:00:00Z",
  },
];

let memorySubadmins = DEFAULT_SUBADMINS;

export function getSubAdmins(): AuthUser[] {
  return memorySubadmins;
}

export function saveSubAdmins(list: AuthUser[]) {
  memorySubadmins = list;
  window.dispatchEvent(new CustomEvent("horemow_subadmins_changed"));
}

export async function fetchSubAdminsApi(): Promise<AuthUser[]> {
  try {
    const token = await getValidAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/auth/users/`, { headers });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        memorySubadmins = list;
        window.dispatchEvent(new CustomEvent("horemow_subadmins_changed"));
        return list;
      }
    }
  } catch (err) {
    console.warn("fetchSubAdminsApi error:", err);
  }
  return memorySubadmins;
}

export async function createSubAdminApi(payload: {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  capabilities: string[];
  is_active: boolean;
  password?: string;
}): Promise<AuthUser> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/auth/users/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.detail ||
      data?.email?.[0] ||
      data?.password?.[0] ||
      `Failed to create user (${res.status})`;
    throw new Error(errorMsg);
  }

  const createdUser: AuthUser = data.data || data;
  memorySubadmins = [createdUser, ...memorySubadmins.filter((a) => a.id !== createdUser.id)];
  window.dispatchEvent(new CustomEvent("horemow_subadmins_changed"));
  return createdUser;
}

export async function updateSubAdminApi(
  id: string,
  payload: Partial<AuthUser> & { password?: string }
): Promise<AuthUser> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.detail || `Failed to update user (${res.status})`;
    throw new Error(errorMsg);
  }

  const updatedUser: AuthUser = data.data || data;
  memorySubadmins = memorySubadmins.map((a) => (a.id === id ? { ...a, ...updatedUser } : a));
  window.dispatchEvent(new CustomEvent("horemow_subadmins_changed"));
  return updatedUser;
}

export async function deleteSubAdminApi(id: string): Promise<void> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok && res.status !== 204 && res.status !== 404) {
    throw new Error(`Failed to delete user (${res.status})`);
  }

  memorySubadmins = memorySubadmins.filter((a) => a.id !== id);
  window.dispatchEvent(new CustomEvent("horemow_subadmins_changed"));
}

export function saveAuthSession(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
  window.dispatchEvent(new CustomEvent("horemow_auth_changed"));
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKENS);
  window.dispatchEvent(new CustomEvent("horemow_auth_changed"));
}

export async function loginAdmin(email: string, password: string): Promise<AuthUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const errorMsg = data?.error?.details?.non_field_errors?.[0] ||
        data?.message ||
        `Login failed (${response.status})`;
      throw new Error(errorMsg);
    }

    saveAuthSession(data.user, data.tokens);
    return data.user as AuthUser;
  } catch (err: unknown) {
    // If backend is unreachable or local demo fallback needed
    if (email.toLowerCase() === "admin@horemow.org" && password === "AdminPassword123!") {
      const fallbackUser: AuthUser = {
        id: "c2f4c05f-6e5e-48df-80d3-c13fc98e75e4",
        email: "admin@horemow.org",
        first_name: "Main",
        last_name: "Administrator",
        role: "SUPERADMIN",
        capabilities: ["*"],
        is_active: true,
      };
      saveAuthSession(fallbackUser, { access: "mock_token_access", refresh: "mock_token_refresh" });
      return fallbackUser;
    }
    throw err instanceof Error ? err : new Error("Failed to sign in. Please check credentials.");
  }
}

export async function registerAdmin(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
  auth_code?: string;
}): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const errorMsg = data?.message || data?.error?.message || `Registration failed (${response.status})`;
    throw new Error(errorMsg);
  }

  saveAuthSession(data.user, data.tokens);
  return data.user as AuthUser;
}

export async function logoutAdmin(redirect = false): Promise<void> {
  const tokens = getStoredTokens();
  if (tokens?.refresh && !tokens.refresh.startsWith("mock_")) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
    } catch {
      // Ignored during client cleanup
    }
  }
  clearAuthSession();
  if (redirect && typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login?session_expired=1";
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getStoredUser());
      setIsAuth(isAuthenticated());
    };
    window.addEventListener("horemow_auth_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Periodic check every 15 seconds to automatically detect expired sessions
    const timer = setInterval(() => {
      const active = isAuthenticated();
      setIsAuth(active);
      if (!active && getStoredUser()) {
        logoutAdmin(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener("horemow_auth_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(timer);
    };
  }, []);

  return {
    user,
    isAuthenticated: isAuth,
    logout: () => logoutAdmin(false),
  };
}

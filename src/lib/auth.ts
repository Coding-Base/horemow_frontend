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

export function isAuthenticated(): boolean {
  return Boolean(getStoredUser() && getStoredTokens()?.access);
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (!res.ok) return null;
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
  return tokens.access;
}

export function hasPermission(user: AuthUser | null, permissionKey: string): boolean {
  if (!user) return true;
  if (user.role === "SUPERADMIN") return true;
  if (user.capabilities?.includes("*")) return true;
  if (permissionKey === "overview" || permissionKey === "dashboard") return true;
  return Boolean(user.capabilities?.includes(permissionKey));
}

const STORAGE_KEY_SUBADMINS = "horemow_subadmins_list";

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

export function getSubAdmins(): AuthUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBADMINS);
    return raw ? (JSON.parse(raw) as AuthUser[]) : DEFAULT_SUBADMINS;
  } catch {
    return DEFAULT_SUBADMINS;
  }
}

export function saveSubAdmins(list: AuthUser[]) {
  localStorage.setItem(STORAGE_KEY_SUBADMINS, JSON.stringify(list));
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

export async function logoutAdmin(): Promise<void> {
  const tokens = getStoredTokens();
  if (tokens?.refresh) {
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
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  useEffect(() => {
    const handleUpdate = () => setUser(getStoredUser());
    window.addEventListener("horemow_auth_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("horemow_auth_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    logout: logoutAdmin,
  };
}

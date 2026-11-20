const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("The HOREMOW API is not configured.", 0);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("horemow_auth_user");
      localStorage.removeItem("horemow_auth_tokens");
      window.dispatchEvent(new CustomEvent("horemow_auth_changed"));
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login?session_expired=1";
      }
    }
    const body: unknown = await response.json().catch(() => undefined);
    throw new ApiError(
      `The request failed (${response.status}).`,
      response.status,
      body,
    );
  }

  return (await response.json()) as T;
}

export const isApiConfigured = Boolean(API_BASE_URL);

export async function fetchMinistryProfileApi(): Promise<any> {
  const url = API_BASE_URL ? `${API_BASE_URL}/ministry/profile/` : "http://localhost:8000/api/v1/ministry/profile/";
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn("fetchMinistryProfileApi error:", err);
    return null;
  }
}

export async function updateMinistryProfileApi(payload: any): Promise<any> {
  const url = API_BASE_URL ? `${API_BASE_URL}/ministry/profile/` : "http://localhost:8000/api/v1/ministry/profile/";
  const rawTokens = localStorage.getItem("horemow_auth_tokens");
  let access = "";
  if (rawTokens) {
    try {
      access = JSON.parse(rawTokens)?.access || "";
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.detail || `Failed to save settings (${res.status})`);
  }
  return await res.json();
}

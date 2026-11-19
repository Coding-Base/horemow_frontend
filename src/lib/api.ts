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

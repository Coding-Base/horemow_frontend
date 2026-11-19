import { getValidAccessToken } from "./auth";
import type { AnalyticsData } from "./contentStore";
import { getAnalyticsData } from "./contentStore";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "horemow_analytics_session_id";

export function getOrCreateSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `hrmw_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return `hrmw_temp_${Date.now()}`;
  }
}

export async function sendAnalyticsEvent(payload: {
  path: string;
  title?: string;
  durationSeconds?: number;
  isExit?: boolean;
}): Promise<void> {
  const { path, title, durationSeconds = 0, isExit = false } = payload;
  if (!path || path.startsWith("/admin") || path.startsWith("/control-panel")) {
    return;
  }

  const sessionId = getOrCreateSessionId();
  const body = JSON.stringify({
    sessionId,
    path,
    title: title || document.title || path,
    durationSeconds,
    isExit,
  });

  const url = `${API_BASE_URL}/analytics/track/`;

  if (isExit && typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    } catch {
      // Fallback to fetch
    }
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Silently ignore telemetry network failures
  }
}

export async function fetchAnalyticsOverview(timeRange: "7D" | "30D" | "90D"): Promise<AnalyticsData> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/analytics/overview/?range=${timeRange}`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      return (await res.json()) as AnalyticsData;
    }
  } catch {
    // If backend endpoint is unreachable (e.g. offline dev or mock), fallback to contentStore
  }

  return getAnalyticsData();
}

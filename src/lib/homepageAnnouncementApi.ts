import { getValidAccessToken } from "./auth";
import type { HomepageAnnouncement } from "./contentStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const ENDPOINT = "/events/homepage-announcement/";

type ApiAnnouncement = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  message: string;
  image_url: string;
  action_label: string;
  action_url: string;
  updated_at: string;
};

function fromApi(value: ApiAnnouncement): HomepageAnnouncement {
  return {
    enabled: value.enabled,
    eyebrow: value.eyebrow,
    title: value.title,
    message: value.message,
    imageUrl: value.image_url,
    actionLabel: value.action_label,
    actionUrl: value.action_url,
    updatedAt: value.updated_at,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => undefined);
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
  }
  return `Homepage announcement request failed (${response.status}).`;
}

export async function fetchHomepageAnnouncement(
  signal?: AbortSignal,
): Promise<HomepageAnnouncement | null> {
  if (!API_BASE_URL) throw new Error("The HOREMOW API is not configured.");

  const token = await getValidAccessToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
    headers,
    signal,
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));

  const text = await response.text();
  if (!text || !text.trim()) return null;

  try {
    const data = JSON.parse(text) as ApiAnnouncement | null;
    return data ? fromApi(data) : null;
  } catch {
    return null;
  }
}

export async function saveHomepageAnnouncementToApi(
  announcement: HomepageAnnouncement,
): Promise<HomepageAnnouncement> {
  if (!API_BASE_URL) throw new Error("The HOREMOW API is not configured.");

  const token = await getValidAccessToken();
  if (!token) throw new Error("Sign in again to publish a homepage announcement.");

  const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      enabled: announcement.enabled,
      eyebrow: announcement.eyebrow,
      title: announcement.title,
      message: announcement.message,
      image_url: announcement.imageUrl,
      action_label: announcement.actionLabel,
      action_url: announcement.actionUrl,
    }),
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));

  return fromApi((await response.json()) as ApiAnnouncement);
}

export const isHomepageAnnouncementApiConfigured = Boolean(API_BASE_URL);

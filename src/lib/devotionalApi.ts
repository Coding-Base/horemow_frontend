import { getValidAccessToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export interface DevotionalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  published_at?: string | null;
  text_reference: string;
  text_body: string;
  key_verse_reference: string;
  key_verse_text: string;
  scripture_reading?: string;
  memory_verse_reference?: string;
  memory_verse_text?: string;
  reflection_body: string;
  prayer_points?: string[];
  action_point?: string;
  thought_for_day?: string;
  song_for_day?: string;
  bible_reading_for_day?: string;
  author_attribution: string;
  card_template: "classic" | "parchment" | "modern" | "royal" | "sunrise" | string;
  card_bg_color?: string;
  card_accent_color?: string;
  card_bg_image?: string;
  batch?: string | null;
  image_url?: string;
  is_audio_available?: boolean;
  audio_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DevotionalParsedEntry {
  id: string;
  batch: string;
  date: string;
  title: string;
  text_reference: string;
  text_body: string;
  key_verse_reference: string;
  key_verse_text: string;
  reflection_body: string;
  thought_for_day: string;
  song_for_day: string;
  bible_reading_for_day: string;
  author_attribution: string;
  prayer_points: string[];
  action_point: string;
  has_parsing_issues: boolean;
  parsing_notes: string;
  order: number;
}

export interface DevotionalBatch {
  id: string;
  file_name: string;
  file_url?: string;
  date_range_start?: string | null;
  date_range_end?: string | null;
  total_entries: number;
  parsed_entries: number;
  total_pages?: number;
  processed_pages?: number;
  target_year?: number;
  start_page?: number;
  end_page?: number;
  is_scanned_ocr?: boolean;
  entries_count?: number;
  status: "UPLOADING" | "PARSING" | "REVIEW" | "CONFIRMED" | "FAILED";
  error_log?: string;
  uploaded_at: string;
  uploaded_by_email?: string;
  entries?: DevotionalParsedEntry[];
}

export interface AutoPublishSettings {
  publish_time: string; // HH:MM:SS
  timezone_name: string;
  is_enabled: boolean;
  default_template: string;
  default_author: string;
  gemini_api_key?: string;
  ocr_model?: string;
  ocr_api_key?: string;
  updated_at?: string;
}

export interface CalendarEntry {
  id: string;
  date: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  card_template: string;
  card_bg_color?: string;
  card_accent_color?: string;
}

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// 1. Fetch Paginated Devotionals
export async function fetchDevotionals(params?: {
  page?: number;
  search?: string;
  status?: string;
  batch?: string;
}): Promise<PaginatedResult<DevotionalEntry>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.batch) query.set("batch", params.batch);

  const res = await fetch(`${API_BASE_URL}/devotionals/?${query.toString()}`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load devotionals: ${res.statusText}`);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return data;
}

// 2. Fetch Single Devotional
export async function fetchDevotional(dateOrId: string): Promise<DevotionalEntry | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/devotionals/${dateOrId}/`, {
      headers: await getAuthHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch devotional (${res.status})`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchDevotional error:", err);
    return null;
  }
}

// 3. Fetch Today's Devotional
export async function fetchTodayDevotional(): Promise<DevotionalEntry | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/devotionals/today/`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn("fetchTodayDevotional offline or unconfigured:", err);
    return null;
  }
}

// 4. Create Single Devotional
export async function createDevotional(payload: Partial<DevotionalEntry>): Promise<DevotionalEntry> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || errData?.detail || `Creation failed (${res.status})`);
  }

  return await res.json();
}

// 5. Update Single Devotional
export async function updateDevotional(dateOrId: string, payload: Partial<DevotionalEntry>): Promise<DevotionalEntry> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/${dateOrId}/`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || errData?.detail || `Update failed (${res.status})`);
  }

  return await res.json();
}

// 6. Delete Devotional
export async function deleteDevotional(dateOrId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/${dateOrId}/`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Deletion failed (${res.status})`);
  }
}

// 7. Calendar View Lookup
export async function fetchCalendar(year: number, month: number): Promise<CalendarEntry[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/calendar/${year}/${month}/`, {
    headers,
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.results || [];
}

// 8. Bulk Upload PDF
export async function uploadDevotionalPdf(
  file: File,
  authorAttribution: string = "Pastor Paul Rika",
  defaultTemplate: string = "classic",
  targetYear: number = 2026,
  startPage: number = 1,
  endPage: number = 184
): Promise<DevotionalBatch> {
  const token = await getValidAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("author_attribution", authorAttribution);
  formData.append("default_template", defaultTemplate);
  formData.append("target_year", targetYear.toString());
  formData.append("start_page", startPage.toString());
  formData.append("end_page", endPage.toString());

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/devotionals/batches/`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || errData?.detail || `Upload failed (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

// 9. Fetch Batches
export async function fetchBatches(): Promise<DevotionalBatch[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/batches/`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}

// 10. Fetch Single Batch Detail (with parsed entries)
export async function fetchBatchDetail(batchId: string): Promise<DevotionalBatch> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/batches/${batchId}/`, { headers });
  if (!res.ok) throw new Error(`Failed to load batch: ${res.statusText}`);
  return await res.json();
}

// 11. Confirm and Import Batch
export async function confirmBatch(batchId: string, replaceConflicts: boolean = true): Promise<{ success: boolean; message: string; imported_count?: number }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/batches/${batchId}/confirm/`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ replace_conflicts: replaceConflicts }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || "Confirmation failed");
  }

  return await res.json();
}

// 12. Delete Batch
export async function deleteBatch(batchId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/batches/${batchId}/`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete batch");
}

// 13. Auto-publish Settings
export async function fetchAutoPublishSettings(): Promise<AutoPublishSettings> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/settings/auto-publish/`, { headers });
  if (!res.ok) {
    return {
      publish_time: "05:00:00",
      timezone_name: "Africa/Lagos",
      is_enabled: true,
      default_template: "classic",
      default_author: "Pastor Paul Rika",
    };
  }
  const json = await res.json();
  return json.data;
}

export async function updateAutoPublishSettings(settings: Partial<AutoPublishSettings>): Promise<AutoPublishSettings> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/settings/auto-publish/`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || "Failed to save settings");
  }
  const json = await res.json();
  return json.data;
}

// 14. Update Single Parsed Entry (during review)
export async function updateParsedEntry(
  entryId: string,
  payload: Partial<DevotionalParsedEntry>
): Promise<DevotionalParsedEntry> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/devotionals/parsed-entries/${entryId}/`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update entry");
  return await res.json();
}

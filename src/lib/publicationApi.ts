import { fileToDataUrl } from "./imageUpload";
import { getValidAccessToken } from "./auth";
import type { Publication } from "../data/content";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");
const API_BASE_URL = rawBase.endsWith("/api/v1") ? rawBase : `${rawBase}/api/v1`;

export interface BookUploadResult {
  success: boolean;
  publicUrl: string;
  fileName: string;
  fileSize: number;
  pageCount?: number;
  storage?: string;
}

export function mapBackendPublication(item: any): Publication {
  let fileUrl = item.fileUrl || item.preview_pdf_url || "";
  let coverUrl = item.coverUrl || item.cover_image_url || "";

  if (fileUrl && fileUrl.startsWith("/media/")) {
    try {
      fileUrl = `${new URL(API_BASE_URL).origin}${fileUrl}`;
    } catch {
      fileUrl = `http://localhost:8000${fileUrl}`;
    }
  }

  return {
    id: String(item.id || item.slug),
    title: item.title || "",
    author: item.author || "Pastor Paul Rika",
    category: item.category || item.category_name || "Holiness & Christian Living",
    language: item.language || "English",
    description: item.description || "",
    coverUrl: coverUrl || "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg",
    fileUrl: fileUrl || "",
    telegramUrl: item.telegramUrl || item.purchase_enquiry_url || "",
    format: item.format || "PDF & Paperback",
    price: item.price || "Free Download / Ministry Gift",
  };
}

export async function fetchPublicationsApi(): Promise<Publication[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/publications/?page_size=100`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results || data.data || [];
    if (!Array.isArray(list)) return [];
    return list.map(mapBackendPublication);
  } catch (err) {
    console.warn("fetchPublicationsApi error:", err);
    return [];
  }
}

export async function createPublicationApi(payload: Partial<Publication>): Promise<Publication> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = {
    title: payload.title,
    author: payload.author || "Pastor Paul Rika",
    category: payload.category || "Holiness & Christian Living",
    language: payload.language || "English",
    description: payload.description || "",
    format: payload.format || "PDF & Paperback",
    price: payload.price || "Free Download / Ministry Gift",
    cover_image_url: payload.coverUrl || "",
    preview_pdf_url: payload.fileUrl || "",
    purchase_enquiry_url: payload.telegramUrl || "",
    status: "PUBLISHED",
  };

  const res = await fetch(`${API_BASE_URL}/publications/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.detail || JSON.stringify(data) || `Failed to create book (${res.status})`;
    throw new Error(errorMsg);
  }

  return mapBackendPublication(data);
}

export async function updatePublicationApi(idOrSlug: string, payload: Partial<Publication>): Promise<Publication> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body: Record<string, any> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.author !== undefined) body.author = payload.author;
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.language !== undefined) body.language = payload.language;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.format !== undefined) body.format = payload.format;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.coverUrl !== undefined) body.cover_image_url = payload.coverUrl;
  if (payload.fileUrl !== undefined) body.preview_pdf_url = payload.fileUrl;
  if (payload.telegramUrl !== undefined) body.purchase_enquiry_url = payload.telegramUrl;

  const res = await fetch(`${API_BASE_URL}/publications/${idOrSlug}/`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = data?.error?.message || data?.detail || JSON.stringify(data) || `Failed to update book (${res.status})`;
    throw new Error(errorMsg);
  }

  return mapBackendPublication(data);
}

export async function deletePublicationApi(idOrSlug: string): Promise<void> {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/publications/${idOrSlug}/`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok && res.status !== 204 && res.status !== 404) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || `Failed to delete publication (${res.status})`);
  }
}

export async function uploadBookPdf(file: File): Promise<BookUploadResult> {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("Only PDF documents (.pdf) can be uploaded.");
  }

  // 100MB limit
  if (file.size > 104857600) {
    throw new Error("File size exceeds 100MB maximum limit.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const uploadEndpoint = `${API_BASE_URL}/publications/upload/`;
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        let pubUrl = json.data.public_url || "";
        if (pubUrl.startsWith("/")) {
          try {
            pubUrl = `${new URL(API_BASE_URL).origin}${pubUrl}`;
          } catch {
            pubUrl = `http://localhost:8000${pubUrl}`;
          }
        }
        return {
          success: true,
          publicUrl: pubUrl,
          fileName: json.data.file_name || file.name,
          fileSize: json.data.file_size || file.size,
          pageCount: json.data.page_count,
          storage: json.data.storage,
        };
      }
    } else {
      const errJson = await response.json().catch(() => null);
      if (errJson?.error?.message) {
        throw new Error(errJson.error.message);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message && !err.message.includes("Failed to fetch")) {
      throw err;
    }
    console.warn("Backend Supabase upload unavailable, falling back to local object storage:", err);
  }

  // Fallback: If backend is not running, generate data URL for instant frontend preview
  const dataUrl = await fileToDataUrl(file);
  return {
    success: true,
    publicUrl: dataUrl,
    fileName: file.name,
    fileSize: file.size,
    storage: "local_browser",
  };
}

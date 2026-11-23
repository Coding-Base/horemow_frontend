import { fileToDataUrl } from "./imageUpload";

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

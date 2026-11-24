import { fileToDataUrl } from "./imageUpload";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");
const API_BASE_URL = rawBase.endsWith("/api/v1") ? rawBase : `${rawBase}/api/v1`;

export interface AudioUploadResult {
  success: boolean;
  publicUrl: string;
  fileName: string;
  fileSize: number;
  storage?: string;
}

export async function uploadSermonAudio(file: File): Promise<AudioUploadResult> {
  const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.name);
  if (!isAudio) {
    throw new Error("Please select a valid audio file (.mp3, .m4a, .wav, .aac, .ogg).");
  }

  // 200MB limit
  if (file.size > 209715200) {
    throw new Error("Audio file size exceeds the 200MB maximum limit.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const uploadEndpoint = `${API_BASE_URL}/sermons/upload-audio/`;
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
    console.warn("Backend audio upload unavailable, falling back to local object storage:", err);
  }

  // Fallback: If backend is offline, generate local object URL
  const dataUrl = await fileToDataUrl(file, "horemow_audio");
  return {
    success: true,
    publicUrl: dataUrl,
    fileName: file.name,
    fileSize: file.size,
    storage: "local_browser",
  };
}

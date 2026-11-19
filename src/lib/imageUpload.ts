import { getValidAccessToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

/**
 * Fallback to local Data URL (base64) preview if offline or server is unconfigured.
 */
function readLocalDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to process image file."));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Cloudinary through the backend API.
 * Automatically saves a MediaAsset and returns the public secure URL.
 */
export async function uploadImageToCloudinary(file: File, folder = "horemow_media"): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selected file must be an image (PNG, JPG, WEBP, etc.)");
  }
  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image size must be less than 10MB.");
  }

  try {
    const token = await getValidAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/media/upload/`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.url) {
        return data.url;
      }
    } else {
      const errData = await response.json().catch(() => null);
      console.warn("Backend Cloudinary upload failed:", errData?.error?.message || response.statusText);
    }
  } catch (err) {
    console.warn("Cloudinary upload request error, falling back to local data URL:", err);
  }

  // Graceful fallback to local data URL if backend or Cloudinary is unreachable
  return readLocalDataUrl(file);
}

/**
 * Primary export used across admin managers.
 * Now routes directly to Cloudinary upload!
 */
export async function fileToDataUrl(file: File, folder = "horemow_media"): Promise<string> {
  return uploadImageToCloudinary(file, folder);
}

import { getValidAccessToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

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

  // Check if API_BASE_URL is pointing to localhost while running on production domain
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    API_BASE_URL.includes("localhost")
  ) {
    throw new Error(
      "Frontend is not linked to backend. Add 'VITE_API_BASE_URL' in Render Frontend Environment variables (e.g. https://your-backend.onrender.com/api/v1)."
    );
  }

  const token = await getValidAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/media/upload/`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (err: unknown) {
    throw new Error(
      `Cannot connect to backend at ${API_BASE_URL}. Ensure CORS_ALLOWED_ORIGINS on backend includes ${window.location.origin}`
    );
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg =
      errData?.error?.message ||
      errData?.detail ||
      `Cloudinary upload failed (HTTP ${response.status}). Check backend Cloudinary credentials.`;
    throw new Error(msg);
  }

  const data = await response.json();
  if (!data?.url) {
    throw new Error("Cloudinary upload completed but no URL was returned by server.");
  }

  return data.url;
}

/**
 * Primary export used across admin managers.
 * Routes directly to Cloudinary upload!
 */
export async function fileToDataUrl(file: File, folder = "horemow_media"): Promise<string> {
  return uploadImageToCloudinary(file, folder);
}

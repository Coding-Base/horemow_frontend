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
 * Reads a File locally as a base64 Data URL.
 * Used as an instant fallback when backend is offline or during local development.
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file locally."));
    reader.readAsDataURL(file);
  });
}

/**
 * Primary export used across admin managers.
 * Attempts Cloudinary upload via backend; if backend connection is refused / unavailable,
 * gracefully falls back to local data URL so admin flows never crash.
 */
export async function fileToDataUrl(file: File, folder = "horemow_media"): Promise<string> {
  try {
    return await uploadImageToCloudinary(file, folder);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // If backend server is not running or network failed, fallback gracefully to base64
    if (
      errorMsg.includes("Cannot connect to backend") ||
      errorMsg.includes("Failed to fetch") ||
      errorMsg.includes("NetworkError") ||
      errorMsg.includes("ERR_CONNECTION_REFUSED") ||
      errorMsg.includes("Frontend is not linked to backend")
    ) {
      console.warn("Backend unavailable; using local image data URL fallback:", errorMsg);
      return await readFileAsBase64(file);
    }
    throw err;
  }
}

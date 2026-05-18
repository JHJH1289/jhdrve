const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(url) {
  const response = await fetch(`${API_BASE_URL}${url}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json();
}

function normalizeImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function normalizePhoto(photo) {
  return photo
    ? {
        ...photo,
        imageUrl: normalizeImageUrl(photo.imageUrl),
        thumbnailUrl: normalizeImageUrl(photo.thumbnailUrl),
      }
    : null;
}

export async function fetchSharedFolder(token) {
  const result = await request(`/api/share/${encodeURIComponent(token)}`);
  return {
    folderPath: result.folderPath || "",
    photos: Array.isArray(result.photos) ? result.photos.map(normalizePhoto) : [],
  };
}

export function getSharedFolderDownloadUrl(token) {
  return `${API_BASE_URL}/api/share/${encodeURIComponent(token)}/download`;
}

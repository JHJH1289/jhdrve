const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DEFAULT_FOLDER = "\uAE30\uBCF8";

function getToken() {
  return localStorage.getItem("token") || "";
}

function normalizeImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

async function request(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
    throw new Error("\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function fetchPhotos(folderPath = DEFAULT_FOLDER) {
  const params = new URLSearchParams();
  if (folderPath) {
    params.set("folderPath", folderPath);
  }

  const result = await request(`/api/photos?${params.toString()}`, {
    method: "GET",
  });

  return Array.isArray(result)
    ? result.map((photo) => ({
        ...photo,
        imageUrl: normalizeImageUrl(photo.imageUrl),
      }))
    : [];
}

export async function fetchAdminPhotos() {
  const result = await request("/api/admin/photos", {
    method: "GET",
  });

  return Array.isArray(result)
    ? result.map((photo) => ({
        ...photo,
        imageUrl: normalizeImageUrl(photo.imageUrl),
      }))
    : [];
}

export async function fetchFolders() {
  const result = await request("/api/photos/folders", {
    method: "GET",
  });

  return normalizeFolders(result);
}

export async function createFolder(folderPath) {
  return request("/api/photos/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folderPath }),
  });
}

export async function deleteFolder(folderPath) {
  return request("/api/photos/folders", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folderPath }),
  });
}

export async function updateFolderOrder(folderPaths) {
  const result = await request("/api/photos/folders/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folderPaths }),
  });

  return normalizeFolders(result);
}

export async function uploadPhotos(folderPath, files) {
  const formData = new FormData();

  files.forEach((file) => formData.append("files", file));

  if (folderPath) {
    formData.append("folderPath", folderPath);
  }

  const result = await request("/api/photos/upload", {
    method: "POST",
    body: formData,
  });

  if (result?.items) {
    result.items = result.items.map((item) => ({
      ...item,
      imageUrl: normalizeImageUrl(item.imageUrl),
    }));
  }

  return result;
}

export async function deletePhoto(id) {
  return request(`/api/photos/${id}`, {
    method: "DELETE",
  });
}

export async function deleteAdminPhoto(id) {
  return request(`/api/admin/photos/${id}`, {
    method: "DELETE",
  });
}

function normalizeFolders(result) {
  return Array.isArray(result)
    ? result.map((folder, index) => {
        if (typeof folder === "string") {
          return { folderPath: folder, updatedAt: null, sortOrder: index, photoCount: 0 };
        }

        return {
          folderPath: folder.folderPath || DEFAULT_FOLDER,
          updatedAt: folder.updatedAt || null,
          sortOrder: folder.sortOrder ?? index,
          photoCount: folder.photoCount ?? 0,
        };
      })
    : [];
}

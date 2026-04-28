const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
    throw new Error("로그인이 필요합니다.");
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

export async function fetchPhotos(folderPath = "기본") {
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

export async function fetchFolders() {
  return request("/api/photos/folders", {
    method: "GET",
  });
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
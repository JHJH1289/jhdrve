const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function uploadPhotos(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "업로드 실패");
  }

  return result;
}

export async function fetchPhotos() {
  const response = await fetch(`${API_BASE_URL}/api/photos`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "목록 조회 실패");
  }

  return result;
}

export async function deletePhoto(id) {
  const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "삭제 실패");
  }

  return result;
}
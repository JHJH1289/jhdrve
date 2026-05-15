export function filterFolders(folders, searchText) {
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return folders;

  return folders.filter((folder) => {
    const folderName = (folder.folderPath || "").toLowerCase();
    const tags = Array.isArray(folder.tags) ? folder.tags : [];

    return folderName.includes(keyword)
      || tags.some((tag) => String(tag).toLowerCase().includes(keyword));
  });
}

export function filterPhotos(photos, searchText) {
  const keyword = searchText.trim().toLowerCase();
  if (!keyword) return photos;

  return photos.filter((photo) => {
    const fileName = (photo.originalName || "").toLowerCase();
    const tags = Array.isArray(photo.tags) ? photo.tags : [];

    return fileName.includes(keyword)
      || tags.some((tag) => String(tag).toLowerCase().includes(keyword));
  });
}

export function sortPhotosByDate(photos, sortOrder) {
  return [...photos].sort((first, second) => {
    const firstTime = getPhotoTime(first);
    const secondTime = getPhotoTime(second);
    const direction = sortOrder === "oldest" ? 1 : -1;

    if (firstTime !== secondTime) {
      return (firstTime - secondTime) * direction;
    }

    return ((first.id || 0) - (second.id || 0)) * direction;
  });
}

export function sortFolders(folders, sortOrder) {
  return [...folders].sort((first, second) => {
    if (sortOrder === "size-desc" || sortOrder === "size-asc") {
      const firstSize = Number(first.totalSize || 0);
      const secondSize = Number(second.totalSize || 0);
      const direction = sortOrder === "size-asc" ? 1 : -1;

      if (firstSize !== secondSize) {
        return (firstSize - secondSize) * direction;
      }
    } else {
      const firstTime = getFolderPhotoTime(first);
      const secondTime = getFolderPhotoTime(second);
      const direction = sortOrder === "oldest" ? 1 : -1;

      if (firstTime !== secondTime) {
        return (firstTime - secondTime) * direction;
      }
    }

    return String(first.folderPath || "").localeCompare(String(second.folderPath || ""), "ko-KR");
  });
}

export function groupPhotosByDate(photos, emptyLabel) {
  const groups = new Map();

  photos.forEach((photo, index) => {
    const dateValue = photo.takenAt || photo.createdAt;
    const key = getDateKey(dateValue);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatDateLabel(dateValue, emptyLabel),
        items: [],
      });
    }

    groups.get(key).items.push({ photo, index });
  });

  return Array.from(groups.values());
}

export function getPhotoTime(photo) {
  const value = photo?.takenAt || photo?.createdAt;
  if (!value) return 0;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getFolderPhotoTime(folder) {
  const value = folder?.latestPhotoAt || folder?.updatedAt;
  if (!value) return 0;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function formatShortDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDateKey(value) {
  if (!value) return "no-date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || "no-date";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDateLabel(value, emptyLabel) {
  if (!value) return emptyLabel;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10) || emptyLabel;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

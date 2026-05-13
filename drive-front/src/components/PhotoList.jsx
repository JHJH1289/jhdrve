import { useState } from "react";
import PhotoCard from "./PhotoCard";

const TEXT = {
  deleteSelected: "\uC120\uD0DD \uC0AD\uC81C",
  empty: "\uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  noDate: "\uB0A0\uC9DC \uC5C6\uC74C",
  selectAll: "\uC804\uCCB4 \uC120\uD0DD",
};

export default function PhotoList({ photos, onOpen, onDeleteSelected }) {
  const [selectedIds, setSelectedIds] = useState([]);

  if (!photos || photos.length === 0) {
    return <p>{TEXT.empty}</p>;
  }

  const photoIdSet = new Set(photos.map((photo) => photo.id));
  const visibleSelectedIds = selectedIds.filter((id) => photoIdSet.has(id));
  const selectedIdSet = new Set(visibleSelectedIds);
  const groups = groupPhotosByDate(photos);
  const allSelected = visibleSelectedIds.length === photos.length;

  function togglePhoto(id) {
    setSelectedIds((current) => (
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    ));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : photos.map((photo) => photo.id));
  }

  async function handleDeleteSelected() {
    if (visibleSelectedIds.length === 0) return;
    await onDeleteSelected(visibleSelectedIds);
    setSelectedIds([]);
  }

  return (
    <div className="photo-date-list">
      {visibleSelectedIds.length > 0 && (
        <div className="photo-select-toolbar">
          <label className="photo-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span>{TEXT.selectAll}</span>
          </label>
          <button
            type="button"
            className="photo-bulk-delete"
            onClick={handleDeleteSelected}
          >
            {TEXT.deleteSelected}
          </button>
        </div>
      )}

      {groups.map((group) => (
        <section className="photo-date-group" key={group.key}>
          <div className="photo-date-header">
            <h3>{group.label}</h3>
          </div>

          <div className="photo-list">
            {group.items.map(({ photo, index }) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                selected={selectedIdSet.has(photo.id)}
                onSelect={() => togglePhoto(photo.id)}
                onOpen={() => onOpen(index)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupPhotosByDate(photos) {
  const groups = new Map();

  photos.forEach((photo, index) => {
    const dateValue = photo.takenAt || photo.createdAt;
    const key = getDateKey(dateValue);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatDateLabel(dateValue),
        items: [],
      });
    }

    groups.get(key).items.push({ photo, index });
  });

  return Array.from(groups.values());
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

function formatDateLabel(value) {
  if (!value) return TEXT.noDate;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10) || TEXT.noDate;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

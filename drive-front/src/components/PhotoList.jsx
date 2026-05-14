import { useState } from "react";
import PhotoCard from "./PhotoCard";
import TagEditModal from "./TagEditModal";
import { groupPhotosByDate } from "../utils/photoCollection";

const TEXT = {
  addTags: "\uD0DC\uADF8 \uCD94\uAC00",
  deleteSelected: "\uC120\uD0DD \uC0AD\uC81C",
  deleteTags: "\uD0DC\uADF8 \uC0AD\uC81C",
  empty: "\uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  noDate: "\uB0A0\uC9DC \uC5C6\uC74C",
  selectAll: "\uC804\uCCB4 \uC120\uD0DD",
};

export default function PhotoList({ photos, onOpen, onDeleteSelected, onAddTagsSelected, onDeleteTagsSelected }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [tagTarget, setTagTarget] = useState(null);

  if (!photos || photos.length === 0) {
    return <p>{TEXT.empty}</p>;
  }

  const photoIdSet = new Set(photos.map((photo) => photo.id));
  const visibleSelectedIds = selectedIds.filter((id) => photoIdSet.has(id));
  const selectedIdSet = new Set(visibleSelectedIds);
  const selectedPhotos = photos.filter((photo) => selectedIdSet.has(photo.id));
  const tagTargetPhotos = tagTarget?.photos || [];
  const groups = groupPhotosByDate(photos, TEXT.noDate);
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

  async function handleSubmitTags(tags) {
    const targetPhotos = tagTarget?.photos || [];
    const targetIds = targetPhotos.map((photo) => photo.id);
    if (targetIds.length === 0) return;

    if (tagTarget?.mode === "delete") {
      await onDeleteTagsSelected(targetIds, tags);
    } else {
      await onAddTagsSelected(targetIds, tags);
    }

    setSelectedIds([]);
  }

  function openSelectionTagModal(mode) {
    setTagTarget({ mode, photos: selectedPhotos });
  }

  function openGroupTagModal(mode, groupPhotos) {
    setTagTarget({ mode, photos: groupPhotos });
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
            className="photo-bulk-tag"
            onClick={() => openSelectionTagModal("add")}
          >
            {TEXT.addTags}
          </button>
          <button
            type="button"
            className="photo-bulk-tag danger"
            onClick={() => openSelectionTagModal("delete")}
          >
            {TEXT.deleteTags}
          </button>
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
            <div className="photo-date-actions">
              <button
                type="button"
                className="photo-date-tag-btn"
                onClick={() => openGroupTagModal("add", group.items.map((item) => item.photo))}
              >
                {TEXT.addTags}
              </button>
              <button
                type="button"
                className="photo-date-tag-btn danger"
                onClick={() => openGroupTagModal("delete", group.items.map((item) => item.photo))}
              >
                {TEXT.deleteTags}
              </button>
            </div>
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

      <TagEditModal
        open={Boolean(tagTarget)}
        mode={tagTarget?.mode || ""}
        photos={tagTargetPhotos}
        onClose={() => setTagTarget(null)}
        onSubmit={handleSubmitTags}
      />
    </div>
  );
}

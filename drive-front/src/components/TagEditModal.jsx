import { useEffect, useMemo, useState } from "react";

const TEXT = {
  addTitle: "\uD0DC\uADF8 \uCD94\uAC00",
  cancel: "\uCDE8\uC18C",
  close: "\uB2EB\uAE30",
  deleteTitle: "\uD0DC\uADF8 \uC0AD\uC81C",
  helper: "\uC5EC\uB7EC \uAC1C\uB294 \uC27C\uD45C\uB098 \uACF5\uBC31\uC73C\uB85C \uAD6C\uBD84\uD569\uB2C8\uB2E4.",
  inputPlaceholder: "\uC608: \uC5EC\uD589 \uC81C\uC8FC \uD544\uB984",
  selectedCount: "\uC120\uD0DD\uB41C \uC0AC\uC9C4",
  submitAdd: "\uCD94\uAC00",
  submitDelete: "\uC0AD\uC81C",
};

export default function TagEditModal({ open, mode, photos, onClose, onSubmit }) {
  const [tagText, setTagText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const availableTags = useMemo(() => {
    const tags = new Set();
    photos.forEach((photo) => {
      if (!Array.isArray(photo.tags)) return;
      photo.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [photos]);

  useEffect(() => {
    if (open) {
      setTagText("");
      setSelectedTags([]);
    }
  }, [open, mode]);

  if (!open) return null;

  const isDeleteMode = mode === "delete";
  const title = isDeleteMode ? TEXT.deleteTitle : TEXT.addTitle;
  const submitText = isDeleteMode ? TEXT.submitDelete : TEXT.submitAdd;

  async function handleSubmit(event) {
    event.preventDefault();
    const submitValue = isDeleteMode ? selectedTags.join(" ") : tagText;
    if (!submitValue.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(submitValue);
      setTagText("");
      setSelectedTags([]);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  function toggleTag(tag) {
    setSelectedTags((current) => (
      current.includes(tag)
        ? current.filter((selectedTag) => selectedTag !== tag)
        : [...current, tag]
    ));
  }

  return (
    <div className="photo-modal-backdrop tag-modal-backdrop" onClick={onClose}>
      <form className="tag-modal-content" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h2>{title}</h2>
            <p className="summary">{TEXT.selectedCount}: {photos.length}</p>
          </div>
          <button type="button" className="photo-modal-close" onClick={onClose}>
            {TEXT.close}
          </button>
        </div>

        {!isDeleteMode && (
          <>
            <label className="tag-input-area">
              <span>{title}</span>
              <input
                type="text"
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                placeholder={TEXT.inputPlaceholder}
                autoFocus
              />
            </label>
            <p className="summary">{TEXT.helper}</p>
          </>
        )}

        {isDeleteMode && availableTags.length > 0 && (
          <div className="tag-chip-list">
            {availableTags.map((tag) => (
              <button
                type="button"
                className={selectedTags.includes(tag) ? "selected" : ""}
                key={tag}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="viewer-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            {TEXT.cancel}
          </button>
          <button
            type="submit"
            className={isDeleteMode ? "delete-btn" : ""}
            disabled={(isDeleteMode ? selectedTags.length === 0 : !tagText.trim()) || submitting}
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}

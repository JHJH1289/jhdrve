import { useState } from "react";
import PhotoPreview from "./PhotoPreview";

const TEXT = {
  cancel: "\uCDE8\uC18C",
  close: "\uB2EB\uAE30",
  folderLabel: "\uC5C5\uB85C\uB4DC \uD3F4\uB354",
  folderPlaceholder: "\uC608: \uC5EC\uD589/\uC81C\uC8FC\uB3C4",
  folderRequired: "\uD3F4\uB354\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
  tagHelper: "공백이나 쉼표로 여러 태그를 구분합니다.",
  tagLabel: "태그",
  tagPlaceholder: "예: 여행 맛집 가족",
  title: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
  upload: "\uC5C5\uB85C\uB4DC",
};

const SUGGESTED_TAGS = ["여행", "맛집", "꽃", "가족", "친구", "공연"];

export default function UploadModal({ open, onClose, onUpload, defaultFolder = "", uploading = false }) {
  const initialFolderPath = open ? defaultFolder : "";
  const [folderPath, setFolderPath] = useState(initialFolderPath);
  const [tagText, setTagText] = useState("");
  const [files, setFiles] = useState([]);

  if (!open) return null;

  function resetForm() {
    setFolderPath(initialFolderPath);
    setTagText("");
    setFiles([]);
  }

  function handleClose() {
    if (uploading) return;
    resetForm();
    onClose();
  }

  function handleChange(e) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }

  async function handleSubmit() {
    if (uploading) return;

    const trimmedFolderPath = folderPath.trim();
    if (!trimmedFolderPath) {
      window.alert(TEXT.folderRequired);
      return;
    }

    await onUpload(trimmedFolderPath, files, tagText);
    resetForm();
  }

  function addSuggestedTag(tag) {
    setTagText((current) => {
      const tags = parseTags(current);
      if (tags.includes(tag)) return current;
      return [...tags, tag].join(" ");
    });
  }

  return (
    <div className="photo-modal-backdrop" onClick={handleClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h2>{TEXT.title}</h2>
          <button type="button" className="photo-modal-close" onClick={handleClose} disabled={uploading}>
            {TEXT.close}
          </button>
        </div>

        <div className="row">
          <label>{TEXT.folderLabel}</label>
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder={TEXT.folderPlaceholder}
            disabled={uploading}
          />
        </div>

        <div className="row">
          <input type="file" multiple accept="image/*" onChange={handleChange} disabled={uploading} />
        </div>

        <div className="row">
          <label>{TEXT.tagLabel}</label>
          <input
            type="text"
            value={tagText}
            onChange={(event) => setTagText(event.target.value)}
            placeholder={TEXT.tagPlaceholder}
            disabled={uploading}
          />
          <div className="upload-tag-suggestions">
            {SUGGESTED_TAGS.map((tag) => (
              <button type="button" key={tag} onClick={() => addSuggestedTag(tag)} disabled={uploading}>
                #{tag}
              </button>
            ))}
          </div>
          <p className="summary upload-tag-helper">{TEXT.tagHelper}</p>
        </div>

        <div className="viewer-actions">
          <button type="button" onClick={handleSubmit} disabled={uploading}>
            {TEXT.upload}
          </button>
          <button type="button" className="secondary-btn" onClick={handleClose} disabled={uploading}>
            {TEXT.cancel}
          </button>
        </div>

        <PhotoPreview files={files} />
      </div>
    </div>
  );
}

function parseTags(value) {
  return value
    .split(/[,#\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

import { useState } from "react";
import PhotoPreview from "./PhotoPreview";

const TEXT = {
  cancel: "\uCDE8\uC18C",
  close: "\uB2EB\uAE30",
  folderLabel: "\uC5C5\uB85C\uB4DC \uD3F4\uB354",
  folderPlaceholder: "\uC608: \uC5EC\uD589/\uC81C\uC8FC\uB3C4",
  folderRequired: "\uD3F4\uB354\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
  title: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
  upload: "\uC5C5\uB85C\uB4DC",
};

export default function UploadModal({ open, onClose, onUpload, defaultFolder = "" }) {
  const initialFolderPath = open ? defaultFolder : "";
  const [folderPath, setFolderPath] = useState(initialFolderPath);
  const [files, setFiles] = useState([]);

  if (!open) return null;

  function resetForm() {
    setFolderPath(initialFolderPath);
    setFiles([]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleChange(e) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }

  async function handleSubmit() {
    const trimmedFolderPath = folderPath.trim();
    if (!trimmedFolderPath) {
      window.alert(TEXT.folderRequired);
      return;
    }

    await onUpload(trimmedFolderPath, files);
    resetForm();
  }

  return (
    <div className="photo-modal-backdrop" onClick={handleClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h2>{TEXT.title}</h2>
          <button type="button" className="photo-modal-close" onClick={handleClose}>
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
          />
        </div>

        <div className="row">
          <input type="file" multiple accept="image/*" onChange={handleChange} />
        </div>

        <div className="viewer-actions">
          <button type="button" onClick={handleSubmit}>
            {TEXT.upload}
          </button>
          <button type="button" className="secondary-btn" onClick={handleClose}>
            {TEXT.cancel}
          </button>
        </div>

        <PhotoPreview files={files} />
      </div>
    </div>
  );
}

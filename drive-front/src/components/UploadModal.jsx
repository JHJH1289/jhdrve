import { useEffect, useState } from "react";
import PhotoPreview from "./PhotoPreview";

export default function UploadModal({ open, onClose, onUpload, defaultFolder = "기본" }) {
  const [folderPath, setFolderPath] = useState(defaultFolder);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (open) {
      setFolderPath(defaultFolder || "기본");
      setFiles([]);
    }
  }, [open, defaultFolder]);

  if (!open) return null;

  function handleChange(e) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }

  async function handleSubmit() {
    await onUpload(folderPath, files);
  }

  return (
    <div className="photo-modal-backdrop" onClick={onClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h2>사진 업로드</h2>
          <button type="button" className="photo-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="row">
          <label>업로드 폴더</label>
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="예: 여행/오사카"
          />
        </div>

        <div className="row">
          <input type="file" multiple accept="image/*" onChange={handleChange} />
        </div>

        <div className="viewer-actions">
          <button type="button" onClick={handleSubmit}>
            업로드
          </button>
          <button type="button" className="secondary-btn" onClick={onClose}>
            취소
          </button>
        </div>

        <PhotoPreview files={files} />
      </div>
    </div>
  );
}
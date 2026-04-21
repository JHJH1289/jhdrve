import { useState } from "react";

export default function PhotoUploadForm({ onUpload, onPreviewChange }) {
  const [files, setFiles] = useState([]);

  function handleChange(e) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    onPreviewChange?.(selectedFiles);
  }

  async function handleSubmit() {
    await onUpload(files);
    setFiles([]);
    onPreviewChange?.([]);
  }

  return (
    <div>
      <div className="row">
        <input type="file" multiple accept="image/*" onChange={handleChange} />
      </div>
      <button type="button" onClick={handleSubmit}>
        여러 장 업로드
      </button>
    </div>
  );
}
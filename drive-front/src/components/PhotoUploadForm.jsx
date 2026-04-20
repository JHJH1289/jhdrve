import { useState } from "react";

function PhotoUploadForm({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (!files.length) {
      alert("파일을 먼저 선택하세요.");
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(files);
      setFiles([]);

      const input = document.getElementById("photo-file-input");
      if (input) {
        input.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="row">
        <input
          id="photo-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSubmit} disabled={isUploading}>
        {isUploading ? "업로드 중..." : "여러 장 업로드"}
      </button>
    </div>
  );
}

export default PhotoUploadForm;
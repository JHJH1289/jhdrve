import { useEffect, useState } from "react";

export default function PhotoPreview({ files }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = (files || []).map((file) => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  if (!files || files.length === 0) return null;

  return (
    <div className="preview-section">
      <h2>업로드 미리보기</h2>
      <div className="photo-list">
        {previewUrls.map((file, index) => (
          <div className="card" key={`${file.name}-${index}`}>
            <img src={file.url} alt={file.name} />
            <div className="card-body">
              <div className="name">{file.name}</div>
              <div className="meta">{Math.round(file.size / 1024)} KB</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
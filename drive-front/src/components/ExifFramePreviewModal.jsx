import { useEffect, useState } from "react";
import { generateExifFrameBlob } from "../utils/exifFrame";

export default function ExifFramePreviewModal({ open, photo, onClose }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewBlob, setPreviewBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !photo) return;

    let cancelled = false;
    let currentUrl = "";

    async function run() {
      try {
        setLoading(true);
        setError("");
        setPreviewBlob(null);

        const blob = await generateExifFrameBlob(photo);
        if (cancelled) return;

        currentUrl = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(currentUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "EXIF 프레임 미리보기를 생성하지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      setPreviewUrl("");
      setPreviewBlob(null);
    };
  }, [open, photo]);

  if (!open || !photo) return null;

  function handleDownload() {
    if (!previewBlob || !previewUrl) return;

    const fileName = buildDownloadFileName(photo.originalName);
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="photo-modal-backdrop preview-modal-backdrop" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h2>EXIF 프레임 미리보기</h2>
          <button type="button" className="photo-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>

        <p className="summary">
          생성된 프레임 이미지를 확인한 뒤 다운로드할 수 있습니다.
        </p>

        <div className="preview-body">
          {loading && <div className="preview-loading">프레임 미리보기를 생성하는 중...</div>}

          {!loading && error && <div className="preview-error">{error}</div>}

          {!loading && !error && previewUrl && (
            <img
              className="exif-preview-image"
              src={previewUrl}
              alt={`${photo.originalName} EXIF frame preview`}
            />
          )}
        </div>

        <div className="viewer-actions">
          <button type="button" onClick={handleDownload} disabled={!previewBlob || loading}>
            다운로드
          </button>
          <button type="button" className="secondary-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function buildDownloadFileName(originalName) {
  if (!originalName) return "photo-exif-frame.jpg";

  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return `${originalName}-exif-frame.jpg`;
  }

  const name = originalName.slice(0, lastDotIndex);
  return `${name}-exif-frame.jpg`;
}
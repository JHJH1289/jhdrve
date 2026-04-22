import { useEffect } from "react";

export default function ImageViewerModal({
  open,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDelete,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onPrev, onNext]);

  if (!open || currentIndex === null || !photos[currentIndex]) return null;

  const photo = photos[currentIndex];

  return (
    <div className="photo-modal-backdrop" onClick={onClose}>
      <div className="viewer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="photo-modal-close" type="button" onClick={onClose}>
          닫기
        </button>

        <div className="viewer-layout">
          <button type="button" className="viewer-nav left" onClick={onPrev}>
            ‹
          </button>

          <div className="viewer-image-wrap">
            <img className="photo-modal-image" src={photo.imageUrl} alt={photo.originalName} />
          </div>

          <button type="button" className="viewer-nav right" onClick={onNext}>
            ›
          </button>
        </div>

        <div className="photo-modal-info">
          <div><strong>파일명:</strong> {photo.originalName}</div>
          <div><strong>폴더:</strong> {photo.folderPath}</div>
          <div><strong>용량:</strong> {photo.fileSize} bytes</div>
          <div><strong>촬영일:</strong> {photo.takenAt || "-"}</div>
          <div><strong>업로드일:</strong> {photo.createdAt || "-"}</div>
          <div><strong>카메라:</strong> {photo.cameraModel || "-"}</div>
          <div><strong>ISO:</strong> {photo.iso || "-"}</div>
          <div><strong>해상도:</strong> {photo.width || "-"} x {photo.height || "-"}</div>
        </div>

        <button className="delete-btn" type="button" onClick={() => onDelete(photo.id)}>
          삭제
        </button>
      </div>
    </div>
  );
}
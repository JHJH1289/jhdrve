import { useEffect, useState } from "react";
import AuthImage from "./AuthImage";
import ExifFramePreviewModal from "./ExifFramePreviewModal";

export default function ImageViewerModal({
  open,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDelete,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreviewOpen(false);
      return;
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (previewOpen) {
          setPreviewOpen(false);
        } else {
          onClose();
        }
      }
      if (e.key === "ArrowLeft" && !previewOpen) onPrev();
      if (e.key === "ArrowRight" && !previewOpen) onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onPrev, onNext, previewOpen]);

  if (!open || currentIndex === null || !photos[currentIndex]) return null;

  const photo = photos[currentIndex];
  const displayFNumber = photo.fNumber || photo.fnumber || "-";

  return (
    <>
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
              <AuthImage
                className="photo-modal-image"
                src={photo.imageUrl}
                alt={photo.originalName}
              />
            </div>

            <button type="button" className="viewer-nav right" onClick={onNext}>
              ›
            </button>
          </div>

          <div className="photo-modal-info">
            <div><strong>파일명:</strong> {photo.originalName}</div>
            <div><strong>폴더:</strong> {photo.folderPath}</div>
            <div><strong>카메라 제조업체:</strong> {photo.cameraMake || "-"}</div>
            <div><strong>카메라 모델:</strong> {photo.cameraModel || "-"}</div>
            <div><strong>초점거리:</strong> {photo.focalLength || "-"}</div>
            <div><strong>F-스톱:</strong> {displayFNumber}</div>
            <div><strong>노출시간:</strong> {photo.exposureTime || "-"}</div>
            <div><strong>ISO 감도:</strong> {photo.iso || "-"}</div>
            <div><strong>렌즈 모델:</strong> {photo.lensModel || "-"}</div>
            <div><strong>촬영일:</strong> {photo.takenAt || "-"}</div>
            <div><strong>업로드일:</strong> {photo.createdAt || "-"}</div>
            <div><strong>해상도:</strong> {photo.width || "-"} x {photo.height || "-"}</div>
          </div>

          <div className="viewer-actions">
            <button type="button" onClick={() => setPreviewOpen(true)}>
              EXIF 프레임 미리보기
            </button>

            <button className="delete-btn viewer-delete-btn" type="button" onClick={() => onDelete(photo.id)}>
              삭제
            </button>
          </div>
        </div>
      </div>

      <ExifFramePreviewModal
        open={previewOpen}
        photo={photo}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
import { useCallback, useEffect, useState } from "react";
import { canGenerateExifFrame, generateExifFrameBlob, shouldAutoRenderExifFrame } from "../utils/exifFrame";
import AuthImage from "./AuthImage";

const TEXT = {
  cameraMake: "\uCE74\uBA54\uB77C \uC81C\uC870\uC0AC",
  cameraModel: "\uCE74\uBA54\uB77C \uBAA8\uB378",
  close: "\uB2EB\uAE30",
  createdAt: "\uC5C5\uB85C\uB4DC\uC77C",
  delete: "\uC0AD\uC81C",
  download: "\uB2E4\uC6B4\uB85C\uB4DC",
  exposureTime: "\uB178\uCD9C\uC2DC\uAC04",
  fileName: "\uD30C\uC77C\uBA85",
  folder: "\uD3F4\uB354",
  focalLength: "\uCD08\uC810\uAC70\uB9AC",
  frameApply: "EXIF \uD504\uB808\uC784 \uC801\uC6A9",
  frameBuilding: "EXIF \uD504\uB808\uC784 \uC0DD\uC131 \uC911...",
  frameFailed: "EXIF \uD504\uB808\uC784\uC744 \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  iso: "ISO \uAC10\uB3C4",
  lensModel: "\uB80C\uC988 \uBAA8\uB378",
  nextPhoto: "\uB2E4\uC74C \uC0AC\uC9C4",
  originalDownloadFailed: "\uC6D0\uBCF8 \uC774\uBBF8\uC9C0\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
  originalView: "\uC6D0\uBCF8 \uBCF4\uAE30",
  previousPhoto: "\uC774\uC804 \uC0AC\uC9C4",
  resolution: "\uD574\uC0C1\uB3C4",
  takenAt: "\uCD2C\uC601\uC77C",
};

export default function ImageViewerModal({
  open,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDelete,
}) {
  const [frameMode, setFrameMode] = useState(true);
  const [frameUrl, setFrameUrl] = useState("");
  const [frameBlob, setFrameBlob] = useState(null);
  const [frameLoading, setFrameLoading] = useState(false);
  const [frameError, setFrameError] = useState("");

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(e) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, open, onPrev, onNext]);

  const photo = open && currentIndex !== null ? photos[currentIndex] : null;

  useEffect(() => {
    setFrameMode(shouldAutoRenderExifFrame(photo));
    setFrameUrl("");
    setFrameBlob(null);
    setFrameError("");
  }, [photo]);

  useEffect(() => {
    if (!open || !photo || frameBlob || !canGenerateExifFrame(photo)) return undefined;

    let cancelled = false;

    async function buildFrame() {
      try {
        setFrameLoading(true);
        setFrameError("");
        setFrameBlob(null);

        const blob = await generateExifFrameBlob(photo);
        if (cancelled) return;

        setFrameBlob(blob);
      } catch (error) {
        if (!cancelled) {
          setFrameMode(false);
          setFrameError(error.message || TEXT.frameFailed);
        }
      } finally {
        if (!cancelled) {
          setFrameLoading(false);
        }
      }
    }

    buildFrame();

    return () => {
      cancelled = true;
    };
  }, [frameBlob, open, photo]);

  useEffect(() => {
    if (!frameBlob) {
      setFrameUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(frameBlob);
    setFrameUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [frameBlob]);

  if (!photo) return null;

  const displayFNumber = photo.fNumber || photo.fnumber || "-";
  const tags = Array.isArray(photo.tags) ? photo.tags : [];
  const showFrame = frameMode && frameUrl && !frameError;
  const frameAvailable = canGenerateExifFrame(photo);

  async function handleDownload() {
    if (showFrame) {
      downloadBlob(frameBlob, buildFrameFileName(photo.originalName));
      return;
    }

    const blob = await fetchProtectedBlob(photo.imageUrl);
    downloadBlob(blob, photo.originalName || "photo");
  }

  return (
    <div className="photo-modal-backdrop" onClick={handleClose}>
      <div className="viewer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="photo-modal-close" type="button" onClick={handleClose}>
          {TEXT.close}
        </button>

        <div className="viewer-layout">
          <button type="button" className="viewer-nav left" onClick={onPrev} aria-label={TEXT.previousPhoto}>
            {"\u2039"}
          </button>

          <div className="viewer-image-wrap">
            {!showFrame && (
              <AuthImage
                className="photo-modal-image"
                src={photo.imageUrl}
                alt={photo.originalName}
              />
            )}

            {showFrame && (
              <img
                className="photo-modal-image exif-viewer-image"
                src={frameUrl}
                alt={`${photo.originalName} EXIF frame`}
              />
            )}
          </div>

          <button type="button" className="viewer-nav right" onClick={onNext} aria-label={TEXT.nextPhoto}>
            {"\u203A"}
          </button>
        </div>

        {frameLoading && <div className="viewer-inline-status">{TEXT.frameBuilding}</div>}
        {frameError && <div className="viewer-inline-error">{frameError}</div>}

        <div className="photo-modal-info">
          <div><strong>{TEXT.fileName}:</strong> {photo.originalName}</div>
          <div><strong>{TEXT.folder}:</strong> {photo.folderPath}</div>
          <div><strong>{TEXT.cameraMake}:</strong> {photo.cameraMake || "-"}</div>
          <div><strong>{TEXT.cameraModel}:</strong> {photo.cameraModel || "-"}</div>
          <div><strong>{TEXT.focalLength}:</strong> {photo.focalLength || "-"}</div>
          <div><strong>F-stop:</strong> {displayFNumber}</div>
          <div><strong>{TEXT.exposureTime}:</strong> {photo.exposureTime || "-"}</div>
          <div><strong>{TEXT.iso}:</strong> {photo.iso || "-"}</div>
          <div><strong>{TEXT.lensModel}:</strong> {photo.lensModel || "-"}</div>
          <div><strong>{TEXT.takenAt}:</strong> {photo.takenAt || "-"}</div>
          <div><strong>{TEXT.createdAt}:</strong> {photo.createdAt || "-"}</div>
          <div><strong>{TEXT.resolution}:</strong> {photo.width || "-"} x {photo.height || "-"}</div>
          <div><strong>태그:</strong> {tags.length ? tags.map((tag) => `#${tag}`).join(" ") : "-"}</div>
        </div>

        <div className="viewer-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setFrameMode((value) => !value)}
            disabled={!frameAvailable || frameLoading}
          >
            {showFrame ? TEXT.originalView : TEXT.frameApply}
          </button>
          <button type="button" onClick={handleDownload} disabled={frameLoading && !frameBlob}>
            {TEXT.download}
          </button>
          <button className="delete-btn viewer-delete-btn" type="button" onClick={() => onDelete(photo.id)}>
            {TEXT.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

async function fetchProtectedBlob(url) {
  const token = localStorage.getItem("token") || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(TEXT.originalDownloadFailed);
  }

  return response.blob();
}

function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function buildFrameFileName(originalName) {
  if (!originalName) return "photo-exif-frame.jpg";

  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return `${originalName}-exif-frame.jpg`;
  }

  return `${originalName.slice(0, lastDotIndex)}-exif-frame.jpg`;
}

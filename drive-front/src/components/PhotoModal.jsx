function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) {
    return "-";
  }

  const mb = bytes / (1024 * 1024);

  if (mb < 1) {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  }

  return `${mb.toFixed(2)} MB`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ");
}

function PhotoModal({ photo, onClose }) {
  if (!photo) {
    return null;
  }

  return (
    <div className="photo-modal-backdrop" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="photo-modal-close" onClick={onClose}>
          닫기
        </button>

        <img
          className="photo-modal-image"
          src={`${import.meta.env.VITE_API_BASE_URL}${photo.imageUrl}`}
          alt={photo.originalName}
        />

        <div className="photo-modal-info">
          <div><strong>파일명:</strong> {photo.originalName}</div>
          <div><strong>ID:</strong> {photo.id}</div>
          <div><strong>크기:</strong> {formatFileSize(photo.fileSize)}</div>
          <div><strong>업로드:</strong> {formatDateTime(photo.createdAt)}</div>
          <hr />
          <div><strong>촬영일시:</strong> {formatDateTime(photo.takenAt)}</div>
          <div><strong>카메라 모델:</strong> {photo.cameraModel || "-"}</div>
          <div><strong>해상도:</strong> {photo.width && photo.height ? `${photo.width} x ${photo.height}` : "-"}</div>
          <div><strong>ISO:</strong> {photo.iso ?? "-"}</div>
        </div>
      </div>
    </div>
  );
}

export default PhotoModal;
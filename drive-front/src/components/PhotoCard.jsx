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

function PhotoCard({ photo, onDelete, onOpen }) {
  if (!photo) {
    return null;
  }

  const imageSrc = `${import.meta.env.VITE_API_BASE_URL}${photo.imageUrl ?? ""}`;

  return (
    <div className="card">
      <img
        src={imageSrc}
        alt={photo.originalName ?? "photo"}
        onClick={() => onOpen?.(photo)}
        className="card-image"
      />
      <div className="card-body">
        <div className="name">{photo.originalName}</div>
        <div className="meta">
          ID: {photo.id}
          <br />
          크기: {formatFileSize(photo.fileSize)}
          <br />
          업로드: {photo.createdAt}
        </div>

        <button className="delete-btn" onClick={() => onDelete?.(photo.id)}>
          삭제
        </button>
      </div>
    </div>
  );
}

export default PhotoCard;
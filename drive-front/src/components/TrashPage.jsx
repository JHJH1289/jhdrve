import AuthImage from "./AuthImage";

const TEXT = {
  countUnit: "개",
  deletedAt: "삭제일",
  empty: "휴지통이 비어 있습니다.",
  emptyTrash: "휴지통 비우기",
  permanentDelete: "영구 삭제",
  restore: "복원",
  summary: "삭제한 사진은 복원하거나 영구 삭제할 수 있습니다.",
  title: "휴지통",
};

export default function TrashPage({
  photos,
  loading,
  onDelete,
  onEmpty,
  onRestore,
}) {
  return (
    <div className="trash-page">
      <div className="trash-page-header">
        <div>
          <h2>{TEXT.title}</h2>
          <p>
            {photos.length}{TEXT.countUnit} · {TEXT.summary}
          </p>
        </div>
        {photos.length > 0 && (
          <button type="button" className="trash-empty-btn" onClick={onEmpty} disabled={loading}>
            {TEXT.emptyTrash}
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="trash-empty">{TEXT.empty}</p>
      ) : (
        <div className="trash-photo-grid">
          {photos.map((photo) => (
            <article className="trash-photo-card" key={photo.id}>
              <AuthImage
                className="trash-photo-image"
                src={photo.thumbnailUrl || photo.imageUrl}
                alt={photo.originalName}
              />
              <div className="trash-photo-meta">
                <strong>{photo.originalName}</strong>
                <span>{photo.folderPath}</span>
                <span>{TEXT.deletedAt}: {formatDate(photo.deletedAt)}</span>
              </div>
              <div className="trash-photo-actions">
                <button type="button" onClick={() => onRestore(photo.id)} disabled={loading}>
                  {TEXT.restore}
                </button>
                <button
                  type="button"
                  className="trash-danger-btn"
                  onClick={() => onDelete(photo.id)}
                  disabled={loading}
                >
                  {TEXT.permanentDelete}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

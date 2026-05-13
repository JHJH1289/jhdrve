import AuthImage from "./AuthImage";

const TEXT = {
  createdAt: "\uC5C5\uB85C\uB4DC\uC77C",
  delete: "\uC0AD\uC81C",
  takenAt: "\uCD2C\uC601\uC77C",
};

export default function PhotoCard({ photo, onDelete, onOpen }) {
  return (
    <div className="card">
      <button className="card-image-wrap" type="button" onClick={onOpen} aria-label={photo.originalName}>
        <AuthImage
          className="card-image"
          src={photo.imageUrl}
          alt={photo.originalName}
        />
      </button>

      <div className="card-body">
        <div className="name">{photo.originalName}</div>
        <div className="meta">
          <div>{TEXT.takenAt}: {formatDateTime(photo.takenAt)}</div>
          <div>{TEXT.createdAt}: {formatDateTime(photo.createdAt)}</div>
        </div>

        <button className="delete-btn" type="button" onClick={() => onDelete(photo.id)}>
          {TEXT.delete}
        </button>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

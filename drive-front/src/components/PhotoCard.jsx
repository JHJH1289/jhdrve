import AuthImage from "./AuthImage";

export default function PhotoCard({ photo, onDelete, onOpen }) {
  return (
    <div className="card">
      <div className="card-image-wrap" onClick={onOpen}>
        <AuthImage
          className="card-image"
          src={photo.imageUrl}
          alt={photo.originalName}
        />
      </div>

      <div className="card-body">
        <div className="name">{photo.originalName}</div>
        <div className="meta">
          <div>촬영일: {photo.takenAt || "-"}</div>
          <div>업로드일: {photo.createdAt || "-"}</div>
        </div>

        <button className="delete-btn" type="button" onClick={() => onDelete(photo.id)}>
          삭제
        </button>
      </div>
    </div>
  );
}
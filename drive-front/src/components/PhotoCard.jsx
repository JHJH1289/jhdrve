export default function PhotoCard({ photo, onDelete, onOpen }) {
  return (
    <div className="card">
      <img
        className="card-image"
        src={photo.imageUrl}
        alt={photo.originalName}
        onClick={() => onOpen(photo)}
      />
      <div className="card-body">
        <div className="name">{photo.originalName}</div>
        <div className="meta">
          <div>폴더: {photo.folderPath}</div>
          <div>크기: {photo.fileSize} bytes</div>
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
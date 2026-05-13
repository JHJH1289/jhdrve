import AuthImage from "./AuthImage";

const TEXT = {
  close: "닫기",
  delete: "삭제 실행",
  deleteTarget: "삭제 예정",
  keep: "보관",
  title: "중복 사진 확인",
};

export default function DuplicatePhotoModal({ open, groups, deleting, onClose, onDelete }) {
  if (!open) return null;

  return (
    <div className="photo-modal-backdrop duplicate-modal-backdrop">
      <div className="duplicate-modal-content">
        <div className="modal-top">
          <h2>{TEXT.title}</h2>
          <button type="button" className="secondary-btn" onClick={onClose} disabled={deleting}>
            {TEXT.close}
          </button>
        </div>

        <div className="duplicate-group-list">
          {groups.map((group) => (
            <section className="duplicate-group" key={group.keepPhoto.id}>
              <DuplicatePhotoItem photo={group.keepPhoto} label={TEXT.keep} keep />

              <div className="duplicate-target-list">
                {group.duplicatePhotos.map((photo) => (
                  <DuplicatePhotoItem photo={photo} label={TEXT.deleteTarget} key={photo.id} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="duplicate-modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose} disabled={deleting}>
            {TEXT.close}
          </button>
          <button type="button" className="delete-btn viewer-delete-btn" onClick={onDelete} disabled={deleting}>
            {TEXT.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function DuplicatePhotoItem({ photo, label, keep = false }) {
  return (
    <article className={keep ? "duplicate-photo-item keep" : "duplicate-photo-item delete"}>
      <div className="duplicate-photo-label">{label}</div>
      <AuthImage className="duplicate-photo-image" src={photo.imageUrl} alt={photo.originalName} />
      <div className="duplicate-photo-meta">
        <strong>{photo.folderPath}</strong>
        <span>{photo.originalName}</span>
      </div>
    </article>
  );
}

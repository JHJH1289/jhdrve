export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  function handleClose() {
    if (!loading) onClose();
  }

  return (
    <div className="photo-modal-backdrop confirm-modal-backdrop" onClick={handleClose}>
      <div
        className="confirm-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-top">
          <h2 id="confirm-modal-title">{title}</h2>
          <button type="button" className="photo-modal-close" onClick={handleClose} disabled={loading}>
            x
          </button>
        </div>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="secondary-btn" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "confirm-danger-btn" : ""}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

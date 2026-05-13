import { useEffect, useState } from "react";

const TEXT = {
  cancel: "취소",
  close: "닫기",
  helper: "변경할 폴더 이름을 입력하세요.",
  label: "폴더 이름",
  placeholder: "예: 여행/제주도",
  submit: "변경",
  title: "폴더 이름 변경",
};

export default function FolderRenameModal({ open, folderPath, onClose, onSubmit }) {
  const [nextFolderPath, setNextFolderPath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setNextFolderPath(folderPath || "");
  }, [folderPath, open]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedFolderPath = nextFolderPath.trim();
    if (!trimmedFolderPath || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(folderPath, trimmedFolderPath);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="photo-modal-backdrop folder-rename-backdrop" onClick={onClose}>
      <form className="folder-rename-modal-content" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h2>{TEXT.title}</h2>
            <p className="summary">{TEXT.helper}</p>
          </div>
          <button type="button" className="photo-modal-close" onClick={onClose}>
            {TEXT.close}
          </button>
        </div>

        <label className="tag-input-area">
          <span>{TEXT.label}</span>
          <input
            type="text"
            value={nextFolderPath}
            onChange={(event) => setNextFolderPath(event.target.value)}
            placeholder={TEXT.placeholder}
            autoFocus
          />
        </label>

        <div className="viewer-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            {TEXT.cancel}
          </button>
          <button type="submit" disabled={!nextFolderPath.trim() || submitting}>
            {TEXT.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

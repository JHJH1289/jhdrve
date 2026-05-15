const TEXT = {
  title: "업로드 중입니다",
  description: "잠시만 기다려주세요",
};

export default function UploadProgressOverlay({ open }) {
  if (!open) return null;

  return (
    <div className="upload-progress-backdrop" role="status" aria-live="polite">
      <div className="upload-progress-content">
        <div className="upload-progress-spinner" aria-hidden="true" />
        <strong>{TEXT.title}</strong>
        <span>{TEXT.description}</span>
      </div>
    </div>
  );
}

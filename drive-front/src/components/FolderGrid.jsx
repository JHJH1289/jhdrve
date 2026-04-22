export default function FolderGrid({ folders, onOpenFolder }) {
  if (!folders || folders.length === 0) {
    return <p>폴더가 없습니다.</p>;
  }

  return (
    <div className="folder-grid">
      {folders.map((folder) => (
        <button
          type="button"
          key={folder}
          className="folder-card"
          onClick={() => onOpenFolder(folder)}
        >
          <div className="folder-icon">📁</div>
          <div className="folder-name">{folder}</div>
        </button>
      ))}
    </div>
  );
}
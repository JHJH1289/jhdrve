import AuthImage from "../AuthImage";

export default function AdminFolderList({ labels, folders, groupedFolders, status, onDeleteFolder, onOpenFolder }) {
  if (folders.length === 0 && !status) {
    return <p className="admin-empty">{labels.empty}</p>;
  }

  return (
    <div className="admin-folder-list">
      {Object.entries(groupedFolders).map(([ownerId, ownerFolders]) => (
        <section className="admin-owner-section" key={ownerId}>
          <div className="admin-owner-header">
            <h2>{ownerId}</h2>
          </div>

          <div className="admin-folder-grid">
            {ownerFolders.map((folder) => (
              <article className="admin-folder-card" key={`${folder.ownerId}-${folder.folderPath}`}>
                <button
                  type="button"
                  className="admin-folder-open-btn"
                  onClick={() => onOpenFolder(folder)}
                >
                  <FolderPreview images={folder.previewImageUrls} />
                </button>
                <div className="admin-folder-meta">
                  <button type="button" onClick={() => onOpenFolder(folder)}>
                    <h3>{folder.folderPath}</h3>
                  </button>
                </div>
                <button
                  type="button"
                  className="folder-manage-btn danger"
                  onClick={() => onDeleteFolder(folder)}
                >
                  {labels.delete}
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FolderPreview({ images = [] }) {
  const image = images[0];

  return (
    <div className="admin-folder-preview">
      {image ? (
        <AuthImage className="admin-folder-preview-image" src={image} alt="" />
      ) : (
        <div className="admin-folder-preview-empty" />
      )}
    </div>
  );
}

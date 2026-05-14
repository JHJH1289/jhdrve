import FolderGrid from "../FolderGrid";

export default function GalleryFolderSection({
  labels,
  folders,
  searchText,
  toolsOpen,
  deletingDuplicates,
  loadingDuplicates,
  onDeleteDuplicates,
  onDeleteFolder,
  onOpenFolder,
  onRenameFolder,
  onReorderFolders,
  onSearchChange,
  onToggleTools,
}) {
  const reorderDisabled = searchText.trim().length > 0;

  return (
    <>
      <div className="section-header folder-section-header">
        <h2>{labels.folderList}</h2>
        <div className="folder-header-actions" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={toolsOpen ? "folder-menu-btn active" : "folder-menu-btn"}
            aria-label={labels.folderTools}
            aria-expanded={toolsOpen}
            onClick={onToggleTools}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>

          {toolsOpen && (
            <div className="folder-tools-menu">
              <input
                type="text"
                className="folder-search-input"
                value={searchText}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={labels.folderSearchPlaceholder}
              />
              <button
                type="button"
                className="secondary-btn"
                onClick={onDeleteDuplicates}
                disabled={loadingDuplicates || deletingDuplicates}
              >
                {labels.deleteDuplicates}
              </button>
            </div>
          )}
        </div>
      </div>
      <FolderGrid
        folders={folders}
        onOpenFolder={onOpenFolder}
        onReorder={reorderDisabled ? () => {} : onReorderFolders}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
      />
    </>
  );
}

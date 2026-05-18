import FolderGrid from "../FolderGrid";

export default function GalleryFolderSection({
  labels,
  folders,
  folderSortOrder,
  searchText,
  toolsOpen,
  deletingDuplicates,
  loadingDuplicates,
  onDeleteDuplicates,
  onDeleteFolder,
  onCreateShareLink,
  onDownloadFolderZip,
  onOpenFolder,
  onOpenTrash,
  onRenameFolder,
  onReorderFolders,
  onSortChange,
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
              <label className="folder-sort-control">
                <select
                  value={folderSortOrder}
                  onChange={(event) => onSortChange(event.target.value)}
                  aria-label={labels.folderSortLabel}
                >
                  <option value="newest">{labels.sortNewest}</option>
                  <option value="oldest">{labels.sortOldest}</option>
                  <option value="size-desc">{labels.sortSizeDesc}</option>
                  <option value="size-asc">{labels.sortSizeAsc}</option>
                </select>
              </label>
              <button
                type="button"
                className="secondary-btn"
                onClick={onDeleteDuplicates}
                disabled={loadingDuplicates || deletingDuplicates}
              >
                {labels.deleteDuplicates}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={onOpenTrash}
              >
                {labels.trash}
              </button>
            </div>
          )}
        </div>
      </div>
      <FolderGrid
        folders={folders}
        onCreateShareLink={onCreateShareLink}
        onDownloadFolderZip={onDownloadFolderZip}
        onOpenFolder={onOpenFolder}
        onReorder={reorderDisabled || folderSortOrder !== "newest" ? () => {} : onReorderFolders}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
      />
    </>
  );
}

import { useState } from "react";
import PhotoList from "../PhotoList";

export default function GalleryPhotoSection({
  labels,
  folderPath,
  photos,
  searchText,
  sortOrder,
  onAddPhotoTags,
  onBack,
  onCreateShareLink,
  onDeletePhotoTags,
  onDeletePhotos,
  onDownloadFolderZip,
  onOpenPhoto,
  onSearchChange,
  onSortChange,
}) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsDisabled = photos.length === 0;

  function runFolderAction(action) {
    setActionsOpen(false);
    action(folderPath);
  }

  return (
    <>
      <div className="section-header">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          {labels.backToFolders}
        </button>
        <div className="photo-folder-header">
          <h2>{folderPath}</h2>
          <div className="photo-folder-tools">
            <label className="photo-sort-control">
              <span>{labels.sortLabel}</span>
              <select
                value={sortOrder}
                onChange={(event) => onSortChange(event.target.value)}
              >
                <option value="newest">{labels.sortNewest}</option>
                <option value="oldest">{labels.sortOldest}</option>
              </select>
            </label>
            <div className="photo-folder-action-menu" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className={actionsOpen ? "folder-menu-btn active" : "folder-menu-btn"}
                aria-label="folder actions"
                aria-expanded={actionsOpen}
                onClick={() => setActionsOpen((value) => !value)}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </button>
              {actionsOpen && (
                <div className="folder-menu photo-folder-menu" role="menu">
                  <button
                    type="button"
                    className="folder-menu-item"
                    role="menuitem"
                    onClick={() => runFolderAction(onCreateShareLink)}
                    disabled={actionsDisabled}
                  >
                    {labels.shareFolder}
                  </button>
                  <button
                    type="button"
                    className="folder-menu-item"
                    role="menuitem"
                    onClick={() => runFolderAction(onDownloadFolderZip)}
                    disabled={actionsDisabled}
                  >
                    {labels.folderZipDownload}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <input
          type="text"
          className="photo-search-input"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={labels.photoSearchPlaceholder}
        />
      </div>

      <PhotoList
        photos={photos}
        onAddTagsSelected={onAddPhotoTags}
        onDeleteTagsSelected={onDeletePhotoTags}
        onDeleteSelected={onDeletePhotos}
        onOpen={onOpenPhoto}
      />
    </>
  );
}

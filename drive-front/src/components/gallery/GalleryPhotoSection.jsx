import PhotoList from "../PhotoList";

export default function GalleryPhotoSection({
  labels,
  folderPath,
  photos,
  searchText,
  sortOrder,
  onAddPhotoTags,
  onBack,
  onDeletePhotoTags,
  onDeletePhotos,
  onOpenPhoto,
  onSearchChange,
  onSortChange,
}) {
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

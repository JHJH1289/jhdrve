import AuthImage from "./AuthImage";

export default function PhotoCard({ photo, selected, onOpen, onSelect }) {
  const tags = Array.isArray(photo.tags) ? photo.tags.slice(0, 3) : [];

  return (
    <div className={selected ? "card photo-card selected" : "card photo-card"}>
      <label className="photo-select-box" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          aria-label={`${photo.originalName} \uC120\uD0DD`}
        />
      </label>
      <button className="card-image-wrap" type="button" onClick={onOpen} aria-label={photo.originalName}>
        <AuthImage
          className="card-image"
          src={photo.thumbnailUrl || photo.imageUrl}
          alt={photo.originalName}
        />
        {tags.length > 0 && (
          <span className="photo-tag-strip">
            {tags.map((tag) => `#${tag}`).join(" ")}
          </span>
        )}
      </button>
    </div>
  );
}

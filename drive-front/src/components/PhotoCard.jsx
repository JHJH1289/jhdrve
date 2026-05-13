import AuthImage from "./AuthImage";

export default function PhotoCard({ photo, selected, onOpen, onSelect }) {
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
          src={photo.imageUrl}
          alt={photo.originalName}
        />
      </button>
    </div>
  );
}

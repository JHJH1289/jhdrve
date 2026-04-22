import PhotoCard from "./PhotoCard";

export default function PhotoList({ photos, onDelete, onOpen }) {
  if (!photos || photos.length === 0) {
    return <p>사진이 없습니다.</p>;
  }

  return (
    <div className="photo-list">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onDelete={onDelete}
          onOpen={() => onOpen(index)}
        />
      ))}
    </div>
  );
}
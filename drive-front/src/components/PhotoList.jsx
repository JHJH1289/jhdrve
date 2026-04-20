import PhotoCard from "./PhotoCard";

function PhotoList({ photos, onDelete, onOpen }) {
  return (
    <div className="gallery">
      <h2>업로드 목록</h2>

      {!photos.length ? (
        <p>업로드된 사진이 없습니다.</p>
      ) : (
        <div className="photo-list">
          {[...photos]
            .reverse()
            .map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={onDelete}
                onOpen={onOpen}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default PhotoList;
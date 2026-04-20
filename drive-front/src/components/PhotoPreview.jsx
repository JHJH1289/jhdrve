function PhotoPreview({ uploadedPhoto }) {
  if (!uploadedPhoto) {
    return null;
  }

  return (
    <div className="preview-section">
      <h2>방금 업로드한 이미지</h2>
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}${uploadedPhoto.imageUrl}`}
        alt="uploaded"
      />
    </div>
  );
}

export default PhotoPreview;
import { useEffect, useState } from "react";
import { deletePhoto, fetchPhotos, uploadPhotos } from "./api/photoApi";
import PhotoList from "./components/PhotoList";
import PhotoModal from "./components/PhotoModal";
import PhotoPreview from "./components/PhotoPreview";
import PhotoStatus from "./components/PhotoStatus";
import PhotoUploadForm from "./components/PhotoUploadForm";

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [statusText, setStatusText] = useState("대기 중");

  const loadPhotos = async () => {
    try {
      const result = await fetchPhotos();
      setPhotos(result);
    } catch (error) {
      setStatusText(`목록 조회 오류: ${error.message}`);
    }
  };

  const handleUpload = async (files) => {
    try {
      setStatusText("업로드 중...");
      const result = await uploadPhotos(files);

      const lastUploaded = result.items[result.items.length - 1] || null;
      setUploadedPhoto(lastUploaded);

      setStatusText(
        [
          "업로드 성공",
          `업로드 개수: ${result.count}`,
          ...result.items.map(
            (item, index) =>
              `${index + 1}. ID=${item.id}, 파일명=${item.originalName}, 크기=${item.size}`
          ),
        ].join("\n")
      );

      await loadPhotos();
    } catch (error) {
      setStatusText(`업로드 오류: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(`사진 ID ${id}를 삭제할까?`);
    if (!ok) {
      return;
    }

    try {
      setStatusText("삭제 중...");
      await deletePhoto(id);

      if (selectedPhoto && selectedPhoto.id === id) {
        setSelectedPhoto(null);
      }

      if (uploadedPhoto && uploadedPhoto.id === id) {
        setUploadedPhoto(null);
      }

      setStatusText(`삭제 성공\nID: ${id}`);
      await loadPhotos();
    } catch (error) {
      setStatusText(`삭제 오류: ${error.message}`);
    }
  };

  const handleOpenPhoto = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <div className="app">
      <div className="wrap">
        <h1>사진 업로드 테스트</h1>
        <p>React + Spring Boot + PostgreSQL 테스트</p>

        <PhotoUploadForm onUpload={handleUpload} />
        <PhotoStatus statusText={statusText} />
        <PhotoPreview uploadedPhoto={uploadedPhoto} />
        <PhotoList
          photos={photos}
          onDelete={handleDelete}
          onOpen={handleOpenPhoto}
        />
      </div>

      <PhotoModal photo={selectedPhoto} onClose={handleClosePhoto} />
    </div>
  );
}

export default App;
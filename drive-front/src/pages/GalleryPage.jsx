import { useEffect, useMemo, useState } from "react";
import { deletePhoto, fetchFolders, fetchPhotos, uploadPhotos } from "../api/photoApi";
import PhotoList from "../components/PhotoList";
import PhotoModal from "../components/PhotoModal";
import PhotoPreview from "../components/PhotoPreview";
import PhotoStatus from "../components/PhotoStatus";
import PhotoUploadForm from "../components/PhotoUploadForm";

export default function GalleryPage({ username, onLogout }) {
  const [photos, setPhotos] = useState([]);
  const [folders, setFolders] = useState(["기본"]);
  const [selectedFolder, setSelectedFolder] = useState("기본");
  const [uploadFolder, setUploadFolder] = useState("기본");
  const [sortType, setSortType] = useState("takenAtDesc");
  const [status, setStatus] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadPhotos(selectedFolder);
  }, [selectedFolder]);

  async function loadFolders() {
    try {
      const result = await fetchFolders();
      const nextFolders = result && result.length ? result : ["기본"];
      setFolders(nextFolders);

      if (!nextFolders.includes(selectedFolder)) {
        setSelectedFolder(nextFolders[0]);
      }
    } catch (error) {
      setStatus(`폴더 조회 오류: ${error.message}`);
    }
  }

  async function loadPhotos(folderPath) {
    try {
      setStatus("");
      const result = await fetchPhotos(folderPath);
      setPhotos(Array.isArray(result) ? result : []);
    } catch (error) {
      setStatus(`목록 조회 오류: ${error.message}`);
      setPhotos([]);
    }
  }

  async function handleUpload(files) {
    try {
      if (!files || files.length === 0) {
        setStatus("업로드할 파일을 선택하세요.");
        return;
      }

      setStatus("업로드 중...");
      await uploadPhotos(uploadFolder, files);
      setPreviewFiles([]);
      setStatus("업로드 완료");

      await loadFolders();
      await loadPhotos(uploadFolder);
      setSelectedFolder(uploadFolder);
    } catch (error) {
      setStatus(`업로드 오류: ${error.message}`);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePhoto(id);
      setStatus("삭제 완료");
      await loadFolders();
      await loadPhotos(selectedFolder);
      setSelectedPhoto(null);
    } catch (error) {
      setStatus(`삭제 오류: ${error.message}`);
    }
  }

  function handleLogoutClick() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    onLogout();
  }

  const sortedPhotos = useMemo(() => {
    const copied = [...photos];

    const compareDateDesc = (a, b, key) => {
      const aValue = a[key] ? new Date(a[key]).getTime() : 0;
      const bValue = b[key] ? new Date(b[key]).getTime() : 0;
      return bValue - aValue;
    };

    const compareDateAsc = (a, b, key) => {
      const aValue = a[key] ? new Date(a[key]).getTime() : 0;
      const bValue = b[key] ? new Date(b[key]).getTime() : 0;
      return aValue - bValue;
    };

    switch (sortType) {
      case "takenAtAsc":
        return copied.sort((a, b) => compareDateAsc(a, b, "takenAt"));
      case "createdAtDesc":
        return copied.sort((a, b) => compareDateDesc(a, b, "createdAt"));
      case "createdAtAsc":
        return copied.sort((a, b) => compareDateAsc(a, b, "createdAt"));
      case "takenAtDesc":
      default:
        return copied.sort((a, b) => compareDateDesc(a, b, "takenAt"));
    }
  }, [photos, sortType]);

  return (
    <div className="app">
      <div className="wrap">
        <div className="top-bar">
          <div>
            <h1>사진 업로드 테스트</h1>
            <p className="subtitle">React + Spring Boot + PostgreSQL 테스트</p>
          </div>
          <div className="user-box">
            <span>{username}</span>
            <button type="button" onClick={handleLogoutClick}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="control-box">
          <div className="row">
            <label>조회 폴더</label>
            <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <label>정렬</label>
            <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
              <option value="takenAtDesc">촬영일 최신순</option>
              <option value="takenAtAsc">촬영일 오래된순</option>
              <option value="createdAtDesc">업로드일 최신순</option>
              <option value="createdAtAsc">업로드일 오래된순</option>
            </select>
          </div>
        </div>

        <div className="upload-section">
          <div className="row">
            <label>업로드 폴더</label>
            <input
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="예: 여행/오사카"
            />
          </div>

          <PhotoUploadForm onUpload={handleUpload} onPreviewChange={setPreviewFiles} />
        </div>

        <PhotoStatus status={status} />
        <PhotoPreview files={previewFiles} />

        <div className="gallery">
          <h2>업로드 목록</h2>
          <p className="summary">
            계정: <strong>{username}</strong> / 폴더: <strong>{selectedFolder}</strong>
          </p>
          <p className="summary">총 {sortedPhotos.length}장</p>

          <PhotoList photos={sortedPhotos} onDelete={handleDelete} onOpen={setSelectedPhoto} />
        </div>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
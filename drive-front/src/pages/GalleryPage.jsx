import { useEffect, useState } from "react";
import { deletePhoto, fetchFolders, fetchPhotos, uploadPhotos } from "../api/photoApi";
import FolderGrid from "../components/FolderGrid";
import ImageViewerModal from "../components/ImageViewerModal";
import PhotoList from "../components/PhotoList";
import PhotoStatus from "../components/PhotoStatus";
import UploadModal from "../components/UploadModal";

export default function GalleryPage({ username, onLogout }) {
  const [folders, setFolders] = useState(["기본"]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadPhotos(selectedFolder);
    }
  }, [selectedFolder]);

  async function loadFolders() {
    try {
      const result = await fetchFolders();
      setFolders(result && result.length ? result : ["기본"]);
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

  async function handleUpload(folderPath, files) {
    try {
      if (!files || files.length === 0) {
        setStatus("업로드할 파일을 선택하세요.");
        return;
      }

      setStatus("업로드 중...");
      await uploadPhotos(folderPath, files);
      setStatus("업로드 완료");
      setUploadModalOpen(false);

      await loadFolders();

      if (selectedFolder === folderPath) {
        await loadPhotos(folderPath);
      } else {
        setSelectedFolder(folderPath);
      }
    } catch (error) {
      setStatus(`업로드 오류: ${error.message}`);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePhoto(id);
      setStatus("삭제 완료");

      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }

      await loadFolders();
      setViewerIndex(null);
    } catch (error) {
      setStatus(`삭제 오류: ${error.message}`);
    }
  }

  function handleLogoutClick() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    onLogout();
  }

  function openViewer(index) {
    setViewerIndex(index);
  }

  function closeViewer() {
    setViewerIndex(null);
  }

  function showPrev() {
    if (viewerIndex === null || photos.length === 0) return;
    setViewerIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function showNext() {
    if (viewerIndex === null || photos.length === 0) return;
    setViewerIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }
  return (
    <div className="app">
      <div className="wrap">
        <div className="top-bar">
          <div>
            <h1>사진 드라이브</h1>
            <p className="subtitle">계정: {username}</p>
          </div>

          <div className="user-box">
            <button type="button" onClick={handleLogoutClick}>
              로그아웃
            </button>
          </div>
        </div>

        <PhotoStatus status={status} />

        {!selectedFolder ? (
          <>
            <div className="section-header">
              <h2>폴더 목록</h2>
            </div>
            <FolderGrid folders={folders} onOpenFolder={setSelectedFolder} />
          </>
        ) : (
          <>
            <div className="section-header">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setSelectedFolder(null);
                  setPhotos([]);
                  setViewerIndex(null);
                }}
              >
                ← 폴더 목록
              </button>
              <h2>{selectedFolder}</h2>
              <p className="summary">총 {photos.length}장</p>
            </div>

            <PhotoList photos={photos} onDelete={handleDelete} onOpen={openViewer} />
          </>
        )}

        <button
          type="button"
          className="upload-fab floating"
          onClick={() => setUploadModalOpen(true)}
          aria-label="사진 업로드"
          title="사진 업로드"
        >
          +
        </button>

        <UploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
          defaultFolder={selectedFolder || "기본"}
        />

        <ImageViewerModal
          open={viewerIndex !== null}
          photos={photos}
          currentIndex={viewerIndex}
          onClose={closeViewer}
          onPrev={showPrev}
          onNext={showNext}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

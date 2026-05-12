import { useEffect, useState } from "react";
import { createFolder, deletePhoto, fetchFolders, fetchPhotos, updatePhotoFolder, uploadPhotos } from "../api/photoApi";
import FolderGrid from "../components/FolderGrid";
import ImageViewerModal from "../components/ImageViewerModal";
import PhotoList from "../components/PhotoList";
import PhotoStatus from "../components/PhotoStatus";
import UploadModal from "../components/UploadModal";

const DEFAULT_FOLDER = "\uAE30\uBCF8";
const TEXT = {
  account: "\uACC4\uC815",
  appTitle: "\uC0AC\uC9C4 \uB4DC\uB77C\uC774\uBE0C",
  backToFolders: "\u2190 \uD3F4\uB354 \uBAA9\uB85D",
  createFolder: "\uD3F4\uB354 \uC0DD\uC131",
  createFolderPrompt: "\uC0DD\uC131\uD560 \uD3F4\uB354\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694.",
  folderList: "\uD3F4\uB354 \uBAA9\uB85D",
  logout: "\uB85C\uADF8\uC544\uC6C3",
  photoUpload: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
  totalPrefix: "총",
  totalSuffix: "장",
};

export default function GalleryPage({ username, onLogout }) {
  const [folders, setFolders] = useState([DEFAULT_FOLDER]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);

  function showNotice(message, type = "success") {
    setNotice({ message, type });
  }

  async function loadFolders() {
    try {
      const result = await fetchFolders();
      setFolders(result && result.length ? result : [DEFAULT_FOLDER]);
    } catch (error) {
      setStatus(`\uD3F4\uB354 \uC870\uD68C \uC624\uB958: ${error.message}`);
    }
  }

  async function loadPhotos(folderPath) {
    try {
      setStatus("");
      const result = await fetchPhotos(folderPath);
      setPhotos(Array.isArray(result) ? result : []);
    } catch (error) {
      setStatus(`\uBAA9\uB85D \uC870\uD68C \uC624\uB958: ${error.message}`);
      setPhotos([]);
    }
  }

  async function handleCreateFolder() {
    const folderPath = window.prompt(TEXT.createFolderPrompt, "");
    if (folderPath === null) return;

    try {
      const result = await createFolder(folderPath);
      showNotice(`'${result.folderPath}' \uD3F4\uB354\uB97C \uB9CC\uB4E4\uC5C8\uC2B5\uB2C8\uB2E4.`);
      await loadFolders();
      if (result?.folderPath) {
        setSelectedFolder(result.folderPath);
      }
    } catch (error) {
      showNotice(`\uD3F4\uB354 \uC0DD\uC131 \uC2E4\uD328: ${error.message}`, "error");
      setStatus(`\uD3F4\uB354 \uC0DD\uC131 \uC624\uB958: ${error.message}`);
    }
  }

  async function handleUpload(folderPath, files) {
    try {
      if (!files || files.length === 0) {
        setStatus("\uC5C5\uB85C\uB4DC\uD560 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
        return;
      }

      setStatus("\uC5C5\uB85C\uB4DC \uC911...");
      await uploadPhotos(folderPath, files);
      setStatus("\uC5C5\uB85C\uB4DC \uC644\uB8CC");
      setUploadModalOpen(false);

      await loadFolders();

      if (selectedFolder === folderPath) {
        await loadPhotos(folderPath);
      } else {
        setSelectedFolder(folderPath);
      }
    } catch (error) {
      setStatus(`\uC5C5\uB85C\uB4DC \uC624\uB958: ${error.message}`);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePhoto(id);
      setStatus("\uC0AD\uC81C \uC644\uB8CC");

      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }

      await loadFolders();
      setViewerIndex(null);
    } catch (error) {
      setStatus(`\uC0AD\uC81C \uC624\uB958: ${error.message}`);
    }
  }

  async function handleUpdateFolder(id, folderPath) {
    let result;

    try {
      result = await updatePhotoFolder(id, folderPath);
    } catch (error) {
      showNotice(`\uD3F4\uB354 \uBCC0\uACBD \uC2E4\uD328: ${error.message}`, "error");
      setStatus(`\uD3F4\uB354 \uBCC0\uACBD \uC624\uB958: ${error.message}`);
      throw error;
    }

    showNotice(`'${result.folderPath}' \uD3F4\uB354\uB85C \uC62E\uACBC\uC2B5\uB2C8\uB2E4.`);
    setSelectedFolder(result.folderPath);
    setPhotos([result]);
    setViewerIndex(null);

    await loadFolders();
    await loadPhotos(result.folderPath);
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

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let cancelled = false;

    async function syncFolders() {
      try {
        const result = await fetchFolders();
        if (!cancelled) {
          setFolders(result && result.length ? result : [DEFAULT_FOLDER]);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(`\uD3F4\uB354 \uC870\uD68C \uC624\uB958: ${error.message}`);
        }
      }
    }

    syncFolders();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedFolder) return undefined;

    let cancelled = false;

    async function syncPhotos() {
      try {
        const result = await fetchPhotos(selectedFolder);
        if (!cancelled) {
          setStatus("");
          setPhotos(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(`\uBAA9\uB85D \uC870\uD68C \uC624\uB958: ${error.message}`);
          setPhotos([]);
        }
      }
    }

    syncPhotos();

    return () => {
      cancelled = true;
    };
  }, [selectedFolder]);

  return (
    <div className="app">
      {notice && (
        <div className={notice.type === "error" ? "top-notice error" : "top-notice"}>
          {notice.message}
        </div>
      )}

      <div className="wrap">
        <div className="top-bar">
          <div>
            <h1>{TEXT.appTitle}</h1>
            <p className="subtitle">{TEXT.account}: {username}</p>
          </div>

          <div className="user-box">
            <button type="button" onClick={handleLogoutClick}>
              {TEXT.logout}
            </button>
          </div>
        </div>

        <PhotoStatus status={status} />

        {!selectedFolder ? (
          <>
            <div className="section-header folder-section-header">
              <h2>{TEXT.folderList}</h2>
              <button type="button" onClick={handleCreateFolder}>
                {TEXT.createFolder}
              </button>
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
                {TEXT.backToFolders}
              </button>
              <h2>{selectedFolder}</h2>
              <p className="summary">
                {TEXT.totalPrefix} {photos.length}{TEXT.totalSuffix}
              </p>
            </div>

            <PhotoList photos={photos} onDelete={handleDelete} onOpen={openViewer} />
          </>
        )}

        <button
          type="button"
          className="upload-fab floating"
          onClick={() => setUploadModalOpen(true)}
          aria-label={TEXT.photoUpload}
          title={TEXT.photoUpload}
        >
          +
        </button>

        <UploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
          defaultFolder={selectedFolder || DEFAULT_FOLDER}
        />

        <ImageViewerModal
          open={viewerIndex !== null}
          photos={photos}
          currentIndex={viewerIndex}
          onClose={closeViewer}
          onPrev={showPrev}
          onNext={showNext}
          onDelete={handleDelete}
          onUpdateFolder={handleUpdateFolder}
        />
      </div>
    </div>
  );
}

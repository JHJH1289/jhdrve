import { useEffect, useState } from "react";
import { createFolder, deleteDuplicatePhotos, deleteFolder, deletePhoto, fetchDuplicatePhotos, fetchFolders, fetchPhotos, renameFolder, updateFolderOrder, uploadPhotos } from "../api/photoApi";
import DuplicatePhotoModal from "../components/DuplicatePhotoModal";
import FolderGrid from "../components/FolderGrid";
import ImageViewerModal from "../components/ImageViewerModal";
import PhotoList from "../components/PhotoList";
import PhotoStatus from "../components/PhotoStatus";
import UploadModal from "../components/UploadModal";

const TEXT = {
  account: "\uACC4\uC815",
  appTitle: "\uC0AC\uC9C4 \uB4DC\uB77C\uC774\uBE0C",
  backToFolders: "\u2190 \uD3F4\uB354 \uBAA9\uB85D",
  createFolder: "\uD3F4\uB354 \uC0DD\uC131",
  createFolderPrompt: "\uC0DD\uC131\uD560 \uD3F4\uB354\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694.",
  deleteFolderConfirm: "\uD3F4\uB354\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694? \uBE44\uC5B4 \uC788\uB294 \uD3F4\uB354\uB9CC \uC0AD\uC81C\uB429\uB2C8\uB2E4.",
  deleteDuplicates: "\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC",
  deleteDuplicatesDone: "\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC \uC644\uB8CC",
  duplicateScanDone: "\uC911\uBCF5 \uC0AC\uC9C4\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.",
  duplicateScanEmpty: "\uC911\uBCF5 \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  duplicateScanLoading: "\uC911\uBCF5 \uC0AC\uC9C4 \uCC3E\uB294 \uC911...",
  folderList: "\uD3F4\uB354 \uBAA9\uB85D",
  logout: "\uB85C\uADF8\uC544\uC6C3",
  adminMode: "\uAD00\uB9AC\uC790\uBAA8\uB4DC",
  photoUpload: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
  renameFolderPrompt: "\uBCC0\uACBD\uD560 \uD3F4\uB354\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694.",
};

export default function GalleryPage({ username, role, onLogout, onOpenAdmin }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [deletingDuplicates, setDeletingDuplicates] = useState(false);

  function showNotice(message, type = "success") {
    setNotice({ message, type });
  }

  async function loadFolders() {
    try {
      const result = await fetchFolders();
      setFolders(result && result.length ? result : []);
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

  async function handleDeletePhotos(ids) {
    if (!ids || ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => deletePhoto(id)));
      setStatus("\uC0AD\uC81C \uC644\uB8CC");

      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }

      await loadFolders();
      setViewerIndex(null);
    } catch (error) {
      setStatus(`\uC0AD\uC81C \uC624\uB958: ${error.message}`);
      throw error;
    }
  }

  async function handleDeleteDuplicates() {
    if (loadingDuplicates || deletingDuplicates) return;

    try {
      setLoadingDuplicates(true);
      setStatus(TEXT.duplicateScanLoading);
      const groups = await fetchDuplicatePhotos();
      setDuplicateGroups(groups);

      if (groups.length === 0) {
        setDuplicateModalOpen(false);
        setStatus(TEXT.duplicateScanEmpty);
        return;
      }

      setDuplicateModalOpen(true);
      setStatus(TEXT.duplicateScanDone);
    } catch (error) {
      setStatus(`\uC911\uBCF5 \uC0AC\uC9C4 \uC870\uD68C \uC624\uB958: ${error.message}`);
    } finally {
      setLoadingDuplicates(false);
    }
  }

  async function handleConfirmDeleteDuplicates() {
    if (deletingDuplicates) return;

    try {
      setDeletingDuplicates(true);
      setStatus("\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC \uC911...");
      await deleteDuplicatePhotos();
      setDuplicateModalOpen(false);
      setDuplicateGroups([]);
      setStatus(TEXT.deleteDuplicatesDone);
      await loadFolders();
    } catch (error) {
      setStatus(`\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC \uC624\uB958: ${error.message}`);
    } finally {
      setDeletingDuplicates(false);
    }
  }

  async function handleReorderFolders(nextFolders) {
    setFolders(nextFolders);

    try {
      const result = await updateFolderOrder(nextFolders.map((folder) => folder.folderPath));
      setFolders(result && result.length ? result : nextFolders);
    } catch (error) {
      showNotice(`\uD3F4\uB354 \uC21C\uC11C \uC800\uC7A5 \uC2E4\uD328: ${error.message}`, "error");
      await loadFolders();
    }
  }

  async function handleDeleteFolder(folderPath) {
    if (!window.confirm(`'${folderPath}' ${TEXT.deleteFolderConfirm}`)) return;

    try {
      await deleteFolder(folderPath);
      showNotice(`'${folderPath}' \uD3F4\uB354\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`);
      await loadFolders();
    } catch (error) {
      showNotice(`\uD3F4\uB354 \uC0AD\uC81C \uC2E4\uD328: ${error.message}`, "error");
    }
  }

  async function handleRenameFolder(folderPath) {
    const nextFolderPath = window.prompt(TEXT.renameFolderPrompt, folderPath);
    if (nextFolderPath === null) return;

    try {
      const result = await renameFolder(folderPath, nextFolderPath);
      showNotice(`'${folderPath}' \uD3F4\uB354\uBA85\uC744 '${result.folderPath}'\uB85C \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4.`);
      await loadFolders();
    } catch (error) {
      showNotice(`\uD3F4\uB354\uBA85 \uBCC0\uACBD \uC2E4\uD328: ${error.message}`, "error");
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
          setFolders(result && result.length ? result : []);
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
            {role === "ADMIN" && (
              <button type="button" className="secondary-btn" onClick={onOpenAdmin}>
                {TEXT.adminMode}
              </button>
            )}
          </div>
        </div>

        <PhotoStatus status={status} />

        {!selectedFolder ? (
          <>
            <div className="section-header folder-section-header">
              <h2>{TEXT.folderList}</h2>
              <div className="folder-header-actions">
                <button type="button" className="secondary-btn" onClick={handleDeleteDuplicates} disabled={loadingDuplicates || deletingDuplicates}>
                  {TEXT.deleteDuplicates}
                </button>
                <button type="button" onClick={handleCreateFolder}>
                  {TEXT.createFolder}
                </button>
              </div>
            </div>
            <FolderGrid
              folders={folders}
              onOpenFolder={setSelectedFolder}
              onReorder={handleReorderFolders}
              onDeleteFolder={handleDeleteFolder}
              onRenameFolder={handleRenameFolder}
            />
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
            </div>

            <PhotoList photos={photos} onDeleteSelected={handleDeletePhotos} onOpen={openViewer} />
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

        {uploadModalOpen && (
          <UploadModal
            key={selectedFolder || "folder-list-upload"}
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onUpload={handleUpload}
            defaultFolder={selectedFolder || ""}
          />
        )}

        <ImageViewerModal
          open={viewerIndex !== null}
          photos={photos}
          currentIndex={viewerIndex}
          onClose={closeViewer}
          onPrev={showPrev}
          onNext={showNext}
          onDelete={handleDelete}
        />

        <DuplicatePhotoModal
          open={duplicateModalOpen}
          groups={duplicateGroups}
          deleting={deletingDuplicates}
          onClose={() => setDuplicateModalOpen(false)}
          onDelete={handleConfirmDeleteDuplicates}
        />
      </div>
    </div>
  );
}

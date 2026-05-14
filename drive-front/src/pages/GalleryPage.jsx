import { useEffect, useMemo, useState } from "react";
import { addPhotoTags, deleteDuplicatePhotos, deleteFolder, deletePhoto, fetchDuplicatePhotos, fetchFolders, fetchPhotos, removePhotoTags, renameFolder, updateFolderOrder, uploadPhotos } from "../api/photoApi";
import DuplicatePhotoModal from "../components/DuplicatePhotoModal";
import FolderRenameModal from "../components/FolderRenameModal";
import GalleryFolderSection from "../components/gallery/GalleryFolderSection";
import GalleryPhotoSection from "../components/gallery/GalleryPhotoSection";
import ImageViewerModal from "../components/ImageViewerModal";
import PhotoStatus from "../components/PhotoStatus";
import UploadModal from "../components/UploadModal";
import { useAutoDismissNotice } from "../hooks/useAutoDismissNotice";
import { filterFolders, filterPhotos, sortPhotosByDate } from "../utils/photoCollection";

const TEXT = {
  backToFolders: "\u2190 \uD3F4\uB354 \uBAA9\uB85D",
  deleteFolderConfirm: "\uD3F4\uB354\uB97C \uC0AD\uC81C\uD560\uAE4C\uC694? \uBE44\uC5B4 \uC788\uB294 \uD3F4\uB354\uB9CC \uC0AD\uC81C\uB429\uB2C8\uB2E4.",
  deleteDuplicates: "\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC",
  deleteDuplicatesDone: "\uC911\uBCF5 \uC0AC\uC9C4 \uC815\uB9AC \uC644\uB8CC",
  duplicateScanDone: "\uC911\uBCF5 \uC0AC\uC9C4\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.",
  duplicateScanEmpty: "\uC911\uBCF5 \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  duplicateScanLoading: "\uC911\uBCF5 \uC0AC\uC9C4 \uCC3E\uB294 \uC911...",
  folderList: "\uD3F4\uB354 \uBAA9\uB85D",
  folderSearchPlaceholder: "\uD3F4\uB354\uBA85\uC774\uB098 \uD0DC\uADF8\uB85C \uAC80\uC0C9",
  folderTools: "폴더 도구",
  logout: "\uB85C\uADF8\uC544\uC6C3",
  adminMode: "\uAD00\uB9AC\uC790\uBAA8\uB4DC",
  photoUpload: "\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC",
  photoSearchPlaceholder: "\uC0AC\uC9C4\uBA85\uC774\uB098 \uD0DC\uADF8\uB85C \uAC80\uC0C9",
  sortLabel: "정렬",
  sortNewest: "\uCD5C\uC2E0\uC21C",
  sortOldest: "\uC624\uB798\uB41C\uC21C",
  tagAddDone: "\uD0DC\uADF8 \uCD94\uAC00 \uC644\uB8CC",
  tagDeleteDone: "\uD0DC\uADF8 \uC0AD\uC81C \uC644\uB8CC",
};

export default function GalleryPage({ username, role, onLogout, onOpenAdmin }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useAutoDismissNotice();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [deletingDuplicates, setDeletingDuplicates] = useState(false);
  const [photoSortOrder, setPhotoSortOrder] = useState("newest");
  const [folderSearch, setFolderSearch] = useState("");
  const [photoSearch, setPhotoSearch] = useState("");
  const [renamingFolder, setRenamingFolder] = useState("");
  const [folderToolsOpen, setFolderToolsOpen] = useState(false);

  const visibleFolders = useMemo(() => {
    return filterFolders(folders, folderSearch);
  }, [folderSearch, folders]);

  const visiblePhotos = useMemo(() => {
    return filterPhotos(photos, photoSearch);
  }, [photoSearch, photos]);

  const sortedPhotos = useMemo(() => {
    return sortPhotosByDate(visiblePhotos, photoSortOrder);
  }, [photoSortOrder, visiblePhotos]);

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

  async function handleUpload(folderPath, files, tags = "") {
    try {
      if (!files || files.length === 0) {
        setStatus("\uC5C5\uB85C\uB4DC\uD560 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
        return;
      }

      setStatus("\uC5C5\uB85C\uB4DC \uC911...");
      await uploadPhotos(folderPath, files, tags);
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

  async function handleAddPhotoTags(ids, tags) {
    if (!ids || ids.length === 0) return;

    try {
      await addPhotoTags(ids, tags);
      setStatus(TEXT.tagAddDone);

      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }

      await loadFolders();
      setViewerIndex(null);
    } catch (error) {
      setStatus(`\uD0DC\uADF8 \uCD94\uAC00 \uC624\uB958: ${error.message}`);
      throw error;
    }
  }

  async function handleDeletePhotoTags(ids, tags) {
    if (!ids || ids.length === 0) return;

    try {
      await removePhotoTags(ids, tags);
      setStatus(TEXT.tagDeleteDone);

      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }

      await loadFolders();
      setViewerIndex(null);
    } catch (error) {
      setStatus(`\uD0DC\uADF8 \uC0AD\uC81C \uC624\uB958: ${error.message}`);
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

  async function handleRenameFolder(folderPath, nextFolderPath) {
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

  function closeFolder() {
    setSelectedFolder(null);
    setPhotos([]);
    setPhotoSearch("");
    setViewerIndex(null);
  }

  function showPrev() {
    if (viewerIndex === null || sortedPhotos.length === 0) return;
    setViewerIndex((prev) => (prev === 0 ? sortedPhotos.length - 1 : prev - 1));
  }

  function showNext() {
    if (viewerIndex === null || sortedPhotos.length === 0) return;
    setViewerIndex((prev) => (prev === sortedPhotos.length - 1 ? 0 : prev + 1));
  }

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
            <h1>{username} 드라이브</h1>
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
          <GalleryFolderSection
            labels={TEXT}
            folders={visibleFolders}
            searchText={folderSearch}
            toolsOpen={folderToolsOpen}
            deletingDuplicates={deletingDuplicates}
            loadingDuplicates={loadingDuplicates}
            onDeleteDuplicates={handleDeleteDuplicates}
            onDeleteFolder={handleDeleteFolder}
            onOpenFolder={setSelectedFolder}
            onRenameFolder={setRenamingFolder}
            onReorderFolders={handleReorderFolders}
            onSearchChange={setFolderSearch}
            onToggleTools={() => setFolderToolsOpen((value) => !value)}
          />
        ) : (
          <GalleryPhotoSection
            labels={TEXT}
            folderPath={selectedFolder}
            photos={sortedPhotos}
            searchText={photoSearch}
            sortOrder={photoSortOrder}
            onAddPhotoTags={handleAddPhotoTags}
            onBack={closeFolder}
            onDeletePhotoTags={handleDeletePhotoTags}
            onDeletePhotos={handleDeletePhotos}
            onOpenPhoto={openViewer}
            onSearchChange={(value) => {
              setPhotoSearch(value);
              setViewerIndex(null);
            }}
            onSortChange={setPhotoSortOrder}
          />
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
          photos={sortedPhotos}
          currentIndex={viewerIndex}
          onClose={closeViewer}
          onPrev={showPrev}
          onNext={showNext}
          onDelete={handleDelete}
        />

        <FolderRenameModal
          open={Boolean(renamingFolder)}
          folderPath={renamingFolder}
          onClose={() => setRenamingFolder("")}
          onSubmit={handleRenameFolder}
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

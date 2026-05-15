import { useEffect, useMemo, useState } from "react";
import { addPhotoTags, deleteDuplicatePhotos, deleteFolder, deletePhoto, deleteTrashPhoto, emptyTrashPhotos, fetchDuplicatePhotos, fetchFolders, fetchPhotos, fetchStorageStatus, fetchTrashPhotos, removePhotoTags, renameFolder, restoreTrashPhoto, updateFolderOrder, uploadPhotos } from "../api/photoApi";
import AdminPanel from "../components/admin/AdminPanel";
import DuplicatePhotoModal from "../components/DuplicatePhotoModal";
import FolderRenameModal from "../components/FolderRenameModal";
import GalleryFolderSection from "../components/gallery/GalleryFolderSection";
import GalleryPhotoSection from "../components/gallery/GalleryPhotoSection";
import ImageViewerModal from "../components/ImageViewerModal";
import PhotoStatus from "../components/PhotoStatus";
import TrashPage from "../components/TrashPage";
import UploadModal from "../components/UploadModal";
import UploadProgressOverlay from "../components/UploadProgressOverlay";
import { useAutoDismissNotice } from "../hooks/useAutoDismissNotice";
import { filterFolders, filterPhotos, sortFolders, sortPhotosByDate } from "../utils/photoCollection";

const TEXT = {
  backToFolders: "← 폴더 목록",
  deleteFolderConfirm: "폴더를 삭제할까요? 비어 있는 폴더만 삭제됩니다.",
  deleteDuplicates: "중복 사진 정리",
  deleteDuplicatesDone: "중복 사진 정리 완료",
  duplicateScanDone: "중복 사진을 확인해주세요.",
  duplicateScanEmpty: "중복 사진이 없습니다.",
  duplicateScanLoading: "중복 사진 찾는 중...",
  folderList: "폴더 목록",
  folderSearchPlaceholder: "폴더명이나 태그로 검색",
  folderSortLabel: "폴더 정렬",
  folderTools: "폴더 도구",
  logout: "로그아웃",
  adminMode: "관리자모드",
  photoUpload: "사진 업로드",
  photoSearchPlaceholder: "사진명이나 태그로 검색",
  sortLabel: "정렬",
  sortNewest: "최신순",
  sortOldest: "오래된순",
  sortSizeAsc: "용량 낮은 순",
  sortSizeDesc: "용량 높은 순",
  tagAddDone: "태그 추가 완료",
  tagDeleteDone: "태그 삭제 완료",
  trash: "휴지통",
  trashEmptyDone: "휴지통 비우기 완료",
  trashPermanentDeleteDone: "영구 삭제 완료",
  trashRestoreDone: "복원 완료",
};

const STORAGE_REFERENCE_BYTES = 400 * 1024 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 * 1024;

export default function GalleryPage({ username, role, onLogout }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useAutoDismissNotice();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [deletingDuplicates, setDeletingDuplicates] = useState(false);
  const [folderSortOrder, setFolderSortOrder] = useState("newest");
  const [photoSortOrder, setPhotoSortOrder] = useState("newest");
  const [folderSearch, setFolderSearch] = useState("");
  const [photoSearch, setPhotoSearch] = useState("");
  const [renamingFolder, setRenamingFolder] = useState("");
  const [folderToolsOpen, setFolderToolsOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trashPhotos, setTrashPhotos] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState({
    usedBytes: 0,
    limitBytes: STORAGE_REFERENCE_BYTES,
    maxUploadBytes: MAX_UPLOAD_BYTES,
  });

  const visibleFolders = useMemo(() => {
    return sortFolders(filterFolders(folders, folderSearch), folderSortOrder);
  }, [folderSearch, folderSortOrder, folders]);

  const visiblePhotos = useMemo(() => {
    return filterPhotos(photos, photoSearch);
  }, [photoSearch, photos]);

  const sortedPhotos = useMemo(() => {
    return sortPhotosByDate(visiblePhotos, photoSortOrder);
  }, [photoSortOrder, visiblePhotos]);

  const activeFolderStorageUsed = useMemo(() => {
    return folders.reduce((total, folder) => total + Number(folder.totalSize || 0), 0);
  }, [folders]);

  const storageUsed = useMemo(() => {
    return Math.max(Number(storageStatus.usedBytes || 0), activeFolderStorageUsed);
  }, [activeFolderStorageUsed, storageStatus.usedBytes]);

  function showNotice(message, type = "success") {
    setNotice({ message, type });
  }

  function openUploadModal() {
    setMobileMenuOpen(false);
    setUploadModalOpen(true);
  }

  function getUploadSize(files) {
    return Array.from(files || []).reduce((total, file) => total + Number(file.size || 0), 0);
  }

  function validateUploadSize(files) {
    const uploadBytes = getUploadSize(files);
    const maxUploadBytes = Number(storageStatus.maxUploadBytes || MAX_UPLOAD_BYTES);
    const limitBytes = Number(storageStatus.limitBytes || STORAGE_REFERENCE_BYTES);
    const usedBytes = storageUsed;

    if (uploadBytes > maxUploadBytes) {
      throw new Error(`한 번에 업로드할 수 있는 용량은 최대 ${formatBytes(maxUploadBytes)}입니다. 선택한 용량: ${formatBytes(uploadBytes)}`);
    }

    if (usedBytes + uploadBytes > limitBytes) {
      throw new Error(`계정 저장공간 ${formatBytes(limitBytes)}를 초과하여 업로드할 수 없습니다. 현재 사용량: ${formatBytes(usedBytes)}, 업로드 용량: ${formatBytes(uploadBytes)}, 남은 용량: ${formatBytes(Math.max(0, limitBytes - usedBytes))}`);
    }
  }

  async function loadFolders() {
    try {
      const result = await fetchFolders();
      setFolders(result && result.length ? result : []);
    } catch (error) {
      setStatus(`\uD3F4\uB354 \uC870\uD68C \uC624\uB958: ${error.message}`);
    }
  }

  async function loadStorageStatus() {
    try {
      const result = await fetchStorageStatus();
      setStorageStatus({
        usedBytes: Number(result?.usedBytes || 0),
        limitBytes: Number(result?.limitBytes || STORAGE_REFERENCE_BYTES),
        maxUploadBytes: Number(result?.maxUploadBytes || MAX_UPLOAD_BYTES),
      });
    } catch (error) {
      setStatus(`저장공간 조회 오류: ${error.message}`);
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

      validateUploadSize(files);
      setUploading(true);
      setStatus("\uC5C5\uB85C\uB4DC \uC911...");
      await uploadPhotos(folderPath, files, tags);
      setStatus("\uC5C5\uB85C\uB4DC \uC644\uB8CC");
      setUploadModalOpen(false);

      await loadFolders();
      await loadStorageStatus();

      if (selectedFolder === folderPath) {
        await loadPhotos(folderPath);
      } else {
        setSelectedFolder(folderPath);
      }
    } catch (error) {
      setStatus(`\uC5C5\uB85C\uB4DC \uC624\uB958: ${error.message}`);
    } finally {
      setUploading(false);
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
      setMobileMenuOpen(false);
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

  async function loadTrashPhotos() {
    try {
      setTrashLoading(true);
      const result = await fetchTrashPhotos();
      setTrashPhotos(Array.isArray(result) ? result : []);
    } catch (error) {
      showNotice(`휴지통 조회 실패: ${error.message}`, "error");
    } finally {
      setTrashLoading(false);
    }
  }

  async function openTrash() {
    setMobileMenuOpen(false);
    setTrashOpen(true);
    setAdminOpen(false);
    setSelectedFolder(null);
    setPhotos([]);
    setPhotoSearch("");
    setViewerIndex(null);
    await loadTrashPhotos();
  }

  async function handleRestoreTrashPhoto(id) {
    try {
      setTrashLoading(true);
      await restoreTrashPhoto(id);
      showNotice(TEXT.trashRestoreDone);
      await loadTrashPhotos();
      await loadFolders();
      if (selectedFolder) {
        await loadPhotos(selectedFolder);
      }
    } catch (error) {
      showNotice(`복원 실패: ${error.message}`, "error");
    } finally {
      setTrashLoading(false);
    }
  }

  async function handleDeleteTrashPhoto(id) {
    if (!window.confirm("사진을 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      setTrashLoading(true);
      await deleteTrashPhoto(id);
      showNotice(TEXT.trashPermanentDeleteDone);
      await loadTrashPhotos();
      await loadStorageStatus();
    } catch (error) {
      showNotice(`영구 삭제 실패: ${error.message}`, "error");
    } finally {
      setTrashLoading(false);
    }
  }

  async function handleEmptyTrash() {
    if (!window.confirm("휴지통을 비울까요? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      setTrashLoading(true);
      await emptyTrashPhotos();
      setTrashPhotos([]);
      showNotice(TEXT.trashEmptyDone);
      await loadStorageStatus();
    } catch (error) {
      showNotice(`휴지통 비우기 실패: ${error.message}`, "error");
    } finally {
      setTrashLoading(false);
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
    setMobileMenuOpen(false);
    setTrashOpen(false);
    setAdminOpen(false);
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

  function openAdmin() {
    setMobileMenuOpen(false);
    setAdminOpen(true);
    setTrashOpen(false);
    setSelectedFolder(null);
    setPhotos([]);
    setPhotoSearch("");
    setViewerIndex(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function syncFolders() {
      try {
        const [result, storage] = await Promise.all([fetchFolders(), fetchStorageStatus()]);
        if (!cancelled) {
          setFolders(result && result.length ? result : []);
          setStorageStatus({
            usedBytes: Number(storage?.usedBytes || 0),
            limitBytes: Number(storage?.limitBytes || STORAGE_REFERENCE_BYTES),
            maxUploadBytes: Number(storage?.maxUploadBytes || MAX_UPLOAD_BYTES),
          });
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
    <div className="app drive-app">
      {notice && (
        <div className={notice.type === "error" ? "top-notice error" : "top-notice"}>
          {notice.message}
        </div>
      )}

      <div className="drive-shell">
        <aside className="drive-sidebar">
          <div className="drive-brand-row">
            <div className="drive-brand">
              <div className="drive-brand-mark" aria-hidden="true">D</div>
              <strong>{username} 드라이브</strong>
            </div>
            <button
              type="button"
              className="drive-mobile-menu-btn"
              aria-label="menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              <span aria-hidden="true">=</span>
            </button>
          </div>

          {mobileMenuOpen && (
            <button
              type="button"
              className="drive-mobile-menu-backdrop"
              aria-label="close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div className={mobileMenuOpen ? "drive-sidebar-panel open" : "drive-sidebar-panel"}>
          <button
            type="button"
            className="drive-mobile-panel-close"
            aria-label="close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span aria-hidden="true">x</span>
          </button>

          <button type="button" className="drive-new-btn" onClick={openUploadModal}>
            <span aria-hidden="true">+</span>
            {TEXT.photoUpload}
          </button>

          <nav className="drive-nav" aria-label="드라이브 메뉴">
            <button
              type="button"
              className={!selectedFolder && !trashOpen && !adminOpen ? "active" : ""}
              onClick={closeFolder}
            >
              <span aria-hidden="true">⌂</span>
              {TEXT.folderList}
            </button>
            <button type="button" className={trashOpen ? "active" : ""} onClick={openTrash}>
              <span aria-hidden="true">♲</span>
              {TEXT.trash}
            </button>
            <button
              type="button"
              onClick={handleDeleteDuplicates}
              disabled={loadingDuplicates || deletingDuplicates}
            >
              <span aria-hidden="true">≋</span>
              {TEXT.deleteDuplicates}
            </button>
            {role === "ADMIN" && (
              <button type="button" className={adminOpen ? "active" : ""} onClick={openAdmin}>
                <span aria-hidden="true">⚙</span>
                {TEXT.adminMode}
              </button>
            )}
          </nav>

          <div className="drive-storage">
            <div className="drive-storage-label">
              <span>저장용량</span>
              <strong>{formatBytes(storageUsed)}</strong>
            </div>
            <div className="drive-storage-meter" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (storageUsed / Number(storageStatus.limitBytes || STORAGE_REFERENCE_BYTES)) * 100)}%` }} />
            </div>
            <p>총 {formatBytes(storageStatus.limitBytes || STORAGE_REFERENCE_BYTES)} 중 {formatBytes(storageUsed)} 사용</p>
          </div>

          <button type="button" className="drive-logout-btn" onClick={handleLogoutClick}>
            {TEXT.logout}
          </button>
          </div>
        </aside>

        <main className="drive-main">
          <header className="drive-topbar">
            <div className="drive-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="text"
                value={selectedFolder ? photoSearch : folderSearch}
                disabled={trashOpen || adminOpen}
                onChange={(event) => {
                  if (selectedFolder) {
                    setPhotoSearch(event.target.value);
                    setViewerIndex(null);
                  } else {
                    setFolderSearch(event.target.value);
                  }
                }}
                placeholder={adminOpen ? TEXT.adminMode : trashOpen ? TEXT.trash : selectedFolder ? TEXT.photoSearchPlaceholder : TEXT.folderSearchPlaceholder}
              />
            </div>
          </header>

          <section className="drive-content-panel">
            <PhotoStatus status={status} />

            {adminOpen ? (
              <AdminPanel username={username} onNotice={showNotice} />
            ) : trashOpen ? (
              <TrashPage
                photos={trashPhotos}
                loading={trashLoading}
                onDelete={handleDeleteTrashPhoto}
                onEmpty={handleEmptyTrash}
                onRestore={handleRestoreTrashPhoto}
              />
            ) : !selectedFolder ? (
              <GalleryFolderSection
                labels={TEXT}
                folders={visibleFolders}
                folderSortOrder={folderSortOrder}
                searchText={folderSearch}
                toolsOpen={folderToolsOpen}
                deletingDuplicates={deletingDuplicates}
                loadingDuplicates={loadingDuplicates}
                onDeleteDuplicates={handleDeleteDuplicates}
                onDeleteFolder={handleDeleteFolder}
                onOpenFolder={setSelectedFolder}
                onOpenTrash={openTrash}
                onRenameFolder={setRenamingFolder}
                onReorderFolders={handleReorderFolders}
                onSearchChange={setFolderSearch}
                onSortChange={setFolderSortOrder}
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
          </section>
        </main>

        <button type="button" className="mobile-upload-fab" aria-label="upload photo" onClick={openUploadModal}>
          <span aria-hidden="true">+</span>
        </button>

        {uploadModalOpen && (
          <UploadModal
            key={selectedFolder || "folder-list-upload"}
            open={uploadModalOpen}
            uploading={uploading}
            onClose={() => {
              if (!uploading) setUploadModalOpen(false);
            }}
            onUpload={handleUpload}
            defaultFolder={selectedFolder || ""}
          />
        )}

        <UploadProgressOverlay open={uploading} />

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

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}


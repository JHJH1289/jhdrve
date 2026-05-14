import { memo, useCallback, useRef, useState } from "react";
import AuthImage from "./AuthImage";
import { formatShortDate } from "../utils/photoCollection";

const TEXT = {
  delete: "\uC0AD\uC81C",
  empty: "\uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  menu: "\uD3F4\uB354 \uBA54\uB274",
  rename: "\uC774\uB984 \uBCC0\uACBD",
};

export default function FolderGrid({ folders, onOpenFolder, onReorder, onDeleteFolder, onRenameFolder }) {
  const [draggingPath, setDraggingPath] = useState("");
  const [openMenuPath, setOpenMenuPath] = useState("");
  const suppressClickRef = useRef(false);

  const closeMenu = useCallback(() => {
    setOpenMenuPath("");
  }, []);

  const toggleMenu = useCallback((folderPath) => {
    setOpenMenuPath((currentPath) => (
      currentPath === folderPath ? "" : folderPath
    ));
  }, []);

  const handleDrop = useCallback((targetPath) => {
    if (!draggingPath || draggingPath === targetPath) {
      setDraggingPath("");
      return;
    }

    const fromIndex = folders.findIndex((folder) => folder.folderPath === draggingPath);
    const toIndex = folders.findIndex((folder) => folder.folderPath === targetPath);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingPath("");
      return;
    }

    const nextFolders = [...folders];
    const [movedFolder] = nextFolders.splice(fromIndex, 1);
    nextFolders.splice(toIndex, 0, movedFolder);
    setDraggingPath("");
    onReorder(nextFolders);
  }, [draggingPath, folders, onReorder]);

  if (!folders || folders.length === 0) {
    return <p>{TEXT.empty}</p>;
  }

  return (
    <div className="folder-grid" onClick={closeMenu}>
      {folders.map((folder) => (
        <FolderItem
          key={folder.folderPath}
          folder={folder}
          isDragging={draggingPath === folder.folderPath}
          isMenuOpen={openMenuPath === folder.folderPath}
          onCloseMenu={closeMenu}
          onDeleteFolder={onDeleteFolder}
          onDropFolder={handleDrop}
          onOpenFolder={onOpenFolder}
          onRenameFolder={onRenameFolder}
          onSetDraggingPath={setDraggingPath}
          onToggleMenu={toggleMenu}
          suppressClickRef={suppressClickRef}
        />
      ))}
    </div>
  );
}

const FolderItem = memo(function FolderItem({
  folder,
  isDragging,
  isMenuOpen,
  onCloseMenu,
  onDeleteFolder,
  onDropFolder,
  onOpenFolder,
  onRenameFolder,
  onSetDraggingPath,
  onToggleMenu,
  suppressClickRef,
}) {
  function openFolder() {
    if (suppressClickRef.current) return;
    onCloseMenu();
    onOpenFolder(folder.folderPath);
  }

  return (
    <div
      className={[
        "folder-card",
        isDragging ? "dragging" : "",
        "manageable",
      ].filter(Boolean).join(" ")}
      draggable
      onDragStart={(event) => {
        suppressClickRef.current = true;
        onSetDraggingPath(folder.folderPath);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", folder.folderPath);
      }}
      onDragEnd={() => {
        onSetDraggingPath("");
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropFolder(folder.folderPath);
      }}
    >
      <button
        type="button"
        className="folder-open-btn"
        onClick={openFolder}
      >
        <div className="folder-preview-stack" aria-hidden="true">
          {buildPreviewSlots(folder.previewImageUrls).map((imageUrl, index) => (
            <div className={`folder-preview-frame frame-${index + 1}`} key={`${folder.folderPath}-${index}`}>
              {imageUrl && (
                <AuthImage
                  className="folder-preview-image"
                  src={imageUrl}
                  alt=""
                />
              )}
            </div>
          ))}
        </div>
      </button>

      <div className="folder-meta">
        <div className="folder-card-top">
          <button
            type="button"
            className="folder-title-btn"
            onClick={openFolder}
          >
            <span className="folder-name">{folder.folderPath}</span>
          </button>
          <div
            className="folder-menu-wrap"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={isMenuOpen ? "folder-menu-btn active" : "folder-menu-btn"}
              aria-label={TEXT.menu}
              aria-expanded={isMenuOpen}
              onClick={() => onToggleMenu(folder.folderPath)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>

            {isMenuOpen && (
              <div className="folder-menu" role="menu">
                <button
                  type="button"
                  className="folder-menu-item"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu();
                    onRenameFolder(folder.folderPath);
                  }}
                >
                  {TEXT.rename}
                </button>
                <button
                  type="button"
                  className="folder-menu-item danger"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu();
                    onDeleteFolder(folder.folderPath);
                  }}
                >
                  {TEXT.delete}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="folder-date">{formatShortDate(folder.updatedAt)}</div>
        {Array.isArray(folder.tags) && folder.tags.length > 0 && (
          <div className="folder-tags">
            {folder.tags.slice(0, 4).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

function buildPreviewSlots(previewImageUrls = []) {
  if (previewImageUrls.length === 0) {
    return ["", "", ""];
  }

  return [0, 1, 2].map((index) => previewImageUrls[index % previewImageUrls.length]);
}


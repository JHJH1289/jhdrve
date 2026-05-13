import { useRef, useState } from "react";
import AuthImage from "./AuthImage";

const TEXT = {
  delete: "\uC0AD\uC81C",
  empty: "\uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  rename: "\uC774\uB984 \uBCC0\uACBD",
};

export default function FolderGrid({ folders, onOpenFolder, onReorder, onDeleteFolder, onRenameFolder }) {
  const [draggingPath, setDraggingPath] = useState("");
  const suppressClickRef = useRef(false);

  if (!folders || folders.length === 0) {
    return <p>{TEXT.empty}</p>;
  }

  function handleDrop(targetPath) {
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
  }

  return (
    <div className="folder-grid">
      {folders.map((folder) => {
        return (
          <div
            key={folder.folderPath}
            className={[
              "folder-card",
              draggingPath === folder.folderPath ? "dragging" : "",
              "manageable",
            ].filter(Boolean).join(" ")}
            draggable
            onDragStart={(event) => {
              suppressClickRef.current = true;
              setDraggingPath(folder.folderPath);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", folder.folderPath);
            }}
            onDragEnd={() => {
              setDraggingPath("");
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
              handleDrop(folder.folderPath);
            }}
          >
            <button
              type="button"
              className="folder-open-btn"
              onClick={() => {
                if (suppressClickRef.current) return;
                onOpenFolder(folder.folderPath);
              }}
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
              <div className="folder-card-top">
                <div className="folder-name">{folder.folderPath}</div>
              </div>
              <div className="folder-date">{formatDate(folder.updatedAt)}</div>
            </button>

            <div className="folder-actions">
              <button
                type="button"
                className="folder-manage-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onRenameFolder(folder.folderPath);
                }}
              >
                {TEXT.rename}
              </button>
              <button
                type="button"
                className="folder-manage-btn danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteFolder(folder.folderPath);
                }}
              >
                {TEXT.delete}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildPreviewSlots(previewImageUrls = []) {
  if (previewImageUrls.length === 0) {
    return ["", "", ""];
  }

  return [0, 1, 2].map((index) => previewImageUrls[index % previewImageUrls.length]);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

import { useRef, useState } from "react";

const DEFAULT_FOLDER = "\uAE30\uBCF8";
const TEXT = {
  delete: "\uC0AD\uC81C",
  empty: "\uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  modifiedAt: "\uCD5C\uC885 \uC218\uC815",
};

export default function FolderGrid({ folders, onOpenFolder, onReorder, onDeleteFolder }) {
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
        const canDelete = folder.folderPath !== DEFAULT_FOLDER && Number(folder.photoCount) === 0;

        return (
          <div
            key={folder.folderPath}
            className={[
              "folder-card",
              draggingPath === folder.folderPath ? "dragging" : "",
              canDelete ? "deletable" : "",
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
              <div className="folder-card-top">
                <div className="folder-icon" aria-hidden="true">{"\uD83D\uDCC1"}</div>
                <div className="folder-name">{folder.folderPath}</div>
              </div>
              <div className="folder-date">
                {TEXT.modifiedAt} {formatDate(folder.updatedAt)}
              </div>
            </button>

            {canDelete && (
              <button
                type="button"
                className="folder-delete-btn"
                aria-label={`${folder.folderPath} ${TEXT.delete}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteFolder(folder.folderPath);
                }}
              >
                {TEXT.delete}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

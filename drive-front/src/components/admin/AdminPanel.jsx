import { useEffect, useMemo, useState } from "react";
import { deleteAdminFolder, fetchAdminFolders } from "../../api/photoApi";
import AdminFolderList from "./AdminFolderList";

const TEXT = {
  account: "계정",
  delete: "삭제",
  deleteConfirm: "폴더와 폴더 안의 사진을 모두 삭제할까요?",
  empty: "폴더가 없습니다.",
  loadError: "폴더 조회 오류",
  title: "관리자 폴더 관리",
};

export default function AdminPanel({ username, onNotice }) {
  const [folders, setFolders] = useState([]);
  const [status, setStatus] = useState("");

  const groupedFolders = useMemo(() => {
    return folders.reduce((groups, folder) => {
      const ownerId = folder.ownerId || "알 수 없음";
      if (!groups[ownerId]) groups[ownerId] = [];
      groups[ownerId].push(folder);
      return groups;
    }, {});
  }, [folders]);

  async function loadFolders() {
    try {
      setStatus("");
      const result = await fetchAdminFolders();
      setFolders(result);
    } catch (error) {
      setStatus(`${TEXT.loadError}: ${error.message}`);
    }
  }

  async function handleDeleteFolder(folder) {
    if (!window.confirm(`'${folder.ownerId}/${folder.folderPath}' ${TEXT.deleteConfirm}`)) return;

    try {
      await deleteAdminFolder(folder.ownerId, folder.folderPath);
      onNotice(`'${folder.ownerId}/${folder.folderPath}' 폴더를 삭제했습니다.`);
      await loadFolders();
    } catch (error) {
      onNotice(`폴더 삭제 실패: ${error.message}`, "error");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function syncFolders() {
      try {
        setStatus("");
        const result = await fetchAdminFolders();
        if (!cancelled) {
          setFolders(result);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(`${TEXT.loadError}: ${error.message}`);
        }
      }
    }

    syncFolders();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2>{TEXT.title}</h2>
          <p>{TEXT.account}: {username}</p>
        </div>
        <span>{folders.length}개 폴더</span>
      </div>

      {status && <div className="status-box">{status}</div>}

      <AdminFolderList
        labels={TEXT}
        folders={folders}
        groupedFolders={groupedFolders}
        status={status}
        onDeleteFolder={handleDeleteFolder}
      />
    </div>
  );
}

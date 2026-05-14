import { useEffect, useMemo, useState } from "react";
import { deleteAdminFolder, fetchAdminFolders } from "../api/photoApi";
import AdminFolderList from "../components/admin/AdminFolderList";
import { useAutoDismissNotice } from "../hooks/useAutoDismissNotice";

const TEXT = {
  account: "\uACC4\uC815",
  appTitle: "\uAD00\uB9AC\uC790 \uD3F4\uB354 \uAD00\uB9AC",
  delete: "\uC0AD\uC81C",
  deleteConfirm: "\uD3F4\uB354\uC640 \uD3F4\uB354 \uC548\uC758 \uC0AC\uC9C4\uC744 \uBAA8\uB450 \uC0AD\uC81C\uD560\uAE4C\uC694?",
  empty: "\uD3F4\uB354\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
  galleryMode: "\uAC24\uB7EC\uB9AC\uB85C",
  logout: "\uB85C\uADF8\uC544\uC6C3",
};

export default function AdminPage({ username, onBackToGallery, onLogout }) {
  const [folders, setFolders] = useState([]);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useAutoDismissNotice();

  const groupedFolders = useMemo(() => {
    return folders.reduce((groups, folder) => {
      const ownerId = folder.ownerId || "\uC54C \uC218 \uC5C6\uC74C";
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
      setStatus(`\uD3F4\uB354 \uC870\uD68C \uC624\uB958: ${error.message}`);
    }
  }

  async function handleDeleteFolder(folder) {
    if (!window.confirm(`'${folder.ownerId}/${folder.folderPath}' ${TEXT.deleteConfirm}`)) return;

    try {
      await deleteAdminFolder(folder.ownerId, folder.folderPath);
      setNotice(`'${folder.ownerId}/${folder.folderPath}' \uD3F4\uB354\uB97C \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`);
      await loadFolders();
    } catch (error) {
      setNotice(`\uD3F4\uB354 \uC0AD\uC81C \uC2E4\uD328: ${error.message}`);
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
          setStatus(`\uD3F4\uB354 \uC870\uD68C \uC624\uB958: ${error.message}`);
        }
      }
    }

    syncFolders();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      {notice && <div className="top-notice">{notice}</div>}

      <div className="wrap">
        <div className="top-bar">
          <div>
            <h1>{TEXT.appTitle}</h1>
            <p className="subtitle">{TEXT.account}: {username}</p>
          </div>

          <div className="user-box">
            <button type="button" className="secondary-btn" onClick={onBackToGallery}>
              {TEXT.galleryMode}
            </button>
            <button type="button" onClick={onLogout}>
              {TEXT.logout}
            </button>
          </div>
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
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { fetchSharedFolder, getSharedFolderDownloadUrl } from "../api/shareApi";

const TEXT = {
  downloadZip: "ZIP \uB2E4\uC6B4",
  empty: "\uACF5\uC720\uB41C \uC0AC\uC9C4\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
  loading: "\uACF5\uC720 \uD3F4\uB354\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...",
  notFound: "\uACF5\uC720 \uB9C1\uD06C\uB97C \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  photoUnit: "\uC7A5",
  sharedFolder: "\uACF5\uC720 \uD3F4\uB354",
};

export default function SharedFolderPage({ token }) {
  const [folder, setFolder] = useState(null);
  const [status, setStatus] = useState(TEXT.loading);
  const downloadUrl = useMemo(() => getSharedFolderDownloadUrl(token), [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadSharedFolder() {
      try {
        setStatus(TEXT.loading);
        const result = await fetchSharedFolder(token);
        if (!cancelled) {
          setFolder(result);
          setStatus("");
        }
      } catch {
        if (!cancelled) {
          setFolder(null);
          setStatus(TEXT.notFound);
        }
      }
    }

    loadSharedFolder();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="shared-page">
      <main className="shared-shell">
        <header className="shared-topbar">
          <div className="shared-brand">
            <div className="drive-brand-mark" aria-hidden="true">D</div>
            <strong>hundoc<span>ter</span></strong>
          </div>
          <span className="shared-link-label">{TEXT.sharedFolder}</span>
        </header>

        <section className="shared-panel">
          <div className="shared-header">
            <div className="shared-title-block">
              <span>{TEXT.sharedFolder}</span>
              <h1>{folder?.folderPath || ""}</h1>
              {folder?.photos?.length > 0 && (
                <p>{folder.photos.length}{TEXT.photoUnit}</p>
              )}
            </div>
            {folder?.photos?.length > 0 && (
              <a className="shared-download-btn" href={downloadUrl}>
                {TEXT.downloadZip}
              </a>
            )}
          </div>

          {status && <p className="shared-status">{status}</p>}

          {folder && folder.photos.length === 0 && (
            <p className="shared-status">{TEXT.empty}</p>
          )}

          {folder?.photos?.length > 0 && (
            <div className="shared-photo-grid">
              {folder.photos.map((photo) => (
                <a className="shared-photo-card" key={photo.id} href={photo.imageUrl} target="_blank" rel="noreferrer">
                  <img src={photo.thumbnailUrl || photo.imageUrl} alt={photo.originalName} />
                  <span>{photo.originalName}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

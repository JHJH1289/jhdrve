import { useState } from "react";
import GalleryPage from "./pages/GalleryPage";
import LoginPage from "./pages/LoginPage";
import SharedFolderPage from "./pages/SharedFolderPage";

export default function App() {
  const shareToken = getShareToken();
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const role = localStorage.getItem("role") || "USER";
    return token && savedUsername ? { username: savedUsername, role } : null;
  });

  if (shareToken) {
    return <SharedFolderPage token={shareToken} />;
  }

  function handleLoginSuccess(nextSession) {
    setSession(nextSession);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setSession(null);
  }

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <GalleryPage
      username={session.username}
      role={session.role}
      onLogout={handleLogout}
    />
  );
}

function getShareToken() {
  const match = window.location.pathname.match(/^\/share\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

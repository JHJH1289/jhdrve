import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const role = localStorage.getItem("role") || "USER";
    return token && savedUsername ? { username: savedUsername, role } : null;
  });

  function handleLoginSuccess(nextSession) {
    setAdminMode(false);
    setSession(nextSession);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setAdminMode(false);
    setSession(null);
  }

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (session.role === "ADMIN" && adminMode) {
    return (
      <AdminPage
        username={session.username}
        onBackToGallery={() => setAdminMode(false)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <GalleryPage
      username={session.username}
      role={session.role}
      onOpenAdmin={() => setAdminMode(true)}
      onLogout={handleLogout}
    />
  );
}

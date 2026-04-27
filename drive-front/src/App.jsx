import { useEffect, useState } from "react";
import GalleryPage from "./pages/GalleryPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (token && savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  function handleLoginSuccess(nextUsername) {
    setUsername(nextUsername);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
  }

  if (!username) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <GalleryPage username={username} onLogout={handleLogout} />;
}
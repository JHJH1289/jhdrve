import { useEffect, useState } from "react";

export default function AuthImage({ src, alt, className }) {
  const [objectUrl, setObjectUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) {
      setObjectUrl("");
      setFailed(true);
      return;
    }

    let cancelled = false;
    let currentUrl = "";

    async function loadImage() {
      try {
        setFailed(false);

        const token = localStorage.getItem("token") || "";
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(src, { headers });

        if (!response.ok) {
          throw new Error("이미지 로드 실패");
        }

        const blob = await response.blob();
        const nextUrl = URL.createObjectURL(blob);

        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }

        currentUrl = nextUrl;
        setObjectUrl(nextUrl);
      } catch (error) {
        if (!cancelled) {
          setFailed(true);
          setObjectUrl("");
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [src]);

  if (failed || !objectUrl) {
    return <div className={className} style={{ background: "#eee" }} />;
  }

  return <img src={objectUrl} alt={alt} className={className} />;
}
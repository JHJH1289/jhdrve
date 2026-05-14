import { useEffect, useState } from "react";

export function useAutoDismissNotice(duration = 2500) {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(null), duration);
    return () => window.clearTimeout(timer);
  }, [duration, notice]);

  return [notice, setNotice];
}

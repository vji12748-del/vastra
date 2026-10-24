// Reactive mobile detection — phone/tablet par heavy media (autoplay videos)
// ki jagah halki poster images ke liye. SSR-safe, listens to orientation changes.
import { useEffect, useState } from "react";

const QUERY = "(max-width: 768px)";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

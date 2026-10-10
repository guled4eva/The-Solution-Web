import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * On every page change: scroll to the top and move keyboard/screen-reader
 * focus to the main content, so navigation feels like a normal page load.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById("hovedinnhold");
    if (main) main.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

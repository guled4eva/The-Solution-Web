import { useEffect } from "react";

const DEFAULT_TITLE = "The Solution | Bioteknologi og kjemi – OsloMet";

/** Sets the browser tab title for a page. Pass nothing for the default title. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | The Solution` : DEFAULT_TITLE;
  }, [title]);
}

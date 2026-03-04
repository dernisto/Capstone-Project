import { useEffect, useState } from "react";
import { DEMO_AUTH_EVENT_NAME, isDemoLoggedIn } from "./demoAuth";

export function useDemoAuth() {
  const [loggedIn, setLoggedIn] = useState(() => isDemoLoggedIn());

  useEffect(() => {
    const sync = () => setLoggedIn(isDemoLoggedIn());

    // Same-tab changes (we dispatch a custom event)
    window.addEventListener(DEMO_AUTH_EVENT_NAME, sync);
    // Cross-tab changes
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(DEMO_AUTH_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { loggedIn };
}


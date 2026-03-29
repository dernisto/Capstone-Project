import { useEffect, useState } from "react";
import { DEMO_AUTH_EVENT_NAME, isDemoLoggedIn } from "./demoAuth";
function useDemoAuth() {
  const [loggedIn, setLoggedIn] = useState(() => isDemoLoggedIn());
  useEffect(() => {
    const sync = () => setLoggedIn(isDemoLoggedIn());
    window.addEventListener(DEMO_AUTH_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_AUTH_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { loggedIn };
}
export {
  useDemoAuth
};

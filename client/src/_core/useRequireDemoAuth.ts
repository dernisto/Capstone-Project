import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDemoAuth } from "./useDemoAuth";

export function useRequireDemoAuth(redirectPath = "/login") {
  const { loggedIn } = useDemoAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loggedIn) {
      navigate(redirectPath);
    }
  }, [loggedIn, navigate, redirectPath]);

  return { loggedIn };
}


export const DEMO_AUTH_STORAGE_KEY = "quizpulse59_logged_in";
export const DEMO_AUTH_EVENT_NAME = "quizpulse59-demoauth";

export function isDemoLoggedIn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_AUTH_STORAGE_KEY) === "true";
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT_NAME));
}

export function demoLogin() {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_AUTH_STORAGE_KEY, "true");
  notifyAuthChanged();
}

export function demoLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
  notifyAuthChanged();
}

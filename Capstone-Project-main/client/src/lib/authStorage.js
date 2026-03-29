const TOKEN_KEY = "quizpulse_token";
const USER_KEY = "quizpulse_user";
function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function setStoredUser(u) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}
export {
  TOKEN_KEY,
  USER_KEY,
  getStoredUser,
  setStoredUser
};

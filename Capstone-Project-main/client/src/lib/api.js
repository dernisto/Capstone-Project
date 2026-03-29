const API_BASE = import.meta.env.VITE_API_BASE ?? "";
function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("quizpulse_token") : null;
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
async function authFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
}
export {
  authFetch,
  getAuthHeaders
};

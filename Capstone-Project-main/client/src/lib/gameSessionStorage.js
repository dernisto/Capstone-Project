import { nanoid } from "nanoid";
const STABLE_PLAYER_ID = "quizpulse_player_id";
const PLAYER_KEY = "quizpulse_player_session";
const HOST_KEY = "quizpulse_host_session";
const GAME_PIN_LS = "quizpulse_game_pin";
function getOrCreatePlayerId() {
  try {
    let id = localStorage.getItem(STABLE_PLAYER_ID);
    if (!id) {
      id = nanoid(12);
      localStorage.setItem(STABLE_PLAYER_ID, id);
    }
    return id;
  } catch {
    return `p-${Date.now()}`;
  }
}
function persistGamePin(pin) {
  try {
    localStorage.setItem(GAME_PIN_LS, normalizeClientPin(pin));
  } catch {
  }
}
function readGamePin() {
  try {
    return normalizeClientPin(localStorage.getItem(GAME_PIN_LS) || "");
  } catch {
    return "";
  }
}
function normalizeClientPin(pin) {
  return (pin || "").toString().trim().toUpperCase().replace(/[\s-]+/g, "");
}
function persistPlayerSession(pin, playerName, playerId) {
  try {
    const id = playerId || getOrCreatePlayerId();
    sessionStorage.setItem(
      PLAYER_KEY,
      JSON.stringify({
        pin: normalizeClientPin(pin),
        playerName: (playerName || "").trim() || "Guest",
        playerId: id
      })
    );
    persistGamePin(pin);
  } catch {
  }
}
function readPlayerSession() {
  try {
    const raw = sessionStorage.getItem(PLAYER_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p?.pin) return null;
    return {
      pin: normalizeClientPin(p.pin),
      playerName: (p.playerName || "").trim() || "Guest",
      playerId: p.playerId || getOrCreatePlayerId()
    };
  } catch {
    return null;
  }
}
function clearPlayerSession() {
  try {
    sessionStorage.removeItem(PLAYER_KEY);
    localStorage.removeItem(GAME_PIN_LS);
  } catch {
  }
}
function persistHostSession(pin) {
  try {
    sessionStorage.setItem(
      HOST_KEY,
      JSON.stringify({ pin: normalizeClientPin(pin) })
    );
  } catch {
  }
}
function readHostSession() {
  try {
    const raw = sessionStorage.getItem(HOST_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p?.pin) return null;
    return { pin: normalizeClientPin(p.pin) };
  } catch {
    return null;
  }
}
export {
  clearPlayerSession,
  getOrCreatePlayerId,
  normalizeClientPin,
  persistGamePin,
  persistHostSession,
  persistPlayerSession,
  readGamePin,
  readHostSession,
  readPlayerSession
};

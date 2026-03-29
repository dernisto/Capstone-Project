import {
  normalizeGamePin,
  setSessionIo,
  startGameSession,
  recordPlayerAnswer,
  getResultsForSocket,
  getLiveLeaderboard,
  removePlayerFromGameSession,
  sendSessionStateToSocket,
  tryResumeDisconnectedPlayer
} from "../gameSessionStore";
const MAX_CHAT_MESSAGES_PER_ROOM = 100;
const MAX_MESSAGE_LENGTH = 500;
const MAX_NAME = 40;
const lobbyByPin = /* @__PURE__ */ new Map();
function getLobbyKey(pin) {
  return normalizeGamePin(pin);
}
function getLobby(pin) {
  const key = getLobbyKey(pin);
  if (!lobbyByPin.has(key)) lobbyByPin.set(key, []);
  return lobbyByPin.get(key);
}
function addToLobby(pin, playerName, socketId) {
  const list = getLobby(pin);
  const existing = list.find((p) => p.socketId === socketId);
  if (existing) {
    existing.playerName = playerName;
    return;
  }
  list.push({ playerName, socketId });
}
function removeFromLobby(pin, socketId) {
  const key = getLobbyKey(pin);
  const list = lobbyByPin.get(key);
  if (!list) return;
  const idx = list.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) list.splice(idx, 1);
  if (list.length === 0) lobbyByPin.delete(key);
}
function broadcastLobby(io, pin) {
  const key = getLobbyKey(pin);
  const list = lobbyByPin.get(key) ?? [];
  io.to(key).emit("lobby-state", { players: list.map((p) => ({ ...p })) });
}
function leavePreviousGameRoom(io, socket, newPinKey) {
  const prev = socket.data.gamePin;
  if (!prev) return;
  const prevKey = getLobbyKey(prev);
  if (prevKey === newPinKey) return;
  socket.leave(prevKey);
  if (socket.data.role === "player") {
    removeFromLobby(prev, socket.id);
    broadcastLobby(io, prev);
  }
}
function resolveLobbyName(incoming, existing, socketId) {
  if (existing?.playerName) return existing.playerName;
  const t = incoming.trim().slice(0, MAX_NAME);
  if (t.length >= 1 && !/^host$/i.test(t) && !/^player$/i.test(t)) return t;
  return `Guest\xB7${socketId.slice(-4).toUpperCase()}`;
}
const chatStore = /* @__PURE__ */ new Map();
function getRoomMessages(gamePin) {
  const key = getLobbyKey(gamePin);
  if (!chatStore.has(key)) chatStore.set(key, []);
  return chatStore.get(key);
}
function appendMessage(gamePin, username, message) {
  const list = getRoomMessages(gamePin);
  const entry = { username, message: message.trim(), timestamp: Date.now() };
  list.push(entry);
  if (list.length > MAX_CHAT_MESSAGES_PER_ROOM) list.shift();
  return entry;
}
function lobbyLeaderboardOnly(pin) {
  const key = getLobbyKey(pin);
  const lobby = lobbyByPin.get(key) ?? [];
  return lobby.map((lp, i) => ({
    rank: i + 1,
    socketId: lp.socketId,
    name: lp.playerName,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0
  }));
}
function registerGameHandlers(io) {
  setSessionIo(io);
  io.on("connection", (socket) => {
    socket.on("join-game", (gamePin) => {
      const pin = normalizeGamePin(gamePin);
      if (!pin) return;
      const key = getLobbyKey(pin);
      leavePreviousGameRoom(io, socket, key);
      socket.data.gamePin = pin;
      socket.data.playerName = "Host";
      socket.data.role = "host";
      socket.join(key);
      broadcastLobby(io, pin);
    });
    socket.on(
      "student-join",
      (payload) => {
        const pin = normalizeGamePin(payload?.gamePin || "");
        if (!pin) return;
        const key = getLobbyKey(pin);
        leavePreviousGameRoom(io, socket, key);
        const list = getLobby(pin);
        const existing = list.find((p) => p.socketId === socket.id);
        const playerName = resolveLobbyName(
          (payload?.playerName || "").toString(),
          existing,
          socket.id
        );
        socket.data.gamePin = pin;
        socket.data.playerName = playerName;
        socket.data.role = "player";
        socket.join(key);
        addToLobby(pin, playerName, socket.id);
        tryResumeDisconnectedPlayer(pin, playerName, socket.id);
        io.to(key).emit("student-joined", {
          playerName,
          socketId: socket.id
        });
        broadcastLobby(io, pin);
        sendSessionStateToSocket(socket, pin);
        const live = getLiveLeaderboard(pin);
        if (live) {
          io.to(key).emit("leaderboard-update", {
            gamePin: key,
            leaderboard: live
          });
        } else {
          io.to(key).emit("leaderboard-update", {
            gamePin: key,
            leaderboard: lobbyLeaderboardOnly(pin)
          });
        }
      }
    );
    socket.on(
      "host-start-quiz",
      (payload) => {
        const pin = normalizeGamePin(
          payload?.gamePin || socket.data.gamePin || ""
        );
        if (!pin || socket.data.role !== "host") return;
        const raw = payload?.questions;
        if (!raw?.length) return;
        const questions = raw.filter((q) => q.text?.trim() && Array.isArray(q.options) && q.options.length > 0).map((q, i) => ({
          id: q.id ?? i + 1,
          text: (q.text || "").trim(),
          options: q.options.map((o) => String(o)),
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
          timeLimit: Math.max(5, Math.min(120, q.timeLimit ?? 30))
        }));
        if (!questions.length) return;
        const lobby = lobbyByPin.get(getLobbyKey(pin)) ?? [];
        const started = startGameSession(
          pin,
          (payload.quizTitle || "").trim() || "Live Quiz",
          questions,
          lobby.map((p) => ({ socketId: p.socketId, playerName: p.playerName }))
        );
        if (!started.ok) return;
        const key = getLobbyKey(pin);
        io.in(key).fetchSockets().then((socks) => {
          for (const s of socks) {
            if (s.data.role === "player") {
              s.emit("quiz-started", { gamePin: pin });
            }
          }
        });
      }
    );
    socket.on("sync-game", (payload) => {
      const pin = normalizeGamePin(payload?.gamePin || "");
      if (!pin) return;
      sendSessionStateToSocket(socket, pin);
    });
    socket.on(
      "player-answer",
      (payload) => {
        const pin = normalizeGamePin(
          payload?.gamePin || socket.data.gamePin || ""
        );
        if (!pin || socket.data.role !== "player") return;
        const idx = typeof payload?.selectedIndex === "number" ? payload.selectedIndex : -1;
        const result = recordPlayerAnswer(pin, socket.id, idx);
        if (result.ok) {
          socket.emit("answer-recorded", {
            correct: result.correct,
            points: result.points,
            streak: result.streak,
            speedTier: result.speedTier,
            basePoints: result.basePoints,
            speedBonus: result.speedBonus,
            streakBonus: result.streakBonus
          });
        } else {
          socket.emit("answer-rejected", { reason: result.error });
        }
      }
    );
    socket.on(
      "kick-player",
      (payload) => {
        const pin = normalizeGamePin(
          payload?.gamePin || socket.data.gamePin || ""
        );
        if (!pin || socket.data.role !== "host") return;
        const key = getLobbyKey(pin);
        const list = lobbyByPin.get(key);
        if (!list) return;
        const targetSocketId = payload?.socketId ?? list.find((p) => p.playerName === payload?.playerName)?.socketId;
        if (!targetSocketId) return;
        removeFromLobby(pin, targetSocketId);
        removePlayerFromGameSession(pin, targetSocketId);
        broadcastLobby(io, pin);
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit("you-were-kicked", { gamePin: pin });
          targetSocket.leave(key);
        }
        const live = getLiveLeaderboard(pin);
        io.to(key).emit("leaderboard-update", {
          gamePin: key,
          leaderboard: live ?? lobbyLeaderboardOnly(pin)
        });
      }
    );
    socket.on("get-results", (payload) => {
      const pin = normalizeGamePin(payload?.gamePin || "");
      if (!pin) return;
      const data = getResultsForSocket(pin, socket.id);
      if (data) {
        socket.emit("results-data", {
          leaderboard: data.leaderboard,
          participantCount: data.leaderboard.length,
          userResult: data.userResult
        });
        return;
      }
      socket.emit("results-data", {
        leaderboard: [],
        participantCount: 0,
        userResult: null
      });
    });
    socket.on(
      "chat-message",
      (payload) => {
        const pin = normalizeGamePin(
          payload?.gamePin || socket.data.gamePin || ""
        );
        const raw = (payload?.message ?? "").toString().trim();
        if (!pin || !raw || raw.length > MAX_MESSAGE_LENGTH) return;
        const username = socket.data.playerName || "Host";
        const entry = appendMessage(pin, username, raw);
        io.to(getLobbyKey(pin)).emit("chat-message", entry);
      }
    );
    socket.on("disconnect", () => {
      const pin = (socket.data?.gamePin || "").toString();
      if (!pin) return;
      if (socket.data.role === "player") {
        removeFromLobby(pin, socket.id);
        broadcastLobby(io, pin);
        const live = getLiveLeaderboard(pin);
        if (live) {
          io.to(getLobbyKey(pin)).emit("leaderboard-update", {
            gamePin: getLobbyKey(pin),
            leaderboard: live
          });
        }
      }
    });
  });
}
export {
  registerGameHandlers
};

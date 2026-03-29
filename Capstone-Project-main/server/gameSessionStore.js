function normalizeGamePin(pin) {
  return (pin || "").toString().trim().toUpperCase().replace(/[\s-]+/g, "");
}
const sessions = /* @__PURE__ */ new Map();
let ioRef = null;
function setSessionIo(io) {
  ioRef = io;
}
function clearTimers(s) {
  if (s.questionTimer) {
    clearTimeout(s.questionTimer);
    s.questionTimer = null;
  }
  if (s.leaderboardTimer) {
    clearTimeout(s.leaderboardTimer);
    s.leaderboardTimer = null;
  }
}
function computeKahootQuestionScore(correct, responseTimeMs, streakAfterCorrect) {
  if (!correct) {
    return { total: 0, basePoints: 0, speedBonus: 0, streakBonus: 0 };
  }
  const timeTakenSec = responseTimeMs / 1e3;
  const basePoints = 500;
  const speedBonus = Math.max(0, Math.round(500 - timeTakenSec * 10));
  const streakBonus = streakAfterCorrect * 50;
  return {
    total: basePoints + speedBonus + streakBonus,
    basePoints,
    speedBonus,
    streakBonus
  };
}
function buildLeaderboardRows(session) {
  const now = Date.now();
  const rows = session.participantIds.map((id) => {
    const p = session.players.get(id);
    const name = p?.name ?? "Unknown";
    let correct = 0;
    for (let i = 0; i < session.questions.length; i++) {
      if (p?.answers[i]?.correct) correct++;
    }
    return {
      rank: 0,
      userId: id,
      username: name,
      socketId: id,
      name,
      score: p?.totalScore ?? 0,
      streak: p?.streak ?? 0,
      correctAnswers: correct,
      totalQuestions: session.questions.length,
      lastUpdated: now
    };
  });
  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  let lastScore = null;
  let lastRank = 0;
  rows.forEach((r, i) => {
    if (lastScore !== null && r.score === lastScore) {
      r.rank = lastRank;
    } else {
      r.rank = i + 1;
      lastRank = r.rank;
      lastScore = r.score;
    }
  });
  return rows;
}
function emitToPin(pin, event, payload) {
  if (!ioRef) return;
  ioRef.to(normalizeGamePin(pin)).emit(event, payload);
}
function broadcastSessionState(pin, session) {
  const key = normalizeGamePin(pin);
  const base = {
    gamePin: key,
    phase: session.phase,
    quizTitle: session.quizTitle,
    questionCount: session.questions.length
  };
  if (session.phase === "question" && session.questions.length > 0) {
    const q = session.questions[session.currentQuestionIndex];
    if (!q) return;
    const endsAt = session.questionStartedAt + q.timeLimit * 1e3;
    const payload = {
      ...base,
      questionIndex: session.currentQuestionIndex,
      question: {
        text: q.text,
        options: q.options,
        timeLimit: q.timeLimit
      },
      questionEndsAt: endsAt
    };
    emitToPin(pin, "session-state", payload);
    if (ioRef) {
      for (const s of Array.from(ioRef.sockets.sockets.values())) {
        if (s.data.role === "player" && session.participantIds.includes(s.id)) {
          s.emit("gameStarted", {
            gamePin: key,
            quizTitle: session.quizTitle,
            questionIndex: session.currentQuestionIndex,
            questionCount: session.questions.length,
            question: payload.question,
            questionEndsAt: endsAt
          });
        }
      }
    }
    return;
  }
  if (session.phase === "leaderboard") {
    const rows = buildLeaderboardRows(session);
    emitToPin(pin, "session-state", {
      ...base,
      questionIndex: session.currentQuestionIndex,
      leaderboard: rows
    });
    emitToPin(pin, "leaderboard-update", { gamePin: key, leaderboard: rows });
    return;
  }
  if (session.phase === "finished") {
    const rows = buildLeaderboardRows(session);
    emitToPin(pin, "session-state", {
      ...base,
      leaderboard: rows,
      finished: true
    });
    emitToPin(pin, "quiz-ended", { gamePin: key });
    emitToPin(pin, "leaderboard-update", { gamePin: key, leaderboard: rows });
  }
}
function scheduleQuestionEnd(pin, session) {
  clearTimers(session);
  const q = session.questions[session.currentQuestionIndex];
  if (!q) return;
  const ms = Math.max(1e3, q.timeLimit * 1e3);
  session.questionTimer = setTimeout(() => {
    session.questionTimer = null;
    enterLeaderboardPhase(pin, session);
  }, ms);
}
function enterLeaderboardPhase(pin, session) {
  const q = session.questions[session.currentQuestionIndex];
  const idx = session.currentQuestionIndex;
  if (q) {
    for (const id of session.participantIds) {
      const p = session.players.get(id);
      if (p && p.answers[idx] === void 0) {
        p.answers[idx] = {
          selectedIndex: -1,
          correct: false,
          responseTimeMs: q.timeLimit * 1e3,
          points: 0,
          basePoints: 0,
          speedBonus: 0,
          streakBonus: 0
        };
        p.streak = 0;
      }
    }
  }
  session.phase = "leaderboard";
  broadcastSessionState(pin, session);
  session.leaderboardTimer = setTimeout(() => {
    session.leaderboardTimer = null;
    if (session.currentQuestionIndex >= session.questions.length - 1) {
      session.phase = "finished";
      clearTimers(session);
      broadcastSessionState(pin, session);
    } else {
      session.currentQuestionIndex += 1;
      session.phase = "question";
      session.questionStartedAt = Date.now();
      for (const id of session.participantIds) {
        const p = session.players.get(id);
        if (p && !p.answers[session.currentQuestionIndex]) {
        }
      }
      broadcastSessionState(pin, session);
      scheduleQuestionEnd(pin, session);
    }
  }, 5e3);
}
function startGameSession(pin, quizTitle, questions, lobbyPlayers) {
  const key = normalizeGamePin(pin);
  if (!questions.length) return { ok: false, error: "No questions" };
  const existing = sessions.get(key);
  if (existing) clearTimers(existing);
  const players = /* @__PURE__ */ new Map();
  const participantIds = [];
  for (const lp of lobbyPlayers) {
    participantIds.push(lp.socketId);
    players.set(lp.socketId, {
      name: lp.playerName,
      totalScore: 0,
      streak: 0,
      answers: {}
    });
  }
  const session = {
    pin: key,
    quizTitle: quizTitle || "Live Quiz",
    phase: "question",
    questions: questions.map((q, i) => ({
      id: q.id ?? i,
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
      timeLimit: Math.max(5, Math.min(120, q.timeLimit || 30))
    })),
    currentQuestionIndex: 0,
    questionStartedAt: Date.now(),
    participantIds,
    players,
    questionTimer: null,
    leaderboardTimer: null
  };
  sessions.set(key, session);
  broadcastSessionState(key, session);
  scheduleQuestionEnd(key, session);
  return { ok: true };
}
function getSession(pin) {
  return sessions.get(normalizeGamePin(pin));
}
function tryResumeDisconnectedPlayer(pin, playerName, newSocketId) {
  if (!ioRef) return false;
  const session = sessions.get(normalizeGamePin(pin));
  if (!session || session.phase === "finished" || session.questions.length === 0) {
    return false;
  }
  if (session.participantIds.includes(newSocketId)) {
    return true;
  }
  const name = playerName.trim();
  let oldId = null;
  for (const id of session.participantIds) {
    const p = session.players.get(id);
    if (!p || p.name !== name) continue;
    if (!ioRef.sockets.sockets.has(id)) {
      oldId = id;
      break;
    }
  }
  if (!oldId) return false;
  const state = session.players.get(oldId);
  if (!state) return false;
  session.players.delete(oldId);
  session.players.set(newSocketId, { ...state });
  const idx = session.participantIds.indexOf(oldId);
  if (idx >= 0) session.participantIds[idx] = newSocketId;
  return true;
}
function recordPlayerAnswer(pin, socketId, selectedIndex) {
  const session = sessions.get(normalizeGamePin(pin));
  if (!session || session.phase !== "question") {
    return { ok: false, error: "Not accepting answers" };
  }
  if (!session.participantIds.includes(socketId)) {
    return { ok: false, error: "Not in this game" };
  }
  const q = session.questions[session.currentQuestionIndex];
  if (!q) return { ok: false, error: "Invalid question" };
  const p = session.players.get(socketId);
  if (!p) return { ok: false, error: "Unknown player" };
  if (p.answers[session.currentQuestionIndex] !== void 0) {
    return { ok: false, error: "Already answered" };
  }
  const now = Date.now();
  const responseTimeMs = Math.min(
    q.timeLimit * 1e3,
    Math.max(0, now - session.questionStartedAt)
  );
  const correct = selectedIndex === q.correctIndex;
  if (correct) {
    p.streak += 1;
  } else {
    p.streak = 0;
  }
  const { total, basePoints, speedBonus, streakBonus } = computeKahootQuestionScore(
    correct,
    responseTimeMs,
    correct ? p.streak : 0
  );
  p.answers[session.currentQuestionIndex] = {
    selectedIndex,
    correct,
    responseTimeMs,
    points: total,
    basePoints,
    speedBonus,
    streakBonus
  };
  p.totalScore += total;
  const timeTakenSec = responseTimeMs / 1e3;
  let speedTier = "ok";
  if (!correct && selectedIndex < 0) speedTier = "timeout";
  else if (correct) {
    if (timeTakenSec <= 2) speedTier = "lightning";
    else if (timeTakenSec <= 5) speedTier = "fast";
    else if (timeTakenSec <= q.timeLimit * 0.7) speedTier = "ok";
    else speedTier = "slow";
  }
  if (ioRef) {
    const rows = buildLeaderboardRows(session);
    ioRef.to(normalizeGamePin(pin)).emit("leaderboard-update", {
      gamePin: normalizeGamePin(pin),
      leaderboard: rows
    });
  }
  return {
    ok: true,
    points: total,
    correct,
    streak: p.streak,
    speedTier,
    basePoints,
    speedBonus,
    streakBonus
  };
}
function getResultsForSocket(pin, socketId) {
  const session = sessions.get(normalizeGamePin(pin));
  if (!session || session.questions.length === 0) {
    return null;
  }
  const rows = buildLeaderboardRows(session);
  const p = session.players.get(socketId);
  const totalQ = session.questions.length;
  const maxPossible = totalQ * 1500;
  if (!p) {
    return {
      leaderboard: rows,
      userResult: null
    };
  }
  const questionResults = [];
  let correctCount = 0;
  for (let i = 0; i < totalQ; i++) {
    const a = p.answers[i];
    if (a) {
      questionResults.push({
        correct: a.correct,
        timeSpent: Math.round(a.responseTimeMs / 1e3),
        points: a.points
      });
      if (a.correct) correctCount++;
    } else {
      questionResults.push({
        correct: false,
        timeSpent: 0,
        points: 0
      });
    }
  }
  const rank = rows.findIndex((r) => r.socketId === socketId) + 1;
  return {
    leaderboard: rows,
    userResult: {
      score: p.totalScore,
      totalScore: maxPossible,
      correctAnswers: correctCount,
      totalQuestions: totalQ,
      accuracy: totalQ ? Math.round(correctCount / totalQ * 100) : 0,
      questionResults,
      rank: rank || 0,
      totalParticipants: rows.length
    }
  };
}
function getLiveLeaderboard(pin) {
  const session = sessions.get(normalizeGamePin(pin));
  if (session && session.questions.length > 0) {
    return buildLeaderboardRows(session);
  }
  return null;
}
function removePlayerFromGameSession(pin, socketId) {
  const session = sessions.get(normalizeGamePin(pin));
  if (!session) return;
  session.participantIds = session.participantIds.filter((id) => id !== socketId);
  session.players.delete(socketId);
  if (ioRef) {
    const rows = buildLeaderboardRows(session);
    ioRef.to(normalizeGamePin(pin)).emit("leaderboard-update", {
      gamePin: normalizeGamePin(pin),
      leaderboard: rows
    });
  }
}
function sendSessionStateToSocket(socket, pin) {
  const key = normalizeGamePin(pin);
  const session = sessions.get(key);
  if (!session || !session.questions.length) {
    socket.emit("session-state", {
      gamePin: key,
      phase: "lobby",
      questionCount: 0,
      quizTitle: ""
    });
    return;
  }
  const base = {
    gamePin: key,
    phase: session.phase,
    quizTitle: session.quizTitle,
    questionCount: session.questions.length
  };
  if (session.phase === "question") {
    const q = session.questions[session.currentQuestionIndex];
    if (!q) return;
    const endsAt = session.questionStartedAt + q.timeLimit * 1e3;
    socket.emit("session-state", {
      ...base,
      questionIndex: session.currentQuestionIndex,
      question: {
        text: q.text,
        options: q.options,
        timeLimit: q.timeLimit
      },
      questionEndsAt: endsAt
    });
    return;
  }
  const rows = buildLeaderboardRows(session);
  socket.emit("session-state", {
    ...base,
    questionIndex: session.currentQuestionIndex,
    leaderboard: rows,
    finished: session.phase === "finished"
  });
}
export {
  computeKahootQuestionScore,
  getLiveLeaderboard,
  getResultsForSocket,
  getSession,
  normalizeGamePin,
  recordPlayerAnswer,
  removePlayerFromGameSession,
  sendSessionStateToSocket,
  setSessionIo,
  startGameSession,
  tryResumeDisconnectedPlayer
};

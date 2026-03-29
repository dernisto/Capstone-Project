# Cursor Super Prompt – Production-Grade Quiz Platform (Kahoot-Style)

Act as a **senior full-stack engineer**. This is a **real-time multiplayer quiz platform (Kahoot-style)** for KNUST. The frontend UI (glassmorphism, indigo-purple palette, animations) is **done and must not be redesigned**. Your job is to make it a **full working system** with a proper backend, real-time features, and no dummy data.

---

## Stack (Use Exactly This)

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Backend     | Node.js, Express, TypeScript         |
| Database    | MongoDB Atlas + Mongoose             |
| Real-time   | Socket.IO (same HTTP server as API)  |
| Auth        | JWT (e.g. jose or jsonwebtoken), bcrypt |
| Frontend    | Existing React + TypeScript + Vite  |

**Do not add** a separate backend repo or different runtime. Extend the **existing** server (e.g. `server/_core/index.ts`) and client.

---

## Phase 1: Backend Foundation

### 1.1 MongoDB + Mongoose

- **Connection:** `server/config/db.ts` – `connectDB()` using `process.env.MONGODB_URI`. Fallback: `mongodb://localhost:27017/quizpulse`. Log success/failure. Do not crash the process on failure; log and continue so the app can run without DB for static pages.
- **.env:** Document in `.env.example`: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`.

### 1.2 User Model & Auth API

- **Schema** `server/models/User.ts` (Mongoose):
  - `name`, `email` (unique), `password` (hashed, select: false), `role` (`teacher` | `student`), `createdAt`.
- **Routes** (Express):
  - `POST /api/auth/register` – body: `email`, `password`, `name`, optional `role`. Validate, hash password (bcrypt), create user, return JWT + user (no password).
  - `POST /api/auth/login` – body: `email`, `password`. Compare password, return JWT + user.
  - `GET /api/auth/me` – protected by middleware that reads `Authorization: Bearer <token>`, verifies JWT, loads user, sets `req.user`. Return user payload.
- **Middleware:** `server/middleware/auth.ts` – verify JWT, attach `req.user`. If MongoDB is not connected, return 503 with a clear message.
- **Frontend:** Auth context (e.g. React context) that: on init reads token from localStorage, calls `GET /api/auth/me`, exposes `user`, `login`, `register`, `logout`, `loading`. Use this context for nav and protected routes. **No dummy or mock user.**

---

## Phase 2: Game Sessions & Lobby

### 2.1 Game Session Model

- **Schema** `server/models/GameSession.ts` (or similar):
  - `quizId`, `hostId` (user id), `gamePin` (unique, e.g. 6-char), `status` (`waiting` | `active` | `finished`), `currentQuestionIndex`, `players` (array of `{ playerId, name, score, socketId? }`), `createdAt`.
- **REST (optional):** `POST /api/game/sessions` – create session, generate `gamePin`, return it. `GET /api/game/sessions/pin/:pin` – validate PIN and return session summary (for join flow).

### 2.2 Socket.IO Server

- Attach Socket.IO to the **same HTTP server** as Express (no separate port).
- **Room convention:** one room per game, e.g. room id = `gamePin` (uppercase).

**Events:**

| Event            | Direction   | Payload / Behavior |
|------------------|------------|--------------------|
| `join-game`      | Client→Server | `{ gamePin }` – host joins room; set `socket.data.gamePin`, `socket.data.role = 'host'`. |
| `student-join`   | Client→Server | `{ gamePin, playerName }` – validate PIN (and optionally duplicate name), join room, set `socket.data.gamePin`, `socket.data.playerName`. Then **emit to room** `student-joined` with `{ playerName, socketId }`. |
| `student-joined` | Server→Room  | Sent after a student joins; host and all in lobby update player list. |
| `start_game`     | Client→Server | Host only; emit to room `game_started` (optional payload e.g. first question). |
| `player_left`    | Server→Room  | On socket disconnect, if in a game room, emit so lobby can remove that player. |

- **Lobby:** Frontend host page subscribes to `student-joined` (and `player_left`). **Players list = only from these events.** No hardcoded or mock players. Frontend student page: on load emit `student-join` with PIN and name, then show “Waiting for host…” and optionally chat.

---

## Phase 3: Live Chat (In-Game)

- **In-memory store (per game):** e.g. `Map<gamePin, Array<{ username, message, timestamp }>>`. Cap at ~100 messages per room. Trim oldest when over.
- **Event `chat-message`:** Client sends `{ gamePin, message }`. Server: validate (non-empty, trim, max length e.g. 500). Use `socket.data.playerName` (or “Player”) as username. Append to store, then **emit `chat-message`** to the same room with `{ username, message, timestamp }`.
- **Frontend:** Chat component that: takes socket, `gamePin`, `playerName`; subscribes to `chat-message`; keeps last N messages in state; input + send button; send emits `chat-message` with `{ gamePin, message }`. Use this component on **host lobby** and **player lobby/game** views so everyone in the same game sees the same chat. No fake or placeholder messages.

---

## Phase 4: Quiz Flow & Questions

- **Assumption:** Quiz and questions already exist in your DB (e.g. Drizzle/MySQL or Mongoose). If not, define a minimal `Quiz` and `Question` schema and seed one quiz for testing.
- **Host flow:** Host sends “next question” (e.g. event `host_send_question` with `{ gamePin, questionIndex, questionPayload }`). Server broadcasts to room (e.g. `question` event) so all players get the same question at the same time.
- **Answer flow:** Player sends `submit_answer` with `{ gamePin, questionIndex, selectedOptionIndex }`. Server: validate (game active, question index matches, no duplicate from that player), compute correct/incorrect, update player score in session, then emit to room `answer_result` (for that player) and `leaderboard` (updated list for everyone).

---

## Phase 5: Leaderboard & Scoring

- **Storage:** Keep leaderboard state in the game session (e.g. in `GameSession.players` with `score`). Update on each `submit_answer`. No duplicate entries per player (one entry per `playerId` or `socketId`); update score in place.
- **Scoring:** e.g. correct = base points + time bonus; wrong = 0. Emit `leaderboard` after each question with sorted list (e.g. top 5 or full list): `[{ playerId, name, score, rank }]`.
- **Frontend:** Leaderboard component that subscribes to `leaderboard` and renders list with smooth animation (e.g. reorder, highlight changed scores). **No dummy leaderboard entries;** only data from socket events.

---

## Phase 6: Answer Validation & Anti-Cheat

- **Server-side only:** Correct answer and score computed on server. Store correct option index (or id) in question payload; never trust client for “correct” flag.
- **Duplicate submission:** Track per player per question (e.g. in session or in memory). If already answered this question, ignore or return error; do not double-count.
- **Immediate feedback:** After `submit_answer`, server sends `answer_result` to that socket with `{ correct, points, correctOptionIndex }`. Frontend shows checkmark/cross and optional correct answer. Then `leaderboard` event updates everyone.

---

## Phase 7: End-to-End Game Flow (Socket Events Summary)

1. Host creates game (REST or socket) → gets `gamePin`.
2. Host opens host view, emits `join-game` with `gamePin`.
3. Students open join page, enter PIN + name; emit `student-join` → server emits `student-joined` to room.
4. Host sees live player list (from `student-joined` / `player_left` only). Host clicks “Start” → emit `start_game` → server emits `game_started`.
5. Host sends first question → `host_send_question` → server emits `question` to room.
6. Players answer → `submit_answer` → server validates, updates scores, emits `answer_result` to sender and `leaderboard` to room.
7. Repeat 5–6 for each question.
8. After last question, host (or server) emits `game_ended` with final leaderboard. Frontend shows final results.

All of the above must use **real data** (MongoDB, in-memory session store, Socket.IO). **No dummy data** for players, messages, or leaderboard.

---

## Phase 8: Frontend Integration (No UI Redesign)

- **Auth:** Use auth context everywhere. Sign In / Sign Up / Logout must call the real API. Protected routes redirect to login if no user.
- **Routes:** e.g. `/join` (enter PIN + name), `/play` (player game view), `/host` (host lobby + game control). Reuse existing routes if they already exist; otherwise add these and wire them.
- **Lobby (host):** Empty list initially; fill only from `student-joined` and `player_left`. Show avatars/initials, count, “Start Game” button.
- **Lobby (player):** After `student-join`, show “Waiting for host…” and chat. No mock list.
- **Chat:** Same `GameChat` component on host and player; real messages only from socket.
- **Leaderboard:** Only from `leaderboard` event; one row per player; animate updates.
- **Design:** Keep glassmorphism, gradients, animations, timer bar, hover effects. Only wire real data and events behind existing components.

---

## Phase 9: Code Quality & Deliverables

- **TypeScript:** Types for all events, API bodies, and models.
- **Structure:** Clear `server/models`, `server/routes`, `server/controllers`, `server/sockets` (or `server/middleware` for auth). Reusable frontend hooks (e.g. `useGameSocket`, `useAuth`).
- **Errors:** Try/catch, 4xx/5xx responses, clear messages. Socket errors acknowledged to client where relevant.
- **Secrets:** All secrets in `.env`; document in `.env.example`. No hardcoded credentials.

**Deliverables:** Working auth (register, login, me, logout), MongoDB connection, Socket.IO server on same server as API, game lobby (real-time list), live chat, full quiz flow (questions, answers, leaderboard), no dummy data for players/chat/leaderboard. Instructions: `pnpm install` (or `npm install`), set `.env`, then `pnpm dev` (or `npm run dev`).

---

Use this prompt in Cursor to generate or refine the backend, Socket.IO events, MongoDB schemas, and frontend wiring so the project behaves like a **production-ready Kahoot-style quiz platform** without changing the existing UI design.

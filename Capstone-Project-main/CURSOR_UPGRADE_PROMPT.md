# Cursor AI Prompt – Upgrade Quiz Platform to Full Working System

Act as a **senior full-stack engineer** improving an existing React + TypeScript project.

This project is a **real-time multiplayer quiz platform for KNUST teachers and students (similar to Kahoot)**. The UI and animations are already implemented and working well. **Do NOT redesign the UI**. Maintain the existing **glassmorphism design, vibrant indigo-purple palette with green accents, and Space Grotesk typography**.

Your task is to **upgrade the project from a UI prototype with dummy data into a working real-time application**.

Follow these steps carefully and build production-ready code.

---

## 1. Authentication System

Replace all dummy authentication with a working system.

**Implement:**
- Sign Up / Create Account
- Sign In
- Logout

**Requirements:**
- Connect authentication to **MongoDB Atlas**
- Use **JWT authentication**
- Passwords must be **hashed with bcrypt**
- Validate inputs on both frontend and backend
- Prevent duplicate accounts
- Store user role: `teacher` | `student`

**Suggested stack:** Node.js + Express, MongoDB + Mongoose, JWT

**Create:** `server/models/User.ts`, `server/routes/auth.ts`, `server/middleware/auth.ts`

**User model fields:** name, email, password, role (teacher | student), createdAt

**Frontend:** Connect Sign In to backend, create Sign Up page, show validation errors, store JWT securely.

---

## 2. Game Lobby System

Implement a **real multiplayer lobby** where players wait before the quiz begins.

**Teacher:** Create quiz session, generate **game PIN**, start the game.  
**Students:** Enter game PIN, join lobby, see all connected players.

**Lobby UI:** Player avatars/initials, real-time player list, player count, animated waiting state, Teacher **Start Game** button.

**Use Socket.IO.** Server events: `create_game`, `join_game`, `player_joined`, `player_left`, `start_game`.

---

## 3. Live Messaging (Chat)

- Messages appear instantly for all players
- Show sender name, auto-scroll, message bubble animations
- Simple rate limit to prevent spam

**Socket events:** `send_message`, `receive_message`

---

## 4. Replace Dummy Data

Remove mock data from: leaderboard, players, quiz questions, lobby users.  
Fetch from **MongoDB** and **Socket.IO events** only.

---

## 5. Leaderboard Fix

- Each player appears **only once**
- Score updates correctly after each question
- Sort by **highest score**
- Fields: playerId, name, score, rank
- Smooth animated leaderboard update after every question

---

## 6. Answer Validation

- Server-side answer checking
- Prevent duplicate submissions
- Immediate feedback, correct-answer animation

**Socket events:** `submit_answer`, `answer_result`, `update_score`

---

## 7. Real-Time Game Flow

1. Teacher creates game  
2. Students join lobby  
3. Teacher starts quiz  
4. Questions broadcast to all players  
5. Players answer with timer  
6. Scores update  
7. Leaderboard shows  
8. Next question  
9. Final results  

All via **Socket.IO**.

---

## 8. Maintain Existing Design

**Do NOT break the existing UI.** Keep: glassmorphism, floating particles, gradient text, animated stat cards, quiz preview, timer bar, hover and motion effects. Only integrate **real functionality** behind existing components.

---

## 9. Code Quality

- TypeScript types everywhere
- Clean folder structure
- Reusable hooks
- Error handling
- Environment variables for secrets

---

## 10. Deliverables

- frontend / backend / socket server
- MongoDB connection
- Working authentication
- Real-time lobby
- Live chat
- Leaderboard fix
- Answer validation

**Run instructions:** `npm install` (or `pnpm install`), `npm run dev` (or `pnpm dev`).

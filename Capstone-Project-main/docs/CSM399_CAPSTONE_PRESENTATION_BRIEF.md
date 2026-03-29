# QuizPulse59 — Capstone Project Brief (CSM 399)

**Course:** CSM 399 Web-Based Concepts and Development (KNUST)  
**Purpose:** Handout for your group — use this to prepare answers for *how the website was built*, *what it does*, and *how it meets the course requirements*. Export to PDF from Word, Google Docs, or a Markdown-to-PDF tool.

---

## 1. One-sentence summary

**QuizPulse59** is a web application for **real-time multiplayer quizzes**: teachers create quizzes and host live sessions with a PIN; students join, answer timed questions, see scores and leaderboards, and interact via chat — all in the browser.

---

## 2. Real-world problem & audience (for proposal/presentation)

| Item | Suggested talking point |
|------|-------------------------|
| **Problem** | Classroom and training sessions need quick, engaging ways to check understanding; paper quizzes are slow to grade and not interactive. |
| **Target audience** | Teachers / trainers (hosts) and students / participants (players). |
| **Industry-style solution** | A hosted web app with accounts, live sync, and analytics-style views — similar in spirit to Kahoot-style platforms but built as your own capstone product. |

---

## 3. How the app works (operations & flow)

### 3.1 Main user journeys

1. **Teacher / host**
   - Registers or logs in → lands on dashboard/sessions area.
   - **Creates a quiz** (title, description, questions with **multiple choice (5 options)** or **True/False-style** preset options, time limit per question).
   - **Starts or shares a live session** using a **PIN** (or demo/local flow when not fully connected to the database).
   - **Hosts the game**: advances questions, sees participants, leaderboard, optional **live chat**.

2. **Student / player**
   - Uses **Join** with PIN (or follows a shared link) → enters play flow.
   - Answers questions within the **time limit** → gets feedback; scores aggregate for **leaderboard / results**.

3. **General visitor**
   - **Home page** explains the product; **Demo** can illustrate flows without full backend.

### 3.2 Technical flow (high level)

- **Browser (React)** talks to a **Node.js server** for REST-style auth, **tRPC** for type-safe API calls, and **Socket.io** for **real-time** game events (scores, question state, chat).
- **Data**: Quiz metadata and relational quiz data can use **MySQL** (via **Drizzle ORM**); **MongoDB/Mongoose** supports user auth in the stack you deployed. Environment variables (`.env`) configure databases, JWT, and optional AI/chat features.
- **Production build**: Client is built with **Vite**; server is bundled and run with **Node** (`pnpm run build` → `pnpm start`).

---

## 4. Core features (checklist for presentation)

Use this list to demo “functionality” in line with the rubric (30%).

- User **authentication** (register, login, session / JWT patterns as implemented).
- **Quiz creation** with question types: **multiple choice (5 custom options)** and **True/False** (fixed four-option preset for API compatibility).
- **Live session** hosting with **PIN**, timers, and **real-time updates** (sockets).
- **Leaderboard** and **results** after or during play.
- **Live chat** during sessions (where enabled).
- **Quiz library**, **analytics** views, **theming** (light/dark), responsive **navigation** (navbar).
- **Home page** with marketing hero, feature cards, and HCI-oriented layout (contrast, overlays, glass-style sections).

---

## 5. Mapping to CSM 399 capstone requirements

From **Course Outline — Capstone Project Instructions** (technical requirements & outcomes):

| Requirement | How QuizPulse59 addresses it |
|-------------|------------------------------|
| **Frontend: HTML, CSS, JavaScript** | Pages are built as **React** components; the DOM is structured for accessibility; **Tailwind CSS** generates utility-based styles (modern CSS). Under the hood, the browser still runs **JavaScript** (bundled). |
| **ReactJS (course unit)** | **React 19** + hooks, context (e.g. auth, theme), client-side **routing** (**Wouter**), forms and lists throughout. |
| **Responsive design** | **Tailwind** breakpoints (`sm`, `md`, `lg`, etc.), flexible grids and stacks on Home, dashboards, and play screens. |
| **Optional backend: Node.js** | **Express** server integrates **tRPC**, **Socket.io**, static/Vite dev middleware, and auth routes. |
| **Data / APIs** | **tRPC** procedures for quizzes, questions, sessions, answers, chat, results; **Zod** validation on inputs. |
| **State & dynamic UI** | **TanStack React Query** + tRPC for server state; **React state** for forms and UI; real-time socket updates. |
| **UI/UX** | Consistent design system (**shadcn/ui**-style Radix components), **Framer Motion** for motion, **Sonner** toasts, light/dark theme. |
| **Version control** | Project intended to live in **Git** with clear commits (mention your branch/PR practice in presentation). |
| **Team roles** | Align each member to PM, Frontend, Backend, UI/UX, QA as in the outline; each can speak to their slice using sections 3–6 of this brief. |

---

## 6. Technologies employed (quick reference)

| Layer | Technologies |
|-------|----------------|
| **UI** | React, JSX, Tailwind CSS v4, Radix UI primitives, Lucide icons, Framer Motion |
| **Routing** | Wouter |
| **Build / dev** | Vite, ES modules, `pnpm` scripts |
| **API** | tRPC, SuperJSON |
| **Server** | Node.js, Express |
| **Real-time** | Socket.io (server + client) |
| **Validation** | Zod |
| **SQL / ORM** | MySQL + Drizzle ORM (schema under `drizzle/`) |
| **Auth stack** | bcrypt, jose (JWT), cookies; MongoDB/Mongoose where configured for users |
| **Optional / extended** | AI SDK / streaming chat routes, Supabase client (analytics path), etc. — mention only if you actually configured and demo them |

*Note:* The codebase was migrated to **JavaScript** (`.js`/`.jsx`) for consistency; the course requirement is **JavaScript** — this still satisfies the spirit of the rubric.

---

## 7. Suggested Q&A for “how was it built?”

- **Why React?** Component reuse, state management, and alignment with the **ReactJS** unit of CSM 399.  
- **Why a Node backend?** Single language on server and client, easy JSON APIs, WebSockets for live quizzes.  
- **Why tRPC?** Shared validation (Zod), fewer REST boilerplate errors, good fit for a TypeScript-friendly stack (even if client is JS now).  
- **How is “live” implemented?** Socket.io events broadcast game state to all connected clients in a session.  
- **How do you run it locally?** Install dependencies (`pnpm install`), configure `.env`, run `pnpm run dev` (see project `README` if present).  
- **What about security?** Passwords hashed, JWT/session patterns, environment secrets not committed — discuss what *you* actually enabled in `.env`.

---

## 8. Presentation checklist (rubric alignment)

| Criterion (from outline) | What to show or say |
|--------------------------|---------------------|
| **Functionality (30%)** | Live path: create quiz → host → join → answer → leaderboard/results. |
| **Design & UI/UX (20%)** | Responsive resize demo; home hero readability; dark mode; consistent components. |
| **Code quality (20%)** | Folder structure (`client/src`, `server`, `shared`), separation of UI vs API vs sockets. |
| **Team collaboration (15%)** | Who did auth, quiz UI, sockets, database, testing. |
| **Presentation (15%)** | This brief + live demo + 1 slide on challenges (e.g. env setup, real-time edge cases). |

---

## 9. Document control

- **Prepared for:** CSM 399 group presentation preparation  
- **Based on:** Course outline *CSM 399 Web-Based Concepts and Development* (Capstone instructions & technical requirements)  
- **Project folder:** `Capstone-Project-main` (QuizPulse59)

*Your team should add: exact problem statement from your proposal, screenshots, and any changes you made after this brief was written.*

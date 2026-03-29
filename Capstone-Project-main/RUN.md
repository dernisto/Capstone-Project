# How to run the project

## 1. Install dependencies

From this folder (the one with `package.json`):

```bash
pnpm install
```

## 2. Environment

Copy `.env.example` to `.env` and edit if needed.

- **PORT** 3000  
- **MONGODB_URI** – needed for login/register. Default: `mongodb://localhost:27017/quizpulse` (local MongoDB).  
  See **MONGODB_SETUP.md** for local install or free MongoDB Atlas setup.  
- **JWT_SECRET** – any string for signing tokens (use a long random value in production).

If MongoDB is not running or not set, the server still starts; login/register will fail until MongoDB is connected.

## 3. Start the app

```bash
pnpm run dev
```

Then open: **http://localhost:3000** (or the port shown in the terminal).

## 4. Teacher dashboard without logging in

If you open the teacher dashboard without being logged in, you’ll see:

- **“You need to sign in to view the teacher dashboard.”**
- A **“Go to Sign in”** button.

Click **“Go to Sign in”** to go to the login page.  
If the app seems stuck on loading, wait up to 8 seconds; then the same sign-in message and button will appear.

## 5. If `pnpm run dev` fails

- Run the terminal from this project folder (where `package.json` is).
- If you see `cross-env` not found, run `pnpm install` again.
- On Windows, avoid running the terminal as Administrator.

# MongoDB setup for QuizPulse

The app uses MongoDB for user accounts (login/register). You can use either **local MongoDB** or **MongoDB Atlas** (free cloud).

---

## Option A: MongoDB locally (Windows)

### 1. Install MongoDB Community Server

1. Go to: https://www.mongodb.com/try/download/community  
2. Choose **Version**: 7.x or 8.x (current)  
3. **Platform**: Windows  
4. Download the **MSI** and run it.  
5. In the installer, choose **Complete** and leave **Install MongoDB as a Service** checked so it starts with Windows.

### 2. Check it’s running

- Open **Services** (Win + R → `services.msc` → Enter).  
- Find **MongoDB Server** and confirm status is **Running**.  
- Or in a new terminal:
  ```bash
  mongosh --eval "db.runCommand({ ping: 1 })"
  ```
  If you see `ok: 1`, MongoDB is running.

### 3. Use it in the project

Your app already defaults to:

- **URI**: `mongodb://localhost:27017/quizpulse`  
- **Database name**: `quizpulse`

So you don’t need to change anything if you use the default. To set it explicitly, in the project folder create or edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/quizpulse
```

Then run the app:

```bash
pnpm run dev
```

You should see in the terminal: `[MongoDB] Connected successfully`.

---

## Option B: MongoDB Atlas (free cloud, no local install)

### 1. Create an Atlas account and cluster

1. Go to: https://www.mongodb.com/cloud/atlas  
2. Sign up or log in.  
3. Create a **free** cluster (e.g. M0).  
4. Choose a cloud provider and region (one close to you).  
5. Create the cluster and wait until it’s ready.

### 2. Create a database user

1. In Atlas, go to **Database Access** → **Add New Database User**.  
2. Choose **Password** and set a username and a **strong password** (save it).  
3. Role: **Atlas Admin** (or **Read and write to any database**).  
4. Click **Add User**.

### 3. Allow network access

1. Go to **Network Access** → **Add IP Address**.  
2. For local dev, click **Allow Access from Anywhere** (adds `0.0.0.0/0`).  
3. Confirm.

### 4. Get the connection string

1. Go to **Database** → **Connect** on your cluster.  
2. Choose **Connect your application**.  
3. Copy the URI. It looks like:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `USERNAME` and `PASSWORD` with your database user.  
5. Add the database name (e.g. `quizpulse`) before the `?`:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/quizpulse?retryWrites=true&w=majority
   ```

### 5. Put it in `.env`

In the project root, create or edit `.env`:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/quizpulse?retryWrites=true&w=majority
```

- Use your **real** Atlas database user and password (no angle brackets `<>` — those are placeholders).
- The `/quizpulse` before the `?` is the database name; keep it so the app uses the `quizpulse` database.
- If your password has special characters (e.g. `@`, `#`), URL-encode them (e.g. `@` → `%40`).

Restart the app:

```bash
pnpm run dev
```

You should see: `[MongoDB] Connected successfully`.

---

## Quick checklist

| Step                         | Local (Option A)     | Atlas (Option B)        |
|-----------------------------|----------------------|-------------------------|
| Install / create cluster     | Install MongoDB MSI  | Create free M0 cluster  |
| Create DB user              | Not needed (local)   | Create in Atlas         |
| Network                     | Use localhost       | Add IP / allow anywhere |
| Set `MONGODB_URI` in `.env` | Optional (has default) | Required (your Atlas URI) |
| Run app                     | `pnpm run dev`       | `pnpm run dev`          |

---

## Troubleshooting

- **“IP that isn’t whitelisted” / still can’t connect after adding IP**  
  - In Atlas go to **Network Access** → **Add IP Address** → choose **“Allow Access from Anywhere”** (adds `0.0.0.0/0`). This allows any IP; use only for development.  
  - Wait **2–3 minutes** after saving — Atlas can take a moment to apply the change.  
  - If you use a **VPN**, turn it off or add the VPN’s exit IP in Network Access.  
  - **Restart the app** after changing the whitelist (`Ctrl+C` then `pnpm run dev`).  
  - Some **school/corporate networks** block MongoDB. Try from another network (e.g. phone hotspot) to confirm.

- **Connection failed / ECONNREFUSED**  
  - Local: make sure MongoDB service is running (see Option A step 2).  
  - Atlas: check user/password in the URI and that your IP is allowed in Network Access.

- **Authentication failed**  
  - Check username and password in `MONGODB_URI`.  
  - For Atlas, URL-encode special characters in the password (e.g. `@` → `%40`).

- **`[MongoDB] Connected successfully`**  
  - MongoDB is set up correctly; login and register in the app should work.

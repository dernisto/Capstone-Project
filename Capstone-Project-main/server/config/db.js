import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "../_core/env.js";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5e3;
async function connectDB() {
  const uri = ENV.mongodbUri;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI is not set. Auth (login/register) will not work.");
    return;
  }
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("[db] \u2139\uFE0F  DNS servers set to Google DNS for SRV resolution");
  } catch (dnsErr) {
    console.warn("[db] \u26A0\uFE0F  Failed to set custom DNS servers:", dnsErr);
  }
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log("[MongoDB] Connected successfully");
      return;
    } catch (error) {
      const msg = error.message;
      console.warn(`[MongoDB] Connection attempt ${attempt}/${MAX_RETRIES} failed:`, msg);
      if (msg.includes("authentication failed") || error?.code === 8e3) {
        console.warn(
          "[MongoDB] Fix: Check MONGODB_URI in .env \u2014 correct password (no angle brackets), database name e.g. .../quizpulse?..."
        );
      }
      if (msg.includes("whitelist") || msg.includes("IP")) {
        console.warn(
          "[MongoDB] Fix: In Atlas go to Network Access \u2192 Add IP Address \u2192 'Allow Access from Anywhere' (0.0.0.0/0). Wait 1\u20132 minutes then restart the app."
        );
      }
      if (attempt < MAX_RETRIES) {
        console.warn(`[MongoDB] Retrying in ${RETRY_DELAY_MS / 1e3}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
}
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
async function ensureConnected() {
  if (mongoose.connection.readyState === 1) return true;
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.mongodbUri);
    }
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}
export {
  connectDB,
  ensureConnected,
  isMongoConnected
};

import { jwtVerify } from "jose";
import { ForbiddenError } from "@shared/_core/errors";
import { ensureConnected } from "../config/db.js";
import { User } from "../models/User.js";
import { ENV } from "./env";
import { sdk } from "./sdk";
function getJwtSecretBytes() {
  const secret = ENV.jwtSecret || ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}
async function assertApiAuthenticated(req) {
  const auth = req.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (bearer) {
    try {
      const { payload } = await jwtVerify(bearer, getJwtSecretBytes());
      const userId = payload.userId;
      if (userId && await ensureConnected()) {
        const doc = await User.findById(userId).select("_id").lean();
        if (doc) return;
      }
    } catch {
    }
  }
  try {
    await sdk.authenticateRequest(req);
  } catch {
    throw ForbiddenError(
      "Authentication required. Sign in again, or ensure your session cookie or Bearer token is sent."
    );
  }
}
export {
  assertApiAuthenticated
};

import { SignJWT, jwtVerify } from "jose";
import { User } from "../models/User.js";
import { ENV } from "../_core/env.js";
import { isMongoConnected, ensureConnected } from "../config/db.js";
function getJwtSecret() {
  const secret = ENV.jwtSecret || ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}
async function register(req, res) {
  if (!isMongoConnected() && !await ensureConnected()) {
    res.status(503).json({
      success: false,
      error: "Auth service unavailable. MongoDB not connected."
    });
    return;
  }
  try {
    const { email, password, name } = req.body;
    if (!email?.trim() || !password || !name?.trim()) {
      res.status(400).json({
        success: false,
        error: "Email, password and name are required."
      });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters."
      });
      return;
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({
        success: false,
        error: "User already exists"
      });
      return;
    }
    const user = await User.create({
      email: normalizedEmail,
      name: name.trim(),
      password
    });
    const token = await new SignJWT({
      userId: user._id.toString(),
      email: user.email
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(ENV.jwtExpiry).sign(getJwtSecret());
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
}
async function login(req, res) {
  if (!isMongoConnected() && !await ensureConnected()) {
    res.status(503).json({
      success: false,
      error: "Auth service unavailable. MongoDB not connected."
    });
    return;
  }
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required."
      });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );
    if (!user) {
      res.status(400).json({ success: false, error: "Invalid credentials" });
      return;
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(400).json({ success: false, error: "Invalid credentials" });
      return;
    }
    const token = await new SignJWT({
      userId: user._id.toString(),
      email: user.email
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(ENV.jwtExpiry).sign(getJwtSecret());
    res.json({
      success: true,
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ success: false, error: "Login failed." });
  }
}
async function authMiddleware(req, res, next) {
  if (!isMongoConnected() && !await ensureConnected()) {
    res.status(503).json({
      success: false,
      error: "Auth service unavailable. MongoDB not connected."
    });
    return;
  }
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, error: "No token, authorization denied" });
    return;
  }
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.userId;
    const email = payload.email;
    if (!userId || !email) {
      res.status(401).json({ success: false, error: "Invalid token." });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ success: false, error: "User not found." });
      return;
    }
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
}
async function me(req, res) {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, error: "Not authenticated." });
    return;
  }
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name }
  });
}
export {
  authMiddleware,
  login,
  me,
  register
};

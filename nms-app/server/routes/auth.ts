import { Router } from "express";
import bcrypt from "bcryptjs";
import { recordLogin, getUserByUsername } from "../lib/storage";
import { signToken, requireAuth } from "../lib/jwt";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Chaitu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Chaitu@001158";

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  // Admin check
  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {
    recordLogin(ADMIN_USERNAME);
    const token = signToken({ username: ADMIN_USERNAME, role: "admin" });
    res.json({ token, username: ADMIN_USERNAME, role: "admin" });
    return;
  }

  // Managed user check
  const user = getUserByUsername(username);
  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    const token = signToken({ username: user.username, role: "user" });
    res.json({ token, username: user.username, role: "user" });
    return;
  }

  res.status(401).json({ error: "Invalid username or password" });
});

router.post("/auth/logout", (_req, res) => {
  // JWT is stateless; the client just discards the token.
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  const user = (req as typeof req & { user: { username: string; role: string } }).user;
  res.json({ username: user.username, role: user.role });
});

import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByUsername,
} from "../lib/storage";
import { requireAdmin } from "../lib/jwt";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Chaitu";

router.get("/users", requireAdmin, (_req, res) => {
  const users = getUsers().map(({ id, username, createdAt }) => ({
    id,
    username,
    createdAt,
  }));
  res.json(users);
});

router.post("/users", requireAdmin, async (req, res) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    res.status(400).json({ error: "Cannot create a user with the admin username" });
    return;
  }
  if (getUserByUsername(username)) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  createUser(newUser);
  res
    .status(201)
    .json({ id: newUser.id, username: newUser.username, createdAt: newUser.createdAt });
});

router.put("/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };
  const updates: Record<string, string> = {};
  if (username) {
    if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      res.status(400).json({ error: "Cannot use the admin username" });
      return;
    }
    const existing = getUserByUsername(username);
    if (existing && existing.id !== id) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    updates.username = username;
  }
  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }
  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }
  const ok = updateUser(id, updates);
  if (!ok) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ok: true });
});

router.delete("/users/:id", requireAdmin, (req, res) => {
  const ok = deleteUser(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;

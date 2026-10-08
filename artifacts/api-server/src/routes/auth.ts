import { Router, type IRouter } from "express";
import session from "express-session";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
    userId?: number;
    userName?: string;
    userEmail?: string;
  }
}

const router: IRouter = Router();

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] || "pakcareerhub@gmail.com";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "Waseem@786";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.userId = undefined;
    res.json({ ok: true, message: "Logged in successfully" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  req.session.isAdmin = false;
  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  res.json({ ok: true, message: "Signed in successfully", user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!name || !normalizedEmail || !password || String(password).length < 6) {
    res.status(400).json({ error: "Name, valid email, and a password of at least 6 characters are required" });
    return;
  }
  if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
    res.status(400).json({ error: "This email is reserved for the administrator" });
    return;
  }
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, normalizedEmail));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(String(password)),
  }).returning();
  req.session.isAdmin = false;
  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (req.session?.isAdmin) {
    res.json({ isAdmin: true, isUser: false, email: ADMIN_EMAIL, role: "admin" });
    return;
  }
  if (req.session?.userId) {
    res.json({ isAdmin: false, isUser: true, id: req.session.userId, name: req.session.userName, email: req.session.userEmail, role: "user" });
    return;
  }
  res.status(401).json({ isAdmin: false, isUser: false });
});

export default router;

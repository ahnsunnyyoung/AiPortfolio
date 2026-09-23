import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map<string, number>();

function getConfiguredPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

function cleanupSessions(): void {
  const now = Date.now();
  sessions.forEach((expiresAt, token) => {
    if (expiresAt <= now) sessions.delete(token);
  });
}

export function authenticateAdmin(password: string): string | null {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword) return null;

  const provided = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  cleanupSessions();
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function setAdminCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === "production";
  const secureFlag = secure ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Max-Age=${SESSION_TTL_MS / 1000}; HttpOnly; SameSite=Lax${secureFlag}; Path=/`,
  );
}

export function clearAdminCookie(res: Response): void {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/`);
}

function getAdminToken(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(`${COOKIE_NAME}=`));
  return cookie?.slice(COOKIE_NAME.length + 1);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  cleanupSessions();
  const token = getAdminToken(req);
  if (token && sessions.has(token)) {
    next();
    return;
  }
  res.status(401).json({ error: "Admin authentication required" });
}

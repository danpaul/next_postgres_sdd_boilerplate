/*
 * Shared auth helpers. Not a Server Action file (no "use server").
 */
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prismaClient";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const GENERIC_ERROR = "Something went wrong. Try again.";
export const INVALID_CREDENTIALS = "Invalid email or password.";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Reads ADMIN_EMAIL at call time. Unset or empty means nobody is admin. Never throws.
export function roleForEmail(email: string): Role {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  return adminEmail !== "" && adminEmail === email ? "admin" : "user";
}

// Where a signed-in user lands: admins go to `/admin`, everyone else to `/`.
export function homePathForRole(role: Role): "/admin" | "/" {
  return role === "admin" ? "/admin" : "/";
}

// Returns the first failing message, or null. `email` must already be normalized.
export function validateSignUp(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  if (!input.email.includes("@")) {
    return "Enter a valid email address.";
  }
  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (input.password !== input.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) {
    return false;
  }
  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = await scrypt(
    password,
    Buffer.from(saltHex, "hex"),
    KEY_LENGTH,
  );
  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

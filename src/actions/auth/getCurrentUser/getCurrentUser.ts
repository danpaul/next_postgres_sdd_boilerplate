"use server";

/*
 * Server Action. Reads the session cookie and returns `{ email, role }` or null.
 * Never returns the password hash, token, or session row.
 * Read-only: runs during render, so it never writes or deletes.
 */
import { cookies } from "next/headers";
import { hashToken, SESSION_COOKIE } from "@/actions/auth/helpers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prismaClient";

export async function getCurrentUser(): Promise<{
  email: string;
  role: Role;
} | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, user: { select: { email: true, role: true } } },
  });
  if (!session || session.expiresAt <= new Date()) {
    return null;
  }
  return { email: session.user.email, role: session.user.role };
}

"use server";

/*
 * Server Action. Reads the Better Auth session from the request cookies and
 * returns `{ email, name, role }` or null. Never returns tokens or session rows.
 * Read-only: runs during render, so it never writes or deletes.
 */
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUser(): Promise<{
  email: string;
  name: string;
  role: "user" | "admin";
} | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  const { email, name, role } = session.user;
  return { email, name, role: role === "admin" ? "admin" : "user" };
}

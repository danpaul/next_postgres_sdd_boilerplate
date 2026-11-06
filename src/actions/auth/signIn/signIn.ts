"use server";

/*
 * Server Action. Verifies credentials, creates a session, then redirects to
 * `homePathForRole(user.role)` (`/admin` for admins, `/` otherwise).
 * Returns `{ error }` for bad credentials; unexpected errors throw.
 */
import { redirect } from "next/navigation";
import {
  createSession,
  homePathForRole,
  INVALID_CREDENTIALS,
  normalizeEmail,
  verifyPassword,
} from "@/actions/auth/helpers";
import { prisma } from "@/prisma/prismaClient";

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<{ error: string }> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return { error: INVALID_CREDENTIALS };
  }

  await createSession(user.id);
  redirect(homePathForRole(user.role));
}

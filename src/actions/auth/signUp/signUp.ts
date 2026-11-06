"use server";

/*
 * Server Action. Creates a user and a session, then redirects to
 * `homePathForRole(role)` (`/admin` for admins, `/` otherwise).
 * Returns `{ error }` for expected failures; unexpected errors throw.
 */
import { redirect } from "next/navigation";
import {
  createSession,
  GENERIC_ERROR,
  hashPassword,
  homePathForRole,
  normalizeEmail,
  roleForEmail,
  validateSignUp,
} from "@/actions/auth/helpers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prismaClient";

export async function signUp(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ error: string }> {
  const email = normalizeEmail(input.email);
  const validationError = validateSignUp({ ...input, email });
  if (validationError) {
    return { error: validationError };
  }

  const role = roleForEmail(email);
  const passwordHash = await hashPassword(input.password);
  let userId: number;
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
    });
    userId = user.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: GENERIC_ERROR };
    }
    throw error;
  }

  await createSession(userId);
  redirect(homePathForRole(role));
}

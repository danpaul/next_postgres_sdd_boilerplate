"use server";

/*
 * Server Action. Deletes the session row, clears the cookie, redirects to `/`.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashToken, SESSION_COOKIE } from "@/actions/auth/helpers";
import { prisma } from "@/prisma/prismaClient";

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  store.delete(SESSION_COOKIE);
  redirect("/");
}

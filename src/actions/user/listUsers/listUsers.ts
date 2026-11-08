"use server";

/*
 * Server Action. Admin only: throws "Forbidden" for signed-out users and non-admins.
 * Returns every user, newest first, with only `id`, `email`, and `role`.
 */
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { prisma } from "@/prisma/prismaClient";

export async function listUsers(): Promise<
  { id: string; email: string; role: "user" | "admin" }[]
> {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("Forbidden");
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true },
  });
  return users.map(({ id, email, role }) => ({
    id,
    email,
    role: role === "admin" ? "admin" : "user",
  }));
}
